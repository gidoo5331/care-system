import { getForServer, postForServer } from '~/lib/server-request'

const staffPath = (workspaceId: string) =>
	`/v1/admin/workspaces/${workspaceId}/staff`

export const getStaffCountsForServer = (
	workspaceId: string,
	apiConfig: ApiConfigForServerConfig,
) => getForServer<StaffCounts>(`${staffPath(workspaceId)}/counts`, apiConfig)

export const getStaffMemberForServer = (
	workspaceId: string,
	staffId: string,
	apiConfig: ApiConfigForServerConfig,
) =>
	getForServer<StaffMember>(`${staffPath(workspaceId)}/${staffId}`, apiConfig)

export const updateStaffAccessForServer = (
	workspaceId: string,
	staffId: string,
	input: UpdateStaffAccessInput,
	apiConfig: ApiConfigForServerConfig,
) =>
	postForServer<StaffMember>(
		`${staffPath(workspaceId)}/${staffId}/access`,
		input,
		apiConfig,
	)
