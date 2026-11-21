import { daysAgo, daysFromNow, todayAt } from './http'
import { getResidentName, isCarePlanReviewDue } from '~/lib/resident.utils'

const CARE_PLAN_REVIEW_CYCLE_DAYS = 30

type ResidentSeed = Pick<
	Resident,
	| 'id'
	| 'code'
	| 'first_name'
	| 'last_name'
	| 'service'
	| 'room'
	| 'unit_name'
	| 'area'
	| 'status'
	| 'risk_level'
	| 'risk_reason'
	| 'allergies'
	| 'conditions'
	| 'latest_note'
> & {
	age: number
	reviewed_days_ago: number
	admitted_at: Date
}

function yearsAgo(years: number) {
	const date = daysAgo(0)
	date.setFullYear(date.getFullYear() - years, 2, 1)
	return date
}

function toResident(seed: ResidentSeed): Resident {
	const { age, reviewed_days_ago, ...rest } = seed
	return {
		...rest,
		date_of_birth: yearsAgo(age),
		care_plan_reviewed_at: daysAgo(reviewed_days_ago),
		care_plan_review_due_at: daysFromNow(
			CARE_PLAN_REVIEW_CYCLE_DAYS - reviewed_days_ago,
		),
		created_at: seed.admitted_at,
		updated_at: daysAgo(0),
	}
}

const designedResidents: Array<ResidentSeed> = [
	{
		id: 'res_kofi_asante',
		code: 'R-0112',
		first_name: 'Kofi',
		last_name: 'Asante',
		age: 81,
		service: 'CARE_HOME',
		room: '12',
		unit_name: 'ground floor',
		area: null,
		status: 'ACTIVE',
		risk_level: 'HIGH',
		risk_reason: 'falls',
		allergies: ['Penicillin'],
		conditions: ['Type 2 diabetes', 'Walks with a frame'],
		latest_note: {
			summary: 'Refused breakfast',
			recorded_at: todayAt('07:50'),
		},
		reviewed_days_ago: 18,
		admitted_at: new Date('2025-03-14T10:00:00Z'),
	},
	{
		id: 'res_efua_darko',
		code: 'R-0104',
		first_name: 'Efua',
		last_name: 'Darko',
		age: 88,
		service: 'CARE_HOME',
		room: '4',
		unit_name: 'ground floor',
		area: null,
		status: 'ACTIVE',
		risk_level: 'HIGH',
		risk_reason: 'falls',
		allergies: [],
		conditions: ['Osteoporosis', 'Needs help of one'],
		latest_note: { summary: 'Fall in bathroom', recorded_at: todayAt('07:42') },
		reviewed_days_ago: 23,
		admitted_at: new Date('2024-09-02T10:00:00Z'),
	},
	{
		id: 'res_nana_agyeman',
		code: 'R-0109',
		first_name: 'Nana',
		last_name: 'Agyeman',
		age: 76,
		service: 'CARE_HOME',
		room: '9',
		unit_name: 'first floor',
		area: null,
		status: 'ACTIVE',
		risk_level: 'MEDIUM',
		risk_reason: 'eating',
		allergies: ['Shellfish'],
		conditions: ['Dementia', 'Soft diet'],
		latest_note: { summary: 'Ate half of lunch', recorded_at: daysAgo(1) },
		reviewed_days_ago: 33,
		admitted_at: new Date('2025-06-20T10:00:00Z'),
	},
	{
		id: 'res_abena_owusu',
		code: 'H-2031',
		first_name: 'Abena',
		last_name: 'Owusu',
		age: 73,
		service: 'HOMECARE',
		room: null,
		unit_name: null,
		area: 'Dansoman',
		status: 'ACTIVE',
		risk_level: 'MEDIUM',
		risk_reason: 'skin',
		allergies: [],
		conditions: ['Pressure area care', 'Lives alone'],
		latest_note: { summary: 'Visit due 09:00', recorded_at: daysAgo(1) },
		reviewed_days_ago: 8,
		admitted_at: new Date('2025-08-11T10:00:00Z'),
	},
	{
		id: 'res_akua_sarpong',
		code: 'H-2044',
		first_name: 'Akua',
		last_name: 'Sarpong',
		age: 84,
		service: 'HOMECARE',
		room: null,
		unit_name: null,
		area: 'Kaneshie',
		status: 'ACTIVE',
		risk_level: 'HIGH',
		risk_reason: 'diabetes',
		allergies: ['Sulfa drugs'],
		conditions: ['Insulin dependent', 'Partially sighted'],
		latest_note: { summary: 'Blood sugar 11.2', recorded_at: daysAgo(1) },
		reviewed_days_ago: 25,
		admitted_at: new Date('2025-02-03T10:00:00Z'),
	},
	{
		id: 'res_yaw_ofori',
		code: 'R-0117',
		first_name: 'Yaw',
		last_name: 'Ofori',
		age: 69,
		service: 'CARE_HOME',
		room: '17',
		unit_name: 'first floor',
		area: null,
		status: 'ACTIVE',
		risk_level: 'LOW',
		risk_reason: null,
		allergies: ['Aspirin'],
		conditions: ['Hypertension'],
		latest_note: { summary: 'Walked in the garden', recorded_at: daysAgo(1) },
		reviewed_days_ago: 11,
		admitted_at: new Date('2025-10-01T10:00:00Z'),
	},
	{
		id: 'res_kwabena_mensah',
		code: 'R-0121',
		first_name: 'Kwabena',
		last_name: 'Mensah',
		age: 79,
		service: 'CARE_HOME',
		room: '21',
		unit_name: 'first floor',
		area: null,
		status: 'ACTIVE',
		risk_level: 'LOW',
		risk_reason: null,
		allergies: [],
		conditions: ['Parkinson’s'],
		latest_note: { summary: 'Family visited', recorded_at: daysAgo(1) },
		reviewed_days_ago: 5,
		admitted_at: new Date('2025-04-22T10:00:00Z'),
	},
	{
		id: 'res_adwoa_frimpong',
		code: 'R-0103',
		first_name: 'Adwoa',
		last_name: 'Frimpong',
		age: 91,
		service: 'CARE_HOME',
		room: '3',
		unit_name: 'ground floor',
		area: null,
		status: 'ACTIVE',
		risk_level: 'MEDIUM',
		risk_reason: 'moving',
		allergies: ['Latex'],
		conditions: ['Bed bound', 'Two-hourly turns'],
		latest_note: { summary: 'Turned in bed', recorded_at: todayAt('06:00') },
		reviewed_days_ago: 14,
		admitted_at: new Date('2023-11-15T10:00:00Z'),
	},
]

