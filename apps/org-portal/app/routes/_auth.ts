import type { Route } from './+types/_auth'
import { userContext } from '~/lib/actions/auth.context.server'
import { authMiddleware } from '~/lib/actions/auth.middleware.server'
import { workspaceContext } from '~/lib/actions/workspace.context.server'
import { workspaceMiddleware } from '~/lib/actions/workspace.middleware.server'
import { AuthMiddlewareModule } from '~/modules'

export const middleware = [authMiddleware, workspaceMiddleware]

export async function loader({ context }: Route.LoaderArgs) {
	const authData = context.get(userContext)
	const workspaceData = context.get(workspaceContext)

	return {
		currentUser: authData?.user,
		workspaceUser: workspaceData?.workspaceUser,
	}
}

export default AuthMiddlewareModule
