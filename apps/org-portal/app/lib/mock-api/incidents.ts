import dayjs from 'dayjs'
import { daysAgo, daysFromNow, todayAt } from './http'
import { findResident } from './residents'
import { getIncidentTypeLabel, isSafeguarding } from '~/lib/incident.utils'
import { getResidentName, getResidentPlace } from '~/lib/resident.utils'

function person(residentId: string): IncidentPerson {
	const resident = findResident(residentId)
	if (!resident) return { id: residentId, name: 'Unknown', place: '' }
	return {
		id: resident.id,
		name: getResidentName(resident),
		place:
			resident.service === 'HOMECARE' ? 'Homecare' : getResidentPlace(resident),
	}
}

function defaultNotifications(residentId: string): Array<IncidentNotification> {
	const contact = findResident(residentId)?.contacts[0]
	return [
		{
			id: 'family',
			label: contact
				? `Family (${contact.name}, ${contact.relationship.toLowerCase()})`
				: 'Family',
			detail: null,
			hint: null,
			is_done: false,
		},
		{ id: 'doctor', label: 'Doctor', detail: null, hint: null, is_done: false },
		{
			id: 'regulator',
			label: 'Health Facilities Regulatory Agency',
			detail: null,
			hint: 'Only needed for serious harm',
			is_done: false,
		},
	]
}

interface IncidentSeed {
	ref: string
	type: IncidentType
	summary: string
	residentId: string
	reportedBy: string
	role: string
	reportedAt: Date
	status: IncidentStatus
}

const olderIncidents: Array<IncidentSeed> = [
	{
		ref: 'INC-0138',
		type: 'FALL',
		summary: 'Slid from chair in the lounge, no injury',
		residentId: 'res_adwoa_frimpong',
		reportedBy: 'Kwame Addo',
		role: 'senior carer',
		reportedAt: daysAgo(8),
		status: 'CLOSED',
	},
	{
		ref: 'INC-0137',
		type: 'FALL',
		summary: 'Found on bedroom floor during night check',
		residentId: 'res_kofi_asante',
		reportedBy: 'Joyce Nkansah',
		role: 'nurse',
		reportedAt: daysAgo(11),
		status: 'CLOSED',
	},
	{
		ref: 'INC-0136',
		type: 'INJURY',
		summary: 'Skin tear on left hand while dressing',
		residentId: 'res_yaw_ofori',
		reportedBy: 'Akosua Badu',
		role: 'carer',
		reportedAt: daysAgo(13),
		status: 'CLOSED',
	},
	{
		ref: 'INC-0135',
		type: 'FALL',
		summary: 'Lost balance in the garden, grazed knee',
		residentId: 'res_kwabena_mensah',
		reportedBy: 'Prince Kumi',
		role: 'carer',
		reportedAt: daysAgo(15),
		status: 'CLOSED',
	},
	{
		ref: 'INC-0134',
		type: 'MEDICATION',
		summary: 'Wrong time recorded for morning dose',
		residentId: 'res_adwoa_frimpong',
		reportedBy: 'Esi Quaye',
		role: 'nurse',
		reportedAt: daysAgo(18),
		status: 'CLOSED',
	},
	{
		ref: 'INC-0133',
		type: 'FALL',
		summary: 'Fall on the stairs, seen by doctor',
		residentId: 'res_efua_darko',
		reportedBy: 'Esi Quaye',
		role: 'nurse',
		reportedAt: dayjs().subtract(1, 'month').date(12).toDate(),
		status: 'CLOSED',
	},
	{
		ref: 'INC-0132',
		type: 'FALL',
		summary: 'Fall getting out of bed',
		residentId: 'res_kofi_asante',
		reportedBy: 'Joyce Nkansah',
		role: 'nurse',
		reportedAt: dayjs().subtract(1, 'month').date(3).toDate(),
		status: 'CLOSED',
	},
]

