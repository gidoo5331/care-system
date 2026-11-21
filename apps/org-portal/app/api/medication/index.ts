import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '~/lib/constants'
import { fetchClient } from '~/lib/transport'

interface MedicationRoundQuery {
	time?: string
	unit?: string
}

const getMedicationRound = async (
	workspaceId: string,
	query: MedicationRoundQuery,
) => {
	const params = new URLSearchParams()
	if (query.time) params.set('time', query.time)
	if (query.unit) params.set('unit', query.unit)

	try {
		const response = await fetchClient<ApiResponse<MedicationRound>>(
			`/v1/admin/workspaces/${workspaceId}/medication-rounds?${params.toString()}`,
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

export const useGetMedicationRound = (
	workspaceId: string,
	query: MedicationRoundQuery,
) =>
	useQuery({
		queryKey: [QUERY_KEYS.MEDICATION_ROUND, workspaceId, query],
		queryFn: () => getMedicationRound(workspaceId, query),
		enabled: Boolean(workspaceId),
		placeholderData: keepPreviousData,
	})
