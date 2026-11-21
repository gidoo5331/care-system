import type { Route } from './+types/_auth._dashboard.visits'
import {
	getVisitCarersForServer,
	getVisitDayForServer,
} from '~/api/visits/server'
import { getApiContext } from '~/lib/actions/api-context.server'
import { VisitsLayoutModule } from '~/modules'

export async function loader({ request, context }: Route.LoaderArgs) {
	const { workspaceId, apiConfig } = await getApiContext({ request, context })
	const [day, carers] = await Promise.all([
		getVisitDayForServer(workspaceId, apiConfig),
		getVisitCarersForServer(workspaceId, apiConfig),
	])
	return { day, carers }
}

export const handle = {
	breadcrumb: 'Visits and rota',
}

export default VisitsLayoutModule
