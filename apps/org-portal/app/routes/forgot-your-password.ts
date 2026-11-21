import { data, redirect } from 'react-router'
import type { Route } from './+types/forgot-your-password'
import { sendForgotPasswordLink } from '~/api/auth'
import {
	getAuthSession,
	saveAuthSession,
} from '~/lib/actions/auth.session.server'
import { environmentVariables } from '~/lib/actions/env.server'
import { APP_NAME } from '~/lib/constants'
import { getDisplayUrl, getDomainUrl } from '~/lib/misc'
import { getSocialMetas } from '~/lib/seo'
import { ForgotYourPasswordModule } from '~/modules'

export async function loader({ request }: Route.LoaderArgs) {
	const authSession = await getAuthSession(request.headers.get('Cookie'))
	if (authSession.has('authToken')) {
		return redirect('/')
	}

	const error = authSession.get('error')

	return data(
		{
			origin: getDomainUrl(request),
			error,
		},
		{
			headers: {
				'Set-Cookie': await saveAuthSession(authSession),
			},
		},
	)
}

export async function action({ request }: Route.ActionArgs) {
	const baseUrl = environmentVariables().API_ADDRESS
	const session = await getAuthSession(request.headers.get('Cookie'))

	const form = await request.formData()
	const email = form.get('email')

	if (!email || typeof email !== 'string') {
		session.flash('error', 'Email is required.')
		return data(undefined, {
			headers: { 'Set-Cookie': await saveAuthSession(session) },
		})
	}

	try {
		await sendForgotPasswordLink({ email }, { baseUrl })
	} catch (e) {
		// Only a transport failure is reported. Whether the address has an
		// account is never revealed, so this form can't be used to probe emails.
		if (!(e instanceof Error && e.message === 'EmailNotFound')) {
			session.flash('error', 'We couldn’t send the link. Please try again.')
			return data(undefined, {
				headers: { 'Set-Cookie': await saveAuthSession(session) },
			})
		}
	}

	session.flash(
		'success',
		'If that email has an account, a reset link is on its way.',
	)
	return redirect('/login', {
		headers: { 'Set-Cookie': await saveAuthSession(session) },
	})
}

export function meta({ loaderData, location }: Route.MetaArgs) {
	return getSocialMetas({
		title: `Reset your password - ${APP_NAME}`,
		url: getDisplayUrl({
			origin: loaderData?.origin ?? '',
			path: location.pathname,
		}),
		origin: loaderData?.origin,
	})
}

export default ForgotYourPasswordModule
