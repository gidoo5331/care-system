import { getForServer, postForServer } from '~/lib/server-request'

export const getRolePermissionsForServer = (
	workspaceId: string,
	apiConfig: ApiConfigForServerConfig,
) =>
	getForServer<RolePermissions>(
		`/v1/admin/workspaces/${workspaceId}/settings/roles`,
		apiConfig,
	)

export const saveRolePermissionsForServer = (
	workspaceId: string,
	input: RolePermissions,
	apiConfig: ApiConfigForServerConfig,
) =>
	postForServer<RolePermissions>(
		`/v1/admin/workspaces/${workspaceId}/settings/roles`,
		input,
		apiConfig,
	)
