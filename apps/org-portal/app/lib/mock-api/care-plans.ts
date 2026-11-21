import dayjs from 'dayjs'
import { daysAgo, daysFromNow } from './http'
import {
	getCarePlanStatusLabel,
	isCarePlanDueForReview,
} from '~/lib/care-plan.utils'
import { CARE_PLAN_REVIEW_CYCLE_MONTHS, daysUntil } from '~/lib/date'

export interface CarePlanSeed {
	version: number
	status: CarePlanStatus
	reviewed_days_ago?: number
	review_due_in_days?: number
	written_by?: string
	is_new?: boolean
}

export const carePlans: Array<CarePlan> = []

const REVIEWERS = ['Esi Quaye', 'Kwame Addo']

function reviewDates(seed: CarePlanSeed) {
	if (seed.status === 'AWAITING_APPROVAL') {
		return { lastReviewedAt: null, nextReviewAt: null }
	}
	if (seed.review_due_in_days !== undefined) {
		const next = daysFromNow(seed.review_due_in_days)
		return {
			lastReviewedAt: dayjs(next)
				.subtract(CARE_PLAN_REVIEW_CYCLE_MONTHS, 'month')
				.toDate(),
			nextReviewAt: next,
		}
	}
	const last = daysAgo(seed.reviewed_days_ago ?? 30)
	return {
		lastReviewedAt: last,
		nextReviewAt: dayjs(last)
			.add(CARE_PLAN_REVIEW_CYCLE_MONTHS, 'month')
			.toDate(),
	}
}

function reviewHistory(
	seed: CarePlanSeed,
	lastReviewedAt: Nullable<Date>,
): Array<CarePlanReview> {
	if (!lastReviewedAt) return []
	const approvedVersions =
		seed.status === 'ACTIVE' ? seed.version : seed.version - 1
	return Array.from({ length: Math.min(approvedVersions, 3) }, (_, i) => {
		const version = approvedVersions - i
		return {
			id: `rev_${version}`,
			version,
			outcome: 'APPROVED',
			reviewed_by:
				i === 2
					? (REVIEWERS[1] ?? 'Kwame Addo')
					: (REVIEWERS[0] ?? 'Esi Quaye'),
			reviewed_at: dayjs(lastReviewedAt)
				.subtract(i * CARE_PLAN_REVIEW_CYCLE_MONTHS, 'month')
				.toDate(),
		}
	})
}

const nanaSections: Array<CarePlanSection> = [
	{
		id: 'sec_eating',
		title: 'Eating and drinking',
		needs: 'Small appetite since July. Has lost 3 kg in 3 months.',
		goal: 'Keep her weight steady and drinking at least 1.5 litres a day.',
		support:
			'Offer small meals often. She likes kenkey and fish, and light soup. Sit with her while she eats.',
		tasks: [
			{
				id: 't1',
				description: 'Offer breakfast, lunch and supper',
				frequency: '3 times a day',
			},
			{
				id: 't2',
				description: 'Record how much she eats',
				frequency: 'Every meal',
			},
			{ id: 't3', description: 'Weigh her', frequency: 'Every Monday' },
		],
	},
	{
		id: 'sec_moving',
		title: 'Moving around',
		needs: 'Walks with a stick. Unsteady when tired in the evening.',
		goal: 'Stay walking safely without falls.',
		support:
			'Walk beside her to the dining room. Make sure her stick is in reach.',
		tasks: [
			{
				id: 't4',
				description: 'Walk to the garden with support',
				frequency: 'Once a day',
			},
		],
	},
]

function genericSections(resident: Resident): Array<CarePlanSection> {
	const object = resident.gender === 'FEMALE' ? 'her' : 'him'
	const possessive = resident.gender === 'FEMALE' ? 'her' : 'his'
	const mainCondition =
		resident.conditions[0]?.toLowerCase() ?? 'general health'

	return [
		{
			id: 'sec_personal',
			title: 'Personal care',
			needs: `Needs some help washing and dressing because of ${mainCondition}.`,
			goal: `Stay clean, comfortable and as independent as possible.`,
			support: `Prompt ${object} to do what ${resident.gender === 'FEMALE' ? 'she' : 'he'} can. Help with ${possessive} back and feet.`,
			tasks: [
				{
					id: 't1',
					description: 'Help with washing and dressing',
					frequency: 'Every morning',
				},
				{
					id: 't2',
					description: 'Check skin for redness',
					frequency: 'Every day',
				},
			],
		},
		{
			id: 'sec_moving',
			title: 'Moving around',
			needs:
				resident.risk_reason === 'falls'
					? 'At risk of falls, especially at night.'
					: 'Walks without help but tires easily.',
			goal: 'Keep moving every day without falls.',
			support: `Make sure ${possessive} call bell and walking aid are in reach.`,
			tasks: [
				{
					id: 't3',
					description: 'Walk with support',
					frequency: 'Twice a day',
				},
			],
		},
	]
}

