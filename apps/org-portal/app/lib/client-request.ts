import { fetchClient } from './transport'

export async function getForClient<T>(path: string) {
	try {
		const response = await fetchClient<ApiResponse<T>>(path)
		return response.parsedBody.data
	} catch (error: unknown) {
		if (error instanceof Response) {
			const body = (await error.json().catch(() => null)) as Nullable<
				ApiResponse<unknown>
			>
			throw new Error(body?.errors?.message || 'Unknown error')
		}
		throw error instanceof Error ? error : new Error('Unknown error')
	}
}
