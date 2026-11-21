import { data } from 'react-router'
import type { Route } from './+types/_auth._dashboard.incidents.$incidentId'
import {
	getIncidentForServer,
	reviewIncidentForServer,
} from '~/api/incidents/server'
import { errorMessage, getApiContext } from '~/lib/actions/api-context.server'
import { APP_NAME } from '~/lib/constants'
import { IncidentModule } from '~/modules'

export async function loader({ request, context, params }: Route.LoaderArgs) {
	const { workspaceId, apiConfig } = await getApiContext({ request, context })
	try {
		return {
			incident: await getIncidentForServer(
				workspaceId,
				params.incidentId,
				apiConfig,
			),
		}
	} catch {
		throw new Response(null, { status: 404, statusText: 'Not Found' })
	}
}

export async function action({ request, context, params }: Route.ActionArgs) {
	const { workspaceId, apiConfig } = await getApiContext({ request, context })
	const input = (await request.json()) as ReviewIncidentInput
	try {
		await reviewIncidentForServer(
			workspaceId,
			params.incidentId,
			input,
			apiConfig,
		)
		return { saved: true as const }
	} catch (error: unknown) {
		return data(
			{ error: errorMessage(error, 'We couldn’t save the review.') },
			{ status: 400 },
		)
	}
}

export const handle = {
	breadcrumb: (loaderData?: Awaited<ReturnType<typeof loader>>) =>
		loaderData?.incident.ref ?? 'Incident',
}

export function meta({ loaderData }: Route.MetaArgs) {
	return [{ title: `${loaderData?.incident.ref ?? 'Incident'} - ${APP_NAME}` }]
}

export default IncidentModule
