import { data, redirect } from 'react-router'
import type { Route } from './+types/_auth._dashboard.incidents.new'
import { reportIncidentForServer } from '~/api/incidents/server'
import { getResidentOptionsForServer } from '~/api/residents/server'
import { errorMessage, getApiContext } from '~/lib/actions/api-context.server'
import { APP_NAME } from '~/lib/constants'
import { ReportIncidentModule } from '~/modules'

export async function loader({ request, context }: Route.LoaderArgs) {
	const { workspaceId, apiConfig } = await getApiContext({ request, context })
	return {
		residentOptions: await getResidentOptionsForServer(workspaceId, apiConfig),
	}
}

export async function action({ request, context }: Route.ActionArgs) {
	const { workspaceId, apiConfig } = await getApiContext({ request, context })
	const input = (await request.json()) as ReportIncidentInput
	try {
		const incident = await reportIncidentForServer(
			workspaceId,
			input,
			apiConfig,
		)
		return redirect(`/incidents/${incident.id}`)
	} catch (error: unknown) {
		return data(
			{ error: errorMessage(error, 'We couldn’t save the report.') },
			{ status: 400 },
		)
	}
}

export const handle = {
	breadcrumb: 'Report incident',
}

export function meta() {
	return [{ title: `Report an incident - ${APP_NAME}` }]
}

export default ReportIncidentModule