const FIRST_NAMES = [
	'Akosua',
	'Kwame',
	'Yaa',
	'Kojo',
	'Afua',
	'Kwesi',
	'Ama',
	'Fiifi',
	'Esi',
	'Kwaku',
	'Adjoa',
	'Ekow',
	'Abena',
	'Nii',
	'Naa',
	'Kobina',
	'Araba',
	'Kofi',
	'Efua',
	'Yaw',
]

const LAST_NAMES = [
	'Boateng',
	'Appiah',
	'Osei',
	'Addo',
	'Ansah',
	'Quaye',
	'Tetteh',
	'Amoah',
	'Bonsu',
	'Danquah',
	'Asamoah',
	'Opoku',
	'Badu',
	'Nkrumah',
	'Agyei',
	'Acheampong',
	'Lamptey',
	'Ofori',
	'Owusu',
	'Mensah',
]

const HOMECARE_AREAS = [
	'Dansoman',
	'Kaneshie',
	'Tema',
	'Spintex',
	'Osu',
	'Labadi',
	'Madina',
	'Achimota',
]

const ALLERGY_POOL: Array<StringList> = [
	[],
	['Penicillin'],
	[],
	['Peanuts'],
	[],
	[],
	['Ibuprofen'],
	['Codeine'],
]

const CONDITION_POOL: Array<StringList> = [
	['Hypertension'],
	['Type 2 diabetes'],
	['Dementia'],
	['Arthritis', 'Walks with a stick'],
	['Heart failure'],
	['Stroke recovery', 'Needs help of one'],
]

const NOTE_POOL = [
	'Slept well',
	'Ate all of breakfast',
	'Took part in morning exercise',
	'Visited by daughter',
	'Bath given',
	'Comfortable, no concerns',
]

const RISK_POOL: Array<[RiskLevel, Nullable<string>]> = [
	['LOW', null],
	['MEDIUM', 'falls'],
	['LOW', null],
	['MEDIUM', 'eating'],
	['LOW', null],
]

const GENERATED_CARE_HOME = 36
const GENERATED_HOMECARE = 29
const HIGH_RISK_AT = new Set([7, 23, 41])
const REVIEW_DUE_AT = new Set([12, 50])
const IN_HOSPITAL_AT = new Set([3, 30])

