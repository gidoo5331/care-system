import { redirect, type MiddlewareFunction } from 'react-router'
import { userContext } from './auth.context.server'
import {
	deleteAuthSession,
	getAuthSession,
	saveAuthSession,
} from './auth.session.server'
import { authTokenContext } from './auth.token.server'
import { environmentVariables } from './env.server'
import { getCurrentUser, refreshAuthToken } from '~/api/auth'

export const authMiddleware: MiddlewareFunction<Response> = async (
	{ request, url, context },
	next,
) => {
	const baseUrl = environmentVariables().API_ADDRESS
	const authSession = await getAuthSession(request.headers.get('Cookie'))
	const returnTo = `${url.pathname}${url.search}`
	const redirectToLogin = `/login?return_to=${encodeURIComponent(returnTo)}`

	const authToken = authSession.get('authToken')
	if (!authToken) {
		throw redirect(redirectToLogin)
	}

	const endSession = async () =>
		redirect(redirectToLogin, {
			headers: { 'Set-Cookie': await deleteAuthSession(authSession) },
		})

	let activeToken = authToken
	let didRotate = false

	let result = await getCurrentUser({ baseUrl, authToken: activeToken })

	// A 401 is the expected state once the access token expires — rotate
	// rather than ending the session.
	if (!result.ok && result.status === 401) {
		const refreshToken = authSession.get('refreshToken')
		if (!refreshToken) throw await endSession()

		const pair = await refreshAuthToken(
			{ refresh_token: refreshToken },
			{ baseUrl },
		)
		if (!pair) throw await endSession()

		authSession.set('authToken', pair.token)
		authSession.set('refreshToken', pair.refresh_token)
		activeToken = pair.token
		didRotate = true

		result = await getCurrentUser({ baseUrl, authToken: activeToken })
	}

	if (!result.ok) {
		if (result.status === 401) throw await endSession()
		// 5xx and network failures are transient; surfacing the error keeps
		// the session alive through a backend hiccup.
		throw new Error('Unable to verify your session. Please try again.')
	}

	context.set(userContext, { user: result.user })
	context.set(authTokenContext, { token: activeToken })

	const response = await next()

	if (didRotate) {
		// Appended, not set: workspaceMiddleware may already have added its own
		// Set-Cookie, and overwriting would drop it.
		response.headers.append('Set-Cookie', await saveAuthSession(authSession))
	}

	return response
}
