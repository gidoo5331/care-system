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
import type { loader } from '~/routes/_auth._dashboard.staff'

function StaffNav({ counts }: { counts: StaffCounts }) {
	const { pathname } = useLocation()
	const [searchParams] = useSearchParams()
	const view = searchParams.get('view')
	const isListPage = pathname === '/staff'

	return (
		<>
			<SubNavTitle>Staff</SubNavTitle>
			<SubNavLink
				to="/staff"
				active={
					(isListPage && !view) ||
					(pathname.startsWith('/staff/') && pathname !== '/staff/invite')
				}
				trailing={<Badge>{counts.total}</Badge>}
			>
				All staff
			</SubNavLink>
			<SubNavLink
				to="/staff?view=on-shift"
				active={isListPage && view === 'on-shift'}
				trailing={<Badge tone="success">{counts.on_shift}</Badge>}
			>
				On shift now
			</SubNavLink>
			<SubNavLink
				to="/staff?view=training-due"
				active={isListPage && view === 'training-due'}
				trailing={
					counts.training_due ? (
						<Badge tone="warning">{counts.training_due}</Badge>
					) : null
				}
			>
				Training due
			</SubNavLink>
			<SubNavLink to="/staff/invite">Invite staff</SubNavLink>
		</>
	)
}

export function StaffLayoutModule() {
	const { counts } = useLoaderData<typeof loader>()

	return (
		<ModuleLayout label="Staff" nav={<StaffNav counts={counts} />}>
			<Outlet />
		</ModuleLayout>
	)
}

export function StaffComingSoonModule() {
	return <ComingSoonPanel backTo="/staff" backLabel="Back to staff" />
}
