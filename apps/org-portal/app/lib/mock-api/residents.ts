import dayjs from 'dayjs'
import { buildCarePlan, carePlans, type CarePlanSeed } from './care-plans'
import { daysAgo, todayAt } from './http'
import { getResidentName, isCarePlanReviewDue } from '~/lib/resident.utils'

type ResidentSeed = Pick<
	Resident,
	| 'id'
	| 'code'
	| 'first_name'
	| 'last_name'
	| 'gender'
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
	admitted_at: Date
	contact?: ResidentContact
	plan: CarePlanSeed
}

function birthDateForAge(age: number) {
	return dayjs().subtract(age, 'year').month(2).date(1).toDate()
}

function toResident(seed: ResidentSeed): Resident {
	const { age, plan: planSeed, contact, ...rest } = seed
	const resident: Resident = {
		...rest,
		preferred_name: null,
		date_of_birth: birthDateForAge(age),
		ghana_card_number: null,
		nhis_number: null,
		languages: ['Twi', 'English'],
		address: null,
		contacts: contact
			? [contact]
			: [
					{
						name: `Ama ${seed.last_name}`,
						relationship: 'Daughter',
						phone_number: '+233 24 000 0000',
						is_next_of_kin: true,
					},
				],
		care_plan_id: null,
		care_plan_status: null,
		care_plan_reviewed_at: null,
		care_plan_review_due_at: null,
		created_at: seed.admitted_at,
		updated_at: daysAgo(0),
	}

	const plan = buildCarePlan(resident, planSeed)
	carePlans.push(plan)
	return linkCarePlan(resident, plan)
}

export function linkCarePlan(resident: Resident, plan: CarePlan): Resident {
	return {
		...resident,
		care_plan_id: plan.id,
		care_plan_status: plan.status,
		care_plan_reviewed_at: plan.last_reviewed_at,
		care_plan_review_due_at: plan.next_review_at,
	}
}

const designedResidents: Array<ResidentSeed> = [
	{
		id: 'res_kofi_asante',
		code: 'R-0112',
		first_name: 'Kofi',
		last_name: 'Asante',
		gender: 'MALE',
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
		admitted_at: new Date('2025-03-14T10:00:00Z'),
		contact: {
			name: 'Kwame Asante',
			relationship: 'Son',
			phone_number: '+233 24 412 7781',
			is_next_of_kin: true,
		},
		plan: { version: 6, status: 'ACTIVE', reviewed_days_ago: 18 },
	},
	{
		id: 'res_efua_darko',
		code: 'R-0104',
		first_name: 'Efua',
		last_name: 'Darko',
		gender: 'FEMALE',
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
		admitted_at: new Date('2024-09-02T10:00:00Z'),
		plan: { version: 3, status: 'ACTIVE', reviewed_days_ago: 23 },
	},
	{
		id: 'res_nana_agyeman',
		code: 'R-0109',
		first_name: 'Nana',
		last_name: 'Agyeman',
		gender: 'FEMALE',
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
		admitted_at: new Date('2025-06-20T10:00:00Z'),
		plan: { version: 4, status: 'ACTIVE', review_due_in_days: -3 },
	},
	{
		id: 'res_abena_owusu',
		code: 'H-2031',
		first_name: 'Abena',
		last_name: 'Owusu',
		gender: 'FEMALE',
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
		admitted_at: new Date('2025-08-11T10:00:00Z'),
		plan: {
			version: 2,
			status: 'DRAFT',
			reviewed_days_ago: 8,
			written_by: 'Kwame Addo',
		},
	},
	{
		id: 'res_akua_sarpong',
		code: 'H-2044',
		first_name: 'Akua',
		last_name: 'Sarpong',
		gender: 'FEMALE',
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
		admitted_at: new Date('2025-02-03T10:00:00Z'),
		plan: { version: 2, status: 'ACTIVE', review_due_in_days: 5 },
	},
	{
		id: 'res_yaa_asantewaa',
		code: 'R-0106',
		first_name: 'Yaa',
		last_name: 'Asantewaa',
		gender: 'FEMALE',
		age: 78,
		service: 'CARE_HOME',
		room: '6',
		unit_name: 'ground floor',
		area: null,
		status: 'ACTIVE',
		risk_level: 'LOW',
		risk_reason: null,
		allergies: [],
		conditions: ['Hypertension'],
		latest_note: { summary: 'Settling in well', recorded_at: daysAgo(1) },
		admitted_at: daysAgo(2),
		plan: {
			version: 1,
			status: 'AWAITING_APPROVAL',
			written_by: 'Kwame Addo',
			is_new: true,
		},
	},
	{
		id: 'res_yaw_ofori',
		code: 'R-0117',
		first_name: 'Yaw',
		last_name: 'Ofori',
		gender: 'MALE',
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
		admitted_at: new Date('2025-10-01T10:00:00Z'),
		plan: { version: 1, status: 'ACTIVE', reviewed_days_ago: 11 },
	},
	{
		id: 'res_kwabena_mensah',
		code: 'R-0121',
		first_name: 'Kwabena',
		last_name: 'Mensah',
		gender: 'MALE',
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
		admitted_at: new Date('2025-04-22T10:00:00Z'),
		plan: { version: 2, status: 'ACTIVE', reviewed_days_ago: 5 },
	},
	{
		id: 'res_adwoa_frimpong',
		code: 'R-0103',
		first_name: 'Adwoa',
		last_name: 'Frimpong',
		gender: 'FEMALE',
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
		admitted_at: new Date('2023-11-15T10:00:00Z'),
		plan: { version: 5, status: 'ACTIVE', reviewed_days_ago: 14 },
	},
]

