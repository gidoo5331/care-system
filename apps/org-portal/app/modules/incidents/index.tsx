import {
	DownloadIcon,
	LoaderCircleIcon,
	PlusIcon,
	SearchXIcon,
} from 'lucide-react'
import { useState } from 'react'
import { Link, useRouteLoaderData, useSearchParams } from 'react-router'
import { useGetIncidents } from '~/api/incidents'
import { getReport } from '~/api/reports'
import { PageHeader } from '~/components/page-header'
import { Pagination } from '~/components/pagination'
import { SearchInput } from '~/components/search-input'
import { StatCard } from '~/components/stat-card'
import { TableBodyContent } from '~/components/table-states'
import { Avatar } from '~/components/ui/avatar'
import { Badge } from '~/components/ui/badge'
import { Button, buttonVariants } from '~/components/ui/button'
import { Card } from '~/components/ui/card'
import { SegmentedControl } from '~/components/ui/segmented-control'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '~/components/ui/table'
import { PAGINATION_DEFAULTS } from '~/lib/constants'
import { downloadCsv } from '~/lib/csv'
import { formatRelativeDay } from '~/lib/date'
import { getIncidentStatus, getIncidentTypeLabel } from '~/lib/incident.utils'
import { getInitials, safeString } from '~/lib/strings'
import { cn } from '~/lib/utils'
import { useWorkspace } from '~/providers/workspace-provider'
import type { loader as incidentsLayoutLoader } from '~/routes/_auth._dashboard.incidents'

const COLUMNS = ['Ref', 'What happened', 'Who', 'Reported', 'Status', '']

const STATUS_FILTER = [
	{ value: 'all', label: 'All' },
	{ value: 'open', label: 'Open' },
	{ value: 'closed', label: 'Closed' },
] as const

const VIEWS: ReadonlyArray<IncidentListView> = [
	'open',
	'awaiting-review',
	'safeguarding',
	'closed',
]

function buildStats(counts: IncidentCounts): Array<OverviewStat> {
	const fallsChange =
		counts.falls_this_month > counts.falls_last_month
			? `up from ${counts.falls_last_month} last month`
			: counts.falls_this_month < counts.falls_last_month
				? `down from ${counts.falls_last_month} last month`
				: 'same as last month'
	return [
		{
			id: 'open',
			label: 'Open',
			value: String(counts.open),
			detail: `${counts.safeguarding} safeguarding`,
			tone: counts.safeguarding ? 'critical' : 'neutral',
		},
		{
			id: 'review',
			label: 'Waiting for my review',
			value: String(counts.awaiting_review),
			detail: `${counts.reported_today} reported today`,
			tone: counts.awaiting_review ? 'warning' : 'neutral',
		},
		{
			id: 'month',
			label: 'This month',
			value: String(counts.this_month),
			detail: 'all incidents',
			tone: 'neutral',
		},
		{
			id: 'falls',
			label: 'Falls this month',
			value: String(counts.falls_this_month),
			detail: fallsChange,
			tone:
				counts.falls_this_month > counts.falls_last_month
					? 'warning'
					: 'neutral',
		},
	]
}

function IncidentRow({ incident }: { incident: Incident }) {
	const status = getIncidentStatus(incident.status)
	const needsReview = incident.status === 'AWAITING_REVIEW'
	const detailPath = `/incidents/${incident.id}`

	return (
		<TableRow>
			<TableCell className="text-muted-foreground font-mono text-[13px]">
				{incident.ref}
			</TableCell>
			<TableCell>
				<span className="text-muted-foreground block text-[13px] leading-[18px] font-medium">
					{getIncidentTypeLabel(incident.type)}
				</span>
				<span className="block">{incident.summary}</span>
			</TableCell>
			<TableCell>
				<span className="flex items-center gap-3">
					<Avatar size="sm" initials={getInitials(incident.resident.name)} />
					<span className="min-w-0">
						<span className="block font-medium">{incident.resident.name}</span>
						<span className="text-muted-foreground block text-[13px] leading-[18px]">
							{incident.resident.place}
						</span>
					</span>
				</span>
			</TableCell>
			<TableCell className="text-muted-foreground" suppressHydrationWarning>
				{incident.reported_by} · {formatRelativeDay(incident.reported_at)}
			</TableCell>
			<TableCell>
				<Badge tone={status.tone}>{status.label}</Badge>
			</TableCell>
			<TableCell className="text-right">
				<Link
					to={detailPath}
					aria-label={`${needsReview ? 'Review' : 'Open'} ${incident.ref}`}
					className={buttonVariants({
						variant: needsReview ? 'default' : 'outline',
					})}
				>
					{needsReview ? 'Review' : 'Open'}
				</Link>
			</TableCell>
		</TableRow>
	)
}

