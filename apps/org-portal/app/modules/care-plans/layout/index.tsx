import {
	Outlet,
	useLoaderData,
	useLocation,
	useSearchParams,
} from 'react-router'
import { ComingSoonPanel } from '~/components/coming-soon-panel'
import { ModuleLayout } from '~/components/module-layout'
import {
	SubNavLink,
	SubNavSectionLabel,
	SubNavTitle,
} from '~/components/sub-nav'
import { Badge } from '~/components/ui/badge'
import type { loader } from '~/routes/_auth._dashboard.care-plans'

const STATIC_PAGES = new Set([
	'/care-plans/new',
	'/care-plans/assessments',
	'/care-plans/templates',
	'/care-plans/sections',
])

function CarePlansNav({ counts }: { counts: CarePlanCounts }) {
	const { pathname } = useLocation()
	const [searchParams] = useSearchParams()
	const view = searchParams.get('view')
	const isListPage = pathname === '/care-plans'
	const isAllActive =
		(isListPage && !view) ||
		(pathname.startsWith('/care-plans/') &&
			!STATIC_PAGES.has(pathname) &&
			!pathname.startsWith('/care-plans/templates/'))

	return (
		<>
			<SubNavTitle>Care plans</SubNavTitle>
			<SubNavLink
				to="/care-plans"
				active={isAllActive}
				trailing={<Badge>{counts.total}</Badge>}
			>
				All care plans
			</SubNavLink>
			<SubNavLink
				to="/care-plans?view=review-due"
				active={isListPage && view === 'review-due'}
				trailing={
					counts.review_due ? (
						<Badge tone="warning">{counts.review_due}</Badge>
					) : null
				}
			>
				Reviews due
			</SubNavLink>
			<SubNavLink
				to="/care-plans?view=awaiting-approval"
				active={isListPage && view === 'awaiting-approval'}
				trailing={
					counts.awaiting_approval ? (
						<Badge>{counts.awaiting_approval}</Badge>
					) : null
				}
			>
				Waiting for approval
			</SubNavLink>
			<SubNavLink to="/care-plans/assessments">Assessments</SubNavLink>

			<SubNavSectionLabel>Set-up</SubNavSectionLabel>
			<SubNavLink to="/care-plans/templates">Assessment templates</SubNavLink>
			<SubNavLink to="/care-plans/sections">Care plan sections</SubNavLink>
		</>
	)
}

export function CarePlansLayoutModule() {
	const { counts } = useLoaderData<typeof loader>()

	return (
		<ModuleLayout label="Care plans" nav={<CarePlansNav counts={counts} />}>
			<Outlet />
		</ModuleLayout>
	)
}

export function CarePlansComingSoonModule() {
	return <ComingSoonPanel backTo="/care-plans" backLabel="Back to care plans" />
}
