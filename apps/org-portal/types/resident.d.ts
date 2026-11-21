type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH'

type ResidentStatus = 'ACTIVE' | 'IN_HOSPITAL' | 'DISCHARGED'

type Gender = 'FEMALE' | 'MALE'

interface ResidentNote {
	summary: string
	recorded_at: Date
}

interface ResidentContact {
	name: string
	relationship: string
	phone_number: string
	is_next_of_kin: boolean
}

interface Resident {
	id: string
	code: string
	first_name: string
	last_name: string
	preferred_name: Nullable<string>
	gender: Gender
	date_of_birth: Date
	ghana_card_number: Nullable<string>
	nhis_number: Nullable<string>
	languages: StringList
	service: WorkspaceType
	room: Nullable<string>
	unit_name: Nullable<string>
	area: Nullable<string>
	address: Nullable<string>
	status: ResidentStatus
	risk_level: RiskLevel
	risk_reason: Nullable<string>
	allergies: StringList
	conditions: StringList
	contacts: Array<ResidentContact>
	admitted_at: Date
	care_plan_id: Nullable<string>
	care_plan_status: Nullable<CarePlanStatus>
	care_plan_reviewed_at: Nullable<Date>
	care_plan_review_due_at: Nullable<Date>
	latest_note: Nullable<ResidentNote>
	created_at: Date
	updated_at: Date
}

type ResidentListView = 'high-risk' | 'review-due' | 'in-hospital'

interface FetchResidentFilter {
	service?: WorkspaceType
	risk_level?: RiskLevel
	view?: ResidentListView
}

interface ResidentCounts {
	total: number
	care_home: number
	homecare: number
	high_risk: number
	review_due: number
	in_hospital: number
	appointments_today: number
}

interface CreateResidentInput {
	first_name: string
	last_name: string
	preferred_name?: string
	gender: Gender
	date_of_birth: string
	service: WorkspaceType
	ghana_card_number?: string
	nhis_number?: string
	languages: StringList
	allergies: StringList
	conditions: StringList
	risk_level: RiskLevel
	risk_reason?: string
	room?: string
	unit_name?: string
	area?: string
	address?: string
	contacts: Array<ResidentContact>
}

interface ResidentReading {
	id: string
	label: string
	value: string
	tone: StatusTone
}

interface ResidentTimelineEntry {
	id: string
	time: string
	title: string
	detail: string
}

interface ResidentSummary {
	round_times: StringList
	medications: Array<ResidentMedication>
	latest_readings: Nullable<{
		recorded_at: Date
		recorded_by: string
		readings: Array<ResidentReading>
	}>
	today: Array<ResidentTimelineEntry>
}
