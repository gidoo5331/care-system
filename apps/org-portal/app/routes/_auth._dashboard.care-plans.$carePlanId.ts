import type { Route } from './+types/_auth._dashboard.care-plans.$carePlanId'
import { getCarePlanForServer } from '~/api/care-plans/server'
import { resolveAuthToken } from '~/lib/actions/auth.token.server'
import { environmentVariables } from '~/lib/actions/env.server'
import { workspaceContext } from '~/lib/actions/workspace.context.server'
import { APP_NAME } from '~/lib/constants'
import { CarePlanModule } from '~/modules'

export async function loader({ request, context, params }: Route.LoaderArgs) {
	const workspaceData = context.get(workspaceContext)
	if (!workspaceData) throw new Error('No workplace selected')

	try {
		const plan = await getCarePlanForServer(
			workspaceData.workspaceUser.workspace_id,
			params.carePlanId,
			{
				authToken: await resolveAuthToken(request, context),
				baseUrl: environmentVariables().API_ADDRESS,
			},
		)
		return { plan }
	} catch {
		throw new Response(null, { status: 404, statusText: 'Not Found' })
	}
}

const residentName = (data?: Awaited<ReturnType<typeof loader>>) =>
	data?.plan
		? `${data.plan.resident.first_name} ${data.plan.resident.last_name}`
		: 'Care plan'

export const handle = {
	breadcrumb: residentName,
}

export function meta({ loaderData }: Route.MetaArgs) {
	return [{ title: `${residentName(loaderData)}'s care plan - ${APP_NAME}` }]
}

export default CarePlanModule
