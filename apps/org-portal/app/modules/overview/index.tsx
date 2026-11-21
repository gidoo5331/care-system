import dayjs from 'dayjs'
import { PlusIcon, TriangleAlertIcon } from 'lucide-react'
import { Link, useLoaderData } from 'react-router'
import { MedicationRound } from './components/medication-round'
import { NeedsAttention } from './components/needs-attention'
import { OnShift } from './components/on-shift'
import { OverviewNav } from './components/overview-nav'
import { useGetWorkspaceOverview } from '~/api/workspaces'
import { ModuleLayout } from '~/components/module-layout'
import { StatCard } from '~/components/stat-card'
import { buttonVariants } from '~/components/ui/button'
import { getFirstName } from '~/lib/strings'
import { useAuth } from '~/providers/auth-provider'
import { useWorkspace } from '~/providers/workspace-provider'
import type { loader } from '~/routes/_auth._dashboard._index'

function getGreeting(hour: number) {
	if (hour < 12) return 'Good morning'
	if (hour < 17) return 'Good afternoon'
	return 'Good evening'
}

export function OverviewModule() {
	const loaderData = useLoaderData<typeof loader>()
	const { currentUser } = useAuth()
	const { workspaceUser } = useWorkspace()
	const workspace = workspaceUser?.workspace

	const { data: overview } = useGetWorkspaceOverview(
		loaderData.workspaceId,
		loaderData.overview,
	)

	const now = dayjs()
	const isCareHome = workspace?.type === 'CARE_HOME'

	return (
		<ModuleLayout label="Overview" nav={<OverviewNav overview={overview} />}>
			<div className="flex flex-wrap items-end justify-between gap-4">
				<div className="min-w-0">
					{/* Greeting and date depend on the viewer's clock, which the server can't know. */}
					<h1
						className="m-0 text-2xl leading-8 font-semibold"
						suppressHydrationWarning
					>
						{getGreeting(now.hour())}, {getFirstName(currentUser?.name ?? '')}
					</h1>
					<p
						className="text-muted-foreground m-0 text-sm"
						suppressHydrationWarning
					>
						{now.format('dddd D MMMM')} · {workspace?.name}
					</p>
				</div>
				<div className="flex flex-wrap items-center gap-2">
					<Link
						to="/incidents/new"
						className={buttonVariants({ variant: 'outline' })}
					>
						<TriangleAlertIcon strokeWidth={1.75} />
						Report incident
					</Link>
					<Link to="/residents/new" className={buttonVariants()}>
						<PlusIcon strokeWidth={1.75} />
						{isCareHome ? 'Admit resident' : 'Add client'}
					</Link>
				</div>
			</div>

			{overview ? (
				<>
					<div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4">
						{overview.stats.map((stat) => (
							<StatCard key={stat.id} stat={stat} />
						))}
					</div>

					<div className="flex flex-wrap items-start gap-6">
						<div className="flex min-w-0 flex-[999_1_560px] flex-col gap-6">
							<NeedsAttention items={overview.needs_attention} />
						</div>
						<div className="flex min-w-0 flex-[1_1_360px] flex-col gap-6">
							{overview.medication_round ? (
								<MedicationRound round={overview.medication_round} />
							) : null}
							<OnShift staff={overview.on_shift} />
						</div>
					</div>
				</>
			) : null}
		</ModuleLayout>
	)
}
