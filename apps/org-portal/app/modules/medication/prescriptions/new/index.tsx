import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import {
	AlertCircleIcon,
	LoaderCircleIcon,
	OctagonAlertIcon,
} from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { Link, useFetcher, useLoaderData, useSearchParams } from 'react-router'
import {
	AddPrescriptionSchema,
	DEFAULT_VALUES,
	toCreatePrescriptionInput,
	type AddPrescriptionValues,
} from './schema'
import { FormField } from '~/components/form-field'
import { PageHeader } from '~/components/page-header'
import { Alert } from '~/components/ui/alert'
import { Button, buttonVariants } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Checkbox } from '~/components/ui/checkbox'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { NativeSelect } from '~/components/ui/native-select'
import { Textarea } from '~/components/ui/textarea'
import { QUERY_KEYS } from '~/lib/constants'
import { toJsonPayload } from '~/lib/json'
import {
	findAllergyConflict,
	getAllergyConflictMessage,
	getDefaultTimes,
	MEDICINE_FORM_OPTIONS,
	MEDICINE_FREQUENCY_OPTIONS,
	MEDICINE_ROUTE_OPTIONS,
} from '~/lib/medication.utils'
import { getResidentName, getResidentPlace } from '~/lib/resident.utils'
import type {
	action,
	loader,
} from '~/routes/_auth._dashboard.medication.prescriptions.new'

function ResidentPicker({ options }: { options: Array<Resident> }) {
	const [, setSearchParams] = useSearchParams()

	return (
		<Card aria-labelledby="choose-resident">
			<CardHeader>
				<CardTitle id="choose-resident">Who is it for?</CardTitle>
			</CardHeader>
			<CardContent>
				<FormField
					label="Resident or client"
					hint="Their allergies are checked as you type the medicine."
				>
					<NativeSelect
						defaultValue=""
						onChange={(event) =>
							setSearchParams({ resident: event.target.value })
						}
					>
						<option value="" disabled>
							Choose someone
						</option>
						{options.map((resident) => (
							<option key={resident.id} value={resident.id}>
								{getResidentName(resident)} · {getResidentPlace(resident)}
							</option>
						))}
					</NativeSelect>
				</FormField>
			</CardContent>
		</Card>
	)
}

