import type { Route } from './+types/_auth._dashboard.residents.$residentId.care-plan'
import { getResidentCarePlanForServer } from '~/api/residents/server'
import { resolveAuthToken } from '~/lib/actions/auth.token.server'
import { environmentVariables } from '~/lib/actions/env.server'
import { workspaceContext } from '~/lib/actions/workspace.context.server'
import { ResidentCarePlanModule } from '~/modules'

export async function loader({ request, context, params }: Route.LoaderArgs) {
	const workspaceData = context.get(workspaceContext)
	if (!workspaceData) throw new Error('No workplace selected')

	try {
		const plan = await getResidentCarePlanForServer(
			workspaceData.workspaceUser.workspace_id,
			params.residentId,
			{
				authToken: await resolveAuthToken(request, context),
				baseUrl: environmentVariables().API_ADDRESS,
			},
		)
		return { plan }
	} catch {
		return { plan: null }
	}
}

export default ResidentCarePlanModule
