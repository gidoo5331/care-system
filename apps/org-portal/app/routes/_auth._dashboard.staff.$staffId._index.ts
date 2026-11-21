import { data } from 'react-router'
import type { Route } from './+types/_auth._dashboard.staff.$staffId._index'
import { updateStaffAccessForServer } from '~/api/staff/server'
import { errorMessage, getApiContext } from '~/lib/actions/api-context.server'
import { StaffTrainingModule } from '~/modules'

export async function action({ request, context, params }: Route.ActionArgs) {
	const { workspaceId, apiConfig } = await getApiContext({ request, context })
	const input = (await request.json()) as UpdateStaffAccessInput
	try {
		await updateStaffAccessForServer(
			workspaceId,
			params.staffId,
			input,
			apiConfig,
		)
		return { saved: true as const }
	} catch (error: unknown) {
		return data(
			{ error: errorMessage(error, 'We couldn’t save their access.') },
			{ status: 400 },
		)
	}
}

export default StaffTrainingModule
