import { data } from 'react-router'
import type { Route } from './+types/_auth._dashboard.needs-attention'
import { handleAttentionForServer } from '~/api/needs-attention/server'
import { getWorkspaceOverviewForServer } from '~/api/workspaces/server'
import { errorMessage, getApiContext } from '~/lib/actions/api-context.server'
import { APP_NAME } from '~/lib/constants'
import { NeedsAttentionModule } from '~/modules'

export async function loader({ request, context }: Route.LoaderArgs) {
	const { workspaceId, apiConfig } = await getApiContext({ request, context })
	return {
		workspaceId,
		overview: await getWorkspaceOverviewForServer(workspaceId, apiConfig),
	}
}

export async function action({ request, context }: Route.ActionArgs) {
	const { workspaceId, apiConfig } = await getApiContext({ request, context })
	const input = (await request.json()) as HandleAttentionInput
	try {
		return {
			item: await handleAttentionForServer(workspaceId, input, apiConfig),
		}
	} catch (error: unknown) {
		return data(
			{ error: errorMessage(error, 'We couldn’t mark that as handled.') },
			{ status: 400 },
		)
	}
}

export const handle = {
	breadcrumb: 'Needs attention',
}

export function meta() {
	return [{ title: `Needs attention - ${APP_NAME}` }]
}

export default NeedsAttentionModule
