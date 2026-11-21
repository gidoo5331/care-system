import { useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import {
	AlertCircleIcon,
	ChevronDownIcon,
	LoaderCircleIcon,
	PlusIcon,
} from 'lucide-react'
import {
	Link,
	useFetcher,
	useRouteLoaderData,
	useSearchParams,
} from 'react-router'
import { CarerTimeline } from './carer-timeline'
import { useGetVisitDay } from '~/api/visits'
import { PageHeader } from '~/components/page-header'
import { StatCard } from '~/components/stat-card'
import { Alert } from '~/components/ui/alert'
import { Button, buttonVariants } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { Skeleton } from '~/components/ui/skeleton'
import { QUERY_KEYS } from '~/lib/constants'
import { toJsonPayload } from '~/lib/json'
import { safeString } from '~/lib/strings'
import { useWorkspace } from '~/providers/workspace-provider'
import type { loader as visitsLayoutLoader } from '~/routes/_auth._dashboard.visits'
import type { action } from '~/routes/_auth._dashboard.visits._index'

function buildStats(stats: VisitDay['stats']): Array<OverviewStat> {
	return [
		{
			id: 'total',
			label: 'Visits today',
			value: String(stats.total),
			detail: 'across all carers',
			tone: 'neutral',
		},
		{
			id: 'done',
			label: 'Done',
			value: String(stats.done),
			detail: `${stats.on_time} on time`,
			tone: 'neutral',
		},
		{
			id: 'late',
			label: 'Late',
			value: String(stats.late_or_missed),
			detail: stats.late_or_missed ? 'carers notified' : 'none so far',
			tone: stats.late_or_missed ? 'warning' : 'neutral',
		},
		{
			id: 'unassigned',
			label: 'Not assigned',
			value: String(stats.unassigned),
			detail: stats.unassigned ? 'need a carer' : 'all covered',
			tone: stats.unassigned ? 'critical' : 'neutral',
		},
	]
}

function AssignCarer({
	visit,
	carers,
}: {
	visit: Visit
	carers: Array<{ id: string; name: string }>
}) {
	const fetcher = useFetcher<typeof action>()
	const queryClient = useQueryClient()
	const isSubmitting = fetcher.state !== 'idle'

	const assign = (carerId: string) => {
		queryClient.removeQueries({ queryKey: [QUERY_KEYS.VISITS] })
		const input: AssignVisitInput = { visit_id: visit.id, carer_id: carerId }
		void fetcher.submit(toJsonPayload(input), {
			method: 'post',
			encType: 'application/json',
		})
	}

	return (
		<div className="flex flex-col items-end gap-1">
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button disabled={isSubmitting}>
						{isSubmitting ? (
							<LoaderCircleIcon className="animate-spin" />
						) : null}
						Assign carer
						<ChevronDownIcon strokeWidth={1.75} />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuLabel className="text-subtle-foreground text-xs font-semibold tracking-wide uppercase">
						Carers on today
					</DropdownMenuLabel>
					{carers.map((carer) => (
						<DropdownMenuItem key={carer.id} onSelect={() => assign(carer.id)}>
							{carer.name}
						</DropdownMenuItem>
					))}
				</DropdownMenuContent>
			</DropdownMenu>
			{fetcher.data && 'error' in fetcher.data ? (
				<p className="text-destructive m-0 text-[13px]">{fetcher.data.error}</p>
			) : null}
		</div>
	)
}

export function VisitsModule() {
	const { workspaceUser } = useWorkspace()
	const layoutData = useRouteLoaderData<typeof visitsLayoutLoader>(
		'routes/_auth._dashboard.visits',
	)
	const [searchParams] = useSearchParams()
	const viewParam = searchParams.get('view')
	const view: VisitListView | undefined =
		viewParam === 'late' || viewParam === 'unassigned' ? viewParam : undefined

	const { data, isPending, error, refetch } = useGetVisitDay(
		safeString(workspaceUser?.workspace_id),
		{ view },
	)
	const carers = layoutData?.carers ?? []
	const stats = layoutData?.day.stats

	return (
		<>
			<PageHeader
				title="Today's visits"
				description={
					<span suppressHydrationWarning>
						{dayjs().format('dddd D MMMM')} ·{' '}
						{data?.branch_name ?? layoutData?.day.branch_name}
					</span>
				}
				actions={
					<Link to="/visits/new" className={buttonVariants()}>
						<PlusIcon strokeWidth={1.75} />
						Add visit
					</Link>
				}
			/>

			{stats ? (
				<div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
					{buildStats(stats).map((stat) => (
						<StatCard key={stat.id} stat={stat} />
					))}
				</div>
			) : null}

			{error ? (
				<Alert tone="critical" className="items-center">
					<AlertCircleIcon />
					<span className="flex-1">
						We couldn’t load visits. {error.message}
					</span>
					<Button variant="outline" onClick={() => void refetch()}>
						Try again
					</Button>
				</Alert>
			) : null}

			{view !== 'unassigned' ? (
				<Card aria-labelledby="schedule">
					<CardHeader>
						<CardTitle id="schedule">
							{view === 'late' ? 'Late or missed visits' : 'Schedule by carer'}
						</CardTitle>
					</CardHeader>
					{isPending && !data ? (
						<CardContent>
							{Array.from({ length: 4 }, (_, i) => (
								<Skeleton key={i} className="h-12 w-full" />
							))}
						</CardContent>
					) : (
						<CarerTimeline carers={data?.carers ?? []} />
					)}
				</Card>
			) : null}

			{view !== 'late' ? (
				<Card aria-labelledby="unassigned">
					<CardHeader>
						<CardTitle id="unassigned">Not yet assigned</CardTitle>
					</CardHeader>
					{data?.unassigned.length ? (
						<ul className="m-0 list-none p-0">
							{data.unassigned.map((visit) => (
								<li
									key={visit.id}
									className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b px-6 py-3 last:border-b-0"
								>
									<time className="text-muted-foreground w-14 shrink-0 text-sm">
										{visit.start_time}
									</time>
									<span className="min-w-0 flex-1">
										<span className="block text-[15px] leading-[22px] font-medium">
											{visit.client_name}
										</span>
										<span className="text-muted-foreground block text-sm">
											{visit.area} · {visit.duration_minutes} min · {visit.task}
										</span>
									</span>
									<AssignCarer visit={visit} carers={carers} />
								</li>
							))}
						</ul>
					) : (
						<p className="text-muted-foreground m-0 px-6 py-8 text-sm">
							{isPending ? 'Loading…' : 'Every visit today has a carer.'}
						</p>
					)}
				</Card>
			) : null}
		</>
	)
}
