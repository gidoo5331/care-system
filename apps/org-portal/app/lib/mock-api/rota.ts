import dayjs from 'dayjs'
import { findStaff } from './staff'

const E: ShiftType = 'EARLY'
const L: ShiftType = 'LATE'
const N: ShiftType = 'NIGHT'
const O: ShiftType = 'OFF'

interface RotaSeed {
	staff_id: string
	staff_name: string
	role: string
	pattern: Array<ShiftType>
}

const UNITS: Record<string, Array<RotaSeed>> = {
	'ground floor': [
		{
			staff_id: 'stf_esi_quaye',
			staff_name: 'Esi Quaye',
			role: 'Nurse',
			pattern: [E, E, O, O, E, L, L],
		},
		{
			staff_id: 'stf_kwame_addo',
			staff_name: 'Kwame Addo',
			role: 'Senior carer',
			pattern: [L, L, E, E, O, O, E],
		},
		{
			staff_id: 'stf_akosua_badu',
			staff_name: 'Akosua Badu',
			role: 'Carer',
			pattern: [E, E, L, L, O, O, N],
		},
		{
			staff_id: 'stf_joyce_nkansah',
			staff_name: 'Joyce Nkansah',
			role: 'Nurse',
			pattern: [N, N, O, O, L, L, E],
		},
		{
			staff_id: 'stf_prince_kumi',
			staff_name: 'Prince Kumi',
			role: 'Carer',
			pattern: [O, O, E, E, L, L, O],
		},
	],
	'first floor': [
		{
			staff_id: 'stf_gen_2',
			staff_name: 'Efua Antwi',
			role: 'Nurse',
			pattern: [E, E, E, O, O, L, L],
		},
		{
			staff_id: 'stf_gen_3',
			staff_name: 'Kwaku Owusu',
			role: 'Senior carer',
			pattern: [L, L, O, E, E, E, O],
		},
		{
			staff_id: 'stf_gen_0',
			staff_name: 'Ama Antwi',
			role: 'Carer',
			pattern: [O, E, E, L, L, O, E],
		},
		{
			staff_id: 'stf_gen_8',
			staff_name: 'Nana Asare',
			role: 'Nurse',
			pattern: [N, N, N, O, O, E, E],
		},
	],
}

const OPEN_SHIFTS: Record<string, Array<ShiftType>> = {
	'ground floor': [O, 'OPEN', O, O, 'OPEN', O, O],
	'first floor': [O, O, O, 'OPEN', O, O, O],
}

function rotate<T>(items: Array<T>, by: number) {
	const n = ((by % items.length) + items.length) % items.length
	return [...items.slice(n), ...items.slice(0, n)]
}

export function startOfWeek(offset = 0) {
	const today = dayjs().startOf('day')
	return today.subtract((today.day() + 6) % 7, 'day').add(offset, 'week')
}

export function getRotaWeek(searchParams: URLSearchParams): RotaWeek {
	const offset = Math.max(
		-12,
		Math.min(12, Number(searchParams.get('week')) || 0),
	)
	const requestedUnit = searchParams.get('unit') ?? ''
	const unitName = requestedUnit in UNITS ? requestedUnit : 'ground floor'

	const rows: Array<RotaRow> = (UNITS[unitName] ?? []).map((seed) => ({
		staff_id: seed.staff_id,
		staff_name: findStaff(seed.staff_id)?.name ?? seed.staff_name,
		role: seed.role,
		shifts: rotate(seed.pattern, offset * 2),
	}))

	const open = offset >= 0 ? (OPEN_SHIFTS[unitName] ?? []) : []
	const openCount = open.filter((s) => s === 'OPEN').length
	if (openCount) {
		rows.push({
			staff_id: null,
			staff_name: 'Open shifts',
			role: 'No one assigned',
			shifts: open,
		})
	}

	return {
		week_start: startOfWeek(offset).toDate(),
		week_offset: offset,
		unit_name: unitName,
		unit_names: Object.keys(UNITS),
		rows,
		open_shift_count: openCount,
	}
}
