import type { Route } from './+types/_auth._dashboard.residents.$residentId._index'
import { getResidentSummaryForServer } from '~/api/residents/server'
import { resolveAuthToken } from '~/lib/actions/auth.token.server'
import { environmentVariables } from '~/lib/actions/env.server'
import { workspaceContext } from '~/lib/actions/workspace.context.server'
import { ResidentSummaryModule } from '~/modules'

export async function loader({ request, context, params }: Route.LoaderArgs) {
	const workspaceData = context.get(workspaceContext)
	if (!workspaceData) throw new Error('No workplace selected')

	const workspaceId = workspaceData.workspaceUser.workspace_id
	const summary = await getResidentSummaryForServer(
		workspaceId,
		params.residentId,
		{
			authToken: await resolveAuthToken(request, context),
			baseUrl: environmentVariables().API_ADDRESS,
		},
	)

	return { workspaceId, residentId: params.residentId, summary }
}

export default ResidentSummaryModule
