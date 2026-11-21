import type { Route } from './+types/_auth._dashboard._index'
import { getWorkspaceOverviewForServer } from '~/api/workspaces/server'
import { resolveAuthToken } from '~/lib/actions/auth.token.server'
import { environmentVariables } from '~/lib/actions/env.server'
import { workspaceContext } from '~/lib/actions/workspace.context.server'
import { APP_NAME } from '~/lib/constants'
import { getDisplayUrl, getDomainUrl } from '~/lib/misc'
import { getSocialMetas } from '~/lib/seo'
import { OverviewModule } from '~/modules'

export async function loader({ request, context }: Route.LoaderArgs) {
	const baseUrl = environmentVariables().API_ADDRESS
	const authToken = await resolveAuthToken(request, context)
	const workspaceData = context.get(workspaceContext)
	if (!workspaceData) throw new Error('No workplace selected')

	const workspaceId = workspaceData.workspaceUser.workspace_id
	const overview = await getWorkspaceOverviewForServer(workspaceId, {
		authToken,
		baseUrl,
	})

	return {
		origin: getDomainUrl(request),
		workspaceId,
		overview,
	}
}

export const handle = {
	breadcrumb: 'Overview',
}

export function meta({ loaderData, location }: Route.MetaArgs) {
	return getSocialMetas({
		title: `Today - ${APP_NAME}`,
		url: getDisplayUrl({
			origin: loaderData?.origin ?? '',
			path: location.pathname,
		}),
		origin: loaderData?.origin,
	})
}

export default OverviewModule
