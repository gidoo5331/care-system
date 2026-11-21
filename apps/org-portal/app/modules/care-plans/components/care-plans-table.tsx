import { AlertCircleIcon, SearchXIcon } from 'lucide-react'
import { Link } from 'react-router'
import { Avatar } from '~/components/ui/avatar'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Skeleton } from '~/components/ui/skeleton'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '~/components/ui/table'
import {
	getCarePlanResidentPlace,
	getCarePlanStatusLabel,
	getCarePlanStatusTone,
	getNextReviewLabel,
} from '~/lib/care-plan.utils'
import { formatShortDate } from '~/lib/date'
import { getInitials } from '~/lib/strings'

const COLUMNS = [
	'Resident',
	'Version',
	'Status',
	'Last review',
	'Next review',
	'Written by',
]

interface Props {
	carePlans?: Array<CarePlan>
	isLoading: boolean
	error: Nullable<Error>
	onRetry: () => void
}

function MessageRow({ children }: { children: React.ReactNode }) {
	return (
		<TableRow>
			<TableCell colSpan={COLUMNS.length} className="h-48">
				<div className="text-muted-foreground flex flex-col items-center gap-3 text-center text-sm">
					{children}
				</div>
			</TableCell>
		</TableRow>
	)
}

function CarePlanRow({ plan }: { plan: CarePlan }) {
	const name = `${plan.resident.first_name} ${plan.resident.last_name}`
	const nextReview = getNextReviewLabel(plan)

	return (
		<TableRow>
			<TableCell>
				<Link
					to={`/care-plans/${plan.id}`}
					className="text-foreground group flex items-center gap-3 no-underline"
				>
					<Avatar size="sm" initials={getInitials(name)} />
					<span className="min-w-0">
						<span className="group-hover:text-primary block font-medium">
							{name}
						</span>
						<span className="text-muted-foreground block text-[13px] leading-[18px]">
							{getCarePlanResidentPlace(plan.resident)}
						</span>
					</span>
				</Link>
			</TableCell>
			<TableCell>Version {plan.version}</TableCell>
			<TableCell>
				<Badge tone={getCarePlanStatusTone(plan.status)}>
					{getCarePlanStatusLabel(plan.status)}
				</Badge>
			</TableCell>
			<TableCell className="text-muted-foreground">
				{plan.last_reviewed_at ? formatShortDate(plan.last_reviewed_at) : '–'}
			</TableCell>
			<TableCell>
				{nextReview.tone ? (
					<Badge tone={nextReview.tone}>{nextReview.label}</Badge>
				) : (
					<span className="text-muted-foreground">{nextReview.label}</span>
				)}
			</TableCell>
			<TableCell className="text-muted-foreground">{plan.written_by}</TableCell>
		</TableRow>
	)
}

export function CarePlansTable({
	carePlans,
	isLoading,
	error,
	onRetry,
}: Props) {
	return (
		<Table className="min-w-[860px]">
			<TableHeader>
				<TableRow>
					{COLUMNS.map((column) => (
						<TableHead key={column}>{column}</TableHead>
					))}
				</TableRow>
			</TableHeader>
			<TableBody>
				{error ? (
					<MessageRow>
						<AlertCircleIcon className="text-critical size-6" />
						<span>We couldn’t load care plans. {error.message}</span>
						<Button variant="outline" onClick={onRetry}>
							Try again
						</Button>
					</MessageRow>
				) : isLoading && !carePlans ? (
					Array.from({ length: 6 }, (_, index) => (
						<TableRow key={index}>
							{COLUMNS.map((column) => (
								<TableCell key={column}>
									<Skeleton className="h-4 w-24" />
								</TableCell>
							))}
						</TableRow>
					))
				) : carePlans?.length ? (
					carePlans.map((plan) => <CarePlanRow key={plan.id} plan={plan} />)
				) : (
					<MessageRow>
						<SearchXIcon className="size-6" />
						<span>No care plans match.</span>
					</MessageRow>
				)}
			</TableBody>
		</Table>
	)
}
