import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { getForClient } from '~/lib/client-request'
import { QUERY_KEYS } from '~/lib/constants'
import { getQueryParams } from '~/lib/get-param'

export const useGetIncidents = (
	workspaceId: string,
	query: FetchMultipleDataInputParams<FetchIncidentFilter>,
) =>
	useQuery({
		queryKey: [QUERY_KEYS.INCIDENTS, workspaceId, query],
		queryFn: () =>
			getForClient<FetchMultipleDataResponse<Incident>>(
				`/v1/admin/workspaces/${workspaceId}/incidents?${getQueryParams(query).toString()}`,
			),
		enabled: Boolean(workspaceId),
		placeholderData: keepPreviousData,
	})
