import { PlusIcon, UploadIcon } from 'lucide-react'
import { Link, useRouteLoaderData, useSearchParams } from 'react-router'
import { ResidentsTable } from './components/residents-table'
import { ResidentsController } from './controller'
import { useGetResidents } from '~/api/residents'
import { Pagination } from '~/components/pagination'
import { buttonVariants } from '~/components/ui/button'
import { Card } from '~/components/ui/card'
import { PAGINATION_DEFAULTS } from '~/lib/constants'
import { safeString } from '~/lib/strings'
import { cn } from '~/lib/utils'
import { useWorkspace } from '~/providers/workspace-provider'
import type { loader as residentsLayoutLoader } from '~/routes/_auth._dashboard.residents'

const RESIDENTS_LAYOUT_ROUTE_ID = 'routes/_auth._dashboard.residents'

function readEnum<T extends string>(
	value: string | null,
	allowed: ReadonlyArray<T>,
): T | undefined {
	return allowed.find((option) => option === value)
}

export function ResidentsModule() {
	const { workspaceUser } = useWorkspace()
	const layoutData = useRouteLoaderData<typeof residentsLayoutLoader>(
		RESIDENTS_LAYOUT_ROUTE_ID,
	)
	const counts = layoutData?.counts
	const [searchParams] = useSearchParams()

	const page = Number(searchParams.get('page')) || PAGINATION_DEFAULTS.PAGE

	const { data, isPending, isPlaceholderData, error, refetch } =
		useGetResidents(safeString(workspaceUser?.workspace_id), {
			pagination: { page, per: PAGINATION_DEFAULTS.PER_PAGE },
			search: { query: searchParams.get('query') ?? undefined },
			filters: {
				service: readEnum(searchParams.get('service'), [
					'CARE_HOME',
					'HOMECARE',
				]),
				risk_level: readEnum(searchParams.get('risk_level'), [
					'HIGH',
					'MEDIUM',
					'LOW',
				]),
				view: readEnum(searchParams.get('view'), [
					'high-risk',
					'review-due',
					'in-hospital',
				]),
			},
		})

	return (
		<>
			<div className="flex flex-wrap items-end justify-between gap-4">
				<div className="min-w-0">
					<h1 className="m-0 text-2xl leading-8 font-semibold">
						Residents and clients
					</h1>
					{counts ? (
						<p className="text-muted-foreground m-0 text-sm">
							{counts.care_home} in the care home · {counts.homecare} homecare
							clients
						</p>
					) : null}
				</div>
				<div className="flex flex-wrap items-center gap-2">
					<Link
						to="/residents/import"
						className={buttonVariants({ variant: 'outline' })}
					>
						<UploadIcon strokeWidth={1.75} />
						Import list
					</Link>
					<Link to="/residents/new" className={buttonVariants()}>
						<PlusIcon strokeWidth={1.75} />
						Admit resident
					</Link>
				</div>
			</div>

			<ResidentsController />

			<Card
				aria-label="Residents and clients"
				aria-busy={isPending || isPlaceholderData}
				className={cn(isPlaceholderData && 'opacity-70 transition-opacity')}
			>
				<ResidentsTable
					residents={data?.rows}
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
