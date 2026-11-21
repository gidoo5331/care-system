import { getForServer } from '~/lib/server-request'

const carePlansPath = (workspaceId: string) =>
	`/v1/admin/workspaces/${workspaceId}/care-plans`

export const getCarePlanCountsForServer = (
	workspaceId: string,
	apiConfig: ApiConfigForServerConfig,
) =>
	getForServer<CarePlanCounts>(
		`${carePlansPath(workspaceId)}/counts`,
		apiConfig,
	)

export const getCarePlanForServer = (
	workspaceId: string,
	carePlanId: string,
	apiConfig: ApiConfigForServerConfig,
) =>
	getForServer<CarePlan>(
		`${carePlansPath(workspaceId)}/${carePlanId}`,
		apiConfig,
	)
