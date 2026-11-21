import dayjs from 'dayjs'
import { CalendarDaysIcon, LoaderCircleIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useFetcher, useLoaderData, useSearchParams } from 'react-router'
import { FormField } from '~/components/form-field'
import { PageHeader } from '~/components/page-header'
import { Avatar } from '~/components/ui/avatar'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { NativeSelect } from '~/components/ui/native-select'
import { SegmentedControl } from '~/components/ui/segmented-control'
import { toJsonPayload } from '~/lib/json'
import { getResidentName, getResidentPlace } from '~/lib/resident.utils'
import { getInitials } from '~/lib/strings'
import type {
	action,
	loader,
} from '~/routes/_auth._dashboard.residents.appointments'

const RANGE_OPTIONS = [
	{ value: 'today', label: 'Today' },
	{ value: 'week', label: 'Next 7 days' },
	{ value: 'month', label: 'Next 30 days' },
] as const

function dayHeading(date: Date) {
	const day = dayjs(date)
	if (day.isSame(dayjs(), 'day')) return 'Today'
	if (day.isSame(dayjs().add(1, 'day'), 'day')) return 'Tomorrow'
	return day.format('dddd D MMMM')
}

function groupByDay(appointments: Array<Appointment>) {
	const groups = new Map<string, Array<Appointment>>()
	for (const appointment of appointments) {
		const key = dayjs(appointment.starts_at).format('YYYY-MM-DD')
		groups.set(key, [...(groups.get(key) ?? []), appointment])
	}
	return [...groups.values()]
}

const EMPTY = {
	resident_id: '',
	starts_at: '',
	with_whom: '',
	location: '',
	escort: '',
	transport: '',
	notes: '',
}

function AddAppointment({ residents }: { residents: Array<Resident> }) {
	const fetcher = useFetcher<typeof action>()
	const [values, setValues] = useState(EMPTY)
	const [errors, setErrors] = useState<
		Partial<Record<keyof typeof EMPTY, string>>
	>({})
	const isSubmitting = fetcher.state !== 'idle'

	useEffect(() => {
		if (
			fetcher.state === 'idle' &&
			fetcher.data &&
			'appointment' in fetcher.data
		) {
			setValues(EMPTY)
		}
	}, [fetcher.state, fetcher.data])

	const set =
		(key: keyof typeof EMPTY) =>
		(event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
			setValues((v) => ({ ...v, [key]: event.target.value }))
			setErrors((e) => ({ ...e, [key]: undefined }))
		}

	const save = (event: React.FormEvent) => {
		event.preventDefault()
		const next = {
			resident_id: values.resident_id ? undefined : 'Choose someone',
			starts_at: values.starts_at ? undefined : 'Enter the date and time',
			with_whom: values.with_whom.trim() ? undefined : 'Say who it is with',
			location: values.location.trim() ? undefined : 'Say where it is',
		}
		setErrors(next)
		if (Object.values(next).some(Boolean)) return
		void fetcher.submit(toJsonPayload(values), {
			method: 'post',
			encType: 'application/json',
		})
	}

	return (
		<Card aria-labelledby="add-appointment">
			<CardHeader>
				<CardTitle id="add-appointment">Add an appointment</CardTitle>
			</CardHeader>
			<CardContent>
				<form noValidate onSubmit={save} className="flex flex-col gap-4">
					<FormField label="Who" error={errors.resident_id}>
						<NativeSelect
							value={values.resident_id}
							onChange={set('resident_id')}
						>
							<option value="">Choose someone</option>
							{residents.map((r) => (
								<option key={r.id} value={r.id}>
									{getResidentName(r)} · {getResidentPlace(r)}
								</option>
							))}
						</NativeSelect>
					</FormField>
					<FormField label="When" error={errors.starts_at}>
						<Input
							type="datetime-local"
							value={values.starts_at}
							min={dayjs().format('YYYY-MM-DDT00:00')}
							onChange={set('starts_at')}
						/>
					</FormField>
					<FormField label="With" error={errors.with_whom}>
						<Input
							value={values.with_whom}
							placeholder="Diabetes clinic"
							onChange={set('with_whom')}
						/>
					</FormField>
					<FormField label="Where" error={errors.location}>
						<Input
							value={values.location}
							placeholder="Korle Bu Teaching Hospital"
							onChange={set('location')}
						/>
					</FormField>
					<FormField label="Going with them" optional>
						<Input
							value={values.escort}
							placeholder="Esi Quaye"
							onChange={set('escort')}
						/>
					</FormField>
					<FormField label="Transport" optional>
						<Input
							value={values.transport}
							placeholder="Home minibus"
							onChange={set('transport')}
						/>
					</FormField>
					{fetcher.data && 'error' in fetcher.data ? (
						<p className="text-destructive m-0 text-[13px]">
							{fetcher.data.error}
						</p>
					) : null}
					<div className="flex justify-end">
						<Button type="submit" disabled={isSubmitting}>
							{isSubmitting ? (
								<LoaderCircleIcon className="animate-spin" />
							) : null}
							Add appointment
						</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	)
}

