import type { Route } from './+types/_auth._dashboard.residents.$residentId'
import { getResidentForServer } from '~/api/residents/server'
import { resolveAuthToken } from '~/lib/actions/auth.token.server'
import { environmentVariables } from '~/lib/actions/env.server'
import { workspaceContext } from '~/lib/actions/workspace.context.server'
import { APP_NAME } from '~/lib/constants'
import { getDisplayUrl, getDomainUrl } from '~/lib/misc'
import { getResidentName } from '~/lib/resident.utils'
import { getSocialMetas } from '~/lib/seo'
import { ResidentModule } from '~/modules'

export async function loader({ request, context, params }: Route.LoaderArgs) {
	const workspaceData = context.get(workspaceContext)
	if (!workspaceData) throw new Error('No workplace selected')

	const workspaceId = workspaceData.workspaceUser.workspace_id

	try {
		const resident = await getResidentForServer(
			workspaceId,
			params.residentId,
			{
				authToken: await resolveAuthToken(request, context),
				baseUrl: environmentVariables().API_ADDRESS,
			},
		)

		return { origin: getDomainUrl(request), workspaceId, resident }
	} catch {
		throw new Response(null, { status: 404, statusText: 'Not Found' })
	}
}

export const handle = {
	breadcrumb: (data: Awaited<ReturnType<typeof loader>> | undefined) =>
		data?.resident ? getResidentName(data.resident) : 'Resident',
}

export function meta({ loaderData, location }: Route.MetaArgs) {
	const name = loaderData?.resident
		? getResidentName(loaderData.resident)
		: 'Resident'

	return getSocialMetas({
		title: `${name} - ${APP_NAME}`,
		url: getDisplayUrl({
			origin: loaderData?.origin ?? '',
			path: location.pathname,
		}),
		origin: loaderData?.origin,
	})
}

export default ResidentModule
