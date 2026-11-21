export function getYesNo(answers: AssessmentAnswers, blockId: string) {
	const value = answers[blockId]
	return value && !Array.isArray(value) && typeof value === 'object'
		? (value as Record<string, YesNoAnswer>)
		: {}
}

export function getText(answers: AssessmentAnswers, blockId: string) {
	const value = answers[blockId]
	return typeof value === 'string' ? value : ''
}

export function getFields(answers: AssessmentAnswers, blockId: string) {
	const value = answers[blockId]
	return value && !Array.isArray(value) && typeof value === 'object'
		? (value as Record<string, string>)
		: {}
}

export function getList(answers: AssessmentAnswers, blockId: string) {
	const value = answers[blockId]
	return Array.isArray(value) && value.every((v) => typeof v === 'string')
		? (value as StringList)
		: []
}

export function getRows(answers: AssessmentAnswers, blockId: string) {
	const value = answers[blockId]
	return Array.isArray(value) ? (value as Array<Record<string, string>>) : []
}

export function getMarks(answers: AssessmentAnswers, blockId: string) {
	const value = answers[blockId]
	return Array.isArray(value) ? (value as Array<BodyMark>) : []
}

function clientQuestions(template: AssessmentTemplate) {
	return template.blocks.flatMap((block) =>
		block.type === 'yes_no'
			? block.items
					.filter((item) => !item.staff_only)
					.map((item) => ({ blockId: block.id, item }))
			: [],
	)
}

export function getProgress(
	template: AssessmentTemplate,
	answers: AssessmentAnswers,
) {
	const questions = clientQuestions(template)
	const answered = questions.filter(
		({ blockId, item }) => getYesNo(answers, blockId)[item.id]?.answer,
	).length
	return { answered, total: questions.length }
}

export function getUnansweredIds(
	template: AssessmentTemplate,
	answers: AssessmentAnswers,
) {
	return clientQuestions(template)
		.filter(({ blockId, item }) => !getYesNo(answers, blockId)[item.id]?.answer)
		.map(({ item }) => item.id)
}

export function getYesAnswers(
	template: AssessmentTemplate,
	answers: AssessmentAnswers,
) {
	return clientQuestions(template)
		.filter(
			({ blockId, item }) =>
				getYesNo(answers, blockId)[item.id]?.answer === 'YES',
		)
		.map(({ blockId, item }) => ({
			text: item.text,
			comment: getYesNo(answers, blockId)[item.id]?.comment.trim() ?? '',
		}))
}

/**
 * Drafts a care plan section from a completed form. Staff still edit and a
 * manager approves it, so this only saves retyping.
 */
export function toCarePlanSection(
	template: AssessmentTemplate,
	assessment: ResidentAssessment,
): CarePlanSectionInput {
	const yes = getYesAnswers(template, assessment.answers)
	const needs = yes.length
		? `From the ${template.short_title.toLowerCase()} assessment:\n${yes
				.map((a) => `– ${a.text}${a.comment ? ` (${a.comment})` : ''}`)
				.join('\n')}`
		: `No needs identified in the ${template.short_title.toLowerCase()} assessment.`

	return {
		title: template.care_plan_section ?? template.short_title,
		needs,
		goal: getText(assessment.answers, 'goals').trim(),
		support: getText(assessment.answers, 'important').trim(),
		tasks: [],
	}
}

export function getAssessmentStatus(
	assessment?: Nullable<ResidentAssessment>,
): {
	label: string
	tone: StatusTone
} {
	if (!assessment) return { label: 'Not started', tone: 'neutral' }
	if (assessment.status === 'DRAFT')
		return { label: 'In progress', tone: 'warning' }
	return { label: 'Completed', tone: 'success' }
}