function generateResidents(): Array<ResidentSeed> {
	const total = GENERATED_CARE_HOME + GENERATED_HOMECARE
	return Array.from({ length: total }, (_, i): ResidentSeed => {
		const isCareHome = i < GENERATED_CARE_HOME
		const firstName = FIRST_NAMES[i % FIRST_NAMES.length] ?? 'Ama'
		const lastName = LAST_NAMES[(i * 7 + 3) % LAST_NAMES.length] ?? 'Mensah'
		const [riskLevel, riskReason] = HIGH_RISK_AT.has(i)
			? (['HIGH', 'falls'] as const)
			: (RISK_POOL[i % RISK_POOL.length] ?? ['LOW', null])

		return {
			id: `res_gen_${i}`,
			code: isCareHome
				? `R-${String(130 + i).padStart(4, '0')}`
				: `H-${2050 + i}`,
			first_name: firstName,
			last_name: lastName,
			age: 65 + ((i * 13) % 31),
			service: isCareHome ? 'CARE_HOME' : 'HOMECARE',
			room: isCareHome ? String(22 + i) : null,
			unit_name: isCareHome ? (i % 2 ? 'first floor' : 'ground floor') : null,
			area: isCareHome
				? null
				: (HOMECARE_AREAS[i % HOMECARE_AREAS.length] ?? null),
			status: IN_HOSPITAL_AT.has(i) ? 'IN_HOSPITAL' : 'ACTIVE',
			risk_level: riskLevel,
			risk_reason: riskReason,
			allergies: ALLERGY_POOL[i % ALLERGY_POOL.length] ?? [],
			conditions: CONDITION_POOL[i % CONDITION_POOL.length] ?? [],
			latest_note: {
				summary: NOTE_POOL[i % NOTE_POOL.length] ?? 'Comfortable',
				recorded_at: daysAgo(1 + (i % 3)),
			},
			reviewed_days_ago: REVIEW_DUE_AT.has(i) ? 28 : 2 + (i % 18),
			admitted_at: daysAgo(60 + i * 11),
		}
	})
}

export const residents: Array<Resident> = [
	...designedResidents,
	...generateResidents(),
].map(toResident)

const VIEW_PREDICATES: Record<ResidentListView, (r: Resident) => boolean> = {
	'high-risk': (r) => r.risk_level === 'HIGH',
	'review-due': isCarePlanReviewDue,
	'in-hospital': (r) => r.status === 'IN_HOSPITAL',
}

function isResidentListView(value: string): value is ResidentListView {
	return value in VIEW_PREDICATES
}

export function filterResidents(searchParams: URLSearchParams) {
	const query = searchParams.get('query')?.trim().toLowerCase()
	const service = searchParams.get('service')
	const riskLevel = searchParams.get('risk_level')
	const view = searchParams.get('view')

	return residents.filter((resident) => {
		if (resident.status === 'DISCHARGED') return false
		if (service && resident.service !== service) return false
		if (riskLevel && resident.risk_level !== riskLevel) return false
		if (view && isResidentListView(view) && !VIEW_PREDICATES[view](resident)) {
			return false
		}
		if (query) {
			const haystack = [
				getResidentName(resident),
				resident.code,
				resident.room ? `room ${resident.room}` : '',
				resident.area ?? '',
			]
				.join(' ')
				.toLowerCase()
			if (!haystack.includes(query)) return false
		}
		return true
	})
}

export function getResidentCounts(): ResidentCounts {
	const current = residents.filter((r) => r.status !== 'DISCHARGED')
	return {
		total: current.length,
		care_home: current.filter((r) => r.service === 'CARE_HOME').length,
		homecare: current.filter((r) => r.service === 'HOMECARE').length,
		high_risk: current.filter(VIEW_PREDICATES['high-risk']).length,
		review_due: current.filter(VIEW_PREDICATES['review-due']).length,
		in_hospital: current.filter(VIEW_PREDICATES['in-hospital']).length,
		appointments_today: 4,
	}
}

const ROUND_TIMES = ['08:00', '13:00', '18:00', '22:00']

