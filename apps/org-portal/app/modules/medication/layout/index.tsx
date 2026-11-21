import { Outlet, useLoaderData } from 'react-router'
import { ComingSoonPanel } from '~/components/coming-soon-panel'
import { ModuleLayout } from '~/components/module-layout'
import { SubNavLink, SubNavTitle } from '~/components/sub-nav'
import { Badge } from '~/components/ui/badge'
import type { loader } from '~/routes/_auth._dashboard.medication'

export function MedicationLayoutModule() {
	const { counts } = useLoaderData<typeof loader>()

	return (
		<ModuleLayout
			label="Medication"
			nav={
				<>
					<SubNavTitle>Medication</SubNavTitle>
					<SubNavLink to="/medication" end>
						Today's rounds
					</SubNavLink>
					<SubNavLink
						to="/medication/missed"
						trailing={
							counts.missed_and_refused ? (
								<Badge tone="critical">{counts.missed_and_refused}</Badge>
							) : null
						}
					>
						Missed and refused
					</SubNavLink>
					<SubNavLink to="/medication/prescriptions" end>
						Prescriptions
					</SubNavLink>
					<SubNavLink to="/medication/prescriptions/new">
						Add prescription
					</SubNavLink>
					<SubNavLink to="/medication/prn-log">As-needed (PRN) log</SubNavLink>
					<SubNavLink
						to="/medication/reviews"
						trailing={
							counts.reviews_due ? (
								<Badge tone="warning">{counts.reviews_due}</Badge>
							) : null
						}
					>
						Reviews due
					</SubNavLink>
				</>
			}
		>
			<Outlet />
		</ModuleLayout>
	)
}

export function MedicationComingSoonModule() {
	return <ComingSoonPanel backTo="/medication" backLabel="Back to rounds" />
}
