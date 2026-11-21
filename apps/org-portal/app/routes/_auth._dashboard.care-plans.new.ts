import { data, redirect } from 'react-router'
import type { Route } from './+types/_auth._dashboard.care-plans.new'
import { createCarePlanForServer } from '~/api/care-plans/server'
import { getResidentOptionsForServer } from '~/api/residents/server'
import { errorMessage, getApiContext } from '~/lib/actions/api-context.server'
import { getAssessmentPrefill } from '~/lib/actions/assessment-prefill.server'
import { APP_NAME } from '~/lib/constants'
import { NewCarePlanModule } from '~/modules'

export async function loader({ request, context, url }: Route.LoaderArgs) {
	const { workspaceId, apiConfig } = await getApiContext({ request, context })
	const [residentOptions, prefill] = await Promise.all([
		getResidentOptionsForServer(workspaceId, apiConfig),
		getAssessmentPrefill(
			url,
			workspaceId,
			url.searchParams.get('resident'),
			apiConfig,
		),
	])
	return { residentOptions, prefill }
}

export async function action({ request, context }: Route.ActionArgs) {
	const { workspaceId, apiConfig } = await getApiContext({ request, context })
	const input = (await request.json()) as CreateCarePlanInput
	try {
		const plan = await createCarePlanForServer(workspaceId, input, apiConfig)
		return redirect(`/care-plans/${plan.id}`)
	} catch (error: unknown) {
		return data(
			{ error: errorMessage(error, 'We couldn’t save the care plan.') },
			{ status: 400 },
		)
	}
}

export const handle = {
	breadcrumb: 'New care plan',
}

export function meta() {
	return [{ title: `New care plan - ${APP_NAME}` }]
}

export default NewCarePlanModule
