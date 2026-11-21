import { Outlet, useLoaderData } from 'react-router'
import { ResidentProfileHeader } from './profile-header'
import { useGetResident } from '~/api/residents'
import { RouteTabs } from '~/components/route-tabs'
import type { loader } from '~/routes/_auth._dashboard.residents.$residentId'

const SECTIONS = [
	{ label: 'Summary', path: '', end: true },
	{ label: 'Care plan', path: '/care-plan' },
	{ label: 'Medication', path: '/medication' },
	{ label: 'Notes', path: '/notes' },
	{ label: 'Assessments', path: '/assessments' },
	{ label: 'Documents', path: '/documents' },
	{ label: 'Contacts', path: '/contacts' },
] as const

export function ResidentModule() {
	const loaderData = useLoaderData<typeof loader>()
	const { data } = useGetResident(
		loaderData.workspaceId,
		loaderData.resident.id,
		loaderData.resident,
	)
	const resident = data ?? loaderData.resident

	const basePath = `/residents/${resident.id}`

	return (
		<>
			<ResidentProfileHeader resident={resident} />
			<RouteTabs
				label="Sections"
				tabs={SECTIONS.map((section) => ({
					label: section.label,
					to: `${basePath}${section.path}`,
					end: 'end' in section ? section.end : undefined,
				}))}
			/>
			<Outlet />
		</>
	)
}
