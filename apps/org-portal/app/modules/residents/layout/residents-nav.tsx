import { useLocation, useSearchParams } from 'react-router'
import {
	SubNavLink,
	SubNavSectionLabel,
	SubNavTitle,
} from '~/components/sub-nav'
import { Badge } from '~/components/ui/badge'

interface Props {
	counts?: ResidentCounts
}

const SAVED_VIEWS: ReadonlyArray<{
	view: ResidentListView
	label: string
	count: (counts: ResidentCounts) => number
	tone: StatusTone
}> = [
	{
		view: 'high-risk',
		label: 'High risk',
		count: (c) => c.high_risk,
		tone: 'critical',
	},
	{
		view: 'review-due',
		label: 'Care plan review due',
		count: (c) => c.review_due,
		tone: 'warning',
	},
	{
		view: 'in-hospital',
		label: 'In hospital',
		count: (c) => c.in_hospital,
		tone: 'neutral',
	},
]

const STATIC_PAGES = new Set([
	'/residents/new',
	'/residents/import',
	'/residents/discharges',
	'/residents/appointments',
])

export function ResidentsNav({ counts }: Props) {
	const { pathname } = useLocation()
	const [searchParams] = useSearchParams()
	const view = searchParams.get('view')

	const isListPage = pathname === '/residents'
	const isAllActive =
		(isListPage && !view) ||
		(pathname.startsWith('/residents/') && !STATIC_PAGES.has(pathname))

	return (
		<>
			<SubNavTitle>Residents and clients</SubNavTitle>
			<SubNavLink
				to="/residents"
				active={isAllActive}
				trailing={counts ? <Badge>{counts.total}</Badge> : null}
			>
				All
			</SubNavLink>
			<SubNavLink to="/residents/new">Admit someone new</SubNavLink>
			<SubNavLink to="/residents/discharges">
				Discharges and transfers
			</SubNavLink>
			<SubNavLink
				to="/residents/appointments"
				trailing={
					counts?.appointments_today ? (
						<Badge>{counts.appointments_today} today</Badge>
					) : null
				}
			>
				Appointments
			</SubNavLink>

			<SubNavSectionLabel>Saved views</SubNavSectionLabel>
			{SAVED_VIEWS.map((savedView) => {
				const count = counts ? savedView.count(counts) : 0
				return (
					<SubNavLink
						key={savedView.view}
						to={`/residents?view=${savedView.view}`}
						active={isListPage && view === savedView.view}
						trailing={
							count ? <Badge tone={savedView.tone}>{count}</Badge> : null
						}
					>
						{savedView.label}
					</SubNavLink>
				)
			})}
		</>
	)
}
