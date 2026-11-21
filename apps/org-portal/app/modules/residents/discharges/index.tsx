import { useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { LoaderCircleIcon, TriangleAlertIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useFetcher, useLoaderData } from 'react-router'
import { FormField } from '~/components/form-field'
import { PageHeader } from '~/components/page-header'
import { Avatar } from '~/components/ui/avatar'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { NativeSelect } from '~/components/ui/native-select'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '~/components/ui/table'
import { Textarea } from '~/components/ui/textarea'
import { QUERY_KEYS } from '~/lib/constants'
import { formatShortDate } from '~/lib/date'
import { toJsonPayload } from '~/lib/json'
import {
	getMovementType,
	MOVEMENT_TYPE_OPTIONS,
} from '~/lib/resident-records.utils'
import { getResidentName, getResidentPlace } from '~/lib/resident.utils'
import { getInitials } from '~/lib/strings'
import type {
	action,
	loader,
} from '~/routes/_auth._dashboard.residents.discharges'

const LEAVING: ReadonlyArray<MovementType> = [
	'DISCHARGED_HOME',
	'TRANSFERRED',
	'DIED',
]

function useRecordMovement() {
	const fetcher = useFetcher<typeof action>()
	const queryClient = useQueryClient()
	const submit = (input: CreateMovementInput) => {
		queryClient.removeQueries({ queryKey: [QUERY_KEYS.RESIDENTS] })
		void fetcher.submit(toJsonPayload(input), {
			method: 'post',
			encType: 'application/json',
		})
	}
	return { fetcher, submit }
}

function BackFromHospital({ resident }: { resident: Resident }) {
	const { fetcher, submit } = useRecordMovement()
	return (
		<Button
			variant="outline"
			disabled={fetcher.state !== 'idle'}
			onClick={() =>
				submit({
					resident_id: resident.id,
					type: 'RETURNED_FROM_HOSPITAL',
					date: dayjs().format('YYYY-MM-DD'),
				})
			}
		>
			{fetcher.state !== 'idle' ? (
				<LoaderCircleIcon className="animate-spin" />
			) : null}
			Back from hospital
		</Button>
	)
}

function RecordMovement({ residents }: { residents: Array<Resident> }) {
	const { fetcher, submit } = useRecordMovement()
	const [residentId, setResidentId] = useState('')
	const [type, setType] = useState<MovementType>('HOSPITAL_ADMISSION')
	const [date, setDate] = useState(dayjs().format('YYYY-MM-DD'))
	const [destination, setDestination] = useState('')
	const [notes, setNotes] = useState('')
	const [error, setError] = useState<string>()

	const option = getMovementType(type)
	const resident = residents.find((r) => r.id === residentId)
	const isLeaving = LEAVING.includes(type)
	const isSubmitting = fetcher.state !== 'idle'

	useEffect(() => {
		if (
			fetcher.state === 'idle' &&
			fetcher.data &&
			'movement' in fetcher.data
		) {
			setResidentId('')
			setDestination('')
			setNotes('')
		}
	}, [fetcher.state, fetcher.data])

	const save = (event: React.FormEvent) => {
		event.preventDefault()
		if (!residentId) {
			setError('Choose who this is for')
			return
		}
		submit({ resident_id: residentId, type, date, destination, notes })
	}

	return (
		<Card aria-labelledby="record-move">
			<CardHeader>
				<CardTitle id="record-move">Record a move</CardTitle>
			</CardHeader>
			<CardContent>
				<form noValidate onSubmit={save} className="flex flex-col gap-4">
					<FormField label="Who" error={error}>
						<NativeSelect
							value={residentId}
							onChange={(e) => {
								setResidentId(e.target.value)
								setError(undefined)
							}}
						>
							<option value="">Choose someone</option>
							{residents
								.filter((r) => r.status === 'ACTIVE')
								.map((r) => (
									<option key={r.id} value={r.id}>
										{getResidentName(r)} · {getResidentPlace(r)}
									</option>
								))}
						</NativeSelect>
					</FormField>
					<FormField label="What happened">
						<NativeSelect
							value={type}
							onChange={(e) => setType(e.target.value as MovementType)}
						>
							{MOVEMENT_TYPE_OPTIONS.filter(
								(o) => o.value !== 'RETURNED_FROM_HOSPITAL',
							).map((o) => (
								<option key={o.value} value={o.value}>
									{o.label}
								</option>
							))}
						</NativeSelect>
					</FormField>
					<FormField label="Date">
						<Input
							type="date"
							value={date}
							max={dayjs().format('YYYY-MM-DD')}
							onChange={(e) => setDate(e.target.value)}
						/>
					</FormField>
					{option.needsDestination ? (
						<FormField
							label={type === 'HOSPITAL_ADMISSION' ? 'Hospital' : 'Going to'}
							optional
						>
							<Input
								value={destination}
								placeholder={
									type === 'HOSPITAL_ADMISSION'
										? 'Korle Bu Teaching Hospital'
										: 'Home to her daughter'
								}
								onChange={(e) => setDestination(e.target.value)}
							/>
						</FormField>
					) : null}
					<FormField label="Notes" optional>
						<Textarea
							rows={2}
							value={notes}
							onChange={(e) => setNotes(e.target.value)}
						/>
					</FormField>
					{isLeaving && resident ? (
						<p className="text-warning-ink m-0 flex items-start gap-2 text-sm">
							<TriangleAlertIcon className="mt-0.5 size-4 shrink-0" />
							{resident.first_name} will be taken off the residents list. Their
							records are kept.
						</p>
					) : null}
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
							Record
						</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	)
}

export function DischargesModule() {
	const { overview, residentOptions } = useLoaderData<typeof loader>()

	return (
		<>
			<PageHeader
				title="Discharges and transfers"
				description="Hospital stays, discharges and moves to other homes"
			/>
			<div className="flex flex-wrap items-start gap-6">
				<div className="flex min-w-0 flex-[999_1_560px] flex-col gap-6">
					<Card aria-labelledby="in-hospital">
						<CardHeader>
							<CardTitle id="in-hospital">In hospital now</CardTitle>
						</CardHeader>
						{overview.in_hospital.length ? (
							<ul className="m-0 list-none p-0">
								{overview.in_hospital.map((resident) => (
									<li
										key={resident.id}
										className="flex flex-wrap items-center gap-4 border-b px-6 py-3 last:border-b-0"
									>
										<Avatar
											size="sm"
											initials={getInitials(getResidentName(resident))}
										/>
										<Link
											to={`/residents/${resident.id}`}
											className="text-foreground min-w-0 flex-1 no-underline"
										>
											<span className="block font-medium">
												{getResidentName(resident)}
											</span>
											<span className="text-muted-foreground block text-sm">
												{getResidentPlace(resident)}
											</span>
										</Link>
										<BackFromHospital resident={resident} />
									</li>
								))}
							</ul>
						) : (
							<p className="text-muted-foreground m-0 px-6 py-8 text-sm">
								No one is in hospital.
							</p>
						)}
					</Card>

					<Card aria-labelledby="recent-moves">
						<CardHeader>
							<CardTitle id="recent-moves">Recent moves</CardTitle>
						</CardHeader>
						<Table className="min-w-[640px]">
							<TableHeader>
								<TableRow>
									<TableHead>Who</TableHead>
									<TableHead>What happened</TableHead>
									<TableHead>Date</TableHead>
									<TableHead>Details</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{overview.recent.map((movement) => {
									const type = getMovementType(movement.type)
									return (
										<TableRow key={movement.id}>
											<TableCell>
												<span className="block font-medium">
													{movement.resident.name}
												</span>
												<span className="text-muted-foreground block text-[13px]">
													{movement.resident.place}
												</span>
											</TableCell>
											<TableCell>
												<Badge tone={type.tone}>{type.label}</Badge>
											</TableCell>
											<TableCell className="text-muted-foreground">
												{formatShortDate(movement.date)}
											</TableCell>
											<TableCell className="text-muted-foreground text-sm">
												{[movement.destination, movement.notes]
													.filter(Boolean)
													.join(' · ') || '–'}
												<span className="text-subtle-foreground block text-[13px]">
													Recorded by {movement.recorded_by}
												</span>
											</TableCell>
										</TableRow>
									)
								})}
							</TableBody>
						</Table>
					</Card>
				</div>
				<div className="flex min-w-0 flex-[1_1_320px] flex-col gap-6">
					<RecordMovement residents={residentOptions} />
				</div>
			</div>
		</>
	)
}
