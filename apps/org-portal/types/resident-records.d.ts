type NoteCategory = 'DAILY' | 'HEALTH' | 'FAMILY' | 'BEHAVIOUR' | 'OTHER'

interface ResidentNoteEntry {
	id: string
	resident_id: string
	category: NoteCategory
	body: string
	recorded_by: string
	recorded_at: Date
}

interface CreateNoteInput {
	category: NoteCategory
	body: string
}

type DocumentCategory =
	| 'AGREEMENT'
	| 'MEDICAL'
	| 'ASSESSMENT'
	| 'IDENTITY'
	| 'OTHER'

interface ResidentDocument {
	id: string
	resident_id: string
	title: string
	category: DocumentCategory
	file_name: Nullable<string>
	added_by: string
	added_at: Date
}

interface CreateDocumentInput {
	title: string
	category: DocumentCategory
	file_name?: string
}

type MovementType =
	| 'HOSPITAL_ADMISSION'
	| 'RETURNED_FROM_HOSPITAL'
	| 'DISCHARGED_HOME'
	| 'TRANSFERRED'
	| 'DIED'

interface ResidentMovement {
	id: string
	resident: { id: string; name: string; place: string }
	type: MovementType
	date: Date
	destination: Nullable<string>
	notes: string
	recorded_by: string
}

interface CreateMovementInput {
	resident_id: string
	type: MovementType
	date: string
	destination?: string
	notes?: string
}

interface MovementsOverview {
	in_hospital: Array<Resident>
	recent: Array<ResidentMovement>
}

interface Appointment {
	id: string
	resident: { id: string; name: string; place: string }
	starts_at: Date
	with_whom: string
	location: string
	escort: Nullable<string>
	transport: Nullable<string>
	notes: string
}

interface CreateAppointmentInput {
	resident_id: string
	starts_at: string
	with_whom: string
	location: string
	escort?: string
	transport?: string
	notes?: string
}

interface ImportResidentsResult {
	created: number
	residents: Array<Pick<Resident, 'id' | 'code' | 'first_name' | 'last_name'>>
}

type CarePlanIntent =
	| 'SAVE_DRAFT'
	| 'SEND_FOR_APPROVAL'
	| 'APPROVE'
	| 'COMPLETE_REVIEW'

interface CarePlanSectionInput {
	id?: string
	title: string
	needs: string
	goal: string
	support: string
	tasks: Array<{ id?: string; description: string; frequency: string }>
}

interface SaveCarePlanInput {
	sections: Array<CarePlanSectionInput>
	risk_assessments: Array<{ id?: string; name: string; level: RiskLevel }>
	intent: CarePlanIntent
}

interface CreateCarePlanInput extends SaveCarePlanInput {
	resident_id: string
}

interface RiskAssessmentRow {
	id: string
	care_plan_id: string
	resident: CarePlanResident
	name: string
	level: RiskLevel
	reviewed_at: Nullable<Date>
}
