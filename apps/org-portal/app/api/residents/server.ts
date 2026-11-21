import { fetchServer } from '~/lib/transport'

async function getForServer<T>(
	path: string,
	apiConfig: ApiConfigForServerConfig,
) {
	try {
		const response = await fetchServer<ApiResponse<T>>(
			`${apiConfig.baseUrl}${path}`,
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

export const getResidentCountsForServer = (
	workspaceId: string,
	apiConfig: ApiConfigForServerConfig,
) =>
	getForServer<ResidentCounts>(
		`/v1/admin/workspaces/${workspaceId}/residents/counts`,
		apiConfig,
	)

export const getResidentForServer = (
	workspaceId: string,
	residentId: string,
	apiConfig: ApiConfigForServerConfig,
) =>
	getForServer<Resident>(
		`/v1/admin/workspaces/${workspaceId}/residents/${residentId}`,
		apiConfig,
	)

export const getResidentSummaryForServer = (
	workspaceId: string,
	residentId: string,
	apiConfig: ApiConfigForServerConfig,
) =>
	getForServer<ResidentSummary>(
		`/v1/admin/workspaces/${workspaceId}/residents/${residentId}/summary`,
		apiConfig,
	)