const kofiSummary: ResidentSummary = {
	round_times: ROUND_TIMES,
	medications: [
		{
			id: 'med_metformin',
			name: 'Metformin 500 mg',
			instructions: '1 tablet, with food',
			is_as_needed: false,
			last_given_label: null,
			doses: [
				{ time: '08:00', status: 'MISSED', detail: 'not recorded' },
				{ time: '13:00', status: 'DUE', detail: 'in 2 h' },
				{ time: '18:00', status: 'DUE', detail: null },
			],
		},
		{
			id: 'med_amlodipine',
			name: 'Amlodipine 5 mg',
			instructions: '1 tablet, once a day',
			is_as_needed: false,
			last_given_label: null,
			doses: [{ time: '08:00', status: 'GIVEN', detail: '08:06 · EQ' }],
		},
		{
			id: 'med_atorvastatin',
			name: 'Atorvastatin 20 mg',
			instructions: '1 tablet, at night',
			is_as_needed: false,
			last_given_label: null,
			doses: [{ time: '22:00', status: 'DUE', detail: null }],
		},
		{
			id: 'med_calcium',
			name: 'Calcium and vitamin D',
			instructions: '1 tablet, twice a day',
			is_as_needed: false,
			last_given_label: null,
			doses: [
				{ time: '08:00', status: 'REFUSED', detail: 'EQ · noted' },
				{ time: '18:00', status: 'DUE', detail: null },
			],
		},
		{
			id: 'med_paracetamol',
			name: 'Paracetamol 500 mg',
			instructions: '1 to 2 tablets for pain',
			is_as_needed: true,
			last_given_label: 'Last given yesterday 21:40',
			doses: [],
		},
	],
	latest_readings: {
		recorded_at: todayAt('07:30'),
		recorded_by: 'Esi Quaye',
		readings: [
			{ id: 'bp', label: 'Blood pressure', value: '138/84', tone: 'neutral' },
			{ id: 'pulse', label: 'Pulse', value: '76 bpm', tone: 'neutral' },
			{
				id: 'sugar',
				label: 'Blood sugar',
				value: '9.8 mmol/L',
				tone: 'warning',
			},
			{ id: 'temp', label: 'Temperature', value: '36.7 °C', tone: 'neutral' },
		],
	},
	today: [
		{
			id: 't1',
			time: '07:50',
			title: 'Refused breakfast',
			detail: 'Said he felt full · Akosua Badu',
		},
		{
			id: 't2',
			time: '07:30',
			title: 'Readings taken',
			detail: 'Blood sugar above usual · Esi Quaye',
		},
		{
			id: 't3',
			time: '07:10',
			title: 'Washed and dressed',
			detail: 'Help of one · Akosua Badu',
		},
		{
			id: 't4',
			time: '06:00',
			title: 'Night handover',
			detail: 'Slept well · Kwame Addo',
		},
	],
}

function genericSummary(resident: Resident): ResidentSummary {
	const isCareHome = resident.service === 'CARE_HOME'
	return {
		round_times: ROUND_TIMES,
		medications: [
			{
				id: 'med_amlodipine',
				name: 'Amlodipine 5 mg',
				instructions: '1 tablet, once a day',
				is_as_needed: false,
				last_given_label: null,
				doses: [{ time: '08:00', status: 'GIVEN', detail: '08:10 · EQ' }],
			},
			{
				id: 'med_vitamin_d',
				name: 'Vitamin D 1000 IU',
				instructions: '1 tablet, with food',
				is_as_needed: false,
				last_given_label: null,
				doses: [{ time: '13:00', status: 'DUE', detail: null }],
			},
			{
				id: 'med_paracetamol',
				name: 'Paracetamol 500 mg',
				instructions: '1 to 2 tablets for pain',
				is_as_needed: true,
				last_given_label: 'Not given in the last 7 days',
				doses: [],
			},
		],
		latest_readings: {
			recorded_at: todayAt('07:45'),
			recorded_by: isCareHome ? 'Esi Quaye' : 'Yaw Boateng',
			readings: [
				{ id: 'bp', label: 'Blood pressure', value: '126/78', tone: 'neutral' },
				{ id: 'pulse', label: 'Pulse', value: '72 bpm', tone: 'neutral' },
				{
					id: 'sugar',
					label: 'Blood sugar',
					value: '6.1 mmol/L',
					tone: 'neutral',
				},
				{ id: 'temp', label: 'Temperature', value: '36.5 °C', tone: 'neutral' },
			],
		},
		today: [
			{
				id: 't1',
				time: '07:45',
				title: 'Readings taken',
				detail: `All within usual range · ${isCareHome ? 'Esi Quaye' : 'Yaw Boateng'}`,
			},
			{
				id: 't2',
				time: isCareHome ? '06:00' : '07:30',
				title: isCareHome ? 'Night handover' : 'Morning visit',
				detail: isCareHome
					? 'Slept well · Kwame Addo'
					: 'Washed and dressed · Yaw Boateng',
			},
		],
	}
}

export function getResidentSummary(resident: Resident) {
	return resident.id === 'res_kofi_asante'
		? kofiSummary
		: genericSummary(resident)
}
