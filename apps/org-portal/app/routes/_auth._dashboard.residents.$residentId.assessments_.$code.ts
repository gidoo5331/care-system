import { data } from 'react-router'
import type { Route } from './+types/_auth._dashboard.residents.$residentId.assessments_.$code'
import {
	getResidentAssessmentForServer,
	getResidentForServer,
	saveResidentAssessmentForServer,
} from '~/api/residents/server'
import { errorMessage, getApiContext } from '~/lib/actions/api-context.server'
import { findAssessmentTemplate } from '~/lib/assessment-templates'
import { APP_NAME } from '~/lib/constants'
import { ResidentAssessmentModule } from '~/modules'

function templateOr404(code: string) {
	const template = findAssessmentTemplate(code)
	if (!template)
		throw new Response(null, { status: 404, statusText: 'Not Found' })
	return template
}

export async function loader({ request, context, params }: Route.LoaderArgs) {
	const template = templateOr404(params.code)
	const { workspaceId, apiConfig } = await getApiContext({ request, context })
	const [resident, assessment] = await Promise.all([
		getResidentForServer(workspaceId, params.residentId, apiConfig),
		getResidentAssessmentForServer(
			workspaceId,
			params.residentId,
			template.code,
			apiConfig,
		),
	])
	return {
		residentId: resident.id,
		carePlanId: resident.care_plan_id,
		code: template.code,
		title: template.title,
		assessment,
	}
}

export async function action({ request, context, params }: Route.ActionArgs) {
	const template = templateOr404(params.code)
	const { workspaceId, apiConfig } = await getApiContext({ request, context })
	const input = (await request.json()) as SaveAssessmentInput
	try {
		return {
			assessment: await saveResidentAssessmentForServer(
				workspaceId,
				params.residentId,
				template.code,
				input,
				apiConfig,
			),
		}
	} catch (error: unknown) {
		return data(
			{ error: errorMessage(error, 'We couldn’t save the assessment.') },
			{ status: 400 },
		)
	}
}

export const handle = {
	breadcrumb: (loaderData?: Awaited<ReturnType<typeof loader>>) =>
		loaderData?.code ?? 'Assessment',
}

export function meta({ loaderData }: Route.MetaArgs) {
	return [{ title: `${loaderData?.title ?? 'Assessment'} - ${APP_NAME}` }]
}

export default ResidentAssessmentModule
