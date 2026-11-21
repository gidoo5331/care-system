import { daysUntil } from './date'

export const TRAINING_DUE_SOON_DAYS = 30

export const STAFF_ROLE_OPTIONS: ReadonlyArray<{
	value: StaffRole
	label: string
	description: string
}> = [
	{
		value: 'MANAGER',
		label: 'Manager',
		description:
			'Managers can do everything except change organisation settings.',
	},
	{
		value: 'NURSE',
		label: 'Nurse',
		description:
			'Nurses can record medication, write care plans and report incidents.',
	},
	{
		value: 'SENIOR_CARER',
		label: 'Senior carer',
		description:
			'Senior carers can record medication, update care notes and report incidents.',
	},
	{
		value: 'CARER',
		label: 'Carer',
		description:
			'Carers use the mobile app to record care, medication and visits.',
	},
	{
		value: 'OFFICE',
		label: 'Office',
		description:
			'Office staff manage the rota, staff records and reports, but not care records.',
	},
]

export const ROLE_GROUPS: Record<StaffRoleGroup, ReadonlyArray<StaffRole>> = {
	nurses: ['NURSE'],
	carers: ['SENIOR_CARER', 'CARER'],
	office: ['OFFICE', 'MANAGER'],
}

export function getStaffRoleLabel(role: StaffRole) {
	return STAFF_ROLE_OPTIONS.find((o) => o.value === role)?.label ?? role
}

export function getStaffRoleDescription(role: StaffRole) {
	return STAFF_ROLE_OPTIONS.find((o) => o.value === role)?.description ?? ''
}

export type TrainingState = 'EXPIRED' | 'DUE_SOON' | 'UP_TO_DATE'

export function getTrainingState(record: TrainingRecord): TrainingState {
	const days = daysUntil(record.expires_at) ?? 0
	if (days < 0) return 'EXPIRED'
	if (days <= TRAINING_DUE_SOON_DAYS) return 'DUE_SOON'
	return 'UP_TO_DATE'
}

export function getTrainingRecordStatus(record: TrainingRecord): {
	label: string
	tone: StatusTone
} {
	const days = daysUntil(record.expires_at) ?? 0
	const state = getTrainingState(record)
	if (state === 'EXPIRED') return { label: 'Expired', tone: 'critical' }
	if (state === 'DUE_SOON') {
		return {
			label:
				days === 0
					? 'Due today'
					: `Due in ${days} ${days === 1 ? 'day' : 'days'}`,
			tone: 'warning',
		}
	}
	return { label: 'Up to date', tone: 'success' }
}

export function getTrainingSummary(staff: StaffMember): {
	label: string
	tone: StatusTone
} {
	const states = staff.training.map(getTrainingState)
	const expired = states.filter((s) => s === 'EXPIRED').length
	const dueSoon = states.filter((s) => s === 'DUE_SOON').length
	if (expired) return { label: `${expired} expired`, tone: 'critical' }
	if (dueSoon) return { label: `${dueSoon} due soon`, tone: 'warning' }
	return { label: 'Up to date', tone: 'success' }
}

export function needsTraining(staff: StaffMember) {
	return staff.training.some((r) => getTrainingState(r) !== 'UP_TO_DATE')
}

const TODAY_LABEL: Record<StaffToday, { label: string; tone: StatusTone }> = {
	ON_SHIFT: { label: 'On shift', tone: 'success' },
	ON_VISITS: { label: 'On visits', tone: 'info' },
	OFF: { label: 'Off today', tone: 'neutral' },
}

export function getStaffToday(today: StaffToday) {
	return TODAY_LABEL[today]
}

export function isWorkingNow(staff: StaffMember) {
	return staff.today !== 'OFF'
}
