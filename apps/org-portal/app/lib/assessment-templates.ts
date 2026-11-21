/**
 * The client's paper Client Assessment Booklet (forms OHS-01 to OHS-24),
 * transcribed. Wording is theirs — keep it when editing.
 */

const OWN_WORDS = 'Where possible, in the Client’s own words.'

const q = (id: string, text: string, staffOnly = false): YesNoItem => ({
	id,
	text,
	...(staffOnly ? { staff_only: true } : {}),
})

const goals = (): AssessmentBlock => ({
	type: 'text',
	id: 'goals',
	label: 'My Goals',
	hint: `${OWN_WORDS} What they would like to be able to achieve or continue to do.`,
	rows: 4,
})

const important = (): AssessmentBlock => ({
	type: 'text',
	id: 'important',
	label: 'What’s Important to Me?',
	hint: `${OWN_WORDS} What areas of their care are most important to them. Where it is a safety issue, detail this here too.`,
	rows: 4,
})

const involved = (): AssessmentBlock => ({
	type: 'table',
	id: 'involved',
	label: 'Who was involved in this assessment?',
	columns: [
		{ id: 'name', label: 'Name' },
		{ id: 'role', label: 'Role' },
		{ id: 'date', label: 'Date' },
	],
})

const staffUse = (items: StringList): AssessmentBlock => ({
	type: 'checklist',
	id: 'staff',
	label: 'Staff Use Only',
	items,
	staff_only: true,
})

const CARE_PLAN_DONE = q('care_plan', 'Care Plan completed?', true)

function questionnaire({
	code,
	title,
	short,
	description,
	section,
	questions,
	staff,
	extra = [],
}: {
	code: string
	title: string
	short: string
	description: string
	section: Nullable<string>
	questions: Array<YesNoItem>
	staff: StringList
	extra?: Array<AssessmentBlock>
}): AssessmentTemplate {
	return {
		code,
		title,
		short_title: short,
		description,
		care_plan_section: section,
		blocks: [
			{
				type: 'yes_no',
				id: 'questions',
				label: 'Assessment Questionnaire',
				hint: 'Complete the questionnaire to determine if a Care Plan alongside a further assessment is required for the Client.',
				items: [...questions, CARE_PLAN_DONE],
			},
			...extra,
			goals(),
			important(),
			involved(),
			staffUse(staff),
		],
	}
}

const PROFILE: AssessmentTemplate = {
	code: 'OHS-01',
	title: 'Client Personal & Social Profile',
	short_title: 'Personal & social profile',
	description:
		'Personal details, family, doctor, services, ethnic group, religion and funding.',
	care_plan_section: null,
	blocks: [
		{
			type: 'fields',
			id: 'personal',
			label: 'A: Client personal details',
			fields: [
				{
					id: 'title',
					label: 'Title',
					kind: 'text',
					hint: 'Mr, Mrs, Miss, Madam, Dr, Rev./Imam, Other',
				},
				{
					id: 'place_of_birth',
					label: 'Place of birth (town / region)',
					kind: 'text',
				},
				{ id: 'hometown', label: 'Hometown / region', kind: 'text' },
				{ id: 'nationality', label: 'Nationality', kind: 'text' },
				{ id: 'occupation', label: 'Former occupation', kind: 'text' },
				{ id: 'ssnit', label: 'SSNIT No. (if applicable)', kind: 'text' },
				{ id: 'nhis_expiry', label: 'NHIS expiry', kind: 'date' },
				{
					id: 'residence',
					label: 'Present residence and GhanaPost digital address',
					kind: 'textarea',
				},
			],
		},
		{
			type: 'choice',
			id: 'marital_status',
			label: 'Marital status',
			options: ['Single', 'Married', 'Widowed', 'Divorced', 'Separated'],
		},
		{
			type: 'choice',
			id: 'home',
			label: 'Home',
			options: ['Own house', 'Rented', 'Family house', 'Other'],
		},
		{
			type: 'fields',
			id: 'family',
			label: 'B: Active family / advocate support',
			fields: [
				{ id: 'name', label: 'Name', kind: 'text' },
				{ id: 'relationship', label: 'Relationship to Client', kind: 'text' },
				{ id: 'address', label: 'Address', kind: 'text' },
				{ id: 'phone', label: 'Tel No. / WhatsApp', kind: 'text' },
				{
					id: 'emergency',
					label: 'Emergency contact (name & Tel)',
					kind: 'text',
				},
			],
		},
		{
			type: 'fields',
			id: 'professionals',
			label: 'C: Doctor / hospital / social welfare',
			fields: [
				{ id: 'doctor', label: 'Doctor / physician', kind: 'text' },
				{ id: 'hospital', label: 'Hospital / clinic & address', kind: 'text' },
				{ id: 'doctor_phone', label: 'Doctor’s Tel No.', kind: 'text' },
				{
					id: 'social_welfare',
					label: 'Social welfare officer (name, office, Tel)',
					kind: 'text',
				},
			],
		},
		{
			type: 'fields',
			id: 'services',
			label: 'D: Special services presently received',
			fields: [
				{ id: 'home_help', label: 'Home help', kind: 'text' },
				{ id: 'day_care', label: 'Day care centre', kind: 'text' },
				{
					id: 'faith',
					label: 'Faith community visits (church / mosque)',
					kind: 'text',
				},
				{ id: 'other', label: 'Other community / social care', kind: 'text' },
			],
		},
		{
			type: 'choice',
			id: 'ethnic_group',
			label: 'E: Ethnic group',
			hint: 'If the Client is unable or unwilling to divulge this information, do not press the matter; record as “Prefer not to say”.',
			options: [
				'Akan',
				'Ga-Dangme',
				'Ewe',
				'Guan',
				'Gurma',
				'Mole-Dagbani',
				'Grusi',
				'Mande',
				'Other Ghanaian group',
				'Other African nationality',
				'Non-African',
				'Prefer not to say',
			],
		},
		{
			type: 'text',
			id: 'tribe',
			label: 'Specific tribe / sub-group',
			hint: 'For example Asante, Fante, Dagomba, Ga, Ewe.',
			rows: 1,
		},
		{
			type: 'choice',
			id: 'religion',
			label: 'F: Religion / belief',
			options: [
				'Christian – Catholic',
				'Christian – Protestant (Presbyterian, Methodist, Anglican, etc.)',
				'Christian – Pentecostal / Charismatic',
				'Christian – Seventh-day Adventist',
				'Christian – Other',
				'Muslim',
				'African Traditional Religion',
				'Hindu',
				'Buddhist',
				'Bahá’í',
				'Rastafarian',
				'Other',
				'No religion',
				'Prefer not to say',
			],
		},
		{
			type: 'fields',
			id: 'finance',
			label: 'G: Financial details & funding',
			fields: [
				{ id: 'pension', label: 'SSNIT / other pension', kind: 'text' },
				{
					id: 'nhis_status',
					label: 'NHIS status',
					kind: 'text',
					hint: 'Active or expired',
				},
				{
					id: 'remittances',
					label: 'Family support / remittances',
					kind: 'text',
				},
				{
					id: 'funding',
					label: 'Funding arrangements',
					kind: 'text',
					hint: 'Self, family, insurance / HMO, employer, other',
				},
				{
					id: 'pension_collector',
					label: 'Person collecting pension on behalf of Client',
					kind: 'text',
				},
				{ id: 'additional', label: 'Additional information', kind: 'textarea' },
			],
		},
		{
			type: 'text',
			id: 'cultural_notes',
			label: 'H: Additional cultural notes',
			hint: 'Any cultural, family or community customs the Client would like us to be aware of (e.g. family head / hometown obligations, dress, naming, funeral and festival observances).',
			rows: 3,
		},
	],
}