function riskAssessments(resident: Resident): Array<CarePlanRiskAssessment> {
	if (resident.id === 'res_nana_agyeman') {
		return [
			{
				id: 'ra_nutrition',
				name: 'Nutrition (weight and appetite)',
				level: 'MEDIUM',
			},
			{ id: 'ra_falls', name: 'Falls', level: 'LOW' },
			{ id: 'ra_pressure', name: 'Pressure sores', level: 'LOW' },
		]
	}
	const reason = resident.risk_reason
	return [
		{
			id: 'ra_nutrition',
			name: 'Nutrition (weight and appetite)',
			level: reason === 'eating' ? resident.risk_level : 'LOW',
		},
		{
			id: 'ra_falls',
			name: 'Falls',
			level:
				reason === 'falls' || reason === 'moving' ? resident.risk_level : 'LOW',
		},
		{
			id: 'ra_pressure',
			name: 'Pressure sores',
			level: reason === 'skin' ? resident.risk_level : 'LOW',
		},
	]
}

export function buildCarePlan(
	resident: Resident,
	seed: CarePlanSeed,
): CarePlan {
	const { lastReviewedAt, nextReviewAt } = reviewDates(seed)
	const reviews = reviewHistory(seed, lastReviewedAt)

	return {
		id: `cp_${resident.id.replace(/^res_/, '')}`,
		resident: {
			id: resident.id,
			first_name: resident.first_name,
			last_name: resident.last_name,
			gender: resident.gender,
			service: resident.service,
			room: resident.room,
			area: resident.area,
			is_new: seed.is_new ?? false,
		},
		version: seed.version,
		status: seed.status,
		active_since: reviews[0]?.reviewed_at ?? null,
		last_reviewed_at: lastReviewedAt,
		next_review_at: nextReviewAt,
		written_by: seed.written_by ?? 'Esi Quaye',
		sections:
			resident.id === 'res_nana_agyeman'
				? nanaSections
				: genericSections(resident),
		reviews,
		risk_assessments: riskAssessments(resident),
	}
}

export function findCarePlan(id: string) {
	return carePlans.find((plan) => plan.id === id)
}

export function findCarePlanForResident(residentId: string) {
	return carePlans.find((plan) => plan.resident.id === residentId)
}

const VIEW_PREDICATES: Record<CarePlanListView, (plan: CarePlan) => boolean> = {
	'review-due': isCarePlanDueForReview,
	'awaiting-approval': (plan) => plan.status === 'AWAITING_APPROVAL',
	drafts: (plan) => plan.status === 'DRAFT',
}

function isCarePlanListView(value: string): value is CarePlanListView {
	return value in VIEW_PREDICATES
}

function urgency(plan: CarePlan) {
	if (isCarePlanDueForReview(plan)) return daysUntil(plan.next_review_at) ?? 0
	if (plan.status === 'AWAITING_APPROVAL') return 100
	if (plan.status === 'DRAFT') return 200
	return 300 + (daysUntil(plan.next_review_at) ?? 0)
}

export function filterCarePlans(searchParams: URLSearchParams) {
	const query = searchParams.get('query')?.trim().toLowerCase()
	const view = searchParams.get('view')

	return carePlans
		.filter((plan) => {
			if (view && isCarePlanListView(view) && !VIEW_PREDICATES[view](plan)) {
				return false
			}
			if (query) {
				const { resident } = plan
				const haystack = [
					`${resident.first_name} ${resident.last_name}`,
					resident.room ? `room ${resident.room}` : '',
					resident.area ?? '',
					getCarePlanStatusLabel(plan.status),
				]
					.join(' ')
					.toLowerCase()
				if (!haystack.includes(query)) return false
			}
			return true
		})
		.sort((a, b) => urgency(a) - urgency(b))
}

export function getCarePlanCounts(): CarePlanCounts {
	return {
		total: carePlans.length,
		active: carePlans.filter((p) => p.status === 'ACTIVE').length,
		review_due: carePlans.filter(VIEW_PREDICATES['review-due']).length,
		awaiting_approval: carePlans.filter(VIEW_PREDICATES['awaiting-approval'])
			.length,
		drafts: carePlans.filter(VIEW_PREDICATES.drafts).length,
	}
}
