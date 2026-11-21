import { carePlans } from './care-plans'
import { incidents } from './incidents'
import { getResidentMedication } from './medication'
import { residents } from './residents'
import { staffMembers } from './staff'
import { getVisitDay } from './visits'
import { getCarePlanStatusLabel } from '~/lib/care-plan.utils'
import { formatShortDate } from '~/lib/date'
import { getIncidentStatus, getIncidentTypeLabel } from '~/lib/incident.utils'
import { ALL_PERMISSIONS, withOwnerPermissions } from '~/lib/permissions'
import { getResidentName } from '~/lib/resident.utils'
import { getStaffRoleLabel, getTrainingRecordStatus } from '~/lib/staff.utils'

let rolePermissions: RolePermissions = withOwnerPermissions({
	OWNER: [],
	MANAGER: [
		'SEE_RESIDENTS',
		'EDIT_CARE_PLANS',
		'APPROVE_CARE_PLANS',
		'RECORD_MEDICATION',
		'ADD_PRESCRIPTIONS',
		'REPORT_INCIDENTS',
		'REVIEW_INCIDENTS',
		'MANAGE_STAFF',
		'SEE_REPORTS',
	],
	NURSE: [
		'SEE_RESIDENTS',
		'EDIT_CARE_PLANS',
		'RECORD_MEDICATION',
		'ADD_PRESCRIPTIONS',
		'REPORT_INCIDENTS',
	],
	CARER: ['SEE_RESIDENTS', 'RECORD_MEDICATION', 'REPORT_INCIDENTS'],
	OFFICE: ['SEE_RESIDENTS', 'REPORT_INCIDENTS', 'MANAGE_STAFF', 'SEE_REPORTS'],
})

export function getRolePermissions() {
	return rolePermissions
}

export function saveRolePermissions(input: Partial<RolePermissions>) {
	const next = { ...rolePermissions }
	for (const role of ['MANAGER', 'NURSE', 'CARER', 'OFFICE'] as const) {
		const permissions = input[role]
		if (Array.isArray(permissions)) {
			next[role] = permissions.filter((p) => ALL_PERMISSIONS.includes(p))
		}
	}
	rolePermissions = withOwnerPermissions(next)
	return rolePermissions
}

const REPORT_BUILDERS: Record<ReportKey, () => ReportTable> = {
	medication: () => ({
		columns: ['Resident', 'Room', 'Given', 'Refused', 'Missed', 'Still due'],
		rows: residents
			.filter((r) => r.service === 'CARE_HOME')
			.map((resident) => {
				const doses = getResidentMedication(resident).flatMap((m) => m.doses)
				const count = (status: DoseStatus) =>
					doses.filter((d) => d.status === status).length
				return [
					getResidentName(resident),
					resident.room ?? '',
					count('GIVEN'),
					count('REFUSED'),
					count('MISSED'),
					count('DUE'),
				]
			}),
	}),
	visits: () => {
		const day = getVisitDay(new URLSearchParams())
		return {
			columns: ['Carer', 'Client', 'Start', 'Minutes', 'Task', 'Status'],
			rows: [
				...day.carers.flatMap((carer) =>
					carer.visits.map((v) => [
						carer.name,
						v.client_name,
						v.start_time,
						v.duration_minutes,
						v.task,
						v.status,
					]),
				),
				...day.unassigned.map((v) => [
					'Not assigned',
					v.client_name,
					v.start_time,
					v.duration_minutes,
					v.task,
					v.status,
				]),
			],
		}
	},
	incidents: () => ({
		columns: ['Ref', 'Type', 'What happened', 'Who', 'Reported', 'Status'],
		rows: incidents.map((i) => [
			i.ref,
			getIncidentTypeLabel(i.type),
			i.summary,
			i.resident.name,
			formatShortDate(i.reported_at),
			getIncidentStatus(i.status).label,
		]),
	}),
	'care-plan-reviews': () => ({
		columns: ['Resident', 'Version', 'Status', 'Last review', 'Next review'],
		rows: carePlans.map((plan) => [
			`${plan.resident.first_name} ${plan.resident.last_name}`,
			plan.version,
			getCarePlanStatusLabel(plan.status),
			plan.last_reviewed_at ? formatShortDate(plan.last_reviewed_at) : '',
			plan.next_review_at ? formatShortDate(plan.next_review_at) : '',
		]),
	}),
	'staff-training': () => ({
		columns: ['Staff', 'Role', 'Course', 'Completed', 'Expires', 'Status'],
		rows: staffMembers.flatMap((staff) =>
			staff.training.map((record) => [
				staff.name,
				getStaffRoleLabel(staff.role),
				record.course,
				formatShortDate(record.completed_at),
				formatShortDate(record.expires_at),
				getTrainingRecordStatus(record).label,
			]),
		),
	}),
	occupancy: () => {
		const careHome = residents.filter((r) => r.service === 'CARE_HOME')
		return {
			columns: ['Floor', 'Beds', 'In use', 'In hospital', 'Free'],
			rows: ['ground floor', 'first floor'].map((unit) => {
				const onUnit = careHome.filter((r) => r.unit_name === unit)
				const beds = unit === 'ground floor' ? 22 : 24
				return [
					unit,
					beds,
					onUnit.length,
					onUnit.filter((r) => r.status === 'IN_HOSPITAL').length,
					Math.max(beds - onUnit.length, 0),
				]
			}),
		}
	},
}

export function isReportKey(value: string): value is ReportKey {
	return value in REPORT_BUILDERS
}

export function buildReport(key: ReportKey) {
	return REPORT_BUILDERS[key]()
}