const CAPACITY: AssessmentTemplate = {
	code: 'OHS-02',
	title: 'Assessment of a Client’s Mental Capacity – Best Interest Decision',
	short_title: 'Mental capacity (best interests)',
	description:
		'Only used when the Client has been assessed as lacking capacity to make a particular decision.',
	care_plan_section: null,
	blocks: [
		{
			type: 'text',
			id: 'decision_to_make',
			label: 'Details of the decision to be made',
			hint: 'All decisions and steps taken for the Client who lacks capacity will be taken in their best interests.',
			rows: 3,
		},
		{
			type: 'yes_no',
			id: 'parameters',
			label: 'Determining best interests for the Client',
			comment_label: 'Comments',
			items: [
				q(
					'regaining',
					'Regaining capacity: Is the Client likely to have capacity in the future? Can the decision be delayed until then?',
				),
				q(
					'circumstances',
					'Relevant circumstances: Has everything the Client would have taken into account if they were making the decision for themselves been considered?',
				),
				q(
					'discrimination',
					'Avoid discrimination: Have assumptions been made on the basis of the Client’s age, appearance, condition or behaviour?',
				),
				q(
					'participation',
					'Encourage participation: Has everything possible been done to encourage and permit the Client to participate in making the decision?',
				),
				q(
					'special',
					'Special considerations: Where the decision relates to life-sustaining treatment, is it ensured that this has not been motivated by a desire to bring about their death?',
				),
				q(
					'written',
					'Written statements: Has any written statement made by the Client when they had capacity been considered?',
				),
				q(
					'wishes',
					'The Client’s wishes: Have the Client’s past and present wishes, feelings, beliefs and values that would likely influence the decision been considered?',
				),
				q(
					'consult',
					'Consult others: Has input from others involved in caring for the Client (relatives, family head, friends, legal representatives, etc.) been considered?',
				),
				q(
					'restricting',
					'Avoid restricting rights: Has the least restrictive option for the Client been considered?',
				),
				q(
					'advocate',
					'Independent advocate: Where the decision relates to serious medical treatment or changes in accommodation, has an independent advocate (e.g. a social welfare officer) been appointed to provide an appropriate report?',
				),
				q(
					'other',
					'Other considerations: Have factors such as emotional bonds and family obligations that the Client would consider when making the decision been considered?',
				),
			],
		},
		{
			type: 'text',
			id: 'advocate_details',
			label: 'Independent advocate: full name and contact details',
			rows: 2,
		},
		{
			type: 'text',
			id: 'advocate_report',
			label: 'Summary of the advocate’s report',
			rows: 3,
		},
		{
			type: 'text',
			id: 'decision',
			label: 'Decision',
			hint: 'Action to be taken whilst acting in the best interests of the Client.',
			rows: 4,
		},
		{
			type: 'fields',
			id: 'sign_off',
			label: 'Sign-off',
			fields: [
				{ id: 'assessor', label: 'Assessor name', kind: 'text' },
				{ id: 'position', label: 'Position', kind: 'text' },
				{
					id: 'family_name',
					label: 'Client / family member / advocate name',
					kind: 'text',
				},
				{
					id: 'family_relationship',
					label: 'Relationship to Client',
					kind: 'text',
				},
			],
		},
	],
}

