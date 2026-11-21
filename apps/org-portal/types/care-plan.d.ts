type CarePlanStatus = 'ACTIVE' | 'AWAITING_APPROVAL' | 'DRAFT'

type CarePlanListView = 'review-due' | 'awaiting-approval' | 'drafts'

interface CarePlanTask {
	id: string
	description: string
	frequency: string
}

interface CarePlanSection {
	id: string
	title: string
	needs: string
	goal: string
	support: string
	tasks: Array<CarePlanTask>
}

interface CarePlanReview {
	id: string
	version: number
	outcome: 'APPROVED'
	reviewed_by: string
	reviewed_at: Date
}

interface CarePlanRiskAssessment {
	id: string
	name: string
	level: RiskLevel
}

interface CarePlanResident {
	id: string
	first_name: string
	last_name: string
	gender: Gender
	service: WorkspaceType
	room: Nullable<string>
	area: Nullable<string>
	is_new: boolean
}

interface CarePlan {
	id: string
	resident: CarePlanResident
	version: number
	status: CarePlanStatus
	active_since: Nullable<Date>
	last_reviewed_at: Nullable<Date>
	next_review_at: Nullable<Date>
	written_by: string
	sections: Array<CarePlanSection>
	reviews: Array<CarePlanReview>
	risk_assessments: Array<CarePlanRiskAssessment>
}

interface FetchCarePlanFilter {
	view?: CarePlanListView
}

interface CarePlanCounts {
	total: number
	active: number
	review_due: number
	awaiting_approval: number
	drafts: number
}
