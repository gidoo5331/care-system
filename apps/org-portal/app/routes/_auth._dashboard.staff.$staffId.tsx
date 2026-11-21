import type { Route } from './+types/_auth._dashboard.staff.$staffId'
import { getStaffMemberForServer } from '~/api/staff/server'
import { getApiContext } from '~/lib/actions/api-context.server'
import { APP_NAME } from '~/lib/constants'
import { StaffMemberModule } from '~/modules'

export async function loader({ request, context, params }: Route.LoaderArgs) {
	const { workspaceId, apiConfig } = await getApiContext({ request, context })
	try {
		return {
			staff: await getStaffMemberForServer(
				workspaceId,
				params.staffId,
				apiConfig,
			),
		}
	} catch {
		throw new Response(null, { status: 404, statusText: 'Not Found' })
	}
}

export const handle = {
	breadcrumb: (data?: Awaited<ReturnType<typeof loader>>) =>
		data?.staff.name ?? 'Staff member',
}

export function meta({ loaderData }: Route.MetaArgs) {
	return [
		{ title: `${loaderData?.staff.name ?? 'Staff member'} - ${APP_NAME}` },
	]
}

export default StaffMemberModule
