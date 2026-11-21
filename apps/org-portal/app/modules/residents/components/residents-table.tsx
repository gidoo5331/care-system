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
	getAllergiesLabel,
	getCarePlanStatus,
	getLatestNoteLabel,
	getResidentAge,
	getResidentName,
	getResidentPlace,
	getResidentServiceLabel,
	getRiskLabel,
	getRiskTone,
} from '~/lib/resident.utils'
import { getInitials } from '~/lib/strings'

const COLUMNS = [
	'Name',
	'Room or area',
	'Service',
	'Risk',
	'Allergies',
	'Care plan',
	'Latest note',
]

const SKELETON_ROWS = 8

interface Props {
	residents?: Array<Resident>
	isLoading: boolean
	error: Nullable<Error>
	onRetry: () => void
}

function StatusCell({
	label,
	tone,
}: {
	label: string
	tone: Nullable<StatusTone>
}) {
	if (!tone || tone === 'neutral') {
		return <span className="text-muted-foreground">{label}</span>
	}
	return <Badge tone={tone}>{label}</Badge>
}

function ResidentRow({ resident }: { resident: Resident }) {
	const name = getResidentName(resident)
	const carePlan = getCarePlanStatus(resident)

	return (
		<TableRow>
			<TableCell>
				<Link
					to={`/residents/${resident.id}`}
					className="text-foreground group flex items-center gap-3 no-underline"
				>
					<Avatar size="sm" initials={getInitials(name)} />
					<span className="min-w-0">
						<span className="group-hover:text-primary block font-medium">
							{name}
						</span>
						<span className="text-muted-foreground block text-[13px] leading-[18px]">
							{getResidentAge(resident)} yrs · {resident.code}
						</span>
					</span>
				</Link>
			</TableCell>
			<TableCell>
				<span className="text-muted-foreground">
					{getResidentPlace(resident)}
				</span>
			</TableCell>
			<TableCell>{getResidentServiceLabel(resident)}</TableCell>
			<TableCell>
				<StatusCell
					label={getRiskLabel(resident)}
					tone={getRiskTone(resident.risk_level)}
				/>
			</TableCell>
			<TableCell>{getAllergiesLabel(resident)}</TableCell>
			<TableCell>
				<StatusCell label={carePlan.label} tone={carePlan.tone} />
			</TableCell>
			<TableCell>
				<span className="text-muted-foreground">
					{getLatestNoteLabel(resident)}
				</span>
			</TableCell>
		</TableRow>
	)
}

function LoadingRows() {
	return Array.from({ length: SKELETON_ROWS }, (_, index) => (
		<TableRow key={index}>
			<TableCell>
				<span className="flex items-center gap-3">
					<Skeleton className="size-9 rounded-full" />
					<span className="flex flex-col gap-1.5">
						<Skeleton className="h-4 w-32" />
						<Skeleton className="h-3 w-20" />
					</span>
				</span>
			</TableCell>
			{COLUMNS.slice(1).map((column) => (
				<TableCell key={column}>
					<Skeleton className="h-4 w-20" />
				</TableCell>
			))}
		</TableRow>
	))
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

export function ResidentsTable({
	residents,
	isLoading,
	error,
	onRetry,
}: Props) {
	return (
		<Table className="min-w-[980px]">
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
						<span>We couldn’t load residents. {error.message}</span>
						<Button variant="outline" onClick={onRetry}>
							Try again
						</Button>
					</MessageRow>
				) : isLoading && !residents ? (
					<LoadingRows />
				) : residents?.length ? (
					residents.map((resident) => (
						<ResidentRow key={resident.id} resident={resident} />
					))
				) : (
					<MessageRow>
						<SearchXIcon className="size-6" />
						<span>No residents or clients match these filters.</span>
					</MessageRow>
				)}
			</TableBody>
		</Table>
	)
}
