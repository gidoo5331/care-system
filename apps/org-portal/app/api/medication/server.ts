import { getForServer } from '~/lib/server-request'

export const getMedicationCountsForServer = (
	workspaceId: string,
	apiConfig: ApiConfigForServerConfig,
) =>
	getForServer<MedicationCounts>(
		`/v1/admin/workspaces/${workspaceId}/medication/counts`,
		apiConfig,
	)
