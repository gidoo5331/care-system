import { daysAgo } from './http'
import { findAssessmentTemplate } from '~/lib/assessment-templates'
import { getUnansweredIds } from '~/lib/assessment.utils'

const store = new Map<string, Array<ResidentAssessment>>()

const yes = (comment = ''): YesNoAnswer => ({ answer: 'YES', comment })
const no = (comment = ''): YesNoAnswer => ({ answer: 'NO', comment })

function seed(
	residentId: string,
	code: string,
	status: AssessmentStatus,
	daysOld: number,
	answers: AssessmentAnswers,
): ResidentAssessment {
	const at = daysAgo(daysOld)
	return {
		id: `asm_${residentId}_${code}`,
		resident_id: residentId,
		template_code: code,
		status,
		answers,
		completed_by: status === 'COMPLETED' ? 'Esi Quaye' : null,
		completed_at: status === 'COMPLETED' ? at : null,
		updated_by: 'Esi Quaye',
		updated_at: at,
	}
}

store.set('res_kofi_asante', [
	seed('res_kofi_asante', 'OHS-14', 'COMPLETED', 18, {
		questions: {
			transfer: yes('Help of one to stand from his chair'),
			reposition: no(),
			grip: no(),
			equipment: yes('Walking frame at all times'),
			fall_risk: yes('Most unsteady getting up at night'),
			fall_history: yes('Two falls in the last three months'),
			risk_done: yes(),
			care_plan: yes(),
		},
		goals: 'I want to keep walking to the dining room on my own with my frame.',
		important:
			'Do not rush me when I stand up. Leave my frame where I can reach it, especially at night.',
		involved: [{ name: 'Esi Quaye', role: 'Nurse', date: '' }],
		staff: [
			'Risk Assessment(s) completed?',
			'Moving and handling equipment in place?',
		],
	}),
	seed('res_kofi_asante', 'OHS-04', 'COMPLETED', 18, {
		questions: {
			share: yes('With his son Kwame'),
			problems: yes('Hard of hearing on the left'),
			aids: no(),
			language: yes('Prefers Twi'),
			varies: no(),
			care_plan: yes(),
		},
		goals: 'To be spoken to in Twi and on my right side.',
		important: 'Speak slowly and face me so I can follow.',
	}),
	seed('res_kofi_asante', 'OHS-12', 'DRAFT', 1, {
		questions: {
			support: yes(),
			appetite: yes('Refusing some breakfasts'),
			special_diet: yes('Diabetic diet'),
		},
	}),
])

store.set('res_nana_agyeman', [
	seed('res_nana_agyeman', 'OHS-12', 'COMPLETED', 95, {
		questions: {
			support: yes('Prompting and sitting with her'),
			appetite: yes('Lost 3 kg in 3 months'),
			special_diet: yes('Soft diet'),
			preferences: yes('Kenkey and fish, light soup'),
			therapist: no(),
			swallowing: no(),
			alcohol: no(),
			modified: no(),
			diuretics: no(),
			d_and_v: no(),
			dry_mouth: yes(),
			choking: no(),
			care_plan: yes(),
		},
		goals: 'Keep my weight steady.',
		important: 'Small meals, and someone to sit with me while I eat.',
	}),
])

export function listAssessments(residentId: string) {
	return store.get(residentId) ?? []
}

export function findAssessment(residentId: string, code: string) {
	return listAssessments(residentId).find((a) => a.template_code === code)
}

export function saveAssessment(
	residentId: string,
	code: string,
	input: Partial<SaveAssessmentInput>,
	actor: string,
) {
	const template = findAssessmentTemplate(code)
	if (!template) return { error: 'Unknown assessment form.' }
	if (input.status !== 'DRAFT' && input.status !== 'COMPLETED') {
		return { error: 'Save it as a draft or mark it complete.' }
	}
	const answers = input.answers ?? {}
	if (input.status === 'COMPLETED') {
		const missing = getUnansweredIds(template, answers).length
		if (missing) {
			return {
				error: `${missing} ${missing === 1 ? 'question has' : 'questions have'} no answer yet.`,
			}
		}
	}

	const now = new Date()
	const existing = findAssessment(residentId, template.code)
	const assessment: ResidentAssessment = {
		id: existing?.id ?? `asm_${residentId}_${template.code}`,
		resident_id: residentId,
		template_code: template.code,
		status: input.status,
		answers,
		completed_by: input.status === 'COMPLETED' ? actor : null,
		completed_at: input.status === 'COMPLETED' ? now : null,
		updated_by: actor,
		updated_at: now,
	}
	store.set(residentId, [
		...listAssessments(residentId).filter(
			(a) => a.template_code !== template.code,
		),
		assessment,
	])
	return { assessment }
}
