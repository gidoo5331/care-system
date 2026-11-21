import dayjs from 'dayjs'
import { z } from 'zod'

const GHANA_CARD_PATTERN = /^GHA-\d{9}-\d$/

export const AddResidentSchema = z
	.object({
		first_name: z.string().trim().min(1, 'Enter their first name'),
		last_name: z.string().trim().min(1, 'Enter their last name'),
		preferred_name: z.string().trim(),
		date_of_birth: z
			.string()
			.min(1, 'Enter their date of birth')
			.refine((value) => dayjs(value).isValid(), 'Enter a real date')
			.refine(
				(value) => dayjs(value).isBefore(dayjs()),
				'Date of birth must be in the past',
			),
		gender: z.enum(['FEMALE', 'MALE']),
		service: z.enum(['CARE_HOME', 'HOMECARE']),
		ghana_card_number: z
			.string()
			.trim()
			.refine(
				(value) => !value || GHANA_CARD_PATTERN.test(value.toUpperCase()),
				'Use the format GHA-000000000-0',
			),
		nhis_number: z.string().trim(),
		languages: z.string().trim(),

		allergies: z.string().trim(),
		conditions: z.string().trim(),
		risk_level: z.enum(['LOW', 'MEDIUM', 'HIGH']),
		risk_reason: z.string().trim(),

		room: z.string().trim(),
		unit_name: z.string().trim(),
		area: z.string().trim(),
		address: z.string().trim(),

		contact_name: z.string().trim(),
		contact_relationship: z.string().trim(),
		contact_phone: z.string().trim(),
	})
	.superRefine((values, ctx) => {
		if (values.risk_level !== 'LOW' && !values.risk_reason) {
			ctx.addIssue({
				code: 'custom',
				path: ['risk_reason'],
				message: 'Say what the main risk is, for example falls',
			})
		}
		if (values.service === 'CARE_HOME' && !values.room) {
			ctx.addIssue({ code: 'custom', path: ['room'], message: 'Enter a room' })
		}
		if (values.service === 'HOMECARE' && !values.area) {
			ctx.addIssue({ code: 'custom', path: ['area'], message: 'Enter an area' })
		}
		if (values.contact_name && !values.contact_phone) {
			ctx.addIssue({
				code: 'custom',
				path: ['contact_phone'],
				message: 'Add a phone number for this contact',
			})
		}
	})

export type AddResidentValues = z.infer<typeof AddResidentSchema>

export const STEPS = [
	'Personal details',
	'Health',
	'Room or visits',
	'Contacts',
] as const

export const STEP_FIELDS: ReadonlyArray<
	ReadonlyArray<keyof AddResidentValues>
> = [
	[
		'first_name',
		'last_name',
		'preferred_name',
		'date_of_birth',
		'gender',
		'service',
		'ghana_card_number',
		'nhis_number',
		'languages',
	],
	['allergies', 'conditions', 'risk_level', 'risk_reason'],
	['room', 'unit_name', 'area', 'address'],
	['contact_name', 'contact_relationship', 'contact_phone'],
]

export const DEFAULT_VALUES: AddResidentValues = {
	first_name: '',
	last_name: '',
	preferred_name: '',
	date_of_birth: '',
	gender: 'FEMALE',
	service: 'CARE_HOME',
	ghana_card_number: '',
	nhis_number: '',
	languages: 'Twi, English',
	allergies: '',
	conditions: '',
	risk_level: 'LOW',
	risk_reason: '',
	room: '',
	unit_name: 'ground floor',
	area: '',
	address: '',
	contact_name: '',
	contact_relationship: '',
	contact_phone: '',
}

const splitList = (value: string) =>
	value
		.split(',')
		.map((item) => item.trim())
		.filter(Boolean)

const optional = (value: string) => value || undefined

export function toCreateResidentInput(
	values: AddResidentValues,
): CreateResidentInput {
	const isCareHome = values.service === 'CARE_HOME'
	return {
		first_name: values.first_name,
		last_name: values.last_name,
		preferred_name: optional(values.preferred_name),
		gender: values.gender,
		date_of_birth: values.date_of_birth,
		service: values.service,
		ghana_card_number: optional(values.ghana_card_number.toUpperCase()),
		nhis_number: optional(values.nhis_number),
		languages: splitList(values.languages),
		allergies: splitList(values.allergies),
		conditions: splitList(values.conditions),
		risk_level: values.risk_level,
		risk_reason: values.risk_level === 'LOW' ? undefined : values.risk_reason,
		room: isCareHome ? values.room : undefined,
		unit_name: isCareHome ? values.unit_name : undefined,
		area: isCareHome ? undefined : values.area,
		address: isCareHome ? undefined : optional(values.address),
		contacts: values.contact_name
			? [
					{
						name: values.contact_name,
						relationship: values.contact_relationship || 'Contact',
						phone_number: values.contact_phone,
						is_next_of_kin: true,
					},
				]
			: [],
	}
}
