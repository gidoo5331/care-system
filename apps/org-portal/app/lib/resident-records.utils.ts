export const NOTE_CATEGORY_OPTIONS: ReadonlyArray<{
	value: NoteCategory
	label: string
	tone: StatusTone
}> = [
	{ value: 'DAILY', label: 'Daily care', tone: 'neutral' },
	{ value: 'HEALTH', label: 'Health', tone: 'info' },
	{ value: 'FAMILY', label: 'Family and visitors', tone: 'success' },
	{ value: 'BEHAVIOUR', label: 'Mood and behaviour', tone: 'warning' },
	{ value: 'OTHER', label: 'Other', tone: 'neutral' },
]

export function getNoteCategory(category: NoteCategory) {
	return (
		NOTE_CATEGORY_OPTIONS.find((o) => o.value === category) ?? {
			label: category,
			tone: 'neutral' as StatusTone,
		}
	)
}

export const DOCUMENT_CATEGORY_OPTIONS: ReadonlyArray<{
	value: DocumentCategory
	label: string
}> = [
	{ value: 'AGREEMENT', label: 'Agreement or consent' },
	{ value: 'MEDICAL', label: 'Medical letter or result' },
	{ value: 'ASSESSMENT', label: 'Assessment' },
	{ value: 'IDENTITY', label: 'ID or insurance' },
	{ value: 'OTHER', label: 'Other' },
]

export function getDocumentCategoryLabel(category: DocumentCategory) {
	return (
		DOCUMENT_CATEGORY_OPTIONS.find((o) => o.value === category)?.label ??
		category
	)
}

export const MOVEMENT_TYPE_OPTIONS: ReadonlyArray<{
	value: MovementType
	label: string
	tone: StatusTone
	needsDestination: boolean
}> = [
	{
		value: 'HOSPITAL_ADMISSION',
		label: 'Admitted to hospital',
		tone: 'info',
		needsDestination: true,
	},
	{
		value: 'RETURNED_FROM_HOSPITAL',
		label: 'Back from hospital',
		tone: 'success',
		needsDestination: false,
	},
	{
		value: 'DISCHARGED_HOME',
		label: 'Discharged home',
		tone: 'neutral',
		needsDestination: true,
	},
	{
		value: 'TRANSFERRED',
		label: 'Moved to another home',
		tone: 'neutral',
		needsDestination: true,
	},
	{
		value: 'DIED',
		label: 'Passed away',
		tone: 'neutral',
		needsDestination: false,
	},
]

export function getMovementType(type: MovementType) {
	return (
		MOVEMENT_TYPE_OPTIONS.find((o) => o.value === type) ?? {
			label: type,
			tone: 'neutral' as StatusTone,
			needsDestination: false,
		}
	)
}
