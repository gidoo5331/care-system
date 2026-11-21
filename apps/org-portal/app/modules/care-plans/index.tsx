import { ClockAlertIcon, PlusIcon } from 'lucide-react'
import { Link, useRouteLoaderData, useSearchParams } from 'react-router'
import { CarePlansTable } from './components/care-plans-table'
import { useGetCarePlans } from '~/api/care-plans'
import { PageHeader } from '~/components/page-header'
import { Pagination } from '~/components/pagination'
import { SearchInput } from '~/components/search-input'
import { Alert } from '~/components/ui/alert'
import { buttonVariants } from '~/components/ui/button'
import { Card } from '~/components/ui/card'
import { SegmentedControl } from '~/components/ui/segmented-control'
import { PAGINATION_DEFAULTS } from '~/lib/constants'
import { safeString } from '~/lib/strings'
import { cn } from '~/lib/utils'
import { useWorkspace } from '~/providers/workspace-provider'
import type { loader as carePlansLayoutLoader } from '~/routes/_auth._dashboard.care-plans'

const CARE_PLANS_LAYOUT_ROUTE_ID = 'routes/_auth._dashboard.care-plans'

const VIEW_OPTIONS = [
	{ value: 'all', label: 'All' },
	{ value: 'review-due', label: 'Review due' },
	{ value: 'awaiting-approval', label: 'Waiting for approval' },
	{ value: 'drafts', label: 'Drafts' },
] as const

type ViewOption = (typeof VIEW_OPTIONS)[number]['value']

function isView(value: string | null): value is CarePlanListView {
	return VIEW_OPTIONS.some(
		(option) => option.value !== 'all' && option.value === value,
	)
}

export function CarePlansModule() {
	const { workspaceUser } = useWorkspace()
	const layoutData = useRouteLoaderData<typeof carePlansLayoutLoader>(
		CARE_PLANS_LAYOUT_ROUTE_ID,
	)
	const counts = layoutData?.counts
	const [searchParams, setSearchParams] = useSearchParams()

	const viewParam = searchParams.get('view')
	const view = isView(viewParam) ? viewParam : undefined
	const page = Number(searchParams.get('page')) || PAGINATION_DEFAULTS.PAGE

	const { data, isPending, isPlaceholderData, error, refetch } =
		useGetCarePlans(safeString(workspaceUser?.workspace_id), {
			pagination: { page, per: PAGINATION_DEFAULTS.PER_PAGE },
			search: { query: searchParams.get('query') ?? undefined },
			filters: { view },
		})

	const setView = (value: ViewOption) =>
		setSearchParams((prev) => {
			if (value === 'all') prev.delete('view')
			else prev.set('view', value)
			prev.delete('page')
			return prev
		})

	return (
		<>
			<PageHeader
				title="Care plans"
				description={
					counts
						? `${counts.active} active · reviewed at least every 3 months`
						: 'Reviewed at least every 3 months'
				}
				actions={
					<Link to="/care-plans/new" className={buttonVariants()}>
						<PlusIcon strokeWidth={1.75} />
						New care plan
					</Link>
				}
			/>

			{counts?.review_due && view !== 'review-due' ? (
				<Alert tone="warning" className="items-center">
					<ClockAlertIcon />
					<span className="flex-1">
						{counts.review_due === 1
							? '1 care plan needs a review this week.'
							: `${counts.review_due} care plans need a review this week.`}
					</span>
					<button
						type="button"
						onClick={() => setView('review-due')}
						className="cursor-pointer font-semibold underline underline-offset-4"
					>
						Show them
					</button>
				</Alert>
			) : null}

			<div className="flex flex-wrap items-center gap-3">
				<SearchInput
					label="Search care plans"
					placeholder="Search by name, room or ID"
					className="max-w-[360px] flex-[1_1_280px]"
				/>
				<SegmentedControl
					label="Status"
					options={VIEW_OPTIONS}
					value={view ?? 'all'}
					onValueChange={setView}
				/>
			</div>

			<Card
				aria-label="Care plans"
				aria-busy={isPending || isPlaceholderData}
				className={cn(isPlaceholderData && 'opacity-70 transition-opacity')}
			>
				<CarePlansTable
					carePlans={data?.rows}
					isLoading={isPending}
					error={error}
					onRetry={() => void refetch()}
				/>
				{data && data.meta.total > 0 ? (
					<Pagination meta={data.meta} rowCount={data.rows.length} />
				) : null}
			</Card>
		</>
	)
}
