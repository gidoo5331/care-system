type DoseStatus = 'GIVEN' | 'DUE' | 'MISSED' | 'REFUSED'

interface ScheduledDose {
	time: string
	status: DoseStatus
	recorded_by: Nullable<string>
	recorded_at: Nullable<string>
}

type MedicineForm =
	| 'TABLET'
	| 'CAPSULE'
	| 'LIQUID'
	| 'INHALER'
	| 'CREAM'
	| 'INJECTION'
	| 'DROPS'
	| 'PATCH'

type MedicineRoute =
	| 'MOUTH'
	| 'UNDER_TONGUE'
	| 'SKIN'
	| 'INHALED'
	| 'INJECTION'
	| 'EYE'
	| 'EAR'

type MedicineFrequency =
	| 'ONCE_DAILY'
	| 'TWICE_DAILY'
	| 'THREE_TIMES_DAILY'
	| 'FOUR_TIMES_DAILY'
	| 'AT_NIGHT'

interface ResidentMedication {
	id: string
	name: string
	instructions: string
	is_as_needed: boolean
	doses: Array<ScheduledDose>
	last_given_label: Nullable<string>
}

interface CreatePrescriptionInput {
	medicine_name: string
	strength: string
	form: MedicineForm
	dose: string
	route: MedicineRoute
	is_as_needed: boolean
	frequency?: MedicineFrequency
	times: StringList
	as_needed_reason?: string
	max_doses_per_day?: number
	start_date: string
	end_date?: string
	prescribed_by: string
	instructions?: string
}

type RoundRowStatus = 'GIVEN' | 'DUE' | 'REFUSED' | 'MISSED'

interface MedicationRoundRow {
	resident_id: string
	resident_name: string
	room: Nullable<string>
	medicines: StringList
	status: RoundRowStatus
	missed_count: number
	given_by: Nullable<string>
	given_at: Nullable<string>
}

interface MedicationRound {
	date: Date
	round_time: string
	round_times: StringList
	unit_name: string
	unit_names: StringList
	stats: {
		given: number
		total: number
		due: number
		due_by: string
		refused: number
		missed: number
	}
	rows: Array<MedicationRoundRow>
}

interface MedicationCounts {
	missed_and_refused: number
	reviews_due: number
}
