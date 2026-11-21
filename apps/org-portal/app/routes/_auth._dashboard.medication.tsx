import type { Route } from './+types/_auth._dashboard.medication'
import { getMedicationCountsForServer } from '~/api/medication/server'
import { resolveAuthToken } from '~/lib/actions/auth.token.server'
import { environmentVariables } from '~/lib/actions/env.server'
import { workspaceContext } from '~/lib/actions/workspace.context.server'
import { MedicationLayoutModule } from '~/modules'

export async function loader({ request, context }: Route.LoaderArgs) {
	const workspaceData = context.get(workspaceContext)
	if (!workspaceData) throw new Error('No workplace selected')

	const counts = await getMedicationCountsForServer(
		workspaceData.workspaceUser.workspace_id,
		{
			authToken: await resolveAuthToken(request, context),
			baseUrl: environmentVariables().API_ADDRESS,
		},
	)

	return { counts }
}

export const handle = {
	breadcrumb: 'Medication',
}

export default MedicationLayoutModule
