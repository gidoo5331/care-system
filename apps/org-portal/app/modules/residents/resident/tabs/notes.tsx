import { useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { LoaderCircleIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useFetcher, useLoaderData } from 'react-router'
import { FormField } from '~/components/form-field'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { NativeSelect } from '~/components/ui/native-select'
import { Textarea } from '~/components/ui/textarea'
import { QUERY_KEYS } from '~/lib/constants'
import { toJsonPayload } from '~/lib/json'
import {
	getNoteCategory,
	NOTE_CATEGORY_OPTIONS,
} from '~/lib/resident-records.utils'
import type {
	action,
	loader,
} from '~/routes/_auth._dashboard.residents.$residentId.notes'

function dayHeading(date: Date) {
	const day = dayjs(date)
	if (day.isSame(dayjs(), 'day')) return 'Today'
	if (day.isSame(dayjs().subtract(1, 'day'), 'day')) return 'Yesterday'
	return day.format('dddd D MMMM')
}

function groupByDay(notes: Array<ResidentNoteEntry>) {
	const groups = new Map<string, Array<ResidentNoteEntry>>()
	for (const note of notes) {
		const key = dayjs(note.recorded_at).format('YYYY-MM-DD')
		groups.set(key, [...(groups.get(key) ?? []), note])
	}
	return [...groups.entries()]
}

function AddNote() {
	const fetcher = useFetcher<typeof action>()
	const queryClient = useQueryClient()
	const [category, setCategory] = useState<NoteCategory>('DAILY')
	const [body, setBody] = useState('')
	const [error, setError] = useState<string>()
	const textareaRef = useRef<HTMLTextAreaElement>(null)
	const isSubmitting = fetcher.state !== 'idle'

	useEffect(() => {
		if (fetcher.state === 'idle' && fetcher.data && 'note' in fetcher.data) {
			setBody('')
		}
	}, [fetcher.state, fetcher.data])

	const save = (event: React.FormEvent) => {
		event.preventDefault()
		if (!body.trim()) {
			setError('Write the note first')
			textareaRef.current?.focus()
			return
		}
		queryClient.removeQueries({ queryKey: [QUERY_KEYS.RESIDENTS] })
		const input: CreateNoteInput = { category, body }
		void fetcher.submit(toJsonPayload(input), {
			method: 'post',
			encType: 'application/json',
		})
	}

	return (
		<Card aria-labelledby="add-note">
			<CardHeader>
				<CardTitle id="add-note">Add a note</CardTitle>
			</CardHeader>
			<CardContent>
				<form noValidate onSubmit={save} className="flex flex-col gap-4">
					<FormField label="Type">
						<NativeSelect
							value={category}
							onChange={(e) => setCategory(e.target.value as NoteCategory)}
						>
							{NOTE_CATEGORY_OPTIONS.map((option) => (
								<option key={option.value} value={option.value}>
									{option.label}
								</option>
							))}
						</NativeSelect>
					</FormField>
					<FormField
						label="Note"
						hint="What happened, and anything the next shift should know."
						error={
							error ??
							(fetcher.data && 'error' in fetcher.data
								? fetcher.data.error
								: undefined)
						}
					>
						<Textarea
							ref={textareaRef}
							rows={4}
							value={body}
							onChange={(e) => {
								setBody(e.target.value)
								setError(undefined)
							}}
						/>
					</FormField>
					<div className="flex justify-end">
						<Button type="submit" disabled={isSubmitting}>
							{isSubmitting ? (
								<LoaderCircleIcon className="animate-spin" />
							) : null}
							Save note
						</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	)
}

export function ResidentNotesModule() {
	const { notes } = useLoaderData<typeof loader>()

	return (
		<div className="flex flex-wrap items-start gap-6">
			<div className="flex min-w-0 flex-[999_1_560px] flex-col gap-6">
				<Card aria-labelledby="timeline">
					<CardHeader>
						<CardTitle id="timeline">Timeline</CardTitle>
					</CardHeader>
					<CardContent className="gap-6">
						{notes.length ? (
							groupByDay(notes).map(([day, entries]) => (
								<section
									key={day}
									aria-label={dayHeading(entries[0]?.recorded_at ?? new Date())}
								>
									<h3
										className="text-muted-foreground mt-0 mb-3 text-[13px] font-semibold tracking-[0.04em] uppercase"
										suppressHydrationWarning
									>
										{dayHeading(entries[0]?.recorded_at ?? new Date())}
									</h3>
									<ol className="m-0 flex list-none flex-col gap-4 p-0">
										{entries.map((note) => {
											const category = getNoteCategory(note.category)
											return (
												<li key={note.id} className="flex gap-4">
													<time className="text-muted-foreground w-11 shrink-0 text-sm leading-[22px]">
														{dayjs(note.recorded_at).format('HH:mm')}
													</time>
													<div className="min-w-0 flex-1">
														<p className="m-0 text-[15px] leading-[22px]">
															{note.body}
														</p>
														<p className="text-muted-foreground m-0 mt-1 flex flex-wrap items-center gap-2 text-sm">
															<Badge tone={category.tone}>
																{category.label}
															</Badge>
															{note.recorded_by}
														</p>
													</div>
												</li>
											)
										})}
									</ol>
								</section>
							))
						) : (
							<p className="text-muted-foreground m-0 text-sm">No notes yet.</p>
						)}
					</CardContent>
				</Card>
			</div>
			<div className="flex min-w-0 flex-[1_1_320px] flex-col gap-6">
				<AddNote />
			</div>
		</div>
	)
}
