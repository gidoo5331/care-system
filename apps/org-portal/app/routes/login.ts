import { data, redirect } from 'react-router'
import type { Route } from './+types/login'

import { login } from '~/api/auth'
import {
	getAuthSession,
	saveAuthSession,
} from '~/lib/actions/auth.session.server'
import { environmentVariables } from '~/lib/actions/env.server'
import { APP_NAME, SELECT_WORKSPACE_ROUTE } from '~/lib/constants'
import { getDisplayUrl, getDomainUrl, getSafeReturnTo } from '~/lib/misc'
import { MOCK_API_ADDRESS } from '~/lib/mock-api'
import { getSocialMetas } from '~/lib/seo'
import { isWorkspaceUserActive } from '~/lib/workspace.utils'
import { LoginModule } from '~/modules'

export async function loader({ request }: Route.LoaderArgs) {
	const authSession = await getAuthSession(request.headers.get('Cookie'))

	if (authSession.has('authToken')) {
		return redirect('/')
	}

	const error = authSession.get('error')
	const success = authSession.get('success')

	return data(
		{
			origin: getDomainUrl(request),
			error,
			success,
			isDemoApi: environmentVariables().API_ADDRESS === MOCK_API_ADDRESS,
		},
		{
			headers: {
				'Set-Cookie': await saveAuthSession(authSession),
			},
		},
	)
}

export async function action({ request, url }: Route.ActionArgs) {
	const baseUrl = environmentVariables().API_ADDRESS
	const session = await getAuthSession(request.headers.get('Cookie'))

	const form = await request.formData()
	const email = form.get('email')
	const password = form.get('password')
	const keepSignedIn = form.get('keep_signed_in') === 'on'

	if (
		!email ||
		!password ||
		typeof email !== 'string' ||
		typeof password !== 'string'
	) {
		session.flash('error', 'Email and password are required.')
		return data(undefined, {
			headers: { 'Set-Cookie': await saveAuthSession(session) },
		})
	}

	try {
		const forwardedHeaders: Record<string, string> = {}
		const browserUserAgent = request.headers.get('User-Agent')
		if (browserUserAgent) forwardedHeaders['User-Agent'] = browserUserAgent
		const forwardedFor = request.headers.get('X-Forwarded-For')
		if (forwardedFor) forwardedHeaders['X-Forwarded-For'] = forwardedFor

		const loginResponse = await login(
			{ email, password },
			{ baseUrl, forwardedHeaders },
		)
		if (!loginResponse) {
			throw new Error('Login failed')
		}

		session.set('authToken', loginResponse.token)
		session.set('refreshToken', loginResponse.refresh_token)
		session.set('keepSignedIn', keepSignedIn)

		const returnTo = getSafeReturnTo(url)
		const activeWorkspaceUsers = loginResponse.user.workspace_users.filter(
			isWorkspaceUserActive,
		)

		const onlyWorkspaceUser = activeWorkspaceUsers[0]
		if (activeWorkspaceUsers.length === 1 && onlyWorkspaceUser) {
			session.set('selectedWorkspaceId', onlyWorkspaceUser.workspace_id)
			return redirect(returnTo, {
				headers: { 'Set-Cookie': await saveAuthSession(session) },
			})
		}

		return redirect(
			`${SELECT_WORKSPACE_ROUTE}?return_to=${encodeURIComponent(returnTo)}`,
			{ headers: { 'Set-Cookie': await saveAuthSession(session) } },
		)
	} catch {
		session.flash(
			'error',
			'We couldn’t sign you in. Check your email and password and try again.',
		)
		return data(undefined, {
			headers: { 'Set-Cookie': await saveAuthSession(session) },
		})
	}
}

export function meta({ loaderData, location }: Route.MetaArgs) {
	return getSocialMetas({
		title: `Sign in - ${APP_NAME}`,
		url: getDisplayUrl({
			origin: loaderData?.origin ?? '',
			path: location.pathname,
		}),
		origin: loaderData?.origin,
	})
}

export default LoginModule