export function IncidentsModule() {
	const { workspaceUser } = useWorkspace()
	const workspaceId = safeString(workspaceUser?.workspace_id)
	const layoutData = useRouteLoaderData<typeof incidentsLayoutLoader>(
		'routes/_auth._dashboard.incidents',
	)
	const [searchParams, setSearchParams] = useSearchParams()
	const [isDownloading, setIsDownloading] = useState(false)

	const viewParam = searchParams.get('view')
	const view = VIEWS.find((v) => v === viewParam)
	const page = Number(searchParams.get('page')) || PAGINATION_DEFAULTS.PAGE

	const { data, isPending, isPlaceholderData, error, refetch } =
		useGetIncidents(workspaceId, {
			pagination: { page, per: PAGINATION_DEFAULTS.PER_PAGE },
			search: { query: searchParams.get('query') ?? undefined },
			filters: { view },
		})

	const download = async () => {
		setIsDownloading(true)
		try {
			const table = await getReport(workspaceId, 'incidents', {
				range: 'quarter',
			})
			downloadCsv('incidents.csv', table)
		} finally {
			setIsDownloading(false)
		}
	}

	return (
		<>
			<PageHeader
				title="Incidents"
				description="Falls, injuries, medication errors, safeguarding and complaints"
				actions={
					<>
						<Button
							variant="outline"
							onClick={() => void download()}
							disabled={isDownloading}
						>
							{isDownloading ? (
								<LoaderCircleIcon className="animate-spin" />
							) : (
								<DownloadIcon strokeWidth={1.75} />
							)}
							Download
						</Button>
						<Link to="/incidents/new" className={buttonVariants()}>
							<PlusIcon strokeWidth={1.75} />
							Report incident
						</Link>
					</>
				}
			/>

			{layoutData ? (
				<div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
					{buildStats(layoutData.counts).map((stat) => (
						<StatCard key={stat.id} stat={stat} />
					))}
				</div>
			) : null}

			<div className="flex flex-wrap items-center gap-3">
				<SearchInput
					label="Search incidents"
					placeholder="Search incidents"
					className="max-w-[360px] flex-[1_1_280px]"
				/>
				<SegmentedControl
					label="Status"
					options={STATUS_FILTER}
					value={view === 'open' || view === 'closed' ? view : 'all'}
					onValueChange={(value) =>
						setSearchParams((prev) => {
							if (value === 'all') prev.delete('view')
							else prev.set('view', value)
							prev.delete('page')
							return prev
						})
					}
				/>
			</div>

			<Card
				aria-label="Incidents"
				aria-busy={isPending || isPlaceholderData}
				className={cn(isPlaceholderData && 'opacity-70 transition-opacity')}
			>
				<Table className="min-w-[900px]">
					<TableHeader>
						<TableRow>
							{COLUMNS.map((column, index) => (
								<TableHead key={column || index}>
									{column || <span className="sr-only">Actions</span>}
								</TableHead>
							))}
						</TableRow>
					</TableHeader>
					<TableBody>
						<TableBodyContent
							columnCount={COLUMNS.length}
							rows={data?.rows}
							isLoading={isPending}
							error={error}
							onRetry={() => void refetch()}
							emptyIcon={SearchXIcon}
							emptyMessage="No incidents match."
							errorMessage="We couldn’t load incidents."
							renderRow={(incident) => (
								<IncidentRow key={incident.id} incident={incident} />
							)}
						/>
					</TableBody>
				</Table>
				{data && data.meta.total > 0 ? (
					<Pagination meta={data.meta} rowCount={data.rows.length} />
				) : null}
			</Card>
		</>
	)
}