const INTERESTS = [
	'Writing letters / messages',
	'Flower and plant arranging',
	'Going to church / mosque / religious services',
	'Listening to music (gospel, highlife, hiplife, traditional)',
	'Reading aloud (Bible / Quran / newspapers)',
	'Washing up',
	'Doing jigsaws / puzzles',
	'Kitchen gardening',
	'Shoe cleaning',
	'Shopping (market / supermarket)',
	'Going to the cinema',
	'Sweeping / dusting',
	'Knitting / crochet',
	'Entertaining visitors',
	'Reading books / newspapers',
	'Playing board or card games (oware, ludo, draughts, cards)',
	'Cooking / preparing traditional meals',
	'Looking after a pet',
	'Taking photographs',
	'Making tea, Milo or koko (hot drinks)',
	'Basket weaving / beadwork / kente weaving',
	'Buying presents',
	'Playing bingo / lotto games',
	'Listening to radio',
	'Washing / plaiting / setting hair',
	'Writing poetry / prose',
	'Washing clothes',
	'Embroidery / sewing',
	'Outdoor gardening / farming',
	'Attending religious services in the home',
	'Watching TV (news, films, football)',
	'Bird watching',
	'Making birthday / greeting cards',
	'Going to adult education classes',
	'Making phone / WhatsApp calls',
	'Going to the club / day centre',
	'Talking to friends and neighbours',
	'Family outings',
	'Singing / drumming / dancing',
	'Attending funerals, weddings, naming ceremonies',
	'Prayer / devotion / meditation',
]

const lifeText = (id: string, label: string): AssessmentBlock => ({
	type: 'text',
	id,
	label,
	rows: 3,
})

const PERSONAL_HISTORY: AssessmentTemplate = {
	code: 'OHS-03',
	title: 'Personal History',
	short_title: 'Personal history',
	description: 'Life story, interests, routines, hopes and future planning.',
	care_plan_section: 'Social life and interests',
	blocks: [
		{
			type: 'fields',
			id: 'details',
			label: 'Personal details',
			fields: [
				{ id: 'likes_to_be_called', label: 'Likes to be called', kind: 'text' },
				{ id: 'email', label: 'Email address', kind: 'text' },
				{
					id: 'preferred_contact',
					label: 'Preferred contact method',
					kind: 'text',
					hint: 'Call, WhatsApp, SMS or email',
				},
				{
					id: 'languages',
					label: 'Preferred language(s)',
					kind: 'text',
					hint: 'English, Twi, Fante, Ga, Ewe, Hausa, Dagbani, other',
				},
				{
					id: 'ethnic_hometown',
					label: 'Ethnic group / hometown',
					kind: 'text',
				},
			],
		},
		{
			type: 'fields',
			id: 'access',
			label: 'Access information',
			fields: [
				{
					id: 'arrangements',
					label: 'Access arrangements',
					kind: 'textarea',
					hint: 'Landmarks and directions, gate / compound entry, parking, security contact.',
				},
				{
					id: 'key_safe',
					label: 'Key safe in use? Code recorded?',
					kind: 'text',
				},
				{
					id: 'key_holding',
					label: 'Carer required to have a key? Key Holding Record completed?',
					kind: 'text',
				},
			],
		},
		lifeText(
			'dnar',
			'Advance Directive / DNAR (Do Not Attempt Resuscitation) status',
		),
		lifeText('donation', 'Organ / body donation wishes (if any)'),
		lifeText(
			'early_days',
			'Early days – birth, family, hometown, growing up, pets',
		),
		lifeText(
			'childhood',
			'Childhood – games (e.g. oware, ampe, hide and seek), play, memories, friends, foods',
		),
		lifeText('places', 'Places – where you have lived'),
		lifeText('happiest', 'Happiest memories'),
		lifeText('schooling', 'Schooling / holidays / sports / favourite subjects'),
		lifeText(
			'first_job',
			'First job – when, where, how much were you paid, etc.',
		),
		lifeText(
			'profession',
			'Profession, hobbies, clubs, associations (e.g. church groups, trade or old students’ associations)',
		),
		lifeText('achievements', 'Achievements, most proud moments'),
		lifeText(
			'partners',
			'Partners – what you liked about them, favourite memories, the ceremony (customary, church, mosque or court), how long together',
		),
		lifeText(
			'important_people',
			'Other important people – children, grandchildren, extended family',
		),
		lifeText('travel', 'Holidays and travel (including visits to hometown)'),
		lifeText('bucket_list', 'Wishes and goals – bucket list?'),
		{
			type: 'fields',
			id: 'lifestyle',
			label: 'Preferred activities – “What I want to do” – current lifestyle',
			fields: [
				{ id: 'social', label: 'Social networks', kind: 'textarea' },
				{ id: 'routines', label: 'Current routines', kind: 'textarea' },
				{ id: 'lifestyle', label: 'Current lifestyle', kind: 'textarea' },
				{
					id: 'recreation',
					label: 'Current recreational activities',
					kind: 'textarea',
				},
				{
					id: 'religious',
					label: 'Religious or spiritual requirements',
					kind: 'textarea',
				},
				{
					id: 'cultural',
					label: 'Cultural or ritual routines',
					kind: 'textarea',
				},
				{ id: 'other', label: 'Other', kind: 'textarea' },
			],
		},
		{
			type: 'yes_no',
			id: 'interests',
			label: 'Past / present interests',
			comment_label: 'How to facilitate activity',
			items: INTERESTS.map((text, i) => q(`interest_${i + 1}`, text)),
		},
		lifeText('hopes', 'Hopes and concerns'),
		lifeText(
			'future_wishes',
			'Future planning – wishes, beliefs and life goals',
		),
		lifeText('advance_care_plan', 'Advance Care Plan in place'),
		lifeText(
			'final_wishes',
			'Final wishes / funeral arrangements (optional – only if the Client wishes to share)',
		),
		lifeText('special_requests', 'Special requests / plans in place'),
		lifeText('other_info', 'Any other relevant information'),
		involved(),
		{ type: 'text', id: 'staff_notes', label: 'Staff Use Only', rows: 3 },
	],
}

