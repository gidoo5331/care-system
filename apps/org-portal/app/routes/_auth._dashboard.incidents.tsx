import type { Route } from './+types/_auth._dashboard.incidents'
import { getIncidentCountsForServer } from '~/api/incidents/server'
import { getApiContext } from '~/lib/actions/api-context.server'
import { IncidentsLayoutModule } from '~/modules'

export async function loader({ request, context }: Route.LoaderArgs) {
	const { workspaceId, apiConfig } = await getApiContext({ request, context })
	return { counts: await getIncidentCountsForServer(workspaceId, apiConfig) }
}

export const handle = {
	breadcrumb: 'Incidents',
}

export default IncidentsLayoutModule
