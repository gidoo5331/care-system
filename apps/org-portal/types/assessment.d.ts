type YesNo = 'YES' | 'NO'

interface YesNoItem {
	id: string
	text: string
	staff_only?: boolean
}

interface FieldDefinition {
	id: string
	label: string
	kind: 'text' | 'date' | 'textarea'
	hint?: string
}

type AssessmentBlock =
	| {
			type: 'yes_no'
			id: string
			label?: string
			hint?: string
			items: Array<YesNoItem>
			comment_label?: string
	  }
	| { type: 'text'; id: string; label: string; hint?: string; rows?: number }
	| {
			type: 'fields'
			id: string
			label?: string
			fields: Array<FieldDefinition>
	  }
	| {
			type: 'choice'
			id: string
			label: string
			options: StringList
			hint?: string
	  }
	| {
			type: 'checklist'
			id: string
			label: string
			items: StringList
			staff_only?: boolean
	  }
	| {
			type: 'table'
			id: string
			label: string
			hint?: string
			columns: Array<{ id: string; label: string }>
	  }
	| { type: 'body_map'; id: string }

interface AssessmentTemplate {
	code: string
	title: string
	short_title: string
	description: string
	care_plan_section: Nullable<string>
	blocks: Array<AssessmentBlock>
}

interface YesNoAnswer {
	answer: Nullable<YesNo>
	comment: string
}

type BodyMarkCode = 'W' | 'B' | 'R' | 'P' | 'S' | 'SW' | 'O'

interface BodyMark {
	id: string
	view: 'front' | 'back'
	x: number
	y: number
	code: BodyMarkCode
	note: string
}

type AssessmentAnswer =
	| Record<string, YesNoAnswer>
	| string
	| Record<string, string>
	| StringList
	| Array<Record<string, string>>
	| Array<BodyMark>

type AssessmentAnswers = Record<string, AssessmentAnswer>

type AssessmentStatus = 'DRAFT' | 'COMPLETED'

interface ResidentAssessment {
	id: string
	resident_id: string
	template_code: string
	status: AssessmentStatus
	answers: AssessmentAnswers
	completed_by: Nullable<string>
	completed_at: Nullable<Date>
	updated_by: string
	updated_at: Date
}

interface SaveAssessmentInput {
	status: AssessmentStatus
	answers: AssessmentAnswers
}