const ACTIVITY_RISK: AssessmentTemplate = {
	code: 'OHS-15',
	title: 'Activity Risk Assessment',
	short_title: 'Activity risk',
	description:
		'The risk associated with each activity the Client needs support with.',
	care_plan_section: 'Activities',
	blocks: [
		{
			type: 'yes_no',
			id: 'questions',
			items: [q('needs_support', 'Do you require support with activities?')],
		},
		{
			type: 'table',
			id: 'activities',
			label: 'Activities',
			hint: 'If yes, assess the risk associated with each activity.',
			columns: [
				{ id: 'activity', label: 'Activity' },
				{ id: 'support', label: 'Task / support required' },
				{ id: 'risk', label: 'Risk' },
				{ id: 'equipment', label: 'Equipment' },
				{ id: 'action', label: 'Action to be taken' },
			],
		},
	],
}

const BATHING_RISK: AssessmentTemplate = {
	code: 'OHS-16',
	title: 'Risk Assessment – Client Bathing & Showering',
	short_title: 'Bathing & showering risk',
	description:
		'Twelve hazards to check before supporting the Client to bathe or shower.',
	care_plan_section: 'Personal care',
	blocks: [
		{
			type: 'yes_no',
			id: 'hazards',
			label: 'Hazard / observation',
			comment_label: 'Comments',
			items: [
				q(
					'h1',
					'Client is able to safely run a bath, or prepare bucket-bath water (adding cold water to hot), unattended.',
				),
				q(
					'h2',
					'Client is able to enter / exit a bath / shower safely and unaided.',
				),
				q(
					'h3',
					'Client is able to safely stand unaided in a shower OR there is a shower stool available.',
				),
				q(
					'h4',
					'Where required, grab handles are within easy reach and securely fixed.',
				),
				q(
					'h5',
					'Textured bath / shower mats are available to assist grip and reduce risk of slipping.',
				),
				q(
					'h6',
					'Client can differentiate between hot and cold taps OR can safely operate mixer taps / water heater controls.',
				),
				q('h7', 'Client does not have an impaired sensitivity to temperature.'),
				q(
					'h8',
					'Client’s mental capacity allows them to recognise a bath or shower that is too hot.',
				),
				q(
					'h9',
					'Showers – risk of excessively hot or cold water, or restricted or intermittent water supply / low pressure.',
				),
				q('h10', 'Client is able to summon assistance when needed.'),
				q('h11', 'Bath hoists or other lifting aids required.'),
				q(
					'h12',
					'Thermometers are available to check the temperature of bathing / showering water.',
				),
			],
		},
		{
			type: 'fields',
			id: 'assessor',
			label: 'Person conducting risk assessment',
			fields: [
				{ id: 'name', label: 'Name', kind: 'text' },
				{ id: 'position', label: 'Position', kind: 'text' },
			],
		},
	],
}

const PRIVACY: AssessmentTemplate = {
	code: 'OHS-19',
	title: 'Privacy Notice (Data Protection)',
	short_title: 'Privacy notice',
	description:
		'Consent to collect and store personal data, in line with the Data Protection Act, 2012 (Act 843).',
	care_plan_section: null,
	blocks: [
		{
			type: 'checklist',
			id: 'data',
			label:
				'Data to be collected, to develop a holistic Care Plan tailored to their needs',
			items: [
				'Records of the Baseline Assessment of care needs',
				'Assessments – waking / dressing / retiring / undressing / sleeping',
				'Assessments – standing / sitting / walking / transfers / mobility / bathing / showering / toilet',
				'Assessments – risk assessments (activities / equipment)',
				'Assessments – diets / nutritional care',
				'Assessments – medication',
				'Assessments – medical / therapeutic care',
				'Assessments – lifestyle choices / culture / religion / beliefs',
				'A recent photograph (to positively identify the Client, e.g. when giving medication)',
				'Health & safety risk assessment of the home environment',
				'Financial records relating to the account with us',
				'Service quality questionnaires the Client is asked to complete',
			],
		},
		{
			type: 'fields',
			id: 'management',
			label: 'Management',
			fields: [
				{
					id: 'how_collected',
					label: 'How the data is collected',
					kind: 'text',
				},
				{ id: 'where_stored', label: 'Where the data is stored', kind: 'text' },
			],
		},
		{
			type: 'checklist',
			id: 'consent',
			label: 'Consent',
			items: [
				'The Client consents to Oasis HomeCare Services processing their personal data for the purposes identified.',
				'The Client has been told why and how any sensitive personal data will be used.',
			],
		},
		{
			type: 'fields',
			id: 'signatures',
			label: 'Recorded by',
			fields: [
				{ id: 'collector', label: 'Person collecting the data', kind: 'text' },
				{ id: 'storer', label: 'Person storing the data', kind: 'text' },
				{
					id: 'consent_date',
					label: 'Date the Client consented',
					kind: 'date',
				},
			],
		},
	],
}

