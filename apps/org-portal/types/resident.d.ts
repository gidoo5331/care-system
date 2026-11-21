type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH'

type ResidentStatus = 'ACTIVE' | 'IN_HOSPITAL' | 'DISCHARGED'

interface ResidentNote {
	summary: string
	recorded_at: Date
}

interface Resident {
	id: string
	code: string
	first_name: string
	last_name: string
	date_of_birth: Date
	service: WorkspaceType
	room: Nullable<string>
	unit_name: Nullable<string>
	area: Nullable<string>
	status: ResidentStatus
	risk_level: RiskLevel
	risk_reason: Nullable<string>
	allergies: StringList
	conditions: StringList
	admitted_at: Date
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

type DoseStatus = 'GIVEN' | 'DUE' | 'MISSED' | 'REFUSED'

interface ScheduledDose {
	time: string
	status: DoseStatus
	detail: Nullable<string>
}

interface ResidentMedication {
	id: string
	name: string
	instructions: string
	is_as_needed: boolean
	doses: Array<ScheduledDose>
	last_given_label: Nullable<string>
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
