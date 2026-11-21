import dayjs from 'dayjs'

export const CARE_PLAN_DUE_SOON_DAYS = 5

const RISK_LEVEL_LABEL: Record<RiskLevel, string> = {
	LOW: 'Low',
	MEDIUM: 'Medium',
	HIGH: 'High',
}

const RISK_LEVEL_TONE: Record<RiskLevel, StatusTone> = {
	LOW: 'neutral',
	MEDIUM: 'warning',
	HIGH: 'critical',
}

export function getResidentName(
	resident: Pick<Resident, 'first_name' | 'last_name'>,
) {
	return `${resident.first_name} ${resident.last_name}`
}

export function getResidentAge(resident: Pick<Resident, 'date_of_birth'>) {
	return dayjs().diff(resident.date_of_birth, 'year')
}

export function getResidentPlace(resident: Resident) {
	if (resident.service === 'HOMECARE') return resident.area ?? '—'
	return resident.room ? `Room ${resident.room}` : '—'
}

export function getRiskLevelLabel(level: RiskLevel) {
	return RISK_LEVEL_LABEL[level]
}

export function getRiskTone(level: RiskLevel) {
	return RISK_LEVEL_TONE[level]
}

export function getRiskLabel(resident: Resident) {
	const level = RISK_LEVEL_LABEL[resident.risk_level]
	if (resident.risk_level === 'LOW' || !resident.risk_reason) return level
	return `${level} · ${resident.risk_reason}`
}

export function getAllergiesLabel(resident: Resident) {
	return resident.allergies.length
		? resident.allergies.join(', ')
		: 'None known'
}

function daysUntilReview(resident: Resident) {
	if (!resident.care_plan_review_due_at) return null
	return dayjs(resident.care_plan_review_due_at)
		.startOf('day')
		.diff(dayjs().startOf('day'), 'day')
}

export function isCarePlanReviewDue(resident: Resident) {
	const days = daysUntilReview(resident)
	return days !== null && days <= CARE_PLAN_DUE_SOON_DAYS
}

export function getCarePlanStatus(resident: Resident): {
	label: string
	tone: Nullable<StatusTone>
} {
	const days = daysUntilReview(resident)

	if (days !== null && days < 0) {
		const overdue = Math.abs(days)
		return {
			label: `${overdue} ${overdue === 1 ? 'day' : 'days'} overdue`,
			tone: 'warning',
		}
	}
	if (days === 0) return { label: 'Due today', tone: 'warning' }
	if (days !== null && days <= CARE_PLAN_DUE_SOON_DAYS) {
		return {
			label: `Due in ${days} ${days === 1 ? 'day' : 'days'}`,
			tone: 'warning',
		}
	}
	if (resident.care_plan_reviewed_at) {
		return {
			label: `Reviewed ${dayjs(resident.care_plan_reviewed_at).format('D MMM')}`,
			tone: null,
		}
	}
	return { label: 'No care plan yet', tone: 'warning' }
}

export function getLatestNoteLabel(resident: Resident) {
	const note = resident.latest_note
	if (!note) return '—'
	const recordedAt = dayjs(note.recorded_at)
	return recordedAt.isSame(dayjs(), 'day')
		? `${note.summary}, ${recordedAt.format('HH:mm')}`
		: note.summary
}

export function getResidentServiceLabel(resident: Resident) {
	return resident.service === 'CARE_HOME' ? 'Care home' : 'Homecare'
}
