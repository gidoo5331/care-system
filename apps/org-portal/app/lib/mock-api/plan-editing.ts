import dayjs from 'dayjs'
import { carePlans, findCarePlanForResident } from './care-plans'
import { findResident, linkCarePlan } from './residents'
import { CARE_PLAN_REVIEW_CYCLE_MONTHS } from '~/lib/date'

const newId = (prefix: string) =>
	`${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`

export function validatePlanInput(input: Partial<SaveCarePlanInput>) {
	const sections = (input.sections ?? []).filter((s) => s.title?.trim())
	if (!sections.length) return 'Add at least one section with a title.'
	const missing = sections.find((s) => !s.needs?.trim() || !s.support?.trim())
	if (missing) {
		return `“${missing.title.trim()}” needs both what they need and how to support them.`
	}
	const intents: Array<CarePlanIntent> = [
		'SAVE_DRAFT',
		'SEND_FOR_APPROVAL',
		'APPROVE',
		'COMPLETE_REVIEW',
	]
	if (!input.intent || !intents.includes(input.intent)) {
		return 'Choose what to do with the care plan.'
	}
	return null
}

function toSections(input: SaveCarePlanInput): Array<CarePlanSection> {
	return input.sections
		.filter((section) => section.title.trim())
		.map((section) => ({
			id: section.id ?? newId('sec'),
			title: section.title.trim(),
			needs: section.needs.trim(),
			goal: section.goal.trim(),
			support: section.support.trim(),
			tasks: section.tasks
				.filter((task) => task.description.trim())
				.map((task) => ({
					id: task.id ?? newId('task'),
					description: task.description.trim(),
					frequency: task.frequency.trim() || 'As needed',
				})),
		}))
}

function toRiskAssessments(input: SaveCarePlanInput) {
	return input.risk_assessments
		.filter((assessment) => assessment.name.trim())
		.map((assessment) => ({
			id: assessment.id ?? newId('ra'),
			name: assessment.name.trim(),
			level: assessment.level,
		}))
}

function syncResident(plan: CarePlan) {
	const resident = findResident(plan.resident.id)
	if (resident) Object.assign(resident, linkCarePlan(resident, plan))
}

function approve(plan: CarePlan, actor: string, version: number) {
	const now = new Date()
	plan.version = version
	plan.status = 'ACTIVE'
	plan.active_since = now
	plan.last_reviewed_at = now
	plan.next_review_at = dayjs(now)
		.add(CARE_PLAN_REVIEW_CYCLE_MONTHS, 'month')
		.toDate()
	plan.reviews = [
		{
			id: newId('rev'),
			version,
			outcome: 'APPROVED',
			reviewed_by: actor,
			reviewed_at: now,
		},
		...plan.reviews,
	]
	plan.resident.is_new = false
}

export function saveCarePlan(
	plan: CarePlan,
	input: SaveCarePlanInput,
	actor: string,
) {
	const allowed: Record<CarePlanStatus, Array<CarePlanIntent>> = {
		ACTIVE: ['COMPLETE_REVIEW'],
		AWAITING_APPROVAL: ['APPROVE', 'SAVE_DRAFT', 'SEND_FOR_APPROVAL'],
		DRAFT: ['SAVE_DRAFT', 'SEND_FOR_APPROVAL', 'APPROVE'],
	}
	if (!allowed[plan.status].includes(input.intent)) {
		return { error: 'That isn’t possible for a plan in this state.' }
	}

	plan.sections = toSections(input)
	plan.risk_assessments = toRiskAssessments(input)

	switch (input.intent) {
		case 'COMPLETE_REVIEW':
			approve(plan, actor, plan.version + 1)
			break
		case 'APPROVE':
			approve(plan, actor, plan.version)
			break
		case 'SEND_FOR_APPROVAL':
			plan.status = 'AWAITING_APPROVAL'
			plan.written_by = actor
			break
		case 'SAVE_DRAFT':
			plan.status = 'DRAFT'
			plan.written_by = actor
			break
	}

	syncResident(plan)
	return { plan }
}

export function createCarePlan(input: CreateCarePlanInput, actor: string) {
	const resident = findResident(input.resident_id)
	if (!resident) return { error: 'Choose who the care plan is for.' }
	if (findCarePlanForResident(resident.id)) {
		return {
			error: `${resident.first_name} already has a care plan. Open it and start a review instead.`,
		}
	}
	if (input.intent !== 'SAVE_DRAFT' && input.intent !== 'SEND_FOR_APPROVAL') {
		return {
			error: 'A new care plan is saved as a draft or sent for approval.',
		}
	}

	const plan: CarePlan = {
		id: `cp_${resident.id.replace(/^res_/, '')}`,
		resident: {
			id: resident.id,
			first_name: resident.first_name,
			last_name: resident.last_name,
			gender: resident.gender,
			service: resident.service,
			room: resident.room,
			area: resident.area,
			is_new: dayjs().diff(resident.admitted_at, 'day') < 14,
		},
		version: 1,
		status: input.intent === 'SAVE_DRAFT' ? 'DRAFT' : 'AWAITING_APPROVAL',
		active_since: null,
		last_reviewed_at: null,
		next_review_at: null,
		written_by: actor,
		sections: toSections(input),
		reviews: [],
		risk_assessments: toRiskAssessments(input),
	}
	carePlans.push(plan)
	syncResident(plan)
	return { plan }
}

export function listRiskAssessments(searchParams: URLSearchParams) {
	const level = searchParams.get('level')
	const query = searchParams.get('query')?.trim().toLowerCase()
	const order: Record<RiskLevel, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 }

	return carePlans
		.flatMap((plan) =>
			plan.risk_assessments.map(
				(assessment): RiskAssessmentRow => ({
					id: `${plan.id}_${assessment.id}`,
					care_plan_id: plan.id,
					resident: plan.resident,
					name: assessment.name,
					level: assessment.level,
					reviewed_at: plan.last_reviewed_at,
				}),
			),
		)
		.filter((row) => {
			if (level && row.level !== level) return false
			if (!query) return true
			return `${row.resident.first_name} ${row.resident.last_name} ${row.name}`
				.toLowerCase()
				.includes(query)
		})
		.sort((a, b) => order[a.level] - order[b.level])
}
