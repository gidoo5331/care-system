import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { AlertCircleIcon, LoaderCircleIcon } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Link, useFetcher, useLoaderData } from 'react-router'
import { z } from 'zod'
import { FormField } from '~/components/form-field'
import { PageHeader } from '~/components/page-header'
import { Alert } from '~/components/ui/alert'
import { Button, buttonVariants } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { NativeSelect } from '~/components/ui/native-select'
import { Textarea } from '~/components/ui/textarea'
import { QUERY_KEYS } from '~/lib/constants'
import { INCIDENT_TYPE_OPTIONS } from '~/lib/incident.utils'
import { toJsonPayload } from '~/lib/json'
import { getResidentName, getResidentPlace } from '~/lib/resident.utils'
import type { action, loader } from '~/routes/_auth._dashboard.incidents.new'

const ReportIncidentSchema = z.object({
	type: z.enum([
		'FALL',
		'SAFEGUARDING',
		'MEDICATION',
		'COMPLAINT',
		'INJURY',
		'OTHER',
	]),
	resident_id: z.string().min(1, 'Choose who it happened to'),
	occurred_at: z
		.string()
		.min(1, 'Enter when it happened')
		.refine((v) => !dayjs(v).isAfter(dayjs()), 'It cannot be in the future'),
	location: z.string().trim(),
	description: z
		.string()
		.trim()
		.min(10, 'Describe what happened in a sentence or two'),
	injury: z.string().trim(),
	witnesses: z.string().trim(),
})

type ReportIncidentValues = z.infer<typeof ReportIncidentSchema>

export function ReportIncidentModule() {
	const { residentOptions } = useLoaderData<typeof loader>()
	const fetcher = useFetcher<typeof action>()
	const queryClient = useQueryClient()

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<ReportIncidentValues>({
		resolver: zodResolver(ReportIncidentSchema),
		defaultValues: {
			type: 'FALL',
			resident_id: '',
			occurred_at: dayjs().format('YYYY-MM-DDTHH:mm'),
			location: '',
			description: '',
			injury: '',
			witnesses: '',
		},
		mode: 'onTouched',
	})

	const onSubmit = handleSubmit(async (values) => {
		queryClient.removeQueries({ queryKey: [QUERY_KEYS.INCIDENTS] })
		await fetcher.submit(toJsonPayload(values), {
			method: 'post',
			encType: 'application/json',
		})
	})

	const isSubmitting = fetcher.state !== 'idle'

	return (
		<>
			<PageHeader
				title="Report an incident"
				description="Record what happened as soon as you can. A manager reviews every report."
			/>

			{fetcher.data?.error ? (
				<Alert tone="critical">
					<AlertCircleIcon />
					<span>{fetcher.data.error}</span>
				</Alert>
			) : null}

			<form noValidate onSubmit={onSubmit}>
				<Card aria-labelledby="incident-details">
					<CardHeader>
						<CardTitle id="incident-details">What happened</CardTitle>
					</CardHeader>
					<CardContent className="grid gap-5 sm:grid-cols-2">
						<FormField label="Type of incident">
							<NativeSelect {...register('type')}>
								{INCIDENT_TYPE_OPTIONS.map((option) => (
									<option key={option.value} value={option.value}>
										{option.label}
									</option>
								))}
							</NativeSelect>
						</FormField>
						<FormField
							label="Who was involved"
							error={errors.resident_id?.message}
						>
							<NativeSelect {...register('resident_id')}>
								<option value="" disabled>
									Choose someone
								</option>
								{residentOptions.map((resident) => (
									<option key={resident.id} value={resident.id}>
										{getResidentName(resident)} · {getResidentPlace(resident)}
									</option>
								))}
							</NativeSelect>
						</FormField>
						<FormField label="When" error={errors.occurred_at?.message}>
							<Input type="datetime-local" {...register('occurred_at')} />
						</FormField>
						<FormField label="Where" optional>
							<Input placeholder="Room 4, bathroom" {...register('location')} />
						</FormField>
						<FormField
							label="What happened"
							hint="Facts only: what you saw, heard and did."
							error={errors.description?.message}
							className="sm:col-span-2"
						>
							<Textarea rows={4} {...register('description')} />
						</FormField>
						<FormField label="Were they hurt?" optional>
							<Input placeholder="No injury seen" {...register('injury')} />
						</FormField>
						<FormField label="Witnesses" optional>
							<Input placeholder="None" {...register('witnesses')} />
						</FormField>
					</CardContent>
					<div className="flex flex-wrap items-center justify-end gap-2 border-t px-6 py-4">
						<Link
							to="/incidents"
							className={buttonVariants({ variant: 'outline' })}
						>
							Cancel
						</Link>
						<Button type="submit" disabled={isSubmitting}>
							{isSubmitting ? (
								<LoaderCircleIcon className="animate-spin" />
							) : null}
							Report incident
						</Button>
					</div>
				</Card>
			</form>
		</>
	)
}
