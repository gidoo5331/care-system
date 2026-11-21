export const ATTENTION_CATEGORIES: ReadonlyArray<AttentionCategory> = [
	'MEDICATION',
	'INCIDENT',
	'VISIT',
	'CARE_PLAN',
	'STAFF',
]

const CATEGORY_LABELS: Record<AttentionCategory, string> = {
	MEDICATION: 'Medication',
	INCIDENT: 'Incidents',
	VISIT: 'Visits',
	CARE_PLAN: 'Care plans',
	STAFF: 'Staffing',
}

export function getAttentionCategoryLabel(category: AttentionCategory) {
	return CATEGORY_LABELS[category]
}

export function parseAttentionCategory(
	value: Nullable<string>,
): AttentionCategory | undefined {
	const upper = value?.toUpperCase()
	return ATTENTION_CATEGORIES.find((c) => c === upper)
}

export function toCategoryParam(category: AttentionCategory) {
	return category.toLowerCase().replace('_', '-')
}

export function fromCategoryParam(value: Nullable<string>) {
	return parseAttentionCategory(value ? value.replace('-', '_') : null)
}