function fromSeed(seed: IncidentSeed): Incident {
	const resident = person(seed.residentId)
	return {
		id: seed.ref.toLowerCase().replace('-', '_'),
		ref: seed.ref,
		type: seed.type,
		summary: seed.summary,
		description: `${seed.summary}. Recorded by ${seed.reportedBy}.`,
		resident,
		occurred_at: seed.reportedAt,
		location: resident.place,
		injury:
			seed.type === 'INJURY' ? 'Minor skin tear, dressed' : 'No injury seen',
		witnesses: 'None',
		reported_by: seed.reportedBy,
		reported_by_role: seed.role,
		reported_at: seed.reportedAt,
		status: seed.status,
		severity: seed.status === 'CLOSED' ? 'LOW' : null,
		manager_notes:
			seed.status === 'CLOSED' ? 'Reviewed, no further action.' : '',
		actions: [],
		notifications: defaultNotifications(seed.residentId).map((n) => ({
			...n,
			is_done: n.id === 'family' && seed.status === 'CLOSED',
		})),
	}
}

export const incidents: Array<Incident> = [
	{
		id: 'inc_0142',
		ref: 'INC-0142',
		type: 'FALL',
		summary: 'Fall in the bathroom, no injury seen',
		description:
			'Efua was found sitting on the bathroom floor at 07:40. She said she slipped while standing up from the toilet. No visible injury. She was helped up by two staff using the hoist.',
		resident: person('res_efua_darko'),
		occurred_at: todayAt('07:40'),
		location: 'Room 4, bathroom',
		injury: 'No injury seen',
		witnesses: 'None',
		reported_by: 'Esi Quaye',
		reported_by_role: 'nurse',
		reported_at: todayAt('07:42'),
		status: 'AWAITING_REVIEW',
		severity: null,
		manager_notes: '',
		actions: [
			{
				id: 'act_1',
				description: 'Check her every hour for the next 24 hours',
				owner: 'Esi Quaye',
				due_date: todayAt('23:00'),
				is_done: true,
			},
			{
				id: 'act_2',
				description: 'Update her falls risk assessment',
				owner: 'Esi Quaye',
				due_date: daysFromNow(1),
				is_done: false,
			},
			{
				id: 'act_3',
				description: 'Add a grab rail next to the toilet',
				owner: 'Maintenance',
				due_date: daysFromNow(4),
				is_done: false,
			},
		],
		notifications: [
			{
				id: 'family',
				label: 'Family (Kojo Darko, son)',
				detail: 'Called at 08:15',
				hint: null,
				is_done: true,
			},
			{
				id: 'doctor',
				label: 'Doctor',
				detail: null,
				hint: null,
				is_done: false,
			},
			{
				id: 'regulator',
				label: 'Health Facilities Regulatory Agency',
				detail: null,
				hint: 'Only needed for serious harm',
				is_done: false,
			},
		],
	},
	fromSeed({
		ref: 'INC-0141',
		type: 'SAFEGUARDING',
		summary: 'Bruising on arm, family member visiting',
		residentId: 'res_akua_sarpong',
		reportedBy: 'Gifty Osei',
		role: 'carer',
		reportedAt: daysAgo(1),
		status: 'OPEN',
	}),
	fromSeed({
		ref: 'INC-0140',
		type: 'MEDICATION',
		summary: 'Evening dose given 2 hours late',
		residentId: 'res_kwabena_mensah',
		reportedBy: 'Joyce Nkansah',
		role: 'nurse',
		reportedAt: daysAgo(3),
		status: 'OPEN',
	}),
	fromSeed({
		ref: 'INC-0139',
		type: 'COMPLAINT',
		summary: 'Family unhappy with meal times',
		residentId: 'res_nana_agyeman',
		reportedBy: 'Office',
		role: 'office',
		reportedAt: daysAgo(6),
		status: 'CLOSED',
	}),
	...olderIncidents.map(fromSeed),
]

const VIEW_PREDICATES: Record<IncidentListView, (i: Incident) => boolean> = {
	open: (i) => i.status !== 'CLOSED',
	'awaiting-review': (i) => i.status === 'AWAITING_REVIEW',
	safeguarding: isSafeguarding,
	closed: (i) => i.status === 'CLOSED',
}

export function findIncident(id: string) {
	return incidents.find((incident) => incident.id === id)
}

