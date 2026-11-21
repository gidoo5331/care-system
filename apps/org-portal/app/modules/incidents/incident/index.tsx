import { useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import {
	AlertCircleIcon,
	CheckCircle2Icon,
	CheckIcon,
	LoaderCircleIcon,
	PlusIcon,
	PrinterIcon,
	XIcon,
} from 'lucide-react'
import { useState } from 'react'
import { useFetcher, useLoaderData } from 'react-router'
import { FormField } from '~/components/form-field'
import { PageHeader } from '~/components/page-header'
import { Alert } from '~/components/ui/alert'
import { Button } from '~/components/ui/button'
import {
	Card,
	CardAction,
	CardContent,
	CardHeader,
	CardTitle,
} from '~/components/ui/card'
import { Checkbox } from '~/components/ui/checkbox'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { NativeSelect } from '~/components/ui/native-select'
import { Textarea } from '~/components/ui/textarea'
import { QUERY_KEYS } from '~/lib/constants'
import { formatDueDate, formatRelativeDay } from '~/lib/date'
import {
	getIncidentTypeLabel,
	INCIDENT_SEVERITY_OPTIONS,
	INCIDENT_STATUS_OPTIONS,
} from '~/lib/incident.utils'
import { toJsonPayload } from '~/lib/json'
import { cn } from '~/lib/utils'
import type {
	action,
	loader,
} from '~/routes/_auth._dashboard.incidents.$incidentId'

const FORM_ID = 'incident-review'

interface NewAction {
	key: number
	description: string
	owner: string
	due_date: string
}

function Detail({ label, children }: { label: string; children: string }) {
	return (
		<div className="flex min-w-0 flex-col gap-1">
			<dt className="text-muted-foreground text-[13px] leading-[18px]">
				{label}
			</dt>
			<dd className="m-0 text-[15px] leading-[22px]">{children}</dd>
		</div>
	)
}

function CheckRow({
	id,
	checked,
	onCheckedChange,
	label,
	meta,
	hint,
}: {
	id: string
	checked: boolean
	onCheckedChange: (checked: boolean) => void
	label: string
	meta?: React.ReactNode
	hint?: Nullable<string>
}) {
	return (
		<li className="flex items-start gap-3 py-3">
			<Checkbox
				id={id}
				className="mt-0.5"
				checked={checked}
				onCheckedChange={(value) => onCheckedChange(value === true)}
			/>
			<div className="min-w-0 flex-1">
				<Label
					htmlFor={id}
					className={cn(
						'cursor-pointer text-[15px] leading-[22px] font-normal',
						checked && 'text-muted-foreground',
					)}
				>
					{label}
				</Label>
				{hint ? (
					<p className="text-subtle-foreground m-0 text-[13px]">{hint}</p>
				) : null}
			</div>
			{meta ? (
				<div className="text-muted-foreground shrink-0 text-right text-[13px] leading-[18px]">
					{meta}
				</div>
			) : null}
		</li>
	)
}

export function IncidentModule() {
	const { incident } = useLoaderData<typeof loader>()
	const fetcher = useFetcher<typeof action>()
	const queryClient = useQueryClient()

	const [severity, setSeverity] = useState<IncidentSeverity>(
		incident.severity ?? 'LOW',
	)
	const [status, setStatus] = useState<IncidentStatus>(incident.status)
	const [notes, setNotes] = useState(incident.manager_notes)
	const [doneActions, setDoneActions] = useState(
		() => new Set(incident.actions.filter((a) => a.is_done).map((a) => a.id)),
	)
	const [notified, setNotified] = useState(
		() =>
			new Set(incident.notifications.filter((n) => n.is_done).map((n) => n.id)),
	)
	const [newActions, setNewActions] = useState<Array<NewAction>>([])

	const isSubmitting = fetcher.state !== 'idle'
	const isAwaitingReview = incident.status === 'AWAITING_REVIEW'

	const toggle = (set: Set<string>, id: string, on: boolean) => {
		const next = new Set(set)
		if (on) next.add(id)
		else next.delete(id)
		return next
	}

	const updateNewAction = (key: number, patch: Partial<NewAction>) =>
		setNewActions((actions) =>
			actions.map((a) => (a.key === key ? { ...a, ...patch } : a)),
		)

	const onSubmit = (event: React.FormEvent) => {
		event.preventDefault()
		queryClient.removeQueries({ queryKey: [QUERY_KEYS.INCIDENTS] })
		const input: ReviewIncidentInput = {
			severity,
			status,
			manager_notes: notes,
			completed_action_ids: [...doneActions],
			new_actions: newActions.map(({ description, owner, due_date }) => ({
				description,
				owner,
				due_date,
			})),
			notified_ids: [...notified],
		}
		void fetcher
			.submit(toJsonPayload(input), {
				method: 'post',
				encType: 'application/json',
			})
			.then(() => setNewActions([]))
	}

	return (
		<>
			<PageHeader
				title={`${getIncidentTypeLabel(incident.type)}: ${incident.resident.name}`}
				description={
					<span suppressHydrationWarning>
						{incident.ref} · reported{' '}
						{formatRelativeDay(incident.reported_at, false)} at{' '}
						{dayjs(incident.reported_at).format('HH:mm')}
					</span>
				}
				actions={
					<>
						<Button variant="outline" onClick={() => window.print()}>
							<PrinterIcon strokeWidth={1.75} />
							Print
						</Button>
						<Button type="submit" form={FORM_ID} disabled={isSubmitting}>
							{isSubmitting ? (
								<LoaderCircleIcon className="animate-spin" />
							) : (
								<CheckIcon strokeWidth={1.75} />
							)}
							{isAwaitingReview ? 'Mark as reviewed' : 'Save changes'}
						</Button>
					</>
				}
			/>

			{fetcher.data && 'error' in fetcher.data ? (
				<Alert tone="critical">
					<AlertCircleIcon />
					<span>{fetcher.data.error}</span>
				</Alert>
			) : fetcher.data &&
			  'saved' in fetcher.data &&
			  fetcher.state === 'idle' ? (
				<Alert tone="success">
					<CheckCircle2Icon />
					<span>Review saved.</span>
				</Alert>
			) : null}

			<form
				id={FORM_ID}
				onSubmit={onSubmit}
				className="flex flex-wrap items-start gap-6"
			>
				<div className="flex min-w-0 flex-[999_1_560px] flex-col gap-6">
					<Card aria-labelledby="what-happened">
						<CardHeader>
							<CardTitle id="what-happened">What happened</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="m-0 text-[15px] leading-[22px]">
								{incident.description}
							</p>
							<dl className="m-0 grid gap-4 sm:grid-cols-2">
								<Detail label="When">
									{`${formatRelativeDay(incident.occurred_at, false).replace(/^./, (c) => c.toUpperCase())}, ${dayjs(incident.occurred_at).format('HH:mm')}`}
								</Detail>
								<Detail label="Where">{incident.location}</Detail>
								<Detail label="Hurt?">{incident.injury}</Detail>
								<Detail label="Witnesses">{incident.witnesses}</Detail>
								<Detail label="Reported by">
									{`${incident.reported_by}, ${incident.reported_by_role}`}
								</Detail>
							</dl>
						</CardContent>
					</Card>

					<Card aria-labelledby="follow-up">
						<CardHeader>
							<CardTitle id="follow-up">Follow-up actions</CardTitle>
							<CardAction>
								<Button
									type="button"
									variant="outline"
									onClick={() =>
										setNewActions((actions) => [
											...actions,
											{
												key: Date.now(),
												description: '',
												owner: '',
												due_date: dayjs().add(1, 'day').format('YYYY-MM-DD'),
											},
										])
									}
								>
									<PlusIcon strokeWidth={1.75} />
									Add action
								</Button>
							</CardAction>
						</CardHeader>
						<CardContent className="gap-0 py-2">
							<ul className="m-0 list-none divide-y p-0">
								{incident.actions.map((item) => (
									<CheckRow
										key={item.id}
										id={item.id}
										checked={doneActions.has(item.id)}
										onCheckedChange={(on) =>
											setDoneActions((set) => toggle(set, item.id, on))
										}
										label={item.description}
										meta={
											<>
												<span className="block">{item.owner}</span>
												<span className="block" suppressHydrationWarning>
													{formatDueDate(item.due_date)}
												</span>
											</>
										}
									/>
								))}
								{newActions.map((item) => (
									<li
										key={item.key}
										className="grid gap-3 py-3 sm:grid-cols-[minmax(0,1fr)_160px_150px_auto] sm:items-end"
									>
										<FormField label="New action">
											<Input
												value={item.description}
												placeholder="What needs doing"
												onChange={(e) =>
													updateNewAction(item.key, {
														description: e.target.value,
													})
												}
											/>
										</FormField>
										<FormField label="Who">
											<Input
												value={item.owner}
												placeholder="Esi Quaye"
												onChange={(e) =>
													updateNewAction(item.key, { owner: e.target.value })
												}
											/>
										</FormField>
										<FormField label="By">
											<Input
												type="date"
												value={item.due_date}
												onChange={(e) =>
													updateNewAction(item.key, {
														due_date: e.target.value,
													})
												}
											/>
										</FormField>
										<Button
											type="button"
											variant="ghost"
											size="icon"
											aria-label="Remove this action"
											onClick={() =>
												setNewActions((actions) =>
													actions.filter((a) => a.key !== item.key),
												)
											}
										>
											<XIcon />
										</Button>
									</li>
								))}
							</ul>
							{!incident.actions.length && !newActions.length ? (
								<p className="text-muted-foreground m-0 py-4 text-sm">
									No follow-up actions yet.
								</p>
							) : null}
						</CardContent>
					</Card>
				</div>

				<div className="flex min-w-0 flex-[1_1_320px] flex-col gap-6">
					<Card aria-labelledby="review">
						<CardHeader>
							<CardTitle id="review">Review</CardTitle>
						</CardHeader>
						<CardContent>
							<FormField label="Severity">
								<NativeSelect
									value={severity}
									onChange={(e) =>
										setSeverity(e.target.value as IncidentSeverity)
									}
								>
									{INCIDENT_SEVERITY_OPTIONS.map((option) => (
										<option key={option.value} value={option.value}>
											{option.label}
										</option>
									))}
								</NativeSelect>
							</FormField>
							<FormField label="Status">
								<NativeSelect
									value={status}
									onChange={(e) => setStatus(e.target.value as IncidentStatus)}
								>
									{INCIDENT_STATUS_OPTIONS.map((option) => (
										<option key={option.value} value={option.value}>
											{option.label}
										</option>
									))}
								</NativeSelect>
							</FormField>
							<FormField label="Manager's notes">
								<Textarea
									rows={3}
									value={notes}
									placeholder="What you found and decided"
									onChange={(e) => setNotes(e.target.value)}
								/>
							</FormField>
						</CardContent>
					</Card>

					<Card aria-labelledby="who-told">
						<CardHeader>
							<CardTitle id="who-told">Who has been told</CardTitle>
						</CardHeader>
						<CardContent className="gap-0 py-2">
							<ul className="m-0 list-none divide-y p-0">
								{incident.notifications.map((item) => (
									<CheckRow
										key={item.id}
										id={`notify-${item.id}`}
										checked={notified.has(item.id)}
										onCheckedChange={(on) =>
											setNotified((set) => toggle(set, item.id, on))
										}
										label={item.label}
										hint={item.is_done ? item.detail : item.hint}
									/>
								))}
							</ul>
						</CardContent>
					</Card>
				</div>
			</form>
		</>
	)
}
