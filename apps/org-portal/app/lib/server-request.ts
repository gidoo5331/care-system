import { fetchServer } from './transport'

async function toError(error: unknown) {
	if (error instanceof Response) {
		const body = (await error.json().catch(() => null)) as Nullable<
			ApiResponse<unknown>
		>
		return new Error(body?.errors?.message || 'Unknown error')
	}
	return error instanceof Error ? error : new Error('Unknown error')
}

export async function getForServer<T>(
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
		throw await toError(error)
	}
}

export async function postForServer<T>(
	path: string,
	body: unknown,
	apiConfig: ApiConfigForServerConfig,
) {
	try {
		const response = await fetchServer<ApiResponse<T>>(
			`${apiConfig.baseUrl}${path}`,
			{ ...apiConfig, method: 'POST', body: JSON.stringify(body) },
		)
		return response.parsedBody.data
	} catch (error: unknown) {
		throw await toError(error)
	}
}
