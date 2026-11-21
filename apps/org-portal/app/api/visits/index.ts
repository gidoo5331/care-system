import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { getForClient } from '~/lib/client-request'
import { QUERY_KEYS } from '~/lib/constants'

export const useGetVisitDay = (
	workspaceId: string,
	query: { view?: VisitListView },
) =>
	useQuery({
		queryKey: [QUERY_KEYS.VISITS, workspaceId, query],
		queryFn: () =>
			getForClient<VisitDay>(
				`/v1/admin/workspaces/${workspaceId}/visits${query.view ? `?view=${query.view}` : ''}`,
			),
		enabled: Boolean(workspaceId),
		placeholderData: keepPreviousData,
	})

export const useGetRotaWeek = (
	workspaceId: string,
	query: { week: number; unit: string },
) =>
	useQuery({
		queryKey: [QUERY_KEYS.ROTA, workspaceId, query],
		queryFn: () =>
			getForClient<RotaWeek>(
				`/v1/admin/workspaces/${workspaceId}/rota?${new URLSearchParams({
					week: String(query.week),
					unit: query.unit,
				}).toString()}`,
			),
		enabled: Boolean(workspaceId),
		placeholderData: keepPreviousData,
	})