export function AppointmentsModule() {
	const { appointments, range, residentOptions } =
		useLoaderData<typeof loader>()
	const [, setSearchParams] = useSearchParams()
	const todayCount = appointments.filter((a) =>
		dayjs(a.starts_at).isSame(dayjs(), 'day'),
	).length

	return (
		<>
			<PageHeader
				title="Appointments"
				description={
					<span suppressHydrationWarning>
						{todayCount === 1
							? '1 appointment today'
							: `${todayCount} appointments today`}
					</span>
				}
			/>
			<div className="flex flex-wrap items-start gap-6">
				<div className="flex min-w-0 flex-[999_1_560px] flex-col gap-6">
					<SegmentedControl
						label="Show"
						options={RANGE_OPTIONS}
						value={range}
						onValueChange={(value) =>
							setSearchParams(value === 'week' ? {} : { range: value }, {
								replace: true,
							})
						}
						className="self-start"
					/>
					{appointments.length ? (
						groupByDay(appointments).map((group) => {
							const first = group[0]
							if (!first) return null
							const heading = dayHeading(first.starts_at)
							const headingId = `day-${dayjs(first.starts_at).format('YYYYMMDD')}`
							return (
								<Card key={headingId} aria-labelledby={headingId}>
									<CardHeader>
										<CardTitle id={headingId} suppressHydrationWarning>
											{heading}
										</CardTitle>
									</CardHeader>
									<ul className="m-0 list-none p-0">
										{group.map((appointment) => (
											<li
												key={appointment.id}
												className="flex flex-wrap items-start gap-4 border-b px-6 py-4 last:border-b-0"
											>
												<time className="text-muted-foreground w-12 shrink-0 text-sm leading-[22px]">
													{dayjs(appointment.starts_at).format('HH:mm')}
												</time>
												<Avatar
													size="sm"
													initials={getInitials(appointment.resident.name)}
												/>
												<div className="min-w-0 flex-1">
													<Link
														to={`/residents/${appointment.resident.id}`}
														className="text-foreground block font-medium no-underline hover:underline"
													>
														{appointment.resident.name}
													</Link>
													<p className="m-0 text-[15px]">
														{appointment.with_whom} · {appointment.location}
													</p>
													<p className="text-muted-foreground m-0 text-sm">
														{[
															appointment.resident.place,
															appointment.escort
																? `with ${appointment.escort}`
																: null,
															appointment.transport,
														]
															.filter(Boolean)
															.join(' · ')}
													</p>
												</div>
											</li>
										))}
									</ul>
								</Card>
							)
						})
					) : (
						<div className="bg-card text-muted-foreground flex flex-col items-center gap-3 rounded-xl border px-6 py-12 text-center text-sm">
							<CalendarDaysIcon className="size-6" />
							No appointments in this period.
						</div>
					)}
				</div>
				<div className="flex min-w-0 flex-[1_1_320px] flex-col gap-6">
					<AddAppointment residents={residentOptions} />
				</div>
			</div>
		</>
	)
}
