import dayjs from 'dayjs'
import { todayAt } from './http'
import { residents } from './residents'
import {
	findAllergyConflict,
	getDefaultTimes,
	MEDICATION_ROUND_TIMES,
} from '~/lib/medication.utils'
import { getResidentName } from '~/lib/resident.utils'

const ROUND_TIMES = MEDICATION_ROUND_TIMES

const NURSE = 'Esi Quaye'

function given(time: string, at: string): ScheduledDose {
	return { time, status: 'GIVEN', recorded_by: NURSE, recorded_at: at }
}

function due(time: string): ScheduledDose {
	return { time, status: 'DUE', recorded_by: null, recorded_at: null }
}

function regular(
	id: string,
	name: string,
	instructions: string,
	doses: Array<ScheduledDose>,
): ResidentMedication {
	return {
		id,
		name,
		instructions,
		is_as_needed: false,
		doses,
		last_given_label: null,
	}
}

function asNeeded(
	id: string,
	name: string,
	instructions: string,
	lastGiven: string,
): ResidentMedication {
	return {
		id,
		name,
		instructions,
		is_as_needed: true,
		doses: [],
		last_given_label: lastGiven,
	}
}

const DESIGNED_MEDICATION: Record<string, () => Array<ResidentMedication>> = {
	res_kofi_asante: () => [
		regular('med_metformin', 'Metformin 500 mg', '1 tablet, with food', [
			{ time: '08:00', status: 'MISSED', recorded_by: null, recorded_at: null },
			due('13:00'),
			due('18:00'),
		]),
		regular('med_amlodipine', 'Amlodipine 5 mg', '1 tablet, once a day', [
			given('08:00', '08:06'),
		]),
		regular('med_atorvastatin', 'Atorvastatin 20 mg', '1 tablet, at night', [
			due('22:00'),
		]),
		regular('med_calcium', 'Calcium and vitamin D', '1 tablet, twice a day', [
			{
				time: '08:00',
				status: 'REFUSED',
				recorded_by: NURSE,
				recorded_at: '08:04',
			},
			due('18:00'),
		]),
		asNeeded(
			'med_paracetamol',
			'Paracetamol 500 mg',
			'1 to 2 tablets for pain',
			'Last given yesterday 21:40',
		),
	],
	res_nana_agyeman: () => [
		regular('med_ferrous', 'Ferrous sulfate 200 mg', '1 tablet, with food', [
			due('08:00'),
		]),
		regular('med_b12', 'Vitamin B12 50 mcg', '1 tablet, once a day', [
			due('08:00'),
		]),
	],
	res_yaw_ofori: () => [
		regular('med_lisinopril', 'Lisinopril 10 mg', '1 tablet, once a day', [
			{
				time: '08:00',
				status: 'REFUSED',
				recorded_by: NURSE,
				recorded_at: '08:20',
			},
		]),
	],
	res_efua_darko: () => [
		regular('med_donepezil', 'Donepezil 5 mg', '1 tablet, in the morning', [
			given('08:00', '08:12'),
		]),
		regular(
			'med_paracetamol_reg',
			'Paracetamol 1 g',
			'2 tablets, 4 times a day',
			[given('08:00', '08:12'), due('13:00'), due('18:00'), due('22:00')],
		),
	],
	res_adwoa_frimpong: () => [
		regular('med_furosemide', 'Furosemide 40 mg', '1 tablet, in the morning', [
			given('08:00', '08:02'),
		]),
		regular('med_bisoprolol', 'Bisoprolol 2.5 mg', '1 tablet, once a day', [
			given('08:00', '08:02'),
		]),
		regular(
			'med_omeprazole',
			'Omeprazole 20 mg',
			'1 capsule, before breakfast',
			[given('08:00', '08:02')],
		),
		regular('med_lactulose', 'Lactulose 10 ml', '10 ml, twice a day', [
			given('08:00', '08:02'),
			due('18:00'),
		]),
	],
}

function genericMedication(index: number): Array<ResidentMedication> {
	const minute = String(5 + (index % 40)).padStart(2, '0')
	return [
		regular('med_amlodipine', 'Amlodipine 5 mg', '1 tablet, once a day', [
			given('08:00', `08:${minute}`),
		]),
		regular('med_vitamin_d', 'Vitamin D 1000 IU', '1 tablet, with food', [
			due('13:00'),
		]),
		asNeeded(
			'med_paracetamol',
			'Paracetamol 500 mg',
			'1 to 2 tablets for pain',
			'Not given in the last 7 days',
		),
	]
}

const medicationByResident = new Map<string, Array<ResidentMedication>>()

export function getResidentMedication(resident: Resident) {
	let medication = medicationByResident.get(resident.id)
	if (!medication) {
		const designed = DESIGNED_MEDICATION[resident.id]
		medication = designed
			? designed()
			: resident.id.startsWith('res_gen_')
				? genericMedication(residents.indexOf(resident))
				: []
		medicationByResident.set(resident.id, medication)
	}
	return medication
}

export function getRoundTimes(medication: Array<ResidentMedication>) {
	const times = new Set(ROUND_TIMES)
	for (const item of medication) {
		for (const dose of item.doses) times.add(dose.time)
	}
	return [...times].sort()
}

