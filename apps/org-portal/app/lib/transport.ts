import { isMockApiUrl, mockFetch } from './mock-api'

declare global {
	interface Window {
		ENV: {
			API_ADDRESS: string
			AUTH_TOKEN?: string
			SELECTED_WORKSPACE_ID: string
		}
	}
}

/**
 * Fetch wrapper that rejects on 4xx - 5xx so callers can read the error body
 * in their catch block.
 */
export async function transport(
	input: string,
	init?: RequestInit,
): Promise<Response> {
	const response = isMockApiUrl(input)
		? await mockFetch(input, init)
		: await fetch(input, init)

	if (!response.ok) {
		throw response
	}
	return response
}

interface FetchClientConfig extends RequestInit {
	/**
	 * If not set, defaults to the api address {API_ADDRESS}.
	 */
	baseUrl?: string
	/**
	 * If not set, defaults to the token the server rendered into window.ENV.
	 */
	authToken?: string
	isUnAuthorizedRequest?: boolean
}

export interface HttpResponse<T> extends Response {
	parsedBody: T
}

async function request<T>(
	url: string,
	userToken: string | undefined,
	config?: FetchClientConfig,
): Promise<HttpResponse<T>> {
	const headers = new Headers({
		Accept: 'application/json',
		'Content-Type': 'application/json',
		...config?.headers,
	})

	if (!config?.isUnAuthorizedRequest && userToken?.length) {
		headers.append('Authorization', `Bearer ${userToken}`)
	}

	const response = await transport(url, { ...config, headers })

	if (response.status === 204) {
		return { ...response, parsedBody: {} as T }
	}

	const contentType = response.headers.get('Content-Type')
	const parsedBody = contentType?.includes('json')
		? await response.json()
		: await response.text()

	return { ...response, parsedBody }
}

export function fetchClient<T>(path: string, config?: FetchClientConfig) {
	const baseUrl = config?.baseUrl ?? window.ENV.API_ADDRESS
	return request<T>(
		`${baseUrl}${path}`,
		config?.authToken ?? window.ENV.AUTH_TOKEN,
		config,
	)
}

export function fetchServer<T>(path: string, config?: FetchClientConfig) {
	return request<T>(path, config?.authToken, config)
}