function PrescriptionForm({ resident }: { resident: Resident }) {
	const fetcher = useFetcher<typeof action>()
	const queryClient = useQueryClient()

	const {
		control,
		register,
		handleSubmit,
		setValue,
		watch,
		formState: { errors },
	} = useForm<AddPrescriptionValues>({
		resolver: zodResolver(AddPrescriptionSchema),
		defaultValues: DEFAULT_VALUES,
		mode: 'onTouched',
	})

	const isAsNeeded = watch('is_as_needed')
	const conflict = findAllergyConflict(
		watch('medicine_name'),
		resident.allergies,
	)
	const isSubmitting = fetcher.state !== 'idle'
	const frequencyField = register('frequency')

	const onSubmit = handleSubmit(async (values) => {
		if (conflict) return
		// The profile seeds its chart from loader data only when nothing is cached.
		queryClient.removeQueries({
			queryKey: [QUERY_KEYS.RESIDENT_SUMMARY],
		})
		await fetcher.submit(toJsonPayload(toCreatePrescriptionInput(values)), {
			method: 'post',
			encType: 'application/json',
		})
	})

	return (
		<form noValidate onSubmit={onSubmit} className="flex flex-col gap-6">
			{conflict ? (
				<Alert tone="critical" className="min-h-14 items-center text-[15px]">
					<OctagonAlertIcon />
					<span>
						<b className="font-semibold">
							{getAllergyConflictMessage(conflict, resident.first_name)}
						</b>
					</span>
				</Alert>
			) : null}
			{fetcher.data?.error ? (
				<Alert tone="critical">
					<AlertCircleIcon />
					<span>{fetcher.data.error}</span>
				</Alert>
			) : null}

			<Card aria-labelledby="medicine-details">
				<CardHeader>
					<CardTitle id="medicine-details">Medicine</CardTitle>
				</CardHeader>
				<CardContent className="grid gap-5 sm:grid-cols-2">
					<FormField
						label="Medicine name"
						hint="Generic or brand name"
						error={
							errors.medicine_name?.message ??
							(conflict ? 'Allergy conflict' : undefined)
						}
					>
						<Input autoComplete="off" {...register('medicine_name')} />
					</FormField>
					<FormField label="Strength" error={errors.strength?.message}>
						<Input placeholder="500 mg" {...register('strength')} />
					</FormField>
					<FormField label="Form">
						<NativeSelect {...register('form')}>
							{MEDICINE_FORM_OPTIONS.map((option) => (
								<option key={option.value} value={option.value}>
									{option.label}
								</option>
							))}
						</NativeSelect>
					</FormField>
					<FormField label="Dose" error={errors.dose?.message}>
						<Input placeholder="1 tablet" {...register('dose')} />
					</FormField>
					<FormField label="Given by">
						<NativeSelect {...register('route')}>
							{MEDICINE_ROUTE_OPTIONS.map((option) => (
								<option key={option.value} value={option.value}>
									{option.label}
								</option>
							))}
						</NativeSelect>
					</FormField>

					{isAsNeeded ? (
						<>
							<FormField
								label="Give it for"
								error={errors.as_needed_reason?.message}
							>
								<Input
									placeholder="Pain or fever"
									{...register('as_needed_reason')}
								/>
							</FormField>
							<FormField
								label="Most doses in 24 hours"
								error={errors.max_doses_per_day?.message}
							>
								<Input
									inputMode="numeric"
									placeholder="4"
									{...register('max_doses_per_day')}
								/>
							</FormField>
						</>
					) : (
						<>
							<FormField label="How often">
								<NativeSelect
									{...frequencyField}
									onChange={(event) => {
										void frequencyField.onChange(event)
										setValue(
											'times',
											getDefaultTimes(
												event.target.value as MedicineFrequency,
											).join(', '),
											{ shouldValidate: true },
										)
									}}
								>
									{MEDICINE_FREQUENCY_OPTIONS.map((option) => (
										<option key={option.value} value={option.value}>
											{option.label}
										</option>
									))}
								</NativeSelect>
							</FormField>
							<FormField
								label="Times"
								hint="24-hour, separated by commas"
								error={errors.times?.message}
							>
								<Input placeholder="08:00, 20:00" {...register('times')} />
							</FormField>
						</>
					)}

					<FormField label="Start date" error={errors.start_date?.message}>
						<Input type="date" {...register('start_date')} />
					</FormField>
					<FormField
						label="End date"
						hint="Leave empty if ongoing"
						error={errors.end_date?.message}
					>
						<Input type="date" {...register('end_date')} />
					</FormField>
					<FormField
						label="Prescribed by"
						error={errors.prescribed_by?.message}
						className="sm:col-span-2"
					>
						<Input
							placeholder="Dr. K. Boadu, Ridge Hospital"
							{...register('prescribed_by')}
						/>
					</FormField>

					<div className="flex items-start gap-3 sm:col-span-2">
						<Controller
							name="is_as_needed"
							control={control}
							render={({ field }) => (
								<Checkbox
									id="is_as_needed"
									className="mt-0.5"
									checked={field.value}
									onCheckedChange={(checked) =>
										field.onChange(checked === true)
									}
									aria-describedby="is_as_needed-hint"
								/>
							)}
						/>
						<div>
							<Label
								htmlFor="is_as_needed"
								className="cursor-pointer text-[15px] font-normal"
							>
								Give only when needed (PRN)
							</Label>
							<p
								id="is_as_needed-hint"
								className="text-muted-foreground m-0 text-sm"
							>
								For pain, fever and similar. You set the reason and the most per
								day.
							</p>
						</div>
					</div>

					<FormField
						label="Instructions for staff"
						optional
						className="sm:col-span-2"
					>
						<Textarea
							rows={3}
							placeholder="Give with food."
							{...register('instructions')}
						/>
					</FormField>
				</CardContent>
				<div className="flex flex-wrap items-center justify-end gap-2 border-t px-6 py-4">
					<Link
						to={`/residents/${resident.id}`}
						className={buttonVariants({ variant: 'outline' })}
					>
						Cancel
					</Link>
					<Button type="submit" disabled={isSubmitting || Boolean(conflict)}>
						{isSubmitting ? (
							<LoaderCircleIcon className="animate-spin" />
						) : null}
						Save prescription
					</Button>
				</div>
			</Card>
		</form>
	)
}

export function AddPrescriptionModule() {
	const { resident, residentOptions } = useLoaderData<typeof loader>()

	return (
		<>
			<PageHeader
				title="Add prescription"
				description={
					resident
						? `For ${getResidentName(resident)} · ${getResidentPlace(resident)}`
						: 'Choose who the medicine is for'
				}
			/>
			{resident ? (
				<PrescriptionForm key={resident.id} resident={resident} />
			) : (
				<ResidentPicker options={residentOptions} />
			)}
		</>
	)
}
