import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '~/lib/constants'
import { getQueryParams } from '~/lib/get-param'
import { fetchClient } from '~/lib/transport'

async function toError(error: unknown) {
	if (error instanceof Response) {
		const response = (await error.json()) as ApiResponse<unknown>
		return new Error(response.errors?.message || 'Unknown error')
	}
	return error instanceof Error ? error : new Error('Unknown error')
}

const getCarePlans = async (
	workspaceId: string,
	query: FetchMultipleDataInputParams<FetchCarePlanFilter>,
) => {
	try {
		const params = getQueryParams<FetchCarePlanFilter>(query)
		const response = await fetchClient<
			ApiResponse<FetchMultipleDataResponse<CarePlan>>
		>(`/v1/admin/workspaces/${workspaceId}/care-plans?${params.toString()}`)
		return response.parsedBody.data
	} catch (error: unknown) {
		throw await toError(error)
	}
}

export const useGetCarePlans = (
	workspaceId: string,
	query: FetchMultipleDataInputParams<FetchCarePlanFilter>,
) =>
	useQuery({
		queryKey: [QUERY_KEYS.CARE_PLANS, workspaceId, query],
		queryFn: () => getCarePlans(workspaceId, query),
		enabled: Boolean(workspaceId),
		placeholderData: keepPreviousData,
	})