const BEHAVIOURS: AssessmentTemplate = {
	code: 'OHS-21',
	title: 'Behaviours That May Challenge – Risk Assessment',
	short_title: 'Behaviours that may challenge',
	description: 'Behaviours, triggers, hazards and the controls put in place.',
	care_plan_section: 'Mood and behaviour',
	blocks: [
		{
			type: 'text',
			id: 'description',
			label: 'Description of behaviours that may challenge',
			rows: 3,
		},
		{
			type: 'checklist',
			id: 'frequency',
			label: 'Frequency potential',
			items: [
				'Occasionally',
				'Weekly',
				'Daily',
				'Constantly',
				'In specific environments',
				'Other',
			],
		},
		{
			type: 'checklist',
			id: 'affected',
			label: 'Who may be affected by the behaviour',
			items: ['Staff', 'Relatives', 'Individual', 'Others'],
		},
		{
			type: 'checklist',
			id: 'triggers',
			label: 'Potential triggers',
			items: [
				'Personality clash',
				'Provocation',
				'Frustration',
				'Lack of medication',
				'Drugs / alcohol',
				'Incontinence',
				'Lack of food / water',
				'Sexual awareness',
				'Attention seeking',
				'Allergic reaction',
				'Domestic',
				'Other',
			],
		},
		{
			type: 'checklist',
			id: 'hazards',
			label: 'Potential hazards',
			items: [
				'Running away',
				'Self-harm',
				'Threatening',
				'Verbal abuse',
				'Anxiety',
				'Unpredictability',
				'Spitting',
				'Scratching',
				'Biting',
				'Punching',
				'Kicking',
				'Head butting',
				'Throwing objects',
				'Weapons',
				'Bullying',
				'Involuntary movement',
				'Sexualised behaviour',
				'Shouting / screaming',
				'Other',
			],
		},
		{
			type: 'table',
			id: 'controls',
			label: 'Hazards identified and the controls to be put in place',
			columns: [
				{ id: 'hazard', label: 'Identified hazard' },
				{ id: 'level', label: 'Level of risk' },
				{ id: 'support', label: 'Methods of support / management' },
				{ id: 'adequate', label: 'Are the controls adequate?' },
			],
		},
	],
}

const CLINICAL: AssessmentTemplate = {
	code: 'OHS-18',
	title: 'Clinical Assessment',
	short_title: 'Clinical',
	description:
		'Clinical requirements such as PEG feeds, pressure ulcers, insulin or behaviour needing skilled responses.',
	care_plan_section: 'Clinical needs',
	blocks: [
		{
			type: 'yes_no',
			id: 'questions',
			label: 'Assessment Questionnaire',
			hint: 'Examples: behavioural (requires skilled responses), psychological, mobility (paralysed, spinal injury, totally immobile), skin (pressure ulcers present), nutrition (PEG feed, swallowing difficulties / oral suction, diabetic, insulin administration).',
			items: [
				q(
					'requirements',
					'Do you have any clinical requirements that Oasis HomeCare Services should be aware of?',
				),
				q(
					'other_professionals',
					'Do you have support from other health care professionals in relation to your clinical requirements?',
				),
				q('equipment', 'Do you use any clinical equipment?'),
				q('referral', 'Referral made to Clinical Team?', true),
			],
		},
		{
			type: 'text',
			id: 'referral_details',
			label: 'Staff only – referral details',
			rows: 2,
		},
		goals(),
		important(),
		involved(),
		{
			type: 'checklist',
			id: 'staff',
			label: 'Staff Use Only',
			staff_only: true,
			items: ['Evidence of a referral made to clinical teams.'],
		},
		{
			type: 'text',
			id: 'clinical_notes',
			label: 'Additional clinical notes',
			rows: 3,
		},
	],
}

const BODY_MAP: AssessmentTemplate = {
	code: 'OHS-24',
	title: 'Body Map',
	short_title: 'Body map',
	description:
		'Mark wounds, bruises, rashes, pressure sores, scars and swelling.',
	care_plan_section: null,
	blocks: [
		{ type: 'body_map', id: 'marks' },
		{ type: 'text', id: 'comments', label: 'Comments', rows: 3 },
	],
}

