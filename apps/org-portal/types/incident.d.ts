type IncidentType =
	| 'FALL'
	| 'SAFEGUARDING'
	| 'MEDICATION'
	| 'COMPLAINT'
	| 'INJURY'
	| 'OTHER'

type IncidentStatus = 'AWAITING_REVIEW' | 'OPEN' | 'CLOSED'

type IncidentSeverity = 'LOW' | 'MODERATE' | 'SEVERE'

type IncidentListView = 'open' | 'awaiting-review' | 'safeguarding' | 'closed'

interface IncidentAction {
	id: string
	description: string
	owner: string
	due_date: Date
	is_done: boolean
}

interface IncidentNotification {
	id: string
	label: string
	detail: Nullable<string>
	hint: Nullable<string>
	is_done: boolean
}

interface IncidentPerson {
	id: string
	name: string
	place: string
}

interface Incident {
	id: string
	ref: string
	type: IncidentType
	summary: string
	description: string
	resident: IncidentPerson
	occurred_at: Date
	location: string
	injury: string
	witnesses: string
	reported_by: string
	reported_by_role: string
	reported_at: Date
	status: IncidentStatus
	severity: Nullable<IncidentSeverity>
	manager_notes: string
	actions: Array<IncidentAction>
	notifications: Array<IncidentNotification>
}

interface FetchIncidentFilter {
	view?: IncidentListView
}

interface IncidentCounts {
	open: number
	awaiting_review: number
	safeguarding: number
	reported_today: number
	this_month: number
	falls_this_month: number
	falls_last_month: number
}

interface ReviewIncidentInput {
	severity: IncidentSeverity
	status: IncidentStatus
	manager_notes: string
	completed_action_ids: StringList
	new_actions: Array<{ description: string; owner: string; due_date: string }>
	notified_ids: StringList
}

interface ReportIncidentInput {
	type: IncidentType
	resident_id: string
	occurred_at: string
	location: string
	description: string
	injury: string
	witnesses: string
}
