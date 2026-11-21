import { type RouterContextProvider } from 'react-router'
import { resolveAuthToken } from './auth.token.server'
import { environmentVariables } from './env.server'
import { workspaceContext } from './workspace.context.server'

export async function getApiContext({
	request,
	context,
}: {
	request: Request
	context: Readonly<RouterContextProvider>
}) {
	const workspaceData = context.get(workspaceContext)
	if (!workspaceData) throw new Error('No workplace selected')

	return {
		workspaceId: workspaceData.workspaceUser.workspace_id,
		apiConfig: {
			authToken: await resolveAuthToken(request, context),
			baseUrl: environmentVariables().API_ADDRESS,
		},
	}
}

export function errorMessage(error: unknown, fallback: string) {
	return error instanceof Error ? error.message : fallback
}
