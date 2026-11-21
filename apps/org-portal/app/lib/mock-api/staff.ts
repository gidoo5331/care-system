import dayjs from 'dayjs'
import { daysAgo, daysFromNow } from './http'
import { workspaces } from './users'
import { isWorkingNow, needsTraining, ROLE_GROUPS } from '~/lib/staff.utils'

const [CARE_HOME, DANSOMAN, TEMA] = workspaces

function worksAt(workspace: Workspace | undefined) {
	if (!workspace) return 'Oasis Homecare'
	return workspace.type === 'CARE_HOME'
		? `Care home, ${workspace.location}`
		: `Homecare, ${workspace.location.replace(' branch', '')}`
}

function training(
	role: StaffRole,
	overrides: Partial<
		Record<string, { completedDaysAgo: number; expiresInDays: number }>
	> = {},
): Array<TrainingRecord> {
	const courses: Array<[string, number, number]> = [
		['Medication administration', 250, 115],
		['Manual handling', 200, 165],
		['Safeguarding adults', 150, 215],
		['First aid', 300, 430],
	]
	if (role === 'NURSE') courses.push(['Nursing licence (NMC Ghana)', 320, 40])

	return courses.map(([course, completedDaysAgo, expiresInDays], index) => {
		const override = overrides[course]
		return {
			id: `trn_${index}`,
			course,
			completed_at: daysAgo(override?.completedDaysAgo ?? completedDaysAgo),
			expires_at: daysFromNow(override?.expiresInDays ?? expiresInDays),
		}
	})
}

function email(name: string) {
	return `${name.toLowerCase().replace(/[^a-z]+/g, '.')}@oasishomecare.com.gh`
}

interface StaffSeed {
	id: string
	name: string
	role: StaffRole
	workspace: Workspace | undefined
	phone: string
	today: StaffToday
	shiftEndsAt?: string
	startedAt: Date
	training?: Array<TrainingRecord>
	canApprove?: boolean
}

function toStaff(seed: StaffSeed): StaffMember {
	return {
		id: seed.id,
		name: seed.name,
		role: seed.role,
		workspace_id: seed.workspace?.id ?? '',
		works_at: worksAt(seed.workspace),
		phone_number: seed.phone,
		email: email(seed.name),
		started_at: seed.startedAt,
		today: seed.today,
		shift_ends_at: seed.today === 'OFF' ? null : (seed.shiftEndsAt ?? '15:00'),
		can_approve_care_plans:
			seed.canApprove ?? (seed.role === 'NURSE' || seed.role === 'MANAGER'),
		training: seed.training ?? training(seed.role),
	}
}

const designed: Array<StaffSeed> = [
	{
		id: 'stf_esi_quaye',
		name: 'Esi Quaye',
		role: 'NURSE',
		workspace: CARE_HOME,
		phone: '024 555 0101',
		today: 'ON_SHIFT',
		startedAt: new Date('2024-02-03T08:00:00Z'),
		training: training('NURSE', {
			'Manual handling': { completedDaysAgo: 353, expiresInDays: 12 },
		}),
	},
	{
		id: 'stf_kwame_addo',
		name: 'Kwame Addo',
		role: 'SENIOR_CARER',
		workspace: CARE_HOME,
		phone: '020 555 0102',
		today: 'ON_SHIFT',
		shiftEndsAt: '23:00',
		startedAt: new Date('2023-06-12T08:00:00Z'),
		training: training('SENIOR_CARER', {
			'Safeguarding adults': { completedDaysAgo: 340, expiresInDays: 20 },
		}),
	},
	{
		id: 'stf_yaw_boateng',
		name: 'Yaw Boateng',
		role: 'CARER',
		workspace: DANSOMAN,
		phone: '024 123 4567',
		today: 'ON_VISITS',
		shiftEndsAt: '17:15',
		startedAt: new Date('2024-09-01T08:00:00Z'),
		training: training('CARER', {
			'First aid': { completedDaysAgo: 700, expiresInDays: 25 },
		}),
	},
	{
		id: 'stf_joyce_nkansah',
		name: 'Joyce Nkansah',
		role: 'NURSE',
		workspace: CARE_HOME,
		phone: '055 555 0104',
		today: 'OFF',
		startedAt: new Date('2022-11-20T08:00:00Z'),
	},
	{
		id: 'stf_prince_kumi',
		name: 'Prince Kumi',
		role: 'CARER',
		workspace: CARE_HOME,
		phone: '026 555 0105',
		today: 'OFF',
		startedAt: new Date('2025-01-15T08:00:00Z'),
		training: training('CARER', {
			'Manual handling': { completedDaysAgo: 380, expiresInDays: -15 },
		}),
	},
	{
		id: 'stf_gifty_osei',
		name: 'Gifty Osei',
		role: 'CARER',
		workspace: DANSOMAN,
		phone: '027 555 0106',
		today: 'ON_VISITS',
		shiftEndsAt: '14:45',
		startedAt: new Date('2024-04-08T08:00:00Z'),
	},
	{
		id: 'stf_akosua_badu',
		name: 'Akosua Badu',
		role: 'CARER',
		workspace: CARE_HOME,
		phone: '024 555 0107',
		today: 'ON_SHIFT',
		startedAt: new Date('2024-07-22T08:00:00Z'),
	},
	{
		id: 'stf_ama_mensah',
		name: 'Ama Mensah',
		role: 'MANAGER',
		workspace: CARE_HOME,
		phone: '020 555 0100',
		today: 'ON_SHIFT',
		shiftEndsAt: '17:00',
		startedAt: new Date('2021-03-01T08:00:00Z'),
	},
	{
		id: 'stf_adjoa_dankwa',
		name: 'Adjoa Dankwa',
		role: 'CARER',
		workspace: DANSOMAN,
		phone: '024 555 0108',
		today: 'ON_VISITS',
		shiftEndsAt: '14:00',
		startedAt: new Date('2023-10-02T08:00:00Z'),
	},
	{
		id: 'stf_fiifi_arthur',
		name: 'Fiifi Arthur',
		role: 'CARER',
		workspace: DANSOMAN,
		phone: '024 555 0109',
		today: 'ON_VISITS',
		shiftEndsAt: '16:15',
		startedAt: new Date('2025-05-19T08:00:00Z'),
	},
	{
		id: 'stf_kwesi_ofori',
		name: 'Kwesi Ofori',
		role: 'CARER',
		workspace: DANSOMAN,
		phone: '024 555 0110',
		today: 'ON_VISITS',
		shiftEndsAt: '17:45',
		startedAt: new Date('2024-12-02T08:00:00Z'),
	},
	{
		id: 'stf_abena_sarpong',
		name: 'Abena Sarpong',
		role: 'CARER',
		workspace: DANSOMAN,
		phone: '024 555 0111',
		today: 'ON_VISITS',
		shiftEndsAt: '18:45',
		startedAt: new Date('2025-02-10T08:00:00Z'),
	},
]

