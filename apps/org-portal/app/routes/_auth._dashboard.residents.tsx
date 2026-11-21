import type { Route } from './+types/_auth._dashboard.residents'
import { getResidentCountsForServer } from '~/api/residents/server'
import { resolveAuthToken } from '~/lib/actions/auth.token.server'
import { environmentVariables } from '~/lib/actions/env.server'
import { workspaceContext } from '~/lib/actions/workspace.context.server'
import { ResidentsLayoutModule } from '~/modules'

export async function loader({ request, context }: Route.LoaderArgs) {
	const workspaceData = context.get(workspaceContext)
	if (!workspaceData) throw new Error('No workplace selected')

	const workspaceId = workspaceData.workspaceUser.workspace_id
	const counts = await getResidentCountsForServer(workspaceId, {
		authToken: await resolveAuthToken(request, context),
		baseUrl: environmentVariables().API_ADDRESS,
	})

	return { workspaceId, counts }
}

export const handle = {
	breadcrumb: 'Residents and clients',
}

export default ResidentsLayoutModule
