import { data, redirect } from 'react-router'
import type { Route } from './+types/_auth._dashboard.care-plans.$carePlanId_.edit'
import {
	getCarePlanForServer,
	saveCarePlanForServer,
} from '~/api/care-plans/server'
import { errorMessage, getApiContext } from '~/lib/actions/api-context.server'
import { getAssessmentPrefill } from '~/lib/actions/assessment-prefill.server'
import { APP_NAME } from '~/lib/constants'
import { EditCarePlanModule } from '~/modules'

export async function loader({
	request,
	context,
	params,
	url,
}: Route.LoaderArgs) {
	const { workspaceId, apiConfig } = await getApiContext({ request, context })
	let plan: CarePlan
	try {
		plan = await getCarePlanForServer(workspaceId, params.carePlanId, apiConfig)
	} catch {
		throw new Response(null, { status: 404, statusText: 'Not Found' })
	}
	const prefill = await getAssessmentPrefill(
		url,
		workspaceId,
		plan.resident.id,
		apiConfig,
	)
	return { plan, prefill }
}

export async function action({ request, context, params }: Route.ActionArgs) {
	const { workspaceId, apiConfig } = await getApiContext({ request, context })
	const input = (await request.json()) as SaveCarePlanInput
	try {
		await saveCarePlanForServer(
			workspaceId,
			params.carePlanId,
			input,
			apiConfig,
		)
		return redirect(`/care-plans/${params.carePlanId}`)
	} catch (error: unknown) {
		return data(
			{ error: errorMessage(error, 'We couldn’t save the care plan.') },
			{ status: 400 },
		)
	}
}

const residentName = (loaderData?: Awaited<ReturnType<typeof loader>>) =>
	loaderData
		? `${loaderData.plan.resident.first_name} ${loaderData.plan.resident.last_name}`
		: 'Care plan'

export const handle = {
	breadcrumb: residentName,
}

export function meta({ loaderData }: Route.MetaArgs) {
	return [
		{ title: `Edit ${residentName(loaderData)}'s care plan - ${APP_NAME}` },
	]
}

export default EditCarePlanModule
