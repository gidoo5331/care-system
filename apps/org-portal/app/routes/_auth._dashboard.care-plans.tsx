import type { Route } from './+types/_auth._dashboard.care-plans'
import { getCarePlanCountsForServer } from '~/api/care-plans/server'
import { resolveAuthToken } from '~/lib/actions/auth.token.server'
import { environmentVariables } from '~/lib/actions/env.server'
import { workspaceContext } from '~/lib/actions/workspace.context.server'
import { CarePlansLayoutModule } from '~/modules'

export async function loader({ request, context }: Route.LoaderArgs) {
	const workspaceData = context.get(workspaceContext)
	if (!workspaceData) throw new Error('No workplace selected')

	const counts = await getCarePlanCountsForServer(
		workspaceData.workspaceUser.workspace_id,
		{
			authToken: await resolveAuthToken(request, context),
			baseUrl: environmentVariables().API_ADDRESS,
		},
	)

	return { counts }
}

export const handle = {
	breadcrumb: 'Care plans',
}

export default CarePlansLayoutModule
