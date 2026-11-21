import { data, redirect } from 'react-router'
import type { Route } from './+types/_auth.select-workspace'
import { userContext } from '~/lib/actions/auth.context.server'
import {
	getAuthSession,
	saveAuthSession,
} from '~/lib/actions/auth.session.server'
import { APP_NAME } from '~/lib/constants'
import { getDisplayUrl, getDomainUrl, getSafeReturnTo } from '~/lib/misc'
import { getSocialMetas } from '~/lib/seo'
import { isWorkspaceUserActive } from '~/lib/workspace.utils'
import { SelectWorkspaceModule } from '~/modules'

export async function loader({ request, context }: Route.LoaderArgs) {
	const userData = context.get(userContext)
	if (!userData) throw redirect('/login')

	const session = await getAuthSession(request.headers.get('Cookie'))

	return data({
		origin: getDomainUrl(request),
		workspaceUsers: userData.user.workspace_users,
		selectedWorkspaceId: session.get('selectedWorkspaceId') ?? null,
	})
}

export async function action({ request, url, context }: Route.ActionArgs) {
	const userData = context.get(userContext)
	if (!userData) throw redirect('/login')

	const session = await getAuthSession(request.headers.get('Cookie'))
	const form = await request.formData()
	const workspaceId = form.get('workspace_id')

	const workspaceUser = userData.user.workspace_users.find(
		(wu) => wu.workspace_id === workspaceId,
	)
	if (!workspaceUser || !isWorkspaceUserActive(workspaceUser)) {
		return data({ error: 'Choose a workplace you have access to.' }, 400)
	}

	session.set('selectedWorkspaceId', workspaceUser.workspace_id)

	return redirect(getSafeReturnTo(url), {
		headers: { 'Set-Cookie': await saveAuthSession(session) },
	})
}

export function meta({ loaderData, location }: Route.MetaArgs) {
	return getSocialMetas({
		title: `Choose workplace - ${APP_NAME}`,
		url: getDisplayUrl({
			origin: loaderData?.origin ?? '',
			path: location.pathname,
		}),
		origin: loaderData?.origin,
	})
}

export default SelectWorkspaceModule
