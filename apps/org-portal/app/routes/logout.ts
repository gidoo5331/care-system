import { redirect } from 'react-router'
import type { Route } from './+types/logout'
import { revokeRefreshToken } from '~/api/auth'
import {
	deleteAuthSession,
	getAuthSession,
} from '~/lib/actions/auth.session.server'
import { environmentVariables } from '~/lib/actions/env.server'

export async function action({ request }: Route.ActionArgs) {
	const session = await getAuthSession(request.headers.get('Cookie'))

	// Without revoking, the refresh token would stay valid server-side for its
	// full lifetime — the browser session ends but the credential lives on.
	const refreshToken = session.get('refreshToken')
	if (refreshToken) {
		await revokeRefreshToken(
			{ refresh_token: refreshToken },
			{ baseUrl: environmentVariables().API_ADDRESS },
		)
	}

	return redirect('/login', {
		headers: {
			'Set-Cookie': await deleteAuthSession(session),
		},
	})
}

export async function loader() {
	return redirect('/')
}
