import type { Route } from './+types/_auth._dashboard.staff'
import { getStaffCountsForServer } from '~/api/staff/server'
import { getApiContext } from '~/lib/actions/api-context.server'
import { StaffLayoutModule } from '~/modules'

export async function loader({ request, context }: Route.LoaderArgs) {
	const { workspaceId, apiConfig } = await getApiContext({ request, context })
	return { counts: await getStaffCountsForServer(workspaceId, apiConfig) }
}

export const handle = {
	breadcrumb: 'Staff',
}

export default StaffLayoutModule
