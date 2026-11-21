import { ClockAlertIcon, PencilIcon } from 'lucide-react'
import { Link } from 'react-router'
import { Alert } from '~/components/ui/alert'
import { Avatar } from '~/components/ui/avatar'
import { Badge } from '~/components/ui/badge'
import { buttonVariants } from '~/components/ui/button'
import {
	Card,
	CardAction,
	CardContent,
	CardHeader,
	CardTitle,
} from '~/components/ui/card'
import { getCarePlanPronouns } from '~/lib/care-plan.utils'
import { daysUntil, formatLongDate } from '~/lib/date'
import { getRiskLevelLabel, getRiskTone } from '~/lib/resident.utils'
import { getInitials } from '~/lib/strings'

interface Props {
	plan: CarePlan
}

function ReviewBanner({ plan }: Props) {
	if (plan.status !== 'ACTIVE' || !plan.next_review_at) return null
	const days = daysUntil(plan.next_review_at)
	if (days === null || days > 0) return null

	const dueOn = formatLongDate(plan.next_review_at)
	const message =
		days === 0
			? 'Review is due today.'
			: `Review is ${Math.abs(days)} ${Math.abs(days) === 1 ? 'day' : 'days'} overdue. It was due on ${dueOn}.`

	return (
		<Alert tone="warning" className="items-center">
			<ClockAlertIcon />
			<span>
				<b className="font-semibold">{message}</b>
			</span>
		</Alert>
	)
}

function Field({ label, children }: { label: string; children: string }) {
	return (
		<div className="flex min-w-0 flex-col gap-1">
			<dt className="text-muted-foreground text-[13px] leading-[18px]">
				{label}
			</dt>
			<dd className="m-0 text-[15px] leading-[22px]">{children}</dd>
		</div>
	)
}

function SectionCard({ plan, section }: Props & { section: CarePlanSection }) {
	const pronouns = getCarePlanPronouns(plan.resident.gender)
	const headingId = `section-${section.id}`

	return (
		<Card aria-labelledby={headingId}>
			<CardHeader>
				<CardTitle id={headingId}>{section.title}</CardTitle>
				<CardAction>
					<Link
						to={`/care-plans/${plan.id}/sections/${section.id}`}
						aria-label={`Edit ${section.title}`}
						className={buttonVariants({ variant: 'outline' })}
					>
						<PencilIcon strokeWidth={1.75} />
						Edit
					</Link>
				</CardAction>
			</CardHeader>
			<CardContent>
				<dl className="m-0 flex flex-col gap-4">
					<Field label={pronouns.needs}>{section.needs}</Field>
					<Field label="What we want to achieve">{section.goal}</Field>
					<Field label={pronouns.support}>{section.support}</Field>
				</dl>
				{section.tasks.length ? (
					<div>
						<p className="text-muted-foreground mt-0 mb-2 text-[13px] leading-[18px]">
							Daily tasks
						</p>
						<ul className="m-0 list-none divide-y rounded-lg border p-0">
							{section.tasks.map((task) => (
								<li
									key={task.id}
									className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-3 text-[15px]"
								>
									<span>{task.description}</span>
									<span className="text-muted-foreground text-sm">
										{task.frequency}
									</span>
								</li>
							))}
						</ul>
					</div>
				) : null}
			</CardContent>
		</Card>
	)
}

function ReviewHistory({ plan }: Props) {
	return (
		<Card aria-labelledby="review-history">
			<CardHeader>
				<CardTitle id="review-history">Review history</CardTitle>
			</CardHeader>
			<CardContent>
				{plan.reviews.length ? (
					<ol className="m-0 flex list-none flex-col gap-4 p-0">
						{plan.reviews.map((review) => (
							<li key={review.id} className="flex items-center gap-3">
								<Avatar size="sm" initials={getInitials(review.reviewed_by)} />
								<span className="min-w-0">
									<span className="block text-[15px] leading-[22px] font-medium">
										Version {review.version} · approved
									</span>
									<span className="text-muted-foreground block text-[13px] leading-[18px]">
										{review.reviewed_by} · {formatLongDate(review.reviewed_at)}
									</span>
								</span>
							</li>
						))}
					</ol>
				) : (
					<p className="text-muted-foreground m-0 text-sm">Not approved yet.</p>
				)}
			</CardContent>
		</Card>
	)
}

function RiskAssessments({ plan }: Props) {
	return (
		<Card aria-labelledby="risk-assessments">
			<CardHeader>
				<CardTitle id="risk-assessments">Risk assessments</CardTitle>
				<CardAction>
					<Link
						to={`/care-plans/${plan.id}/risk-assessments/new`}
						className={buttonVariants({ variant: 'outline' })}
					>
						Add
					</Link>
				</CardAction>
			</CardHeader>
			<CardContent>
				<ul className="m-0 flex list-none flex-col gap-3 p-0">
					{plan.risk_assessments.map((assessment) => (
						<li
							key={assessment.id}
							className="flex flex-wrap items-center justify-between gap-2"
						>
							<span className="text-[15px] leading-[22px]">
								{assessment.name}
							</span>
							<Badge tone={getRiskTone(assessment.level)}>
								{getRiskLevelLabel(assessment.level)}
							</Badge>
						</li>
					))}
				</ul>
			</CardContent>
		</Card>
	)
}

export function CarePlanView({ plan }: Props) {
	return (
		<>
			<ReviewBanner plan={plan} />
			<div className="flex flex-wrap items-start gap-6">
				<div className="flex min-w-0 flex-[999_1_560px] flex-col gap-6">
					{plan.sections.map((section) => (
						<SectionCard key={section.id} plan={plan} section={section} />
					))}
				</div>
				<div className="flex min-w-0 flex-[1_1_320px] flex-col gap-6">
					<ReviewHistory plan={plan} />
					<RiskAssessments plan={plan} />
				</div>
			</div>
		</>
	)
}
