import { getResidentAssessmentForServer } from '~/api/residents/server'
import { findAssessmentTemplate } from '~/lib/assessment-templates'
import { toCarePlanSection } from '~/lib/assessment.utils'

export interface AssessmentPrefill {
	section: CarePlanSectionInput
	formTitle: string
}

/** Only a completed form may seed a care plan section. */
export async function getAssessmentPrefill(
	url: URL,
	workspaceId: string,
	residentId: Nullable<string>,
	apiConfig: ApiConfigForServerConfig,
): Promise<Nullable<AssessmentPrefill>> {
	const code = url.searchParams.get('from_assessment')
	const template = code ? findAssessmentTemplate(code) : undefined
	if (!template || !residentId) return null

	const assessment = await getResidentAssessmentForServer(
		workspaceId,
		residentId,
		template.code,
		apiConfig,
	)
	if (assessment?.status !== 'COMPLETED') return null

	return {
		section: toCarePlanSection(template, assessment),
		formTitle: template.short_title,
	}
}
