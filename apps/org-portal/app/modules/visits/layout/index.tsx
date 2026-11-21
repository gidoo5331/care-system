import {
	Outlet,
	useLoaderData,
	useLocation,
	useSearchParams,
} from 'react-router'
import { ComingSoonPanel } from '~/components/coming-soon-panel'
import { ModuleLayout } from '~/components/module-layout'
import { SubNavLink, SubNavTitle } from '~/components/sub-nav'
import { Badge } from '~/components/ui/badge'
import type { loader } from '~/routes/_auth._dashboard.visits'

function VisitsNav({ stats }: { stats: VisitDay['stats'] }) {
	const { pathname } = useLocation()
	const [searchParams] = useSearchParams()
	const view = searchParams.get('view')
	const isVisitsPage = pathname === '/visits'

	return (
		<>
			<SubNavTitle>Visits and rota</SubNavTitle>
			<SubNavLink
				to="/visits"
				active={isVisitsPage && !view}
				trailing={<Badge>{stats.total}</Badge>}
			>
				Today's visits
			</SubNavLink>
			<SubNavLink
				to="/visits?view=late"
				active={isVisitsPage && view === 'late'}
				trailing={
					stats.late_or_missed ? (
						<Badge tone="critical">{stats.late_or_missed}</Badge>
					) : null
				}
			>
				Late or missed
			</SubNavLink>
			<SubNavLink
				to="/visits?view=unassigned"
				active={isVisitsPage && view === 'unassigned'}
				trailing={
					stats.unassigned ? (
						<Badge tone="warning">{stats.unassigned}</Badge>
					) : null
				}
			>
				Not yet assigned
			</SubNavLink>
			<SubNavLink to="/visits/rota">Rota</SubNavLink>
			<SubNavLink to="/visits/availability">Staff availability</SubNavLink>
		</>
	)
}

export function VisitsLayoutModule() {
	const { day } = useLoaderData<typeof loader>()

	return (
		<ModuleLayout label="Visits and rota" nav={<VisitsNav stats={day.stats} />}>
			<Outlet />
		</ModuleLayout>
	)
}

export function VisitsComingSoonModule() {
	return <ComingSoonPanel backTo="/visits" backLabel="Back to today's visits" />
}
