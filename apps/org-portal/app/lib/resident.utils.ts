import dayjs from 'dayjs'
import { formatShortDate, getDueLabel, isDueSoon } from './date'

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

export function isCarePlanReviewDue(resident: Resident) {
	return (
		resident.care_plan_status === 'ACTIVE' &&
		isDueSoon(resident.care_plan_review_due_at)
	)
}

export function getCarePlanStatus(resident: Resident): {
	label: string
	tone: Nullable<StatusTone>
} {
	if (resident.care_plan_status === 'AWAITING_APPROVAL') {
		return { label: 'Waiting for approval', tone: 'info' }
	}
	if (!resident.care_plan_status) {
		return { label: 'No care plan yet', tone: 'warning' }
	}

	const dueLabel = getDueLabel(resident.care_plan_review_due_at)
	if (dueLabel) return { label: dueLabel, tone: 'warning' }

	if (resident.care_plan_reviewed_at) {
		return {
			label: `Reviewed ${formatShortDate(resident.care_plan_reviewed_at)}`,
			tone: null,
		}
	}
	return { label: 'Draft', tone: null }
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
