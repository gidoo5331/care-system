import { useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '~/lib/constants'
import { fetchClient, fetchServer } from '~/lib/transport'

export interface LoginInput {
	email: string
	password: string
}

export interface TokenPair {
	token: string
	expires_in: number
	refresh_token: string
	refresh_expires_in: number
}

interface LoginResponse extends TokenPair {
	user: User
}

async function toError(error: unknown) {
	if (error instanceof Response) {
		const body = (await error.json().catch(() => null)) as Nullable<
			ApiResponse<unknown>
		>
		return new Error(body?.errors?.message || 'Unknown error')
	}
	if (error instanceof Error) return error
	return new Error('Unknown error')
}

export const login = async (
	props: LoginInput,
	apiConfig: ApiConfigForServerConfig & { forwardedHeaders?: HeadersInit },
) => {
	try {
		const response = await fetchServer<ApiResponse<LoginResponse>>(
			`${apiConfig.baseUrl}/v1/admin/users/login`,
			{
				method: 'POST',
				body: JSON.stringify(props),
				// Login runs server-side; without these the backend would record
				// this server, not the person's browser, against the session.
				headers: apiConfig.forwardedHeaders,
			},
		)
		return response.parsedBody.data
	} catch (error: unknown) {
		throw await toError(error)
	}
}

export type CurrentUserResult =
	| { ok: true; user: User }
	| { ok: false; status: number | null }

export const getCurrentUser = async (
	apiConfig: ApiConfigForServerConfig,
): Promise<CurrentUserResult> => {
	try {
		const response = await fetchServer<ApiResponse<User>>(
			`${apiConfig.baseUrl}/v1/admin/users/me`,
			{ method: 'GET', ...apiConfig },
		)
		const user = response.parsedBody.data
		if (!user) return { ok: false, status: null }
		return { ok: true, user }
	} catch (error: unknown) {
		if (error instanceof Response) {
			return { ok: false, status: error.status }
		}
		return { ok: false, status: null }
	}
}

/**
 * Returns null on any failure — every rejection (invalid, revoked, expired)
 * is the same opaque 401, so there is nothing for a caller to branch on.
 */
export const refreshAuthToken = async (
	props: { refresh_token: string },
	apiConfig: ApiConfigForServerConfig,
): Promise<TokenPair | null> => {
	try {
		const response = await fetchServer<ApiResponse<TokenPair>>(
			`${apiConfig.baseUrl}/v1/admin/users/refresh`,
			{ method: 'POST', body: JSON.stringify(props) },
		)
		return response.parsedBody.data ?? null
	} catch {
		return null
	}
}

/**
 * Best-effort and never throws: signing out must not be blocked by the
 * network. The timeout matters — a backend that accepts the connection but
 * never answers makes fetch hang rather than throw.
 */
const REVOKE_TIMEOUT_MS = 3000

export const revokeRefreshToken = async (
	props: { refresh_token: string },
	apiConfig: ApiConfigForServerConfig,
): Promise<void> => {
	try {
		await fetchServer(`${apiConfig.baseUrl}/v1/admin/users/logout`, {
			method: 'POST',
			body: JSON.stringify(props),
			signal: AbortSignal.timeout(REVOKE_TIMEOUT_MS),
		})
	} catch {
		// ignored — see doc comment
	}
}

export const sendForgotPasswordLink = async (
	props: { email: string },
	apiConfig: ApiConfigForServerConfig,
) => {
	try {
		await fetchServer(`${apiConfig.baseUrl}/v1/admin/users/forgot-password`, {
			method: 'POST',
			body: JSON.stringify(props),
		})
	} catch (error: unknown) {
		throw await toError(error)
	}
}

const getCurrentUserClient = async () => {
	const response = await fetchClient<ApiResponse<User>>(`/v1/admin/users/me`, {
		method: 'GET',
	})
	return response.parsedBody.data
}

export const useGetCurrentUser = (initialData?: User) =>
	useQuery({
		queryKey: [QUERY_KEYS.CURRENT_USER],
		queryFn: getCurrentUserClient,
		initialData,
	})
