import type { Route } from './+types/_auth._dashboard.residents.$residentId.assessments'
import {
	getResidentAssessmentsForServer,
	getResidentCarePlanForServer,
	getResidentSummaryForServer,
} from '~/api/residents/server'
import { getApiContext } from '~/lib/actions/api-context.server'
import { ResidentAssessmentsModule } from '~/modules'

export async function loader({ request, context, params }: Route.LoaderArgs) {
	const { workspaceId, apiConfig } = await getApiContext({ request, context })
	const [plan, summary, assessments] = await Promise.all([
		getResidentCarePlanForServer(
			workspaceId,
			params.residentId,
			apiConfig,
		).catch(() => null),
		getResidentSummaryForServer(workspaceId, params.residentId, apiConfig),
		getResidentAssessmentsForServer(workspaceId, params.residentId, apiConfig),
	])
	return { plan, summary, assessments }
}

export default ResidentAssessmentsModule
