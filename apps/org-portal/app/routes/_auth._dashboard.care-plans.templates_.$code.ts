import type { Route } from './+types/_auth._dashboard.care-plans.templates_.$code'
import { findAssessmentTemplate } from '~/lib/assessment-templates'
import { APP_NAME } from '~/lib/constants'
import { AssessmentTemplateModule } from '~/modules'

export function loader({ params }: Route.LoaderArgs) {
	const template = findAssessmentTemplate(params.code)
	if (!template)
		throw new Response(null, { status: 404, statusText: 'Not Found' })
	return { code: template.code, title: template.title }
}

export const handle = {
	breadcrumb: (data?: Awaited<ReturnType<typeof loader>>) =>
		data?.code ?? 'Form',
}

export function meta({ loaderData }: Route.MetaArgs) {
	return [{ title: `${loaderData?.title ?? 'Assessment form'} - ${APP_NAME}` }]
}

export default AssessmentTemplateModule
