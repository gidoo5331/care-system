import { data, redirect } from 'react-router'
import type { Route } from './+types/_auth._dashboard.medication.prescriptions.new'
import {
	createPrescriptionForServer,
	getResidentForServer,
	getResidentOptionsForServer,
} from '~/api/residents/server'
import { resolveAuthToken } from '~/lib/actions/auth.token.server'
import { environmentVariables } from '~/lib/actions/env.server'
import { workspaceContext } from '~/lib/actions/workspace.context.server'
import { APP_NAME } from '~/lib/constants'
import { AddPrescriptionModule } from '~/modules'

async function getApiContext({
	request,
	context,
}: Pick<Route.LoaderArgs, 'request' | 'context'>) {
	const workspaceData = context.get(workspaceContext)
	if (!workspaceData) throw new Error('No workplace selected')
	return {
		workspaceId: workspaceData.workspaceUser.workspace_id,
		apiConfig: {
			authToken: await resolveAuthToken(request, context),
			baseUrl: environmentVariables().API_ADDRESS,
		},
	}
}

export async function loader({ request, context, url }: Route.LoaderArgs) {
	const { workspaceId, apiConfig } = await getApiContext({ request, context })
	const residentId = url.searchParams.get('resident')

	if (residentId) {
		try {
			const resident = await getResidentForServer(
				workspaceId,
				residentId,
				apiConfig,
			)
			return { resident, residentOptions: [] }
		} catch {
			throw new Response(null, { status: 404, statusText: 'Not Found' })
		}
	}

	return {
		resident: null,
		residentOptions: await getResidentOptionsForServer(workspaceId, apiConfig),
	}
}

export async function action({ request, context, url }: Route.ActionArgs) {
	const { workspaceId, apiConfig } = await getApiContext({ request, context })
	const residentId = url.searchParams.get('resident')
	if (!residentId) {
		return data({ error: 'Choose who the medicine is for.' }, { status: 400 })
	}

	const input = (await request.json()) as CreatePrescriptionInput

	try {
		await createPrescriptionForServer(workspaceId, residentId, input, apiConfig)
		return redirect(`/residents/${residentId}`)
	} catch (error: unknown) {
		return data(
			{
				error:
					error instanceof Error
						? error.message
						: 'We couldn’t save the prescription. Please try again.',
			},
			{ status: 400 },
		)
	}
}

export const handle = {
	breadcrumb: 'Add prescription',
}

export function meta() {
	return [{ title: `Add prescription - ${APP_NAME}` }]
}

export default AddPrescriptionModule
