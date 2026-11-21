import {
	BedDoubleIcon,
	CalendarDaysIcon,
	ClipboardListIcon,
	DownloadIcon,
	GraduationCapIcon,
	LoaderCircleIcon,
	PillIcon,
	TriangleAlertIcon,
	type LucideIcon,
} from 'lucide-react'
import { useState } from 'react'
import { Link, Outlet, useSearchParams } from 'react-router'
import { getReport } from '~/api/reports'
import { ComingSoonPanel } from '~/components/coming-soon-panel'
import { FormField } from '~/components/form-field'
import { ModuleLayout } from '~/components/module-layout'
import { PageHeader } from '~/components/page-header'
import { SubNavLink, SubNavTitle } from '~/components/sub-nav'
import { Alert } from '~/components/ui/alert'
import { Button, buttonVariants } from '~/components/ui/button'
import { NativeSelect } from '~/components/ui/native-select'
import { SegmentedControl } from '~/components/ui/segmented-control'
import { downloadCsv } from '~/lib/csv'
import { safeString } from '~/lib/strings'
import { useAuth } from '~/providers/auth-provider'
import { useWorkspace } from '~/providers/workspace-provider'

const REPORTS: ReadonlyArray<{
	key: ReportKey
	title: string
	description: string
	icon: LucideIcon
}> = [
	{
		key: 'medication',
		title: 'Medication',
		description:
			'Doses given, refused and missed, by resident and by staff member.',
		icon: PillIcon,
	},
	{
		key: 'visits',
		title: 'Visits',
		description:
			'On-time, late and missed visits for homecare, by carer and by client.',
		icon: CalendarDaysIcon,
	},
	{
		key: 'incidents',
		title: 'Incidents',
		description:
			'Falls, injuries, medication errors and safeguarding, with follow-up status.',
		icon: TriangleAlertIcon,
	},
	{
		key: 'care-plan-reviews',
		title: 'Care plan reviews',
		description: 'Which care plans are up to date, due or overdue.',
		icon: ClipboardListIcon,
	},
	{
		key: 'staff-training',
		title: 'Staff training',
		description:
			'Certificates and training that are up to date, due soon or expired.',
		icon: GraduationCapIcon,
	},
	{
		key: 'occupancy',
		title: 'Occupancy',
		description: 'Beds in use, admissions and discharges over time.',
		icon: BedDoubleIcon,
	},
]

const RANGE_OPTIONS = [
	{ value: 'week', label: 'This week' },
	{ value: 'month', label: 'This month' },
	{ value: 'quarter', label: 'Last 3 months' },
] as const

export function ReportsLayoutModule() {
	return (
		<ModuleLayout
			label="Reports"
			nav={
				<>
					<SubNavTitle>Reports</SubNavTitle>
					<SubNavLink to="/reports" end>
						All reports
					</SubNavLink>
					<SubNavLink to="/reports/care-delivery">Care delivery</SubNavLink>
					<SubNavLink to="/reports/medication">Medication</SubNavLink>
					<SubNavLink to="/reports/incidents">Incidents</SubNavLink>
					<SubNavLink to="/reports/visits">Visits</SubNavLink>
					<SubNavLink to="/reports/staff-training">Staff training</SubNavLink>
					<SubNavLink to="/reports/downloads">Downloads</SubNavLink>
				</>
			}
		>
			<Outlet />
		</ModuleLayout>
	)
}

export function ReportsComingSoonModule() {
	return <ComingSoonPanel backTo="/reports" backLabel="Back to reports" />
}

export function ReportsModule() {
	const { currentUser } = useAuth()
	const { workspaceUser } = useWorkspace()
	const [searchParams, setSearchParams] = useSearchParams()
	const [downloading, setDownloading] = useState<Nullable<ReportKey>>(null)
	const [error, setError] = useState<Nullable<string>>(null)

	const rangeParam = searchParams.get('range')
	const range: ReportRange =
		rangeParam === 'week' || rangeParam === 'quarter' ? rangeParam : 'month'
	const workspaceFilter = searchParams.get('workspace') ?? ''

	const setParam = (key: string, value: string | null) =>
		setSearchParams(
			(prev) => {
				if (value) prev.set(key, value)
				else prev.delete(key)
				return prev
			},
			{ replace: true },
		)

	const download = async (key: ReportKey) => {
		setDownloading(key)
		setError(null)
		try {
			const table = await getReport(
				safeString(workspaceUser?.workspace_id),
				key,
				{
					range,
					workspace: workspaceFilter || undefined,
				},
			)
			downloadCsv(`${key}-${range}.csv`, table)
		} catch (e: unknown) {
			setError(e instanceof Error ? e.message : 'Download failed.')
		} finally {
			setDownloading(null)
		}
	}

	return (
		<>
			<PageHeader
				title="Reports"
				description="Download or print for inspections and management meetings"
			/>

			<div className="flex flex-wrap items-end gap-3">
				<SegmentedControl
					label="Period"
					options={RANGE_OPTIONS}
					value={range}
					onValueChange={(value) =>
						setParam('range', value === 'month' ? null : value)
					}
				/>
				<FormField label="Workplace" className="w-64">
					<NativeSelect
						value={workspaceFilter}
						onChange={(event) => setParam('workspace', event.target.value)}
					>
						<option value="">All workplaces</option>
						{currentUser?.workspace_users.map(({ workspace }) => (
							<option key={workspace.id} value={workspace.id}>
								{workspace.name}, {workspace.location}
							</option>
						))}
					</NativeSelect>
				</FormField>
			</div>

			{error ? <Alert tone="critical">{error}</Alert> : null}

			<ul className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-4 p-0">
				{REPORTS.map((report) => {
					const Icon = report.icon
					const isDownloading = downloading === report.key
					return (
						<li
							key={report.key}
							className="bg-card flex flex-col gap-4 rounded-xl border p-6"
						>
							<div className="flex items-start gap-4">
								<span
									aria-hidden="true"
									className="bg-accent text-accent-foreground flex size-11 shrink-0 items-center justify-center rounded-xl"
								>
									<Icon className="size-[22px]" strokeWidth={1.75} />
								</span>
								<div className="flex-1">
									<h2 className="m-0 text-base leading-6 font-semibold">
										{report.title}
									</h2>
									<p className="text-muted-foreground m-0 text-sm">
										{report.description}
									</p>
								</div>
							</div>
							<div className="mt-auto flex flex-wrap gap-2">
								<Link
									to={`/reports/${report.key}`}
									aria-label={`Open ${report.title} report`}
									className={buttonVariants()}
								>
									Open
								</Link>
								<Button
									variant="outline"
									disabled={isDownloading}
									aria-label={`Download ${report.title} report as CSV`}
									onClick={() => void download(report.key)}
								>
									{isDownloading ? (
										<LoaderCircleIcon className="animate-spin" />
									) : (
										<DownloadIcon strokeWidth={1.75} />
									)}
									Download CSV
								</Button>
							</div>
						</li>
					)
				})}
			</ul>
		</>
	)
}
