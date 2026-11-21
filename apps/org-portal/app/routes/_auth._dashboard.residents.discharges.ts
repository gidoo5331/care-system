import { data } from 'react-router'
import type { Route } from './+types/_auth._dashboard.residents.discharges'
import {
	getMovementsForServer,
	getResidentOptionsForServer,
	recordMovementForServer,
} from '~/api/residents/server'
import { errorMessage, getApiContext } from '~/lib/actions/api-context.server'
import { APP_NAME } from '~/lib/constants'
import { DischargesModule } from '~/modules'

export async function loader({ request, context }: Route.LoaderArgs) {
	const { workspaceId, apiConfig } = await getApiContext({ request, context })
	const [overview, residentOptions] = await Promise.all([
		getMovementsForServer(workspaceId, apiConfig),
		getResidentOptionsForServer(workspaceId, apiConfig),
	])
	return { overview, residentOptions }
}

export async function action({ request, context }: Route.ActionArgs) {
	const { workspaceId, apiConfig } = await getApiContext({ request, context })
	const input = (await request.json()) as CreateMovementInput
	try {
		return {
			movement: await recordMovementForServer(workspaceId, input, apiConfig),
		}
	} catch (error: unknown) {
		return data(
			{ error: errorMessage(error, 'We couldn’t record that.') },
			{ status: 400 },
		)
	}
}

export const handle = {
	breadcrumb: 'Discharges and transfers',
}

export function meta() {
	return [{ title: `Discharges and transfers - ${APP_NAME}` }]
}

export default DischargesModule
