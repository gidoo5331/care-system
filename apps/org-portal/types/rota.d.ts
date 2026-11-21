type ShiftType = 'EARLY' | 'LATE' | 'NIGHT' | 'OFF' | 'OPEN'

interface RotaRow {
	staff_id: Nullable<string>
	staff_name: string
	role: string
	shifts: Array<ShiftType>
}

interface RotaWeek {
	week_start: Date
	week_offset: number
	unit_name: string
	unit_names: StringList
	rows: Array<RotaRow>
	open_shift_count: number
}
