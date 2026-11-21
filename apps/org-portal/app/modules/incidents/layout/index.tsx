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
import type { loader } from '~/routes/_auth._dashboard.incidents'

function IncidentsNav({ counts }: { counts: IncidentCounts }) {
	const { pathname } = useLocation()
	const [searchParams] = useSearchParams()
	const view = searchParams.get('view')
	const isListPage = pathname === '/incidents'

	const viewLink = (
		value: IncidentListView,
		label: string,
		count?: number,
		tone?: StatusTone,
	) => (
		<SubNavLink
			to={`/incidents?view=${value}`}
			active={isListPage && view === value}
			trailing={count ? <Badge tone={tone}>{count}</Badge> : null}
		>
			{label}
		</SubNavLink>
	)

	return (
		<>
			<SubNavTitle>Incidents</SubNavTitle>
			<SubNavLink
				to="/incidents"
				active={
					(isListPage && !view) ||
					(pathname.startsWith('/incidents/') && pathname !== '/incidents/new')
				}
			>
				All incidents
			</SubNavLink>
			{viewLink('open', 'Open', counts.open)}
			{viewLink(
				'awaiting-review',
				'Waiting for my review',
				counts.awaiting_review,
				'warning',
			)}
			{viewLink(
				'safeguarding',
				'Safeguarding',
				counts.safeguarding,
				'critical',
			)}
			{viewLink('closed', 'Closed')}
		</>
	)
}

export function IncidentsLayoutModule() {
	const { counts } = useLoaderData<typeof loader>()

	return (
		<ModuleLayout label="Incidents" nav={<IncidentsNav counts={counts} />}>
			<Outlet />
		</ModuleLayout>
	)
}

export function IncidentsComingSoonModule() {
	return <ComingSoonPanel backTo="/incidents" backLabel="Back to incidents" />
}
