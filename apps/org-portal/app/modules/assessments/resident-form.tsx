import dayjs from 'dayjs'
import {
	AlertCircleIcon,
	ArrowLeftIcon,
	CheckCircle2Icon,
	ClipboardPlusIcon,
	LoaderCircleIcon,
	PrinterIcon,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useFetcher, useLoaderData } from 'react-router'
import { AssessmentBlocks } from './form-blocks'
import { Alert } from '~/components/ui/alert'
import { Badge } from '~/components/ui/badge'
import { Button, buttonVariants } from '~/components/ui/button'
import { findAssessmentTemplate } from '~/lib/assessment-templates'
import {
	getAssessmentStatus,
	getProgress,
	getUnansweredIds,
} from '~/lib/assessment.utils'
import { formatLongDate } from '~/lib/date'
import { toJsonPayload } from '~/lib/json'
import type {
	action,
	loader,
} from '~/routes/_auth._dashboard.residents.$residentId.assessments_.$code'

function carePlanLink(
	residentId: string,
	carePlanId: Nullable<string>,
	code: string,
) {
	return carePlanId
		? `/care-plans/${carePlanId}/edit?from_assessment=${code}`
		: `/care-plans/new?resident=${residentId}&from_assessment=${code}`
}

export function ResidentAssessmentModule() {
	const { residentId, carePlanId, code, assessment } =
		useLoaderData<typeof loader>()
	const template = findAssessmentTemplate(code)
	const fetcher = useFetcher<typeof action>()
	const [answers, setAnswers] = useState<AssessmentAnswers>(
		assessment?.answers ?? {},
	)
	const [unanswered, setUnanswered] = useState<Set<string>>(new Set())
	const [intent, setIntent] = useState<AssessmentStatus>('DRAFT')

	const saved =
		fetcher.state === 'idle' && fetcher.data && 'assessment' in fetcher.data
			? fetcher.data.assessment
			: null
	const current = saved ?? assessment

	useEffect(() => {
		if (!unanswered.size) return
		document
			.querySelector('[data-unanswered="true"]')
			?.scrollIntoView({ behavior: 'smooth', block: 'center' })
	}, [unanswered])

	if (!template) return null

	const progress = getProgress(template, answers)
	const status = getAssessmentStatus(current)
	const isSubmitting = fetcher.state !== 'idle'

	const onChange = (blockId: string, value: AssessmentAnswer) => {
		setAnswers((prev) => ({ ...prev, [blockId]: value }))
		if (unanswered.size)
			setUnanswered(
				new Set(getUnansweredIds(template, { ...answers, [blockId]: value })),
			)
	}

	const save = (next: AssessmentStatus) => {
		if (next === 'COMPLETED') {
			const missing = getUnansweredIds(template, answers)
			if (missing.length) {
				setUnanswered(new Set(missing))
				return
			}
		}
		setUnanswered(new Set())
		setIntent(next)
		const input: SaveAssessmentInput = { status: next, answers }
		void fetcher.submit(toJsonPayload(input), {
			method: 'post',
			encType: 'application/json',
		})
	}

	return (
		<>
			<div className="flex flex-wrap items-start justify-between gap-4">
				<div className="min-w-0">
					<p className="text-muted-foreground m-0 font-mono text-[13px]">
						Form {template.code}
					</p>
					<h2 className="m-0 text-xl leading-7 font-semibold">
						{template.title}
					</h2>
					<p className="text-muted-foreground m-0 mt-1 flex flex-wrap items-center gap-2 text-sm">
						<Badge tone={status.tone}>{status.label}</Badge>
						{current?.status === 'COMPLETED' && current.completed_at
							? `Completed ${formatLongDate(current.completed_at)} by ${current.completed_by}`
							: current
								? `Last saved ${dayjs(current.updated_at).format('D MMM, HH:mm')} by ${current.updated_by}`
								: 'Not started'}
						{progress.total
							? ` · ${progress.answered} of ${progress.total} questions answered`
							: ''}
					</p>
				</div>
				<div className="flex flex-wrap items-center gap-2 print:hidden">
					<Link
						to={`/residents/${residentId}/assessments`}
						className={buttonVariants({ variant: 'outline' })}
					>
						<ArrowLeftIcon strokeWidth={1.75} />
						All assessments
					</Link>
					<Button variant="outline" onClick={() => window.print()}>
						<PrinterIcon strokeWidth={1.75} />
						Print
					</Button>
				</div>
			</div>

			{unanswered.size ? (
				<Alert tone="warning" className="items-center">
					<AlertCircleIcon />
					<span>
						{unanswered.size === 1
							? '1 question still needs a Yes or No'
							: `${unanswered.size} questions still need a Yes or No`}{' '}
						before you can mark this complete. They are highlighted.
					</span>
				</Alert>
			) : null}
			{fetcher.data && 'error' in fetcher.data ? (
				<Alert tone="critical">
					<AlertCircleIcon />
					<span>{fetcher.data.error}</span>
				</Alert>
			) : null}
			{saved ? (
				<Alert tone="success" className="items-center">
					<CheckCircle2Icon />
					<span className="flex-1">
						{saved.status === 'COMPLETED'
							? 'Assessment completed.'
							: 'Draft saved.'}
					</span>
					{saved.status === 'COMPLETED' && template.care_plan_section ? (
						<Link
							to={carePlanLink(residentId, carePlanId, template.code)}
							className="font-semibold text-current underline underline-offset-4"
						>
							Use in care plan
						</Link>
					) : null}
				</Alert>
			) : null}

			<AssessmentBlocks
				template={template}
				answers={answers}
				onChange={onChange}
				unanswered={unanswered}
			/>

			<div className="bg-card sticky bottom-0 -mx-4 flex flex-wrap items-center justify-end gap-2 border-t px-4 py-4 md:-mx-8 md:px-8 print:hidden">
				{current?.status === 'COMPLETED' &&
				template.care_plan_section &&
				!saved ? (
					<Link
						to={carePlanLink(residentId, carePlanId, template.code)}
						className={`${buttonVariants({ variant: 'outline' })} mr-auto`}
					>
						<ClipboardPlusIcon strokeWidth={1.75} />
						Use in care plan
					</Link>
				) : null}
				{current?.status !== 'COMPLETED' ? (
					<Button
						variant="outline"
						disabled={isSubmitting}
						onClick={() => save('DRAFT')}
					>
						{isSubmitting && intent === 'DRAFT' ? (
							<LoaderCircleIcon className="animate-spin" />
						) : null}
						Save draft
					</Button>
				) : null}
				<Button disabled={isSubmitting} onClick={() => save('COMPLETED')}>
					{isSubmitting && intent === 'COMPLETED' ? (
						<LoaderCircleIcon className="animate-spin" />
					) : null}
					{current?.status === 'COMPLETED' ? 'Save changes' : 'Mark complete'}
				</Button>
			</div>
		</>
	)
}
