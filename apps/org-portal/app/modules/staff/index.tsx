import {
	DownloadIcon,
	LoaderCircleIcon,
	PlusIcon,
	SearchXIcon,
} from 'lucide-react'
import { useState } from 'react'
import { Link, useRouteLoaderData, useSearchParams } from 'react-router'
import { getStaffList, useGetStaff } from '~/api/staff'
import { PageHeader } from '~/components/page-header'
import { Pagination } from '~/components/pagination'
import { SearchInput } from '~/components/search-input'
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
import {
	getStaffRoleLabel,
	getStaffToday,
	getTrainingSummary,
} from '~/lib/staff.utils'
import { getInitials, safeString } from '~/lib/strings'
import { cn } from '~/lib/utils'
import { useWorkspace } from '~/providers/workspace-provider'
import type { loader as staffLayoutLoader } from '~/routes/_auth._dashboard.staff'

const COLUMNS = ['Name', 'Works at', 'Phone', 'Training', 'Today']

const GROUP_OPTIONS = [
	{ value: 'all', label: 'All' },
	{ value: 'nurses', label: 'Nurses' },
	{ value: 'carers', label: 'Carers' },
	{ value: 'office', label: 'Office' },
] as const

const GROUPS: ReadonlyArray<StaffRoleGroup> = ['nurses', 'carers', 'office']
const VIEWS: ReadonlyArray<StaffListView> = ['on-shift', 'training-due']

function StaffRow({ staff }: { staff: StaffMember }) {
	const training = getTrainingSummary(staff)
	const today = getStaffToday(staff.today)

	return (
		<TableRow>
			<TableCell>
				<Link
					to={`/staff/${staff.id}`}
					className="text-foreground group flex items-center gap-3 no-underline"
				>
					<Avatar size="sm" initials={getInitials(staff.name)} />
					<span className="min-w-0">
						<span className="group-hover:text-primary block font-medium">
							{staff.name}
						</span>
						<span className="text-muted-foreground block text-[13px] leading-[18px]">
							{getStaffRoleLabel(staff.role)}
						</span>
					</span>
				</Link>
			</TableCell>
			<TableCell>{staff.works_at}</TableCell>
			<TableCell className="text-muted-foreground">
				<a
					href={`tel:${staff.phone_number.replace(/\s/g, '')}`}
					className="text-inherit"
				>
					{staff.phone_number}
				</a>
			</TableCell>
			<TableCell>
				{training.tone === 'success' ? (
					<span className="text-muted-foreground">{training.label}</span>
				) : (
					<Badge tone={training.tone}>{training.label}</Badge>
				)}
			</TableCell>
			<TableCell>
				<Badge tone={today.tone}>{today.label}</Badge>
			</TableCell>
		</TableRow>
	)
}

export function StaffModule() {
	const { workspaceUser } = useWorkspace()
	const workspaceId = safeString(workspaceUser?.workspace_id)
	const layoutData = useRouteLoaderData<typeof staffLayoutLoader>(
		'routes/_auth._dashboard.staff',
	)
	const counts = layoutData?.counts
	const [searchParams, setSearchParams] = useSearchParams()
	const [isDownloading, setIsDownloading] = useState(false)

	const group = GROUPS.find((g) => g === searchParams.get('group'))
	const view = VIEWS.find((v) => v === searchParams.get('view'))
	const page = Number(searchParams.get('page')) || PAGINATION_DEFAULTS.PAGE
	const query = searchParams.get('query') ?? undefined

	const { data, isPending, isPlaceholderData, error, refetch } = useGetStaff(
		workspaceId,
		{
			pagination: { page, per: PAGINATION_DEFAULTS.PER_PAGE },
			search: { query },
			filters: { group, view },
		},
	)

	const download = async () => {
		setIsDownloading(true)
		try {
			const all = await getStaffList(workspaceId, {
				pagination: { page: 1, per: 500 },
				search: { query },
				filters: { group, view },
			})
			downloadCsv('staff.csv', {
				columns: [
					'Name',
					'Role',
					'Works at',
					'Phone',
					'Email',
					'Training',
					'Today',
				],
				rows: all.rows.map((staff) => [
					staff.name,
					getStaffRoleLabel(staff.role),
					staff.works_at,
					staff.phone_number,
					staff.email,
					getTrainingSummary(staff).label,
					getStaffToday(staff.today).label,
				]),
			})
		} finally {
			setIsDownloading(false)
		}
	}

	return (
		<>
			<PageHeader
				title="Staff"
				description={
					counts
						? `${counts.total} people across ${counts.workplaces} workplaces`
						: undefined
				}
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
							Download list
						</Button>
						<Link to="/staff/invite" className={buttonVariants()}>
							<PlusIcon strokeWidth={1.75} />
							Invite staff
						</Link>
					</>
				}
			/>

			<div className="flex flex-wrap items-center gap-3">
				<SearchInput
					label="Search staff"
					placeholder="Search by name or role"
					className="max-w-[360px] flex-[1_1_280px]"
				/>
				<SegmentedControl
					label="Role"
					options={GROUP_OPTIONS}
					value={group ?? 'all'}
					onValueChange={(value) =>
						setSearchParams((prev) => {
							if (value === 'all') prev.delete('group')
							else prev.set('group', value)
							prev.delete('page')
							return prev
						})
					}
				/>
			</div>

			<Card
				aria-label="Staff"
				aria-busy={isPending || isPlaceholderData}
				className={cn(isPlaceholderData && 'opacity-70 transition-opacity')}
			>
				<Table className="min-w-[860px]">
					<TableHeader>
						<TableRow>
							{COLUMNS.map((column) => (
								<TableHead key={column}>{column}</TableHead>
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
							emptyMessage="No staff match."
							errorMessage="We couldn’t load staff."
							renderRow={(staff) => <StaffRow key={staff.id} staff={staff} />}
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
