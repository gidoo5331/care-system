import { data } from 'react-router'
import type { Route } from './+types/_auth._dashboard.visits._index'
import { assignVisitForServer } from '~/api/visits/server'
import { errorMessage, getApiContext } from '~/lib/actions/api-context.server'
import { APP_NAME } from '~/lib/constants'
import { VisitsModule } from '~/modules'

export async function action({ request, context }: Route.ActionArgs) {
	const { workspaceId, apiConfig } = await getApiContext({ request, context })
	const input = (await request.json()) as AssignVisitInput
	try {
		return { visit: await assignVisitForServer(workspaceId, input, apiConfig) }
	} catch (error: unknown) {
		return data(
			{ error: errorMessage(error, 'We couldn’t assign that visit.') },
			{ status: 400 },
		)
	}
}

export const handle = {
	breadcrumb: "Today's visits",
}

export function meta() {
	return [{ title: `Today's visits - ${APP_NAME}` }]
}

export default VisitsModule
