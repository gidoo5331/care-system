type StatusTone = 'neutral' | 'success' | 'warning' | 'critical' | 'info'

interface OverviewStat {
	id: string
	label: string
	value: string
	detail: string
	tone: StatusTone
	href?: string
}

interface OverviewAttentionItem {
	id: string
	kind: string
	tone: StatusTone
	title: string
	detail: string
	action_label: string
	action_href: string
}

interface OverviewMedicationRound {
	name: string
	window: string
	total_doses: number
	given: number
	due: number
	refused: number
	missed: number
}

interface OverviewStaffOnShift {
	id: string
	name: string
	role: string
	unit: string
}

interface OverviewUnit {
	id: string
	name: string
	resident_count: number
}

interface WorkspaceOverview {
	stats: Array<OverviewStat>
	needs_attention: Array<OverviewAttentionItem>
	needs_attention_count: number
	handover_new_count: number
	medication_round: Nullable<OverviewMedicationRound>
	on_shift: Array<OverviewStaffOnShift>
	units: Array<OverviewUnit>
}
