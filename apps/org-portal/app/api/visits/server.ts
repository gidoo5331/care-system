import { getForServer, postForServer } from '~/lib/server-request'

export const getVisitCarersForServer = (
	workspaceId: string,
	apiConfig: ApiConfigForServerConfig,
) =>
	getForServer<Array<{ id: string; name: string }>>(
		`/v1/admin/workspaces/${workspaceId}/visits/carers`,
		apiConfig,
	)

export const getVisitDayForServer = (
	workspaceId: string,
	apiConfig: ApiConfigForServerConfig,
) =>
	getForServer<VisitDay>(
		`/v1/admin/workspaces/${workspaceId}/visits`,
		apiConfig,
	)

export const assignVisitForServer = (
	workspaceId: string,
	input: AssignVisitInput,
	apiConfig: ApiConfigForServerConfig,
) =>
	postForServer<Visit>(
		`/v1/admin/workspaces/${workspaceId}/visits/assign`,
		input,
		apiConfig,
	)
