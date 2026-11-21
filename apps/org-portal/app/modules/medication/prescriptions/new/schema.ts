import dayjs from 'dayjs'
import { z } from 'zod'
import {
	areValidTimes,
	getDefaultTimes,
	parseTimes,
} from '~/lib/medication.utils'

export const AddPrescriptionSchema = z
	.object({
		medicine_name: z.string().trim().min(2, 'Enter the medicine'),
		strength: z
			.string()
			.trim()
			.min(1, 'Enter the strength, for example 500 mg'),
		form: z.enum([
			'TABLET',
			'CAPSULE',
			'LIQUID',
			'INHALER',
			'CREAM',
			'INJECTION',
			'DROPS',
			'PATCH',
		]),
		dose: z.string().trim().min(1, 'Enter how much to give'),
		route: z.enum([
			'MOUTH',
			'UNDER_TONGUE',
			'SKIN',
			'INHALED',
			'INJECTION',
			'EYE',
			'EAR',
		]),
		frequency: z.enum([
			'ONCE_DAILY',
			'TWICE_DAILY',
			'THREE_TIMES_DAILY',
			'FOUR_TIMES_DAILY',
			'AT_NIGHT',
		]),
		times: z.string().trim(),
		start_date: z
			.string()
			.min(1, 'Enter a start date')
			.refine((value) => dayjs(value).isValid(), 'Enter a real date'),
		end_date: z.string(),
		prescribed_by: z.string().trim().min(1, 'Record who prescribed it'),
		is_as_needed: z.boolean(),
		as_needed_reason: z.string().trim(),
		max_doses_per_day: z.string().trim(),
		instructions: z.string().trim(),
	})
	.superRefine((values, ctx) => {
		if (values.is_as_needed) {
			if (!values.as_needed_reason) {
				ctx.addIssue({
					code: 'custom',
					path: ['as_needed_reason'],
					message: 'Say when to give it, for example pain',
				})
			}
			const max = Number(values.max_doses_per_day)
			if (!Number.isInteger(max) || max < 1) {
				ctx.addIssue({
					code: 'custom',
					path: ['max_doses_per_day'],
					message: 'Enter a whole number, 1 or more',
				})
			}
		} else if (!areValidTimes(parseTimes(values.times))) {
			ctx.addIssue({
				code: 'custom',
				path: ['times'],
				message: 'Use 24-hour times separated by commas, like 08:00, 20:00',
			})
		}
		if (
			values.end_date &&
			dayjs(values.end_date).isBefore(dayjs(values.start_date), 'day')
		) {
			ctx.addIssue({
				code: 'custom',
				path: ['end_date'],
				message: 'End date must be on or after the start date',
			})
		}
	})

export type AddPrescriptionValues = z.infer<typeof AddPrescriptionSchema>

export const DEFAULT_VALUES: AddPrescriptionValues = {
	medicine_name: '',
	strength: '',
	form: 'TABLET',
	dose: '',
	route: 'MOUTH',
	frequency: 'ONCE_DAILY',
	times: getDefaultTimes('ONCE_DAILY').join(', '),
	start_date: dayjs().format('YYYY-MM-DD'),
	end_date: '',
	prescribed_by: '',
	is_as_needed: false,
	as_needed_reason: '',
	max_doses_per_day: '',
	instructions: '',
}

export function toCreatePrescriptionInput(
	values: AddPrescriptionValues,
): CreatePrescriptionInput {
	return {
		medicine_name: values.medicine_name,
		strength: values.strength,
		form: values.form,
		dose: values.dose,
		route: values.route,
		is_as_needed: values.is_as_needed,
		frequency: values.is_as_needed ? undefined : values.frequency,
		times: values.is_as_needed ? [] : parseTimes(values.times),
		as_needed_reason: values.is_as_needed ? values.as_needed_reason : undefined,
		max_doses_per_day: values.is_as_needed
			? Number(values.max_doses_per_day)
			: undefined,
		start_date: values.start_date,
		end_date: values.end_date || undefined,
		prescribed_by: values.prescribed_by,
		instructions: values.instructions || undefined,
	}
}
