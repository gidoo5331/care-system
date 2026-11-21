import { Outlet, useLoaderData } from 'react-router'
import { ResidentsNav } from './residents-nav'
import { ModuleLayout } from '~/components/module-layout'
import type { loader } from '~/routes/_auth._dashboard.residents'

export function ResidentsLayoutModule() {
	const { counts } = useLoaderData<typeof loader>()

	return (
		<ModuleLayout
			label="Residents and clients"
			nav={<ResidentsNav counts={counts} />}
		>
			<Outlet />
		</ModuleLayout>
	)
}
