import { useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import {
	AlertCircleIcon,
	CheckCircle2Icon,
	LoaderCircleIcon,
} from 'lucide-react'
import { useId, useState } from 'react'
import {
	Link,
	useFetcher,
	useLoaderData,
	useSearchParams,
} from 'react-router'
import { useGetAttentionList } from '~/api/needs-attention'
import { useGetWorkspaceOverview } from '~/api/workspaces'
import { ModuleLayout } from '~/components/module-layout'
import { PageHeader } from '~/components/page-header'
import { Alert } from '~/components/ui/alert'
import { Badge } from '~/components/ui/badge'
import { Button, buttonVariants } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { SegmentedControl } from '~/components/ui/segmented-control'
import { Skeleton } from '~/components/ui/skeleton'
import { Textarea } from '~/components/ui/textarea'
import { QUERY_KEYS } from '~/lib/constants'
import { toJsonPayload } from '~/lib/json'
import {
	ATTENTION_CATEGORIES,
	fromCategoryParam,
	getAttentionCategoryLabel,
	toCategoryParam,
} from '~/lib/needs-attention.utils'
import { OverviewNav } from '~/modules/overview/components/overview-nav'
import type {
	action,
	loader,
} from '~/routes/_auth._dashboard.needs-attention'

function HandleForm({
	item,
	onCancel,
}: {
	item: AttentionItem
	onCancel: () => void
}) {
	const fetcher = useFetcher<typeof action>()
	const queryClient = useQueryClient()
	const noteId = useId()
	const [note, setNote] = useState('')
	const [touched, setTouched] = useState(false)
	const isSubmitting = fetcher.state !== 'idle'
	const serverError =
		fetcher.data && 'error' in fetcher.data ? fetcher.data.error : null
	const noteError = touched && !note.trim() ? 'Say what was done.' : null

	const submit = (event: React.FormEvent) => {
		event.preventDefault()
		setTouched(true)
		if (!note.trim()) return
		queryClient.removeQueries({ queryKey: [QUERY_KEYS.NEEDS_ATTENTION] })
		queryClient.removeQueries({ queryKey: [QUERY_KEYS.WORKSPACE_OVERVIEW] })
		const input: HandleAttentionInput = { item_id: item.id, note: note.trim() }
		void fetcher.submit(toJsonPayload(input), {
			method: 'post',
			encType: 'application/json',
		})
	}

	return (
		<form
			onSubmit={submit}
			className="bg-muted/50 flex w-full flex-col gap-2 rounded-lg border p-3"
		>
			<label htmlFor={noteId} className="text-sm font-medium">
				What was done?
			</label>
			<Textarea
				id={noteId}
				autoFocus
				rows={2}
				value={note}
				onChange={(event) => setNote(event.target.value)}
				aria-invalid={Boolean(noteError)}
				aria-describedby={`${noteId}-hint`}
				placeholder="For example: gave the dose at 09:10 and told the GP."
			/>
			<p
				id={`${noteId}-hint`}
				className={
					noteError || serverError
						? 'text-destructive m-0 text-[13px]'
						: 'text-muted-foreground m-0 text-[13px]'
				}
			>
				{noteError ??
					serverError ??
					'Saved with your name and the time, for the audit trail.'}
			</p>
			<div className="flex flex-wrap justify-end gap-2">
				<Button type="button" variant="ghost" onClick={onCancel}>
					Cancel
				</Button>
				<Button type="submit" disabled={isSubmitting}>
					{isSubmitting ? <LoaderCircleIcon className="animate-spin" /> : null}
					Mark handled
				</Button>
			</div>
		</form>
	)
}

function AttentionRow({ item }: { item: AttentionItem }) {
	const [isHandling, setIsHandling] = useState(false)

	return (
		<li className="flex flex-col gap-3 border-b px-6 py-3 last:border-b-0">
			<div className="flex min-h-12 flex-wrap items-center gap-x-4 gap-y-2 sm:flex-nowrap">
				<span className="w-[120px] shrink-0">
					<Badge tone={item.tone}>{item.kind}</Badge>
				</span>
				<span className="min-w-0 flex-1 basis-48">
					<span className="block text-[15px] leading-[22px] font-medium">
						{item.title}
					</span>
					<span className="text-muted-foreground block text-sm">
						{item.detail}
					</span>
				</span>
				<span
					className="text-subtle-foreground shrink-0 text-[13px] tabular-nums"
					suppressHydrationWarning
				>
					Raised {dayjs(item.raised_at).format('HH:mm')}
				</span>
				<span className="flex shrink-0 items-center gap-2">
					{!isHandling ? (
						<Button variant="ghost" onClick={() => setIsHandling(true)}>
							Mark handled
						</Button>
					) : null}
					<Link
						to={item.action_href}
						className={buttonVariants({ variant: 'outline' })}
					>
						{item.action_label}
					</Link>
				</span>
			</div>
			{isHandling ? (
				<HandleForm item={item} onCancel={() => setIsHandling(false)} />
			) : null}
		</li>
	)
}

function AttentionGroup({
	id,
	title,
	description,
	items,
}: {
	id: string
	title: string
	description: string
	items: Array<AttentionItem>
}) {
	if (!items.length) return null
	return (
		<Card aria-labelledby={id}>
			<CardHeader>
				<CardTitle id={id}>
					{title} <span className="text-muted-foreground">· {items.length}</span>
				</CardTitle>
				<p className="text-muted-foreground m-0 text-sm">{description}</p>
			</CardHeader>
			<ul className="m-0 list-none p-0">
				{items.map((item) => (
					<AttentionRow key={item.id} item={item} />
				))}
			</ul>
		</Card>
	)
}

function HandledToday({ items }: { items: Array<AttentionItem> }) {
	if (!items.length) return null
	return (
		<Card aria-labelledby="handled-today">
			<CardHeader>
				<CardTitle id="handled-today">Handled today</CardTitle>
			</CardHeader>
			<ul className="m-0 list-none p-0">
				{items.map((item) => (
					<li
						key={item.id}
						className="flex items-start gap-3 border-b px-6 py-3 last:border-b-0"
					>
						<CheckCircle2Icon
							aria-hidden="true"
							className="text-success mt-0.5 size-5 shrink-0"
							strokeWidth={1.75}
						/>
						<span className="min-w-0 flex-1">
							<span className="block text-[15px] leading-[22px] font-medium">
								{item.title}
							</span>
							<span className="text-muted-foreground block text-sm">
								{item.handled?.note}
							</span>
						</span>
						<span
							className="text-subtle-foreground shrink-0 text-right text-[13px]"
							suppressHydrationWarning
						>
							{item.handled?.by}
							<br />
							{dayjs(item.handled?.at).format('HH:mm')}
						</span>
					</li>
				))}
			</ul>
		</Card>
	)
}

type CategoryOption = AttentionCategory | 'ALL'

export function NeedsAttentionModule() {
	const loaderData = useLoaderData<typeof loader>()
	const [searchParams, setSearchParams] = useSearchParams()
	const category = fromCategoryParam(searchParams.get('category'))

	const { data: overview } = useGetWorkspaceOverview(
		loaderData.workspaceId,
		loaderData.overview,
	)
	const { data, isPending, error, refetch } = useGetAttentionList(
		loaderData.workspaceId,
		{ category },
	)

	const allCounts = data?.counts
	const totalOpen = data?.total_open ?? overview?.needs_attention_count ?? 0

	const options: Array<{ value: CategoryOption; label: string }> = [
		{ value: 'ALL', label: `All ${totalOpen}` },
		...ATTENTION_CATEGORIES.filter(
			(c) => c === category || (allCounts?.[c] ?? 0) > 0,
		).map((c) => ({
			value: c,
			label: `${getAttentionCategoryLabel(c)} ${allCounts?.[c] ?? 0}`,
		})),
	]

	const selectCategory = (value: CategoryOption) =>
		setSearchParams(
			(prev) => {
				const next = new URLSearchParams(prev)
				if (value === 'ALL') next.delete('category')
				else next.set('category', toCategoryParam(value))
				return next
			},
			{ preventScrollReset: true },
		)

	const open = data?.open ?? []
	const urgent = open.filter((item) => item.tone === 'critical')
	const dueSoon = open.filter((item) => item.tone !== 'critical')
	const scope = category
		? getAttentionCategoryLabel(category).toLowerCase()
		: null

	return (
		<ModuleLayout label="Overview" nav={<OverviewNav overview={overview} />}>
			<PageHeader
				title="Needs attention"
				description={
					totalOpen
						? `${totalOpen} open ${totalOpen === 1 ? 'item' : 'items'} · most urgent first`
						: 'Everything is up to date'
				}
			/>

			<div className="-mx-1 overflow-x-auto px-1">
				<SegmentedControl
					label="Show"
					options={options}
					value={category ?? 'ALL'}
					onValueChange={selectCategory}
				/>
			</div>

			{error ? (
				<Alert tone="critical" className="items-center">
					<AlertCircleIcon />
					<span className="flex-1">
						We couldn’t load this list. {error.message}
					</span>
					<Button variant="outline" onClick={() => void refetch()}>
						Try again
					</Button>
				</Alert>
			) : null}

			{isPending && !data ? (
				<Card>
					<CardContent className="flex flex-col gap-3">
						{Array.from({ length: 4 }, (_, i) => (
							<Skeleton key={i} className="h-14 w-full" />
						))}
					</CardContent>
				</Card>
			) : data ? (
				<>
					{open.length ? (
						<>
							<AttentionGroup
								id="act-now"
								title="Act now"
								description="Urgent. Deal with these first."
								items={urgent}
							/>
							<AttentionGroup
								id="due-soon"
								title="Due soon"
								description="Follow up today."
								items={dueSoon}
							/>
						</>
					) : (
						<Card>
							<div className="text-muted-foreground flex items-center gap-3 px-6 py-8 text-sm">
								<CheckCircle2Icon className="text-success size-5" />
								{scope
									? `Nothing in ${scope} needs your attention right now.`
									: 'Nothing needs your attention right now.'}
							</div>
						</Card>
					)}
					<HandledToday items={data.handled} />
				</>
			) : null}
		</ModuleLayout>
	)
}
