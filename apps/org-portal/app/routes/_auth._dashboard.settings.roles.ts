import { data } from 'react-router'
import type { Route } from './+types/_auth._dashboard.settings.roles'
import {
	getRolePermissionsForServer,
	saveRolePermissionsForServer,
} from '~/api/settings/server'
import { errorMessage, getApiContext } from '~/lib/actions/api-context.server'
import { APP_NAME } from '~/lib/constants'
import { RolesModule } from '~/modules'

export async function loader({ request, context }: Route.LoaderArgs) {
	const { workspaceId, apiConfig } = await getApiContext({ request, context })
	return {
		permissions: await getRolePermissionsForServer(workspaceId, apiConfig),
	}
}

export async function action({ request, context }: Route.ActionArgs) {
	const { workspaceId, apiConfig } = await getApiContext({ request, context })
	const input = (await request.json()) as RolePermissions
	try {
		await saveRolePermissionsForServer(workspaceId, input, apiConfig)
		return { saved: true as const }
	} catch (error: unknown) {
		return data(
			{ error: errorMessage(error, 'We couldn’t save the permissions.') },
			{ status: 400 },
		)
	}
}

export const handle = {
	breadcrumb: 'Roles and permissions',
}

export function meta() {
	return [{ title: `Roles and permissions - ${APP_NAME}` }]
}

export default RolesModule
