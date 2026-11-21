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

const getResidents = async (
	workspaceId: string,
	query: FetchMultipleDataInputParams<FetchResidentFilter>,
) => {
	try {
		const params = getQueryParams<FetchResidentFilter>(query)
		const response = await fetchClient<
			ApiResponse<FetchMultipleDataResponse<Resident>>
		>(`/v1/admin/workspaces/${workspaceId}/residents?${params.toString()}`)
		return response.parsedBody.data
	} catch (error: unknown) {
		throw await toError(error)
	}
}

export const useGetResidents = (
	workspaceId: string,
	query: FetchMultipleDataInputParams<FetchResidentFilter>,
) =>
	useQuery({
		queryKey: [QUERY_KEYS.RESIDENTS, workspaceId, query],
		queryFn: () => getResidents(workspaceId, query),
		enabled: Boolean(workspaceId),
		placeholderData: keepPreviousData,
	})

const getResident = async (workspaceId: string, residentId: string) => {
	try {
		const response = await fetchClient<ApiResponse<Resident>>(
			`/v1/admin/workspaces/${workspaceId}/residents/${residentId}`,
		)
		return response.parsedBody.data
	} catch (error: unknown) {
		throw await toError(error)
	}
}

export const useGetResident = (
	workspaceId: string,
	residentId: string,
	initialData?: Resident,
) =>
	useQuery({
		queryKey: [QUERY_KEYS.RESIDENT, workspaceId, residentId],
		queryFn: () => getResident(workspaceId, residentId),
		initialData,
	})

const getResidentSummary = async (workspaceId: string, residentId: string) => {
	try {
		const response = await fetchClient<ApiResponse<ResidentSummary>>(
			`/v1/admin/workspaces/${workspaceId}/residents/${residentId}/summary`,
		)
		return response.parsedBody.data
	} catch (error: unknown) {
		throw await toError(error)
	}
}

export const useGetResidentSummary = (
	workspaceId: string,
	residentId: string,
	initialData?: ResidentSummary,
) =>
	useQuery({
		queryKey: [QUERY_KEYS.RESIDENT_SUMMARY, workspaceId, residentId],
		queryFn: () => getResidentSummary(workspaceId, residentId),
		initialData,
	})
