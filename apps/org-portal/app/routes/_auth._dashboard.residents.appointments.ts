import { data } from 'react-router'
import type { Route } from './+types/_auth._dashboard.residents.appointments'
import {
	addAppointmentForServer,
	getAppointmentsForServer,
	getResidentOptionsForServer,
} from '~/api/residents/server'
import { errorMessage, getApiContext } from '~/lib/actions/api-context.server'
import { APP_NAME } from '~/lib/constants'
import { AppointmentsModule } from '~/modules'

type Range = 'today' | 'week' | 'month'

export async function loader({ request, context, url }: Route.LoaderArgs) {
	const { workspaceId, apiConfig } = await getApiContext({ request, context })
	const param = url.searchParams.get('range')
	const range: Range = param === 'today' || param === 'month' ? param : 'week'
	const [appointments, residentOptions] = await Promise.all([
		getAppointmentsForServer(workspaceId, range, apiConfig),
		getResidentOptionsForServer(workspaceId, apiConfig),
	])
	return { appointments, range, residentOptions }
}

export async function action({ request, context }: Route.ActionArgs) {
	const { workspaceId, apiConfig } = await getApiContext({ request, context })
	const input = (await request.json()) as CreateAppointmentInput
	try {
		return {
			appointment: await addAppointmentForServer(workspaceId, input, apiConfig),
		}
	} catch (error: unknown) {
		return data(
			{ error: errorMessage(error, 'We couldn’t add the appointment.') },
			{ status: 400 },
		)
	}
}

export const handle = {
	breadcrumb: 'Appointments',
}

export function meta() {
	return [{ title: `Appointments - ${APP_NAME}` }]
}

export default AppointmentsModule
