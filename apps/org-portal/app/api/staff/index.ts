import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { getForClient } from '~/lib/client-request'
import { QUERY_KEYS } from '~/lib/constants'
import { getQueryParams } from '~/lib/get-param'

export const getStaffList = (
	workspaceId: string,
	query: FetchMultipleDataInputParams<FetchStaffFilter>,
) =>
	getForClient<FetchMultipleDataResponse<StaffMember>>(
		`/v1/admin/workspaces/${workspaceId}/staff?${getQueryParams(query).toString()}`,
	)

export const useGetStaff = (
	workspaceId: string,
	query: FetchMultipleDataInputParams<FetchStaffFilter>,
) =>
	useQuery({
		queryKey: [QUERY_KEYS.STAFF, workspaceId, query],
		queryFn: () => getStaffList(workspaceId, query),
		enabled: Boolean(workspaceId),
		placeholderData: keepPreviousData,
	})
