import { getForServer, postForServer } from '~/lib/server-request'

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

export const createCarePlanForServer = (
	workspaceId: string,
	input: CreateCarePlanInput,
	apiConfig: ApiConfigForServerConfig,
) => postForServer<CarePlan>(carePlansPath(workspaceId), input, apiConfig)

export const saveCarePlanForServer = (
	workspaceId: string,
	carePlanId: string,
	input: SaveCarePlanInput,
	apiConfig: ApiConfigForServerConfig,
) =>
	postForServer<CarePlan>(
		`${carePlansPath(workspaceId)}/${carePlanId}`,
		input,
		apiConfig,
	)
