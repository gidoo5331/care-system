import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { getForClient } from '~/lib/client-request'
import { QUERY_KEYS } from '~/lib/constants'

export const useGetAttentionList = (
	workspaceId: string,
	query: { category?: AttentionCategory },
) =>
	useQuery({
		queryKey: [QUERY_KEYS.NEEDS_ATTENTION, workspaceId, query],
		queryFn: () =>
			getForClient<AttentionList>(
				`/v1/admin/workspaces/${workspaceId}/needs-attention${query.category ? `?category=${query.category}` : ''}`,
			),
		enabled: Boolean(workspaceId),
		placeholderData: keepPreviousData,
	})
