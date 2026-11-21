import { ClipboardListIcon } from 'lucide-react'
import { Link, useLoaderData, useParams } from 'react-router'
import { LatestReadings } from '../summary/latest-readings'
import { Badge } from '~/components/ui/badge'
import { buttonVariants } from '~/components/ui/button'
import {
	Card,
	CardAction,
	CardContent,
	CardHeader,
	CardTitle,
} from '~/components/ui/card'
import { ASSESSMENT_TEMPLATES } from '~/lib/assessment-templates'
import { getAssessmentStatus, getProgress } from '~/lib/assessment.utils'
import { formatShortDate } from '~/lib/date'
import { getRiskLevelLabel, getRiskTone } from '~/lib/resident.utils'
import type { loader } from '~/routes/_auth._dashboard.residents.$residentId.assessments'

function Booklet({
	residentId,
	assessments,
}: {
	residentId: string
	assessments: Array<ResidentAssessment>
}) {
	const byCode = new Map(assessments.map((a) => [a.template_code, a]))
	const completed = assessments.filter((a) => a.status === 'COMPLETED').length

	return (
		<Card aria-labelledby="booklet">
			<CardHeader>
				<CardTitle id="booklet">Client assessment booklet</CardTitle>
				<CardAction>
					<span className="text-muted-foreground text-sm">
						{completed} of {ASSESSMENT_TEMPLATES.length} completed
					</span>
				</CardAction>
			</CardHeader>
			<ul className="m-0 list-none p-0">
				{ASSESSMENT_TEMPLATES.map((template) => {
					const assessment = byCode.get(template.code)
					const status = getAssessmentStatus(assessment)
					const progress = assessment
						? getProgress(template, assessment.answers)
						: null
					return (
						<li
							key={template.code}
							className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b px-6 py-3 last:border-b-0"
						>
							<span className="text-muted-foreground w-16 shrink-0 font-mono text-[13px]">
								{template.code}
							</span>
							<span className="min-w-0 flex-1 basis-48">
								<span className="block text-[15px] font-medium">
									{template.short_title}
								</span>
								<span className="text-muted-foreground block text-[13px] leading-[18px]">
									{assessment?.status === 'COMPLETED' && assessment.completed_at
										? `${formatShortDate(assessment.completed_at)} · ${assessment.completed_by}`
										: progress?.total
											? `${progress.answered} of ${progress.total} answered`
											: template.description}
								</span>
							</span>
							<Badge tone={status.tone}>{status.label}</Badge>
							<Link
								to={`/residents/${residentId}/assessments/${template.code}`}
								aria-label={`${assessment ? (assessment.status === 'COMPLETED' ? 'View' : 'Continue') : 'Start'} ${template.title}`}
								className={buttonVariants({
									variant: assessment ? 'outline' : 'default',
									size: 'sm',
								})}
							>
								{assessment
									? assessment.status === 'COMPLETED'
										? 'View'
										: 'Continue'
									: 'Start'}
							</Link>
						</li>
					)
				})}
			</ul>
		</Card>
	)
}

export function ResidentAssessmentsModule() {
	const { plan, summary, assessments } = useLoaderData<typeof loader>()
	const { residentId = '' } = useParams()

	return (
		<div className="flex flex-wrap items-start gap-6">
			<div className="flex min-w-0 flex-[999_1_560px] flex-col gap-6">
				<Booklet residentId={residentId} assessments={assessments} />
				<Card aria-labelledby="risk-assessments">
					<CardHeader>
						<CardTitle id="risk-assessments">Risk assessments</CardTitle>
						{plan ? (
							<CardAction>
								<Link
									to={`/care-plans/${plan.id}/edit#risk-assessments`}
									className={buttonVariants({ variant: 'outline' })}
								>
									Update
								</Link>
							</CardAction>
						) : null}
					</CardHeader>
					<CardContent>
						{plan?.risk_assessments.length ? (
							<>
								<p className="text-muted-foreground m-0 text-sm">
									From care plan version {plan.version}
									{plan.last_reviewed_at
										? `, reviewed ${formatShortDate(plan.last_reviewed_at)}`
										: ''}
								</p>
								<ul className="m-0 list-none divide-y rounded-lg border p-0">
									{plan.risk_assessments.map((assessment) => (
										<li
											key={assessment.id}
											className="flex flex-wrap items-center justify-between gap-2 px-4 py-3"
										>
											<span className="text-[15px]">{assessment.name}</span>
											<Badge tone={getRiskTone(assessment.level)}>
												{getRiskLevelLabel(assessment.level)}
											</Badge>
										</li>
									))}
								</ul>
							</>
						) : (
							<div className="text-muted-foreground flex flex-col items-start gap-3 text-sm">
								<span className="flex items-center gap-2">
									<ClipboardListIcon className="size-5" />
									Risk assessments are part of the care plan, and there isn’t
									one yet.
								</span>
								<Link
									to={`/care-plans/new?resident=${residentId}`}
									className={buttonVariants()}
								>
									Write care plan
								</Link>
							</div>
						)}
					</CardContent>
				</Card>
			</div>
			<div className="flex min-w-0 flex-[1_1_320px] flex-col gap-6">
				<LatestReadings latestReadings={summary.latest_readings} />
			</div>
		</div>
	)
}