export function filterIncidents(searchParams: URLSearchParams) {
	const query = searchParams.get('query')?.trim().toLowerCase()
	const view = searchParams.get('view') as IncidentListView | null
	const predicate = view ? VIEW_PREDICATES[view] : undefined

	return incidents.filter((incident) => {
		if (predicate && !predicate(incident)) return false
		if (!query) return true
		return [
			incident.ref,
			incident.summary,
			incident.resident.name,
			incident.reported_by,
			getIncidentTypeLabel(incident.type),
		]
			.join(' ')
			.toLowerCase()
			.includes(query)
	})
}

export function getIncidentCounts(): IncidentCounts {
	const thisMonth = incidents.filter((i) =>
		dayjs(i.reported_at).isSame(dayjs(), 'month'),
	)
	const lastMonth = incidents.filter((i) =>
		dayjs(i.reported_at).isSame(dayjs().subtract(1, 'month'), 'month'),
	)
	return {
		open: incidents.filter(VIEW_PREDICATES.open).length,
		awaiting_review: incidents.filter(VIEW_PREDICATES['awaiting-review'])
			.length,
		safeguarding: incidents.filter(VIEW_PREDICATES.safeguarding).length,
		reported_today: incidents.filter((i) =>
			dayjs(i.reported_at).isSame(dayjs(), 'day'),
		).length,
		this_month: thisMonth.length,
		falls_this_month: thisMonth.filter((i) => i.type === 'FALL').length,
		falls_last_month: lastMonth.filter((i) => i.type === 'FALL').length,
	}
}

export function reviewIncident(incident: Incident, input: ReviewIncidentInput) {
	incident.severity = input.severity
	incident.status = input.status === 'AWAITING_REVIEW' ? 'OPEN' : input.status
	incident.manager_notes = input.manager_notes.trim()
	incident.actions = [
		...incident.actions.map((action) => ({
			...action,
			is_done: input.completed_action_ids.includes(action.id),
		})),
		...input.new_actions
			.filter((action) => action.description.trim())
			.map((action, index) => ({
				id: `act_${Date.now().toString(36)}_${index}`,
				description: action.description.trim(),
				owner: action.owner.trim() || 'Unassigned',
				due_date: new Date(action.due_date || Date.now()),
				is_done: false,
			})),
	]
	const now = dayjs().format('HH:mm')
	incident.notifications = incident.notifications.map((notification) => {
		const isDone = input.notified_ids.includes(notification.id)
		return {
			...notification,
			is_done: isDone,
			detail:
				isDone && !notification.is_done
					? `Recorded at ${now}`
					: isDone
						? notification.detail
						: null,
		}
	})
	return incident
}

export function validateIncidentReport(input: Partial<ReportIncidentInput>) {
	if (!input.type) return 'Choose what kind of incident it was.'
	if (!input.resident_id || !findResident(input.resident_id)) {
		return 'Choose who it happened to.'
	}
	if (!input.description?.trim()) return 'Describe what happened.'
	if (!input.occurred_at || !dayjs(input.occurred_at).isValid()) {
		return 'Enter when it happened.'
	}
	if (dayjs(input.occurred_at).isAfter(dayjs())) {
		return 'It cannot have happened in the future.'
	}
	return null
}

export function reportIncident(input: ReportIncidentInput, reportedBy: string) {
	const highest = incidents
		.map((i) => Number(i.ref.slice(4)))
		.reduce((max, n) => Math.max(max, n), 0)
	const ref = `INC-${String(highest + 1).padStart(4, '0')}`
	const description = input.description.trim()
	const firstSentence = description.split(/[.!?]/)[0]?.trim() ?? description

	const incident: Incident = {
		id: ref.toLowerCase().replace('-', '_'),
		ref,
		type: input.type,
		summary:
			firstSentence.length > 60
				? `${firstSentence.slice(0, 57)}…`
				: firstSentence,
		description,
		resident: person(input.resident_id),
		occurred_at: new Date(input.occurred_at),
		location: input.location.trim() || person(input.resident_id).place,
		injury: input.injury.trim() || 'Not recorded',
		witnesses: input.witnesses.trim() || 'None',
		reported_by: reportedBy,
		reported_by_role: 'manager',
		reported_at: new Date(),
		status: 'AWAITING_REVIEW',
		severity: null,
		manager_notes: '',
		actions: [],
		notifications: defaultNotifications(input.resident_id),
	}
	incidents.unshift(incident)
	return incident
}
