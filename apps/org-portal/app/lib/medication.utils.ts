import dayjs from 'dayjs'
import { getInitials } from './strings'

export const MEDICATION_ROUND_TIMES = ['08:00', '13:00', '18:00', '22:00']

/** The latest round that has started, or the first round before 08:00. */
export function getCurrentRoundTime(now = dayjs()) {
	const current = now.format('HH:mm')
	return (
		[...MEDICATION_ROUND_TIMES].reverse().find((time) => time <= current) ??
		MEDICATION_ROUND_TIMES[0] ??
		'08:00'
	)
}

export const MEDICINE_FORM_OPTIONS: ReadonlyArray<{
	value: MedicineForm
	label: string
}> = [
	{ value: 'TABLET', label: 'Tablet' },
	{ value: 'CAPSULE', label: 'Capsule' },
	{ value: 'LIQUID', label: 'Liquid' },
	{ value: 'INHALER', label: 'Inhaler' },
	{ value: 'CREAM', label: 'Cream or ointment' },
	{ value: 'INJECTION', label: 'Injection' },
	{ value: 'DROPS', label: 'Drops' },
	{ value: 'PATCH', label: 'Patch' },
]

export const MEDICINE_ROUTE_OPTIONS: ReadonlyArray<{
	value: MedicineRoute
	label: string
}> = [
	{ value: 'MOUTH', label: 'Mouth' },
	{ value: 'UNDER_TONGUE', label: 'Under the tongue' },
	{ value: 'SKIN', label: 'On the skin' },
	{ value: 'INHALED', label: 'Inhaled' },
	{ value: 'INJECTION', label: 'Injection' },
	{ value: 'EYE', label: 'Eye' },
	{ value: 'EAR', label: 'Ear' },
]

export const MEDICINE_FREQUENCY_OPTIONS: ReadonlyArray<{
	value: MedicineFrequency
	label: string
	times: StringList
}> = [
	{ value: 'ONCE_DAILY', label: 'Once a day', times: ['08:00'] },
	{ value: 'TWICE_DAILY', label: 'Twice a day', times: ['08:00', '18:00'] },
	{
		value: 'THREE_TIMES_DAILY',
		label: '3 times a day',
		times: ['08:00', '14:00', '20:00'],
	},
	{
		value: 'FOUR_TIMES_DAILY',
		label: '4 times a day',
		times: ['08:00', '13:00', '18:00', '22:00'],
	},
	{ value: 'AT_NIGHT', label: 'At night', times: ['22:00'] },
]

export function getDefaultTimes(frequency: MedicineFrequency) {
	return (
		MEDICINE_FREQUENCY_OPTIONS.find((option) => option.value === frequency)
			?.times ?? []
	)
}

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/

export function parseTimes(value: string) {
	return value
		.split(',')
		.map((time) => time.trim())
		.filter(Boolean)
}

export function areValidTimes(times: StringList) {
	return times.length > 0 && times.every((time) => TIME_PATTERN.test(time))
}

/**
 * Medicines that belong to a drug class people are commonly allergic to.
 * A record says "penicillin" but the prescription says "amoxicillin" — a
 * plain name match would let that through.
 */
const ALLERGY_CLASSES: Record<string, StringList> = {
	penicillin: [
		'penicillin',
		'amoxicillin',
		'ampicillin',
		'flucloxacillin',
		'co-amoxiclav',
		'augmentin',
		'piperacillin',
	],
	'sulfa drugs': [
		'sulfamethoxazole',
		'co-trimoxazole',
		'septrin',
		'sulfasalazine',
	],
	aspirin: ['aspirin', 'acetylsalicylic acid'],
	ibuprofen: ['ibuprofen', 'brufen'],
	codeine: ['codeine', 'co-codamol'],
}

export interface AllergyConflict {
	allergy: string
	medicine: string
	isSameName: boolean
}

export function findAllergyConflict(
	medicineName: string,
	allergies: StringList,
): Nullable<AllergyConflict> {
	const medicine = medicineName.trim().toLowerCase()
	if (medicine.length < 3) return null

	for (const allergy of allergies) {
		const allergen = allergy.trim().toLowerCase()
		if (!allergen) continue

		if (medicine.includes(allergen)) {
			return { allergy, medicine: medicineName.trim(), isSameName: true }
		}
		const members = ALLERGY_CLASSES[allergen] ?? []
		if (members.some((member) => medicine.includes(member))) {
			return { allergy, medicine: medicineName.trim(), isSameName: false }
		}
	}
	return null
}

export function getAllergyConflictMessage(
	conflict: AllergyConflict,
	firstName: string,
) {
	const allergy = conflict.allergy.toLowerCase()
	const medicine = conflict.medicine.toLowerCase()
	const reason = conflict.isSameName
		? `${firstName} is allergic to ${allergy}.`
		: `${medicine} is a ${allergy.replace(/s$/, '')}, and ${firstName} is allergic to ${allergy}.`
	return `Stop: ${reason} Choose another medicine or check with the prescriber.`
}

function minutesOfDay(time: string) {
	const [hours = 0, minutes = 0] = time.split(':').map(Number)
	return hours * 60 + minutes
}

function formatDueIn(time: string, now: dayjs.Dayjs) {
	const diff = minutesOfDay(time) - (now.hour() * 60 + now.minute())
	if (diff <= 0) return 'now'
	if (diff < 60) return `in ${diff} min`
	return `in ${Math.round(diff / 60)} h`
}

export function getDoseDetail(dose: ScheduledDose, now = dayjs()) {
	const initials = dose.recorded_by ? getInitials(dose.recorded_by) : null
	switch (dose.status) {
		case 'GIVEN':
			return [dose.recorded_at, initials].filter(Boolean).join(' · ')
		case 'REFUSED':
			return initials ? `${initials} · noted` : 'noted'
		case 'MISSED':
			return 'not recorded'
		case 'DUE': {
			const due = formatDueIn(dose.time, now)
			return due === 'now' ? '' : due
		}
	}
}

/** "Metformin, amlodipine, calcium" — or "4 medicines" when the list gets long. */
export function formatMedicineList(names: StringList) {
	if (names.length > 3) return `${names.length} medicines`
	return names
		.map((name, index) => {
			const firstWord = name.split(' ')[0] ?? name
			return index === 0 ? firstWord : firstWord.toLowerCase()
		})
		.join(', ')
}

const ROUND_STATUS: Record<
	RoundRowStatus,
	{ tone: StatusTone; label: (row: MedicationRoundRow) => string }
> = {
	MISSED: { tone: 'critical', label: (row) => `${row.missed_count} missed` },
	REFUSED: { tone: 'info', label: () => 'Refused' },
	DUE: { tone: 'warning', label: () => 'Due' },
	GIVEN: { tone: 'success', label: () => 'Given' },
}

export function getRoundRowStatus(row: MedicationRoundRow) {
	const status = ROUND_STATUS[row.status]
	return { tone: status.tone, label: status.label(row) }
}
