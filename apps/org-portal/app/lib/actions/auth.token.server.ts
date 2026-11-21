import { createContext, type RouterContextProvider } from 'react-router'
import { getAuthSession } from './auth.session.server'

/**
 * The access token to use for the rest of THIS request. authMiddleware sets it
 * after validating — and possibly rotating — the session, because loaders
 * re-parse the incoming cookie, which still carries the old token.
 */
export const authTokenContext = createContext<{ token: string } | null>(null)

export async function resolveAuthToken(
	request: Request,
	context: Readonly<RouterContextProvider>,
): Promise<string | undefined> {
	const fromContext = context.get(authTokenContext)
	if (fromContext?.token) return fromContext.token

	const session = await getAuthSession(request.headers.get('Cookie'))
	return session.get('authToken')
}