// prettier-ignore
const FIRST = ['Ama', 'Kojo', 'Efua', 'Kwaku', 'Afia', 'Nana', 'Adwoa', 'Kobby', 'Akua', 'Selorm', 'Dede', 'Kwabena']
// prettier-ignore
const LAST = ['Asare', 'Boakye', 'Antwi', 'Owusu', 'Mensah', 'Darko', 'Agyei', 'Appiah', 'Tetteh', 'Nyarko', 'Ofosu']
const ROLES: Array<StaffRole> = [
	'CARER',
	'CARER',
	'NURSE',
	'SENIOR_CARER',
	'CARER',
	'OFFICE',
]
const ON_SHIFT_AT = new Set([2, 9, 16])

function generated(): Array<StaffSeed> {
	return Array.from({ length: 48 - designed.length }, (_, i) => {
		const role = ROLES[i % ROLES.length] ?? 'CARER'
		const workspace =
			role === 'NURSE' ? CARE_HOME : (workspaces[i % workspaces.length] ?? TEMA)
		return {
			id: `stf_gen_${i}`,
			name: `${FIRST[i % FIRST.length] ?? 'Ama'} ${LAST[(i * 5 + 2) % LAST.length] ?? 'Mensah'}`,
			role,
			workspace,
			phone: `0${24 + (i % 4)} 555 ${String(200 + i).padStart(4, '0')}`,
			today: ON_SHIFT_AT.has(i) ? 'ON_SHIFT' : 'OFF',
			startedAt: dayjs()
				.subtract(120 + i * 23, 'day')
				.toDate(),
		}
	})
}

export const staffMembers: Array<StaffMember> = [
	...designed,
	...generated(),
].map(toStaff)

export function findStaff(id: string) {
	return staffMembers.find((s) => s.id === id)
}

export function filterStaff(searchParams: URLSearchParams) {
	const query = searchParams.get('query')?.trim().toLowerCase()
	const group = searchParams.get('group') as StaffRoleGroup | null
	const view = searchParams.get('view') as StaffListView | null
	const roles = group ? ROLE_GROUPS[group] : undefined

	return staffMembers.filter((staff) => {
		if (roles && !roles.includes(staff.role)) return false
		if (view === 'on-shift' && !isWorkingNow(staff)) return false
		if (view === 'training-due' && !needsTraining(staff)) return false
		if (!query) return true
		return `${staff.name} ${staff.role.replace('_', ' ')} ${staff.works_at}`
			.toLowerCase()
			.includes(query)
	})
}

export function getStaffCounts(): StaffCounts {
	return {
		total: staffMembers.length,
		workplaces: new Set(staffMembers.map((s) => s.workspace_id)).size,
		on_shift: staffMembers.filter(isWorkingNow).length,
		training_due: staffMembers.filter(needsTraining).length,
	}
}

const VALID_ROLES: ReadonlyArray<StaffRole> = [
	'MANAGER',
	'NURSE',
	'SENIOR_CARER',
	'CARER',
	'OFFICE',
]

export function updateStaffAccess(
	staff: StaffMember,
	input: Partial<UpdateStaffAccessInput>,
) {
	if (!input.role || !VALID_ROLES.includes(input.role)) {
		return { error: 'Choose a role.' }
	}
	staff.role = input.role
	staff.can_approve_care_plans = Boolean(input.can_approve_care_plans)
	return { staff }
}