// prettier-ignore
const FIRST_NAMES = [
	'Akosua', 'Kwame', 'Yaa', 'Kojo', 'Afua', 'Kwesi', 'Ama', 'Fiifi', 'Esi',
	'Kwaku', 'Adjoa', 'Ekow', 'Abena', 'Nii', 'Naa', 'Kobina', 'Araba', 'Kofi',
	'Efua', 'Yaw',
]

// prettier-ignore
const LAST_NAMES = [
	'Boateng', 'Appiah', 'Osei', 'Addo', 'Ansah', 'Quaye', 'Tetteh', 'Amoah',
	'Bonsu', 'Danquah', 'Asamoah', 'Opoku', 'Badu', 'Nkrumah', 'Agyei',
	'Acheampong', 'Lamptey', 'Ofori', 'Owusu', 'Mensah',
]

// prettier-ignore
const HOMECARE_AREAS = [
	'Dansoman', 'Kaneshie', 'Tema', 'Spintex', 'Osu', 'Labadi', 'Madina',
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

const GENERATED_CARE_HOME = 35
const GENERATED_HOMECARE = 29
const HIGH_RISK_AT = new Set([7, 23, 41])
const REVIEW_DUE_AT = new Set([12, 50])
const IN_HOSPITAL_AT = new Set([3, 30])
const AWAITING_APPROVAL_AT = new Set([19])

function generatedPlanSeed(i: number): CarePlanSeed {
	if (AWAITING_APPROVAL_AT.has(i)) {
		return { version: 1, status: 'AWAITING_APPROVAL' }
	}
	if (REVIEW_DUE_AT.has(i)) {
		return { version: 2, status: 'ACTIVE', review_due_in_days: 2 }
	}
	return {
		version: 1 + (i % 3),
		status: 'ACTIVE',
		reviewed_days_ago: 2 + (i % 70),
	}
}

function generateResidents(): Array<ResidentSeed> {
	const total = GENERATED_CARE_HOME + GENERATED_HOMECARE
	return Array.from({ length: total }, (_, i): ResidentSeed => {
		const isCareHome = i < GENERATED_CARE_HOME
		const nameIndex = i % FIRST_NAMES.length
		const [riskLevel, riskReason] = HIGH_RISK_AT.has(i)
			? (['HIGH', 'falls'] as const)
			: (RISK_POOL[i % RISK_POOL.length] ?? ['LOW', null])

		return {
			id: `res_gen_${i}`,
			code: isCareHome
				? `R-${String(130 + i).padStart(4, '0')}`
				: `H-${2050 + i}`,
			first_name: FIRST_NAMES[nameIndex] ?? 'Ama',
			last_name: LAST_NAMES[(i * 7 + 3) % LAST_NAMES.length] ?? 'Mensah',
			gender: nameIndex % 2 === 0 ? 'FEMALE' : 'MALE',
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
			admitted_at: daysAgo(60 + i * 11),
			plan: generatedPlanSeed(i),
		}
	})
}

export const residents: Array<Resident> = [
	...designedResidents,
	...generateResidents(),
].map(toResident)

export function findResident(id: string) {
	return residents.find((resident) => resident.id === id)
}

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

function nextCode(service: WorkspaceType) {
	const prefix = service === 'CARE_HOME' ? 'R-' : 'H-'
	const highest = residents
		.filter((r) => r.code.startsWith(prefix))
		.map((r) => Number(r.code.slice(prefix.length)))
		.reduce((max, n) => Math.max(max, n), 0)
	return `${prefix}${String(highest + 1).padStart(4, '0')}`
}

const trimmedOrNull = (value?: string) => value?.trim() || null

export function validateResidentInput(input: Partial<CreateResidentInput>) {
	if (!input.first_name?.trim() || !input.last_name?.trim()) {
		return 'First and last name are required.'
	}
	if (!input.date_of_birth || !dayjs(input.date_of_birth).isValid()) {
		return 'A valid date of birth is required.'
	}
	if (dayjs(input.date_of_birth).isAfter(dayjs())) {
		return 'Date of birth cannot be in the future.'
	}
	if (input.service !== 'CARE_HOME' && input.service !== 'HOMECARE') {
		return 'Choose care home or homecare.'
	}
	return null
}

export function createResident(input: CreateResidentInput): Resident {
	const now = new Date()
	const slug = `${input.first_name}_${input.last_name}`
		.toLowerCase()
		.replace(/[^a-z0-9_]/g, '')
	const isCareHome = input.service === 'CARE_HOME'

	const resident: Resident = {
		id: `res_${slug}_${now.getTime().toString(36)}`,
		code: nextCode(input.service),
		first_name: input.first_name.trim(),
		last_name: input.last_name.trim(),
		preferred_name: trimmedOrNull(input.preferred_name),
		gender: input.gender,
		date_of_birth: new Date(input.date_of_birth),
		ghana_card_number: trimmedOrNull(input.ghana_card_number),
		nhis_number: trimmedOrNull(input.nhis_number),
		languages: input.languages,
		service: input.service,
		room: isCareHome ? trimmedOrNull(input.room) : null,
		unit_name: isCareHome ? trimmedOrNull(input.unit_name) : null,
		area: isCareHome ? null : trimmedOrNull(input.area),
		address: isCareHome ? null : trimmedOrNull(input.address),
		status: 'ACTIVE',
		risk_level: input.risk_level,
		risk_reason:
			input.risk_level === 'LOW' ? null : trimmedOrNull(input.risk_reason),
		allergies: input.allergies,
		conditions: input.conditions,
		contacts: input.contacts,
		admitted_at: now,
		care_plan_id: null,
		care_plan_status: null,
		care_plan_reviewed_at: null,
		care_plan_review_due_at: null,
		latest_note: { summary: 'Admitted', recorded_at: now },
		created_at: now,
		updated_at: now,
	}

	residents.unshift(resident)
	return resident
}
