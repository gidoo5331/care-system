import { useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '~/lib/constants'
import { fetchClient } from '~/lib/transport'

const getWorkspaceOverview = async (workspaceId: string) => {
	const response = await fetchClient<ApiResponse<WorkspaceOverview>>(
		`/v1/admin/workspaces/${workspaceId}/overview`,
	)
	return response.parsedBody.data
}

export const useGetWorkspaceOverview = (
	workspaceId: string,
	initialData?: WorkspaceOverview,
) =>
	useQuery({
		queryKey: [QUERY_KEYS.WORKSPACE_OVERVIEW, workspaceId],
		queryFn: () => getWorkspaceOverview(workspaceId),
		initialData,
	})
