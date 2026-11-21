type VisitStatus = 'DONE' | 'LATE' | 'MISSED' | 'IN_PROGRESS' | 'UPCOMING'

type VisitListView = 'late' | 'unassigned'

interface Visit {
	id: string
	client_name: string
	area: string
	start_time: string
	duration_minutes: number
	task: string
	status: VisitStatus
	carer_id: Nullable<string>
}

interface VisitCarer {
	id: string
	name: string
	visits: Array<Visit>
}

interface VisitDay {
	date: Date
	branch_name: string
	carers: Array<VisitCarer>
	unassigned: Array<Visit>
	stats: {
		total: number
		done: number
		on_time: number
		late_or_missed: number
		unassigned: number
	}
}

interface AssignVisitInput {
	visit_id: string
	carer_id: string
}
