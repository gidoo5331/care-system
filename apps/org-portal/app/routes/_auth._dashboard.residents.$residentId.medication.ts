import type { Route } from './+types/_auth._dashboard.residents.$residentId.medication'
import { getResidentSummaryForServer } from '~/api/residents/server'
import { getApiContext } from '~/lib/actions/api-context.server'
import { ResidentMedicationModule } from '~/modules'

export async function loader({ request, context, params }: Route.LoaderArgs) {
	const { workspaceId, apiConfig } = await getApiContext({ request, context })
	return {
		residentId: params.residentId,
		summary: await getResidentSummaryForServer(
			workspaceId,
			params.residentId,
			apiConfig,
		),
	}
}

export default ResidentMedicationModule
