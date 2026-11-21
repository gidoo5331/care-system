import { formatShortDate, getDueLabel, isDueSoon } from './date'

const STATUS: Record<CarePlanStatus, { label: string; tone: StatusTone }> = {
	ACTIVE: { label: 'Active', tone: 'success' },
	AWAITING_APPROVAL: { label: 'Waiting for approval', tone: 'info' },
	DRAFT: { label: 'Draft', tone: 'neutral' },
}

export function getCarePlanStatusLabel(status: CarePlanStatus) {
	return STATUS[status].label
}

export function getCarePlanStatusTone(status: CarePlanStatus) {
	return STATUS[status].tone
}

export function isCarePlanDueForReview(plan: CarePlan) {
	return plan.status === 'ACTIVE' && isDueSoon(plan.next_review_at)
}

export function getNextReviewLabel(plan: CarePlan): {
	label: string
	tone: Nullable<StatusTone>
} {
	if (!plan.next_review_at) return { label: '–', tone: null }
	const due = getDueLabel(plan.next_review_at, { futurePrefix: 'In' })
	if (due) return { label: due, tone: 'warning' }
	return { label: formatShortDate(plan.next_review_at), tone: null }
}

export function getCarePlanResidentPlace(resident: CarePlanResident) {
	const place =
		resident.service === 'HOMECARE'
			? `Homecare · ${resident.area ?? ''}`
			: resident.room
				? `Room ${resident.room}`
				: 'Care home'
	return resident.is_new ? `${place} · new` : place
}

export function getCarePlanPronouns(gender: Gender) {
	return gender === 'FEMALE'
		? {
				needs: 'What she needs',
				support: 'How to support her',
				possessive: 'her',
			}
		: {
				needs: 'What he needs',
				support: 'How to support him',
				possessive: 'his',
			}
}