export const ASSESSMENT_TEMPLATES: ReadonlyArray<AssessmentTemplate> = [
	PROFILE,
	CAPACITY,
	PERSONAL_HISTORY,
	questionnaire({
		code: 'OHS-04',
		title: 'Communication Assessment',
		short: 'Communication',
		description: 'Eyesight, hearing, speech, language and sharing information.',
		section: 'Communication',
		questions: [
			q(
				'share',
				'Do you wish for information about you to be shared with others?',
			),
			q(
				'problems',
				'Do you have any problems with your eyesight, hearing, speech or written communication?',
			),
			q(
				'aids',
				'Do you require the use of someone or specialist equipment to help you communicate? (e.g. hearing aids, glasses, interpreter)',
			),
			q(
				'language',
				'Do you prefer to communicate in a language other than English? (e.g. Twi, Fante, Ga, Ewe, Hausa, Dagbani)',
			),
			q('varies', 'Does your ability to communicate change from day to day?'),
		],
		staff: [
			'Capacity / best-interest decision for sharing of information completed?',
			'Advocate sourced?',
			'Language-matched carer or interpreter arranged, where required?',
		],
	}),
	questionnaire({
		code: 'OHS-05',
		title: 'Cultural, Spiritual, Social and Relationships Assessment',
		short: 'Cultural, spiritual & social',
		description: 'Faith, cultural routines, family events and relationships.',
		section: 'Faith, culture and relationships',
		questions: [
			q(
				'faith',
				'Would you like support to access any religious or spiritual communities (church, mosque, shrine, etc.)?',
			),
			q(
				'routines',
				'Are there any cultural or ritual routines that we should be aware of and respect? (e.g. prayer times, fasting, observances)',
			),
			q(
				'events',
				'Do you need support to access friends / family / clubs / events? (e.g. funerals, weddings, naming ceremonies, family gatherings)',
			),
			q('relationships', 'Are there any relationships we should be aware of?'),
		],
		staff: [
			'Carer matched to language, faith or gender preference, where requested?',
		],
	}),
	questionnaire({
		code: 'OHS-06',
		title: 'Environment Assessment',
		short: 'Environment',
		description:
			'Hazards in and around the home, lighting, temperature and pets.',
		section: 'Home and environment',
		questions: [
			q(
				'hazards',
				'Do you have any potential hazards around your home? (e.g. loose mats/rugs, damaged flooring, obstructions, loose wires/cables, open drains or steps)',
			),
			q(
				'furniture',
				'Do you need to have furniture placed in a specific position to help you? (e.g. vision, access)',
			),
			q(
				'lighting',
				'Do you have specific lighting requirements for your home? (including during power outages)',
			),
			q(
				'temperature',
				'Do you need support to stay warm and/or keep cool? (e.g. fan, ventilation, mosquito net or screens)',
			),
			q('pets', 'Do you have any pets?'),
			q(
				'external',
				'Do you have any potential external hazards near your home? (e.g. uneven paths/compound, drainage, lighting, security gate/padlock)',
			),
			q(
				'infection',
				'Are there any infection control considerations, or risks that could result in accidents or incidents?',
				true,
			),
		],
		staff: [
			'Risk Assessment(s) completed?',
			'Referral required?',
			'Equipment is available that may be required?',
			'Fire / Emergency Evacuation Plan completed?',
		],
	}),
	questionnaire({
		code: 'OHS-07',
		title: 'Domestic Assessment',
		short: 'Domestic',
		description: 'Cleaning, laundry, cooking and marketing.',
		section: 'Domestic tasks',
		questions: [
			q(
				'support',
				'Do you require support with your domestic chores? (e.g. cleaning, laundry, cooking, marketing)',
			),
			q(
				'someone_else',
				'Does someone else support you with your domestic chores?',
			),
		],
		staff: [
			'Hazardous substances (cleaning chemicals) assessment(s) completed?',
		],
	}),
	questionnaire({
		code: 'OHS-08',
		title: 'Personal Hygiene Assessment',
		short: 'Personal hygiene',
		description: 'Bathing, washing, dressing, hair, nails, feet and shaving.',
		section: 'Personal care',
		questions: [
			q(
				'bath',
				'Do you need any support with using a bath, shower or bucket bath?',
			),
			q('washing', 'Do you need any support with washing?'),
			q('dressing', 'Do you need any support with dressing and undressing?'),
			q(
				'hair',
				'Do you need any support with hair care? (e.g. plaiting, combing, setting)',
			),
			q('nails', 'Do you need any support with nail care?'),
			q('feet', 'Do you need any support with foot care?'),
			q('shaving', 'Do you need any support with shaving?'),
			q(
				'makeup',
				'Do you need any support with applying make-up or skin products?',
			),
			q(
				'time',
				'Do you have a preferred time of day for washing and dressing?',
			),
			q('gender', 'Do you have a preference to the gender of your Carer?'),
		],
		staff: [
			'Risk Assessment(s) completed?',
			'Need for chiropodist / barber / hairdresser / dentist or other professional?',
			'Purchasing and managing the supply of personal hygiene products agreed?',
			'Topical Medication Administration Record in place, where required?',
		],
	}),
	questionnaire({
		code: 'OHS-09',
		title: 'Oral Care Assessment',
		short: 'Oral care',
		description: 'Teeth, dentures, gums, mouth health and dentist visits.',
		section: 'Oral care',
		questions: [
			q('clean', 'Do you have good oral cleanliness?'),
			q('daily', 'Do you need any support with your daily oral care?'),
			q('natural', 'Do you have your natural teeth?'),
			q('dentures', 'Do you need any support with your daily denture care?'),
			q('pain', 'Do you suffer from any dental pain?'),
			q('lips', 'Do you have healthy lips?'),
			q('tongue', 'Do you have a healthy tongue?'),
			q('gums', 'Do you have healthy gums and tissues?'),
			q('saliva', 'Do you have healthy saliva?'),
			q(
				'time',
				'Do you have a preferred time you would like support with your oral/denture care?',
			),
			q('aids', 'Do you have any dental aids that need to be used?'),
			q('dentist', 'Do you regularly visit the dentist?'),
		],
		staff: [
			'Purchasing and managing the supply of oral care products agreed?',
			'Referral made, if required, to a dentist?',
			'Oral Health Assessment Tool completed?',
		],
	}),
	questionnaire({
		code: 'OHS-10',
		title: 'Skin Assessment',
		short: 'Skin',
		description:
			'Wounds, bruising, blood thinners, skin products and pressure care.',
		section: 'Skin care',
		questions: [
			q('manage', 'Do you need support to manage your own skin care?'),
			q(
				'wounds',
				'Do you have any wounds, bruising, skin conditions or sore areas?',
			),
			q(
				'thinners',
				'Do you take any medication that thins your blood, for example, Warfarin, Aspirin, Rivaroxaban, Dabigatran, Apixaban, Edoxaban or other anticoagulation medication?',
			),
			q('dry', 'Do you have dry, flaky skin?'),
			q(
				'at_risk',
				'Is your skin at risk of damage? i.e. Do you bruise or get skin tears easily?',
			),
			q('position', 'Do you need support to change position?'),
			q(
				'pain',
				'Do you have difficulty letting people know if you have discomfort or pain?',
			),
			q(
				'products',
				'Do you use any skin products (e.g. shea butter, creams, lotions) that we should know about?',
			),
			q(
				'equipment',
				'Do you have any specialist equipment or routines in place?',
			),
			q(
				'professionals',
				'Do you have any specialist professionals involved in your skin care?',
			),
		],
		staff: [
			'Pressure ulcer risk assessment (e.g. Waterlow) completed?',
			'Body Map complete?',
			'Topical Medication Administration Record in place (creams dated on opening, matching prescriber’s direction)?',
			'If using pressure relieving equipment, reposition chart / mattress checks in place to ensure it meets the needs of the weight of the Client?',
			'Equipment Register completed?',
		],
	}),
	questionnaire({
		code: 'OHS-11',
		title: 'Continence Assessment',
		short: 'Continence',
		description: 'Continence support, medication, infections and aids.',
		section: 'Continence',
		questions: [
			q('support', 'Do you need support to meet your continence needs?'),
			q(
				'medication',
				'Do you take medication to help you with your continence needs?',
			),
			q(
				'history',
				'Do you have a history of urinary tract infections or constipation?',
			),
			q(
				'conditions',
				'Do you have any medical conditions that affect your ability to pass urine or open your bowels?',
			),
			q(
				'aids',
				'Do you require the use of aids or equipment to meet your continence needs? (e.g. catheter, commode, seat raiser)',
			),
		],
		staff: [
			'Are equipment supplies in place?',
			'Continence Assessment completed and sent to continence service?',
			'Referral required?',
			'Prescribed medication on MAR? PRN protocol in place, where applicable?',
		],
	}),
	questionnaire({
		code: 'OHS-12',
		title: 'Nutrition and Hydration Assessment',
		short: 'Nutrition & hydration',
		description: 'Appetite, diet, food preferences, swallowing and fluids.',
		section: 'Eating and drinking',
		questions: [
			q(
				'support',
				'Do you need support to eat and drink? (This includes preparing and serving food)',
			),
			q(
				'appetite',
				'Do you have a poor appetite, lack of motivation to eat or had any recent unexplained weight loss?',
			),
			q('special_diet', 'Do you have a special diet?'),
			q(
				'preferences',
				'Do you have religious, cultural or personal food preferences or restrictions? (e.g. fasting, halal, traditional dishes such as fufu, banku, kenkey, waakye)',
			),
			q(
				'therapist',
				'Are you under the care of a speech and language therapist or dietician?',
			),
			q('swallowing', 'Do you have any swallowing difficulties?'),
			q('alcohol', 'Do you drink alcohol?'),
			q(
				'modified',
				'Do you require your drinks to be modified in any way? (e.g. due to swallowing difficulties, thickeners etc.)',
			),
			q('diuretics', 'Do you take medications such as Furosemide/Bumetanide?'),
			q('d_and_v', 'Do you have or do you suffer from diarrhoea and vomiting?'),
			q('dry_mouth', 'Do you get a dry tongue/mouth?'),
			q(
				'choking',
				'Any diagnosis or history of choking or aspiration pneumonia?',
			),
		],
		staff: [
			'Malnutrition screening (e.g. MUST) completed?',
			'Referral required?',
			'Food and fluid monitoring commenced, including when to review?',
			'Safe storage of thickener?',
			'Carers aware of dietary and fluid requirements and preferences?',
		],
	}),
	questionnaire({
		code: 'OHS-13',
		title: 'Medication Assessment',
		short: 'Medication',
		description:
			'Support with medication, routes, controlled drugs, herbal remedies and allergies.',
		section: 'Medication',
		questions: [
			q('assistance', 'Do you need assistance with medication?'),
			q('order', 'Do you need support to order and collect your medication?'),
			q('take', 'Do you need support to take your medication?'),
			q(
				'routes',
				'Do you need to take medication via different routes i.e. injection, nasal, sublingual etc?',
			),
			q(
				'specialist',
				'Do you take specialist medication that needs close monitoring?',
			),
			q('controlled', 'Is any of your medication a controlled drug?'),
			q('someone_else', 'Does anyone else support you with your medication?'),
			q(
				'side_effects',
				'Does any of your medication cause side effects that we should be aware of?',
			),
			q(
				'herbal',
				'Do you use herbal, traditional or over-the-counter medicines or supplements?',
			),
			q('allergies', 'Do you have any allergies or sensitivities?'),
		],
		staff: [
			'Medication Risk Assessment completed?',
			'Covert medication – best-interest decision, Care Plan, doctor and pharmacist authorisation?',
			'PRN protocol?',
			'Diabetes Monitoring Sheet / Pain Assessment?',
			'Topical Medication Chart?',
		],
	}),
	questionnaire({
		code: 'OHS-14',
		title: 'Moving and Handling Assessment',
		short: 'Moving & handling',
		description: 'Standing, transfers, walking, equipment and falls risk.',
		section: 'Moving around',
		questions: [
			q('transfer', 'Do you need support to stand, transfer or walk?'),
			q('reposition', 'If unable to walk, do you need support to reposition?'),
			q('grip', 'Do you need support to grip and hold everyday items?'),
			q(
				'equipment',
				'Do you require the use of any equipment to support your mobility? (e.g. wheelchairs, hoists, walking frames, grab aids, bed rails, recliner chair)',
			),
			q(
				'fall_risk',
				'Do you feel you are at risk of falling? (e.g. at night out of bed or in the day from a chair)',
			),
			q(
				'fall_history',
				'Is there a history or a concern (based on condition, anxiety, lack of cognition) that you may fall?',
			),
			q(
				'risk_done',
				'Moving and Handling Risk Assessment and Falls Risk Assessment completed as part of this assessment?',
				true,
			),
		],
		staff: [
			'Risk Assessment(s) completed?',
			'Moving and handling equipment in place?',
			'Equipment Register completed?',
		],
	}),
	ACTIVITY_RISK,
	BATHING_RISK,
	questionnaire({
		code: 'OHS-17',
		title: 'Mental Health Assessment',
		short: 'Mental health',
		description:
			'Mood, diagnosed conditions, behaviours and best-interest decisions.',
		section: 'Mood and wellbeing',
		questions: [
			q(
				'express',
				'Do you feel you need support to express your views, choices, wishes and preferences?',
			),
			q(
				'diagnosed',
				'Do you have a diagnosed mental health condition that you need support to manage (e.g. under a health care professional, via medication)?',
			),
			q(
				'concerns',
				'Do you have concerns about your mental health (e.g. do you worry, get anxious or low in mood sometimes)?',
			),
			q(
				'behaviours',
				'Do you have any behaviours that may challenge or pose a risk of harm to others?',
			),
			q(
				'best_interest',
				'Do you ever require others to make best interest decisions on your behalf?',
			),
		],
		staff: [
			'ABC Chart required?',
			'Referral required?',
			'Risk Assessment(s) completed?',
			'Power of Attorney or legal guardian in place?',
		],
	}),
	CLINICAL,
	PRIVACY,
	questionnaire({
		code: 'OHS-20',
		title: 'Sleeping Assessment',
		short: 'Sleeping',
		description:
			'Night routine, lights and doors, night-time repositioning and sleep.',
		section: 'Night time and sleep',
		questions: [
			q(
				'prepare',
				'Do you need support to prepare for the night? (i.e. putting on night wear)',
			),
			q(
				'lights',
				'Do you need support to manage the lights, windows and/or doors in your home?',
			),
			q(
				'night_care',
				'Do you need support to reposition and meet continence needs at night?',
			),
			q('problems', 'Do you have any problems sleeping?'),
			q('medication', 'Do you need medication or other support to sleep well?'),
		],
		staff: ['Risk Assessment(s) completed?', 'Reposition Record?'],
	}),
	BEHAVIOURS,
	questionnaire({
		code: 'OHS-22',
		title: 'Equipment Assessment',
		short: 'Equipment',
		description: 'Equipment used, who helps with it and servicing.',
		section: 'Equipment',
		questions: [
			q('requires', 'Do you require the use of equipment to aid you?'),
			q('support', 'Does anyone support you with the use of this equipment?'),
			q(
				'serviced',
				'Where applicable, is the equipment serviced and maintained in line with the manufacturer’s guidance?',
			),
		],
		staff: ['Equipment register completed?'],
	}),
	questionnaire({
		code: 'OHS-23',
		title: 'Financial Assessment',
		short: 'Financial',
		description:
			'Pension collection, shopping and bills, Mobile Money and who helps.',
		section: 'Money',
		questions: [
			q(
				'assistance',
				'Do you need assistance with your finances (e.g. collection of a pension or money)?',
			),
			q(
				'activities',
				'Do you need assistance with financial activities such as shopping or paying bills?',
			),
			q(
				'oasis',
				'Do you need support from Oasis HomeCare Services with managing your finances?',
			),
			q(
				'momo',
				'Do you use Mobile Money or a bank account that someone helps you manage?',
			),
			q('someone_else', 'Does someone else support you with your finances?'),
		],
		staff: ['Financial risk assessment completed?'],
	}),
	BODY_MAP,
]

export function findAssessmentTemplate(code: string) {
	return ASSESSMENT_TEMPLATES.find(
		(template) => template.code.toLowerCase() === code.toLowerCase(),
	)
}

/** Standard care plan sections, and the booklet forms that inform each. */
export const CARE_PLAN_SECTIONS: ReadonlyArray<{
	title: string
	forms: StringList
}> = (() => {
	const sections = new Map<string, StringList>()
	for (const template of ASSESSMENT_TEMPLATES) {
		if (!template.care_plan_section) continue
		sections.set(template.care_plan_section, [
			...(sections.get(template.care_plan_section) ?? []),
			template.code,
		])
	}
	return [...sections.entries()].map(([title, forms]) => ({ title, forms }))
})()
