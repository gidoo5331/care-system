import { redirect, type MiddlewareFunction } from 'react-router'
import { SELECT_WORKSPACE_ROUTE } from '../constants'
import { isWorkspaceUserActive } from '../workspace.utils'
import { userContext } from './auth.context.server'
import { getAuthSession, saveAuthSession } from './auth.session.server'
import { workspaceContext } from './workspace.context.server'

export const workspaceMiddleware: MiddlewareFunction = async ({
	request,
	url,
	context,
}) => {
	const userData = context.get(userContext)
	if (!userData) return

	const isOnPicker = url.pathname === SELECT_WORKSPACE_ROUTE

	const authSession = await getAuthSession(request.headers.get('Cookie'))
	const selectedWorkspaceId = authSession.get('selectedWorkspaceId')

	if (!selectedWorkspaceId) {
		if (isOnPicker) return
		throw redirect(
			`${SELECT_WORKSPACE_ROUTE}?return_to=${encodeURIComponent(`${url.pathname}${url.search}`)}`,
		)
	}

	const workspaceUser = userData.user.workspace_users.find(
		(wu) => wu.workspace_id === selectedWorkspaceId,
	)

	// Membership revoked or deactivated since it was picked — make them re-pick.
	if (!workspaceUser || !isWorkspaceUserActive(workspaceUser)) {
		authSession.unset('selectedWorkspaceId')
		throw redirect(SELECT_WORKSPACE_ROUTE, {
			headers: { 'Set-Cookie': await saveAuthSession(authSession) },
		})
	}

	context.set(workspaceContext, { workspaceUser })
}