export function validatePrescriptionInput(
	resident: Resident,
	input: Partial<CreatePrescriptionInput>,
): Nullable<{ message: string; status: number }> {
	if (
		!input.medicine_name?.trim() ||
		!input.strength?.trim() ||
		!input.dose?.trim()
	) {
		return {
			message: 'Medicine name, strength and dose are required.',
			status: 400,
		}
	}
	if (!input.prescribed_by?.trim()) {
		return { message: 'Record who prescribed it.', status: 400 }
	}
	if (!input.is_as_needed && !input.times?.length) {
		return { message: 'Add at least one time to give it.', status: 400 }
	}
	const conflict = findAllergyConflict(input.medicine_name, resident.allergies)
	if (conflict) {
		return {
			message: `${getResidentName(resident)} is allergic to ${conflict.allergy.toLowerCase()}.`,
			status: 409,
		}
	}
	return null
}

export function addPrescription(
	resident: Resident,
	input: CreatePrescriptionInput,
): ResidentMedication {
	const name = `${input.medicine_name.trim()} ${input.strength.trim()}`
	const instructions = [input.dose.trim(), input.instructions?.trim()]
		.filter(Boolean)
		.join(', ')

	const startsToday = dayjs(input.start_date).isSame(dayjs(), 'day')
	const startsLater = dayjs(input.start_date).isAfter(dayjs(), 'day')
	const nowTime = dayjs().format('HH:mm')
	const times = input.times.length
		? input.times
		: input.frequency
			? getDefaultTimes(input.frequency)
			: []

	const medication: ResidentMedication = input.is_as_needed
		? asNeeded(
				`med_${Date.now().toString(36)}`,
				name,
				[instructions, input.as_needed_reason].filter(Boolean).join(' · '),
				'Not given yet',
			)
		: regular(
				`med_${Date.now().toString(36)}`,
				name,
				instructions,
				startsLater
					? []
					: times.filter((time) => !startsToday || time >= nowTime).map(due),
			)

	getResidentMedication(resident).push(medication)
	return medication
}

function rowStatus(doses: Array<ScheduledDose>): RoundRowStatus {
	if (doses.some((d) => d.status === 'MISSED')) return 'MISSED'
	if (doses.some((d) => d.status === 'REFUSED')) return 'REFUSED'
	if (doses.some((d) => d.status === 'DUE')) return 'DUE'
	return 'GIVEN'
}

const UNIT_NAMES = ['ground floor', 'first floor']

export function getMedicationRound(
	searchParams: URLSearchParams,
): MedicationRound {
	const requestedTime = searchParams.get('time')
	const roundTime =
		requestedTime && ROUND_TIMES.includes(requestedTime)
			? requestedTime
			: (ROUND_TIMES[0] ?? '08:00')
	const requestedUnit = searchParams.get('unit')
	const unitName =
		requestedUnit && UNIT_NAMES.includes(requestedUnit)
			? requestedUnit
			: (UNIT_NAMES[0] ?? 'ground floor')

	const stats = { given: 0, total: 0, due: 0, refused: 0, missed: 0 }
	const rows: Array<MedicationRoundRow> = []

	for (const resident of residents) {
		if (
			resident.service !== 'CARE_HOME' ||
			resident.status !== 'ACTIVE' ||
			resident.unit_name !== unitName
		) {
			continue
		}

		const items = getResidentMedication(resident)
			.filter((item) => !item.is_as_needed)
			.flatMap((item) =>
				item.doses
					.filter((dose) => dose.time === roundTime)
					.map((dose) => ({ name: item.name, dose })),
			)
		if (!items.length) continue

		const doses = items.map((item) => item.dose)
		stats.total += doses.length
		stats.given += doses.filter((d) => d.status === 'GIVEN').length
		stats.due += doses.filter((d) => d.status === 'DUE').length
		stats.refused += doses.filter((d) => d.status === 'REFUSED').length
		stats.missed += doses.filter((d) => d.status === 'MISSED').length

		const recorded = doses.find((d) => d.recorded_by)
		rows.push({
			resident_id: resident.id,
			resident_name: getResidentName(resident),
			room: resident.room,
			medicines: items.map((item) => item.name),
			status: rowStatus(doses),
			missed_count: doses.filter((d) => d.status === 'MISSED').length,
			given_by: recorded?.recorded_by ?? null,
			given_at: recorded?.recorded_at ?? null,
		})
	}

	const statusOrder: Record<RoundRowStatus, number> = {
		MISSED: 0,
		DUE: 1,
		REFUSED: 2,
		GIVEN: 3,
	}
	rows.sort((a, b) => statusOrder[a.status] - statusOrder[b.status])

	return {
		date: todayAt(roundTime),
		round_time: roundTime,
		round_times: ROUND_TIMES,
		unit_name: unitName,
		unit_names: UNIT_NAMES,
		stats: {
			...stats,
			due_by: dayjs(todayAt(roundTime)).add(2, 'hour').format('HH:mm'),
		},
		rows,
	}
}

export function getMedicationCounts(): MedicationCounts {
	let missedAndRefused = 0
	for (const resident of residents) {
		if (resident.service !== 'CARE_HOME') continue
		for (const item of getResidentMedication(resident)) {
			missedAndRefused += item.doses.filter(
				(d) => d.status === 'MISSED' || d.status === 'REFUSED',
			).length
		}
	}
	return { missed_and_refused: missedAndRefused, reviews_due: 3 }
}
