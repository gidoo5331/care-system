import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import {
	AlertCircleIcon,
	ChevronDownIcon,
	ClipboardCheckIcon,
	InfoIcon,
	LoaderCircleIcon,
	PlusIcon,
	XIcon,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { FormProvider, useFieldArray, useForm } from 'react-hook-form'
import { Link, useFetcher, useSearchParams } from 'react-router'
import {
	CarePlanEditorSchema,
	EMPTY_SECTION,
	NEW_PLAN_DEFAULTS,
	planToValues,
	type CarePlanEditorValues,
} from './schema'
import { SectionFields } from './section-fields'
import { FormField } from '~/components/form-field'
import { PageHeader } from '~/components/page-header'
import { Alert } from '~/components/ui/alert'
import { Button, buttonVariants } from '~/components/ui/button'
import {
	Card,
	CardAction,
	CardContent,
	CardHeader,
	CardTitle,
} from '~/components/ui/card'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { NativeSelect } from '~/components/ui/native-select'
import { CARE_PLAN_SECTIONS } from '~/lib/assessment-templates'
import { getCarePlanPronouns } from '~/lib/care-plan.utils'
import { QUERY_KEYS } from '~/lib/constants'
import { toJsonPayload } from '~/lib/json'
import { getResidentName, getResidentPlace } from '~/lib/resident.utils'

interface IntentButton {
	intent: CarePlanIntent
	label: string
	primary?: boolean
}

const INTENTS: Record<'NEW' | CarePlanStatus, Array<IntentButton>> = {
	NEW: [
		{ intent: 'SAVE_DRAFT', label: 'Save draft' },
		{ intent: 'SEND_FOR_APPROVAL', label: 'Send for approval', primary: true },
	],
	ACTIVE: [
		{ intent: 'COMPLETE_REVIEW', label: 'Complete review', primary: true },
	],
	AWAITING_APPROVAL: [
		{ intent: 'SAVE_DRAFT', label: 'Send back as draft' },
		{ intent: 'APPROVE', label: 'Approve', primary: true },
	],
	DRAFT: [
		{ intent: 'SAVE_DRAFT', label: 'Save draft' },
		{ intent: 'SEND_FOR_APPROVAL', label: 'Send for approval' },
		{ intent: 'APPROVE', label: 'Approve now', primary: true },
	],
}

function getIntro(plan?: CarePlan) {
	if (!plan) {
		return 'Write what they need and how staff should support them. A manager approves it before it is used.'
	}
	switch (plan.status) {
		case 'ACTIVE':
			return `Check each section is still right. Completing the review saves it as version ${plan.version + 1} and sets the next review for 3 months’ time.`
		case 'AWAITING_APPROVAL':
			return `${plan.written_by} sent this for approval. Make any changes, then approve it or send it back.`
		case 'DRAFT':
			return 'This plan is a draft and is not in use yet.'
	}
}

interface Props {
	plan?: CarePlan
	residentOptions?: Array<Resident>
	prefill?: Nullable<{ section: CarePlanSectionInput; formTitle: string }>
}

const PREFILL_ANCHOR = 'section-from-assessment'

function initialValues(
	plan: CarePlan | undefined,
	residentId: string,
	prefill: Props['prefill'],
): CarePlanEditorValues {
	const base = plan
		? planToValues(plan)
		: { ...NEW_PLAN_DEFAULTS, resident_id: residentId }
	if (!prefill) return base

	const section = {
		...prefill.section,
		tasks: [{ description: '', frequency: '' }],
	}
	const blankDefaults = !plan
		? base.sections.filter((s) => s.title !== section.title)
		: base.sections
	return { ...base, sections: [...blankDefaults, section] }
}

export function CarePlanEditor({ plan, residentOptions = [], prefill }: Props) {
	const fetcher = useFetcher<{ error?: string }>()
	const queryClient = useQueryClient()
	const [searchParams] = useSearchParams()
	const [intent, setIntent] = useState<CarePlanIntent>('SAVE_DRAFT')

	const form = useForm<CarePlanEditorValues>({
		resolver: zodResolver(CarePlanEditorSchema),
		defaultValues: initialValues(
			plan,
			searchParams.get('resident') ?? '',
			prefill,
		),
		mode: 'onTouched',
	})

	useEffect(() => {
		if (!prefill) return
		document
			.getElementById(PREFILL_ANCHOR)
			?.scrollIntoView({ behavior: 'smooth', block: 'start' })
	}, [prefill])
	const sections = useFieldArray({ control: form.control, name: 'sections' })
	const risks = useFieldArray({
		control: form.control,
		name: 'risk_assessments',
	})

	const [prefillFieldId] = useState(() =>
		prefill ? sections.fields.at(-1)?.id : undefined,
	)
	const usedTitles = new Set(
		form.watch('sections').map((section) => section.title.trim()),
	)

	const residentId = form.watch('resident_id')
	const selectedResident = residentOptions.find((r) => r.id === residentId)
	const gender = plan?.resident.gender ?? selectedResident?.gender ?? 'FEMALE'
	const pronouns = getCarePlanPronouns(gender)
	const buttons = INTENTS[plan?.status ?? 'NEW']
	const isSubmitting = fetcher.state !== 'idle'
	const [residentError, setResidentError] = useState<string>()

	const submit = (chosen: CarePlanIntent) =>
		form.handleSubmit(async (values) => {
			if (!plan && !values.resident_id) {
				setResidentError('Choose who the care plan is for')
				return
			}
			setIntent(chosen)
			queryClient.removeQueries({ queryKey: [QUERY_KEYS.CARE_PLANS] })
			queryClient.removeQueries({ queryKey: [QUERY_KEYS.RESIDENTS] })
			await fetcher.submit(
				toJsonPayload({
					...(plan ? {} : { resident_id: values.resident_id }),
					sections: values.sections,
					risk_assessments: values.risk_assessments,
					intent: chosen,
				}),
				{ method: 'post', encType: 'application/json' },
			)
		})()

	const residentName = plan
		? `${plan.resident.first_name} ${plan.resident.last_name}`
		: selectedResident
			? getResidentName(selectedResident)
			: null

	return (
		<>
			<PageHeader
				title={
					plan
						? `${residentName}'s care plan`
						: residentName
							? `New care plan for ${residentName}`
							: 'New care plan'
				}
				description={
					plan
						? `Version ${plan.version} · ${plan.status === 'ACTIVE' ? 'review' : plan.status === 'DRAFT' ? 'draft' : 'waiting for approval'}`
						: 'Usually written in the first few days after admission'
				}
			/>

			<Alert tone="info" className="items-center">
				<InfoIcon />
				<span>{getIntro(plan)}</span>
			</Alert>

			{prefill ? (
				<Alert tone="success" className="items-center">
					<ClipboardCheckIcon />
					<span>
						Added a “{prefill.section.title}” section from the{' '}
						{prefill.formTitle.toLowerCase()} assessment. Check and edit it
						before saving. If the plan already had a section with that title,
						merge them and remove one.
					</span>
				</Alert>
			) : null}

			{fetcher.data?.error ? (
				<Alert tone="critical">
					<AlertCircleIcon />
					<span>{fetcher.data.error}</span>
				</Alert>
			) : null}

			<FormProvider {...form}>
				<form
					noValidate
					onSubmit={(event) => {
						event.preventDefault()
						void submit(buttons.find((b) => b.primary)?.intent ?? 'SAVE_DRAFT')
					}}
					className="flex flex-col gap-6"
				>
					{!plan ? (
						<Card aria-labelledby="who-for">
							<CardHeader>
								<CardTitle id="who-for">Who is it for?</CardTitle>
							</CardHeader>
							<CardContent>
								<FormField
									label="Resident or client"
									hint="Only people without a care plan are listed."
									error={residentError}
								>
									<NativeSelect
										{...form.register('resident_id', {
											onChange: () => setResidentError(undefined),
										})}
									>
										<option value="">Choose someone</option>
										{residentOptions
											.filter((r) => !r.care_plan_id)
											.map((resident) => (
												<option key={resident.id} value={resident.id}>
													{getResidentName(resident)} ·{' '}
													{getResidentPlace(resident)}
												</option>
											))}
									</NativeSelect>
								</FormField>
							</CardContent>
						</Card>
					) : null}

					{sections.fields.map((section, index) => (
						<SectionFields
							key={section.id}
							index={index}
							anchorId={
								section.id === prefillFieldId
									? PREFILL_ANCHOR
									: `section-${plan?.sections[index]?.id ?? section.id}`
							}
							pronouns={pronouns}
							onRemove={
								sections.fields.length > 1
									? () => sections.remove(index)
									: undefined
							}
						/>
					))}
					<div>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button type="button" variant="outline">
									<PlusIcon strokeWidth={1.75} />
									Add section
									<ChevronDownIcon strokeWidth={1.75} />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent
								align="start"
								className="max-h-80 overflow-y-auto"
							>
								<DropdownMenuLabel className="text-subtle-foreground text-xs font-semibold tracking-wide uppercase">
									Standard sections
								</DropdownMenuLabel>
								{CARE_PLAN_SECTIONS.filter(
									(standard) => !usedTitles.has(standard.title),
								).map((standard) => (
									<DropdownMenuItem
										key={standard.title}
										onSelect={() =>
											sections.append({
												...EMPTY_SECTION,
												title: standard.title,
											})
										}
									>
										{standard.title}
									</DropdownMenuItem>
								))}
								<DropdownMenuSeparator />
								<DropdownMenuItem
									onSelect={() => sections.append(EMPTY_SECTION)}
								>
									Blank section
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>

					<Card
						id="risk-assessments"
						aria-labelledby="risk-assessments-heading"
						className="scroll-mt-6"
					>
						<CardHeader>
							<CardTitle id="risk-assessments-heading">
								Risk assessments
							</CardTitle>
							<CardAction>
								<Button
									type="button"
									variant="outline"
									onClick={() => risks.append({ name: '', level: 'LOW' })}
								>
									<PlusIcon strokeWidth={1.75} />
									Add
								</Button>
							</CardAction>
						</CardHeader>
						<CardContent>
							{risks.fields.map((risk, index) => (
								<div
									key={risk.id}
									className="grid items-end gap-2 sm:grid-cols-[minmax(0,1fr)_160px_auto]"
								>
									<div className="flex flex-col gap-1">
										<Label htmlFor={`risk-${index}`} className="sr-only">
											Assessment {index + 1}
										</Label>
										<Input
											id={`risk-${index}`}
											placeholder="Falls"
											{...form.register(`risk_assessments.${index}.name`)}
										/>
									</div>
									<div className="flex flex-col gap-1">
										<Label htmlFor={`risk-${index}-level`} className="sr-only">
											Level
										</Label>
										<NativeSelect
											id={`risk-${index}-level`}
											{...form.register(`risk_assessments.${index}.level`)}
										>
											<option value="LOW">Low</option>
											<option value="MEDIUM">Medium</option>
											<option value="HIGH">High</option>
										</NativeSelect>
									</div>
									<Button
										type="button"
										variant="ghost"
										size="icon"
										aria-label={`Remove assessment ${index + 1}`}
										onClick={() => risks.remove(index)}
									>
										<XIcon />
									</Button>
								</div>
							))}
							{!risks.fields.length ? (
								<p className="text-muted-foreground m-0 text-sm">
									No risk assessments.
								</p>
							) : null}
						</CardContent>
					</Card>

					{form.formState.errors.sections?.root?.message ? (
						<p className="text-destructive m-0 text-sm">
							{form.formState.errors.sections.root.message}
						</p>
					) : null}

					<div className="bg-card sticky bottom-0 -mx-4 flex flex-wrap items-center justify-end gap-2 border-t px-4 py-4 md:-mx-8 md:px-8">
						<Link
							to={plan ? `/care-plans/${plan.id}` : '/care-plans'}
							className={buttonVariants({ variant: 'outline' })}
						>
							Cancel
						</Link>
						{buttons.map((button) => (
							<Button
								key={button.intent}
								type="button"
								variant={button.primary ? 'default' : 'outline'}
								disabled={isSubmitting}
								onClick={() => void submit(button.intent)}
							>
								{isSubmitting && intent === button.intent ? (
									<LoaderCircleIcon className="animate-spin" />
								) : null}
								{button.label}
							</Button>
						))}
					</div>
				</form>
			</FormProvider>
		</>
	)
}
