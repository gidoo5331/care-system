type AttentionCategory =
	| 'MEDICATION'
	| 'INCIDENT'
	| 'VISIT'
	| 'CARE_PLAN'
	| 'STAFF'

interface AttentionHandled {
	by: string
	at: Date
	note: string
}

interface AttentionItem extends OverviewAttentionItem {
	category: AttentionCategory
	raised_at: Date
	handled: Nullable<AttentionHandled>
}

interface AttentionList {
	open: Array<AttentionItem>
	handled: Array<AttentionItem>
	counts: Record<AttentionCategory, number>
	total_open: number
}

interface HandleAttentionInput {
	item_id: string
	note: string
}
