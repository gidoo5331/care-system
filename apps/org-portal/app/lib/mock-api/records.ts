import dayjs from 'dayjs'
import { daysAgo, daysFromNow, todayAt } from './http'
import {
	createResident,
	findResident,
	residents,
	validateResidentInput,
} from './residents'
import { getResidentName, getResidentPlace } from '~/lib/resident.utils'

const newId = (prefix: string) =>
	`${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`

function personOf(resident: Resident) {
	return {
		id: resident.id,
		name: getResidentName(resident),
		place:
			resident.service === 'HOMECARE'
				? `Homecare · ${resident.area ?? ''}`
				: getResidentPlace(resident),
	}
}

const notesByResident = new Map<string, Array<ResidentNoteEntry>>()

function seedNotes(resident: Resident): Array<ResidentNoteEntry> {
	const note = (
		days: number,
		time: string,
		category: NoteCategory,
		body: string,
		by: string,
	): ResidentNoteEntry => {
		const at = dayjs(todayAt(time)).subtract(days, 'day').toDate()
		return {
			id: newId('note'),
			resident_id: resident.id,
			category,
			body,
			recorded_by: by,
			recorded_at: at,
		}
	}

	if (resident.id === 'res_kofi_asante') {
		return [
			note(
				0,
				'07:50',
				'DAILY',
				'Refused breakfast. Said he felt full.',
				'Akosua Badu',
			),
			note(
				0,
				'07:30',
				'HEALTH',
				'Blood sugar 9.8, above his usual. Nurse informed.',
				'Esi Quaye',
			),
			note(
				0,
				'07:10',
				'DAILY',
				'Washed and dressed with help of one.',
				'Akosua Badu',
			),
			note(
				0,
				'06:00',
				'DAILY',
				'Night handover: slept well, no concerns.',
				'Kwame Addo',
			),
			note(
				1,
				'16:00',
				'FAMILY',
				'Son Kwame visited for an hour. Kofi was cheerful.',
				'Akosua Badu',
			),
			note(
				2,
				'11:20',
				'HEALTH',
				'Seen by GP. Metformin dose unchanged.',
				'Esi Quaye',
			),
		]
	}
	if (!resident.latest_note) return []
	return [
		{
			id: newId('note'),
			resident_id: resident.id,
			category: 'DAILY',
			body: resident.latest_note.summary,
			recorded_by:
				resident.service === 'CARE_HOME' ? 'Esi Quaye' : 'Yaw Boateng',
			recorded_at: new Date(resident.latest_note.recorded_at),
		},
	]
}

export function getNotes(resident: Resident) {
	let notes = notesByResident.get(resident.id)
	if (!notes) {
		notes = seedNotes(resident)
		notesByResident.set(resident.id, notes)
	}
	return [...notes].sort(
		(a, b) =>
			new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime(),
	)
}

export function addNote(
	resident: Resident,
	input: Partial<CreateNoteInput>,
	actor: string,
) {
	const body = input.body?.trim()
	if (!body) return { error: 'Write the note first.' }
	const note: ResidentNoteEntry = {
		id: newId('note'),
		resident_id: resident.id,
		category: input.category ?? 'DAILY',
		body,
		recorded_by: actor,
		recorded_at: new Date(),
	}
	getNotes(resident)
	notesByResident.get(resident.id)?.push(note)
	resident.latest_note = {
		summary: body.length > 48 ? `${body.slice(0, 45)}…` : body,
		recorded_at: note.recorded_at,
	}
	return { note }
}

const documentsByResident = new Map<string, Array<ResidentDocument>>()

export function getDocuments(resident: Resident) {
	let documents = documentsByResident.get(resident.id)
	if (!documents) {
		const admitted = new Date(resident.admitted_at)
		documents = [
			{
				id: newId('doc'),
				resident_id: resident.id,
				title:
					resident.service === 'CARE_HOME'
						? 'Care home agreement'
						: 'Homecare agreement',
				category: 'AGREEMENT',
				file_name: 'agreement.pdf',
				added_by: 'Office',
				added_at: admitted,
			},
			{
				id: newId('doc'),
				resident_id: resident.id,
				title: 'GP summary',
				category: 'MEDICAL',
				file_name: 'gp-summary.pdf',
				added_by: 'Esi Quaye',
				added_at: dayjs(admitted).add(3, 'day').toDate(),
			},
		]
		if (resident.id === 'res_kofi_asante') {
			documents.push({
				id: newId('doc'),
				resident_id: resident.id,
				title: 'Diabetes clinic letter',
				category: 'MEDICAL',
				file_name: 'korle-bu-diabetes-clinic.pdf',
				added_by: 'Esi Quaye',
				added_at: daysAgo(12),
			})
		}
		documentsByResident.set(resident.id, documents)
	}
	return [...documents].sort(
		(a, b) => new Date(b.added_at).getTime() - new Date(a.added_at).getTime(),
	)
}

