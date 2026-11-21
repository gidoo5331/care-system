import { fetchServer } from '~/lib/transport'

export const getWorkspaceOverviewForServer = async (
	workspaceId: string,
	apiConfig: ApiConfigForServerConfig,
) => {
	try {
		const response = await fetchServer<ApiResponse<WorkspaceOverview>>(
			`${apiConfig.baseUrl}/v1/admin/workspaces/${workspaceId}/overview`,
			{ ...apiConfig },
		)
		return response.parsedBody.data
	} catch (error: unknown) {
		if (error instanceof Response) {
			const response = (await error.json()) as ApiResponse<unknown>
			throw new Error(response.errors?.message || 'Unknown error')
		}
		throw error
	}
}
