type StaffRole = 'MANAGER' | 'NURSE' | 'SENIOR_CARER' | 'CARER' | 'OFFICE'

type StaffRoleGroup = 'nurses' | 'carers' | 'office'

type StaffToday = 'ON_SHIFT' | 'ON_VISITS' | 'OFF'

type StaffListView = 'on-shift' | 'training-due'

interface TrainingRecord {
	id: string
	course: string
	completed_at: Date
	expires_at: Date
}

interface StaffMember {
	id: string
	name: string
	role: StaffRole
	workspace_id: string
	works_at: string
	phone_number: string
	email: string
	started_at: Date
	today: StaffToday
	shift_ends_at: Nullable<string>
	can_approve_care_plans: boolean
	training: Array<TrainingRecord>
}

interface FetchStaffFilter {
	group?: StaffRoleGroup
	view?: StaffListView
}

interface StaffCounts {
	total: number
	workplaces: number
	on_shift: number
	training_due: number
}

interface UpdateStaffAccessInput {
	role: StaffRole
	can_approve_care_plans: boolean
}