export function addDocument(
	resident: Resident,
	input: Partial<CreateDocumentInput>,
	actor: string,
) {
	const title = input.title?.trim()
	if (!title) return { error: 'Give the document a title.' }
	const document: ResidentDocument = {
		id: newId('doc'),
		resident_id: resident.id,
		title,
		category: input.category ?? 'OTHER',
		file_name: input.file_name?.trim() || null,
		added_by: actor,
		added_at: new Date(),
	}
	getDocuments(resident)
	documentsByResident.get(resident.id)?.push(document)
	return { document }
}

export function addContact(
	resident: Resident,
	input: Partial<ResidentContact>,
) {
	if (!input.name?.trim()) return { error: 'Enter their name.' }
	if (!input.phone_number?.trim()) return { error: 'Enter a phone number.' }
	const contact: ResidentContact = {
		name: input.name.trim(),
		relationship: input.relationship?.trim() || 'Contact',
		phone_number: input.phone_number.trim(),
		is_next_of_kin: Boolean(input.is_next_of_kin),
	}
	resident.contacts = [
		...resident.contacts.map((c) =>
			contact.is_next_of_kin ? { ...c, is_next_of_kin: false } : c,
		),
		contact,
	]
	return { contact }
}

const movements: Array<ResidentMovement> = [
	...residents
		.filter((r) => r.status === 'IN_HOSPITAL')
		.map(
			(resident, index): ResidentMovement => ({
				id: newId('mov'),
				resident: personOf(resident),
				type: 'HOSPITAL_ADMISSION',
				date: daysAgo(2 + index * 3),
				destination: 'Korle Bu Teaching Hospital',
				notes: 'Admitted after a chest infection.',
				recorded_by: 'Esi Quaye',
			}),
		),
	{
		id: 'mov_discharge_1',
		resident: { id: 'res_past_1', name: 'Efua Mintah', place: 'Room 15' },
		type: 'DISCHARGED_HOME',
		date: daysAgo(9),
		destination: 'Home to her daughter in Spintex',
		notes: 'Recovered well after rehabilitation.',
		recorded_by: 'Ama Mensah',
	},
	{
		id: 'mov_transfer_1',
		resident: { id: 'res_past_2', name: 'Kofi Boadi', place: 'Room 28' },
		type: 'TRANSFERRED',
		date: daysAgo(21),
		destination: 'Nursing home closer to family in Kumasi',
		notes: '',
		recorded_by: 'Ama Mensah',
	},
]

export function getMovementsOverview(): MovementsOverview {
	return {
		in_hospital: residents.filter((r) => r.status === 'IN_HOSPITAL'),
		recent: [...movements]
			.reverse()
			.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
	}
}

export function recordMovement(
	input: Partial<CreateMovementInput>,
	actor: string,
) {
	const resident = input.resident_id
		? findResident(input.resident_id)
		: undefined
	if (!resident) return { error: 'Choose who this is for.' }
	if (!input.type) return { error: 'Choose what happened.' }
	if (!input.date || !dayjs(input.date).isValid())
		return { error: 'Enter the date.' }
	if (dayjs(input.date).isAfter(dayjs(), 'day')) {
		return { error: 'The date cannot be in the future.' }
	}

	if (input.type === 'RETURNED_FROM_HOSPITAL') {
		if (resident.status !== 'IN_HOSPITAL') {
			return { error: `${resident.first_name} is not in hospital.` }
		}
		resident.status = 'ACTIVE'
	} else if (resident.status === 'DISCHARGED') {
		return { error: `${resident.first_name} has already left.` }
	} else if (input.type === 'HOSPITAL_ADMISSION') {
		if (resident.status === 'IN_HOSPITAL') {
			return { error: `${resident.first_name} is already in hospital.` }
		}
		resident.status = 'IN_HOSPITAL'
	} else {
		resident.status = 'DISCHARGED'
	}

	const movement: ResidentMovement = {
		id: newId('mov'),
		resident: personOf(resident),
		type: input.type,
		date: new Date(input.date),
		destination: input.destination?.trim() || null,
		notes: input.notes?.trim() ?? '',
		recorded_by: actor,
	}
	movements.push(movement)
	return { movement }
}

