export const INCIDENT_TYPE_OPTIONS: ReadonlyArray<{
	value: IncidentType
	label: string
}> = [
	{ value: 'FALL', label: 'Fall' },
	{ value: 'INJURY', label: 'Injury' },
	{ value: 'MEDICATION', label: 'Medication' },
	{ value: 'SAFEGUARDING', label: 'Safeguarding' },
	{ value: 'COMPLAINT', label: 'Complaint' },
	{ value: 'OTHER', label: 'Something else' },
]

export const INCIDENT_SEVERITY_OPTIONS: ReadonlyArray<{
	value: IncidentSeverity
	label: string
}> = [
	{ value: 'LOW', label: 'Low: no harm' },
	{ value: 'MODERATE', label: 'Moderate: needed treatment' },
	{ value: 'SEVERE', label: 'Severe: serious harm' },
]

export const INCIDENT_STATUS_OPTIONS: ReadonlyArray<{
	value: IncidentStatus
	label: string
	tone: StatusTone
}> = [
	{ value: 'AWAITING_REVIEW', label: 'Waiting for review', tone: 'warning' },
	{ value: 'OPEN', label: 'Open', tone: 'info' },
	{ value: 'CLOSED', label: 'Closed', tone: 'neutral' },
]

export function getIncidentTypeLabel(type: IncidentType) {
	return INCIDENT_TYPE_OPTIONS.find((o) => o.value === type)?.label ?? type
}

export function getIncidentStatus(status: IncidentStatus) {
	const option = INCIDENT_STATUS_OPTIONS.find((o) => o.value === status)
	return { label: option?.label ?? status, tone: option?.tone ?? 'neutral' }
}

export function isSafeguarding(incident: Pick<Incident, 'type' | 'status'>) {
	return incident.type === 'SAFEGUARDING' && incident.status !== 'CLOSED'
}