const appointments: Array<Appointment> = []

function seedAppointment(
	residentId: string,
	startsAt: Date,
	withWhom: string,
	location: string,
	escort: Nullable<string>,
	transport: Nullable<string>,
) {
	const resident = findResident(residentId)
	if (!resident) return
	appointments.push({
		id: newId('apt'),
		resident: personOf(resident),
		starts_at: startsAt,
		with_whom: withWhom,
		location,
		escort,
		transport,
		notes: '',
	})
}

seedAppointment(
	'res_kofi_asante',
	todayAt('10:30'),
	'Diabetes clinic',
	'Korle Bu Teaching Hospital',
	'Esi Quaye',
	'Home minibus',
)
seedAppointment(
	'res_efua_darko',
	todayAt('11:00'),
	'GP review after fall',
	'In the home, room 4',
	null,
	null,
)
seedAppointment(
	'res_nana_agyeman',
	todayAt('14:00'),
	'Dietitian',
	'In the home, room 9',
	null,
	null,
)
seedAppointment(
	'res_akua_sarpong',
	todayAt('15:30'),
	'Eye clinic',
	'Ridge Hospital',
	'Her daughter',
	'Family car',
)
seedAppointment(
	'res_yaw_ofori',
	dayjs(daysFromNow(1)).hour(9).minute(0).toDate(),
	'Dentist',
	'Smile Dental, Tema Community 25',
	'Prince Kumi',
	'Taxi',
)
seedAppointment(
	'res_adwoa_frimpong',
	dayjs(daysFromNow(3)).hour(13).minute(30).toDate(),
	'Occupational therapist',
	'In the home, room 3',
	null,
	null,
)

export function getAppointments(searchParams: URLSearchParams) {
	const range = searchParams.get('range')
	const end =
		range === 'today'
			? dayjs().endOf('day')
			: dayjs()
					.add(range === 'month' ? 30 : 7, 'day')
					.endOf('day')
	return appointments
		.filter((a) => {
			const at = dayjs(a.starts_at)
			return !at.isBefore(dayjs().startOf('day')) && !at.isAfter(end)
		})
		.sort(
			(a, b) =>
				new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime(),
		)
}

export function countAppointmentsToday() {
	return appointments.filter((a) => dayjs(a.starts_at).isSame(dayjs(), 'day'))
		.length
}

export function addAppointment(input: Partial<CreateAppointmentInput>) {
	const resident = input.resident_id
		? findResident(input.resident_id)
		: undefined
	if (!resident) return { error: 'Choose who the appointment is for.' }
	if (!input.starts_at || !dayjs(input.starts_at).isValid()) {
		return { error: 'Enter the date and time.' }
	}
	if (dayjs(input.starts_at).isBefore(dayjs().startOf('day'))) {
		return { error: 'The appointment cannot be in the past.' }
	}
	if (!input.with_whom?.trim())
		return { error: 'Say who the appointment is with.' }
	if (!input.location?.trim()) return { error: 'Say where it is.' }

	const appointment: Appointment = {
		id: newId('apt'),
		resident: personOf(resident),
		starts_at: new Date(input.starts_at),
		with_whom: input.with_whom.trim(),
		location: input.location.trim(),
		escort: input.escort?.trim() || null,
		transport: input.transport?.trim() || null,
		notes: input.notes?.trim() ?? '',
	}
	appointments.push(appointment)
	return { appointment }
}

export function importResidents(rows: Array<Partial<CreateResidentInput>>) {
	if (!rows.length) return { error: 'There are no rows to import.' }
	const problems = rows
		.map((row, index) => ({ index, error: validateResidentInput(row) }))
		.filter((p) => p.error)
	if (problems.length) {
		return {
			error: `Row ${(problems[0]?.index ?? 0) + 1}: ${problems[0]?.error ?? ''}`,
		}
	}
	const created = rows.map((row) =>
		createResident({
			languages: [],
			allergies: [],
			conditions: [],
			contacts: [],
			risk_level: 'LOW',
			...row,
		} as CreateResidentInput),
	)
	const result: ImportResidentsResult = {
		created: created.length,
		residents: created.map(({ id, code, first_name, last_name }) => ({
			id,
			code,
			first_name,
			last_name,
		})),
	}
	return { result }
}
