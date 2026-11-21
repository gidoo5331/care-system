import { AlertCircleIcon, PillIcon } from 'lucide-react'
import { Link } from 'react-router'
import { Avatar } from '~/components/ui/avatar'
import { Badge } from '~/components/ui/badge'
import { Button, buttonVariants } from '~/components/ui/button'
import { Skeleton } from '~/components/ui/skeleton'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '~/components/ui/table'
import { formatMedicineList, getRoundRowStatus } from '~/lib/medication.utils'
import { getInitials } from '~/lib/strings'

const COLUMNS = ['Resident', 'Medicines', 'Status', 'Given by', 'Time', '']

interface Props {
	rows?: Array<MedicationRoundRow>
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

export function RoundTable({ rows, isLoading, error, onRetry }: Props) {
	return (
		<Table className="min-w-[860px]">
			<TableHeader>
				<TableRow>
					{COLUMNS.map((column, index) => (
						<TableHead key={column || index}>
							{column || <span className="sr-only">Actions</span>}
						</TableHead>
					))}
				</TableRow>
			</TableHeader>
			<TableBody>
				{error ? (
					<MessageRow>
						<AlertCircleIcon className="text-critical size-6" />
						<span>We couldn’t load this round. {error.message}</span>
						<Button variant="outline" onClick={onRetry}>
							Try again
						</Button>
					</MessageRow>
				) : isLoading && !rows ? (
					Array.from({ length: 5 }, (_, index) => (
						<TableRow key={index}>
							{COLUMNS.map((column, cell) => (
								<TableCell key={column || cell}>
									<Skeleton className="h-4 w-24" />
								</TableCell>
							))}
						</TableRow>
					))
				) : rows?.length ? (
					rows.map((row) => {
						const status = getRoundRowStatus(row)
						const profilePath = `/residents/${row.resident_id}`
						return (
							<TableRow key={row.resident_id}>
								<TableCell>
									<Link
										to={profilePath}
										className="text-foreground group flex items-center gap-3 no-underline"
									>
										<Avatar
											size="sm"
											initials={getInitials(row.resident_name)}
										/>
										<span className="min-w-0">
											<span className="group-hover:text-primary block font-medium">
												{row.resident_name}
											</span>
											<span className="text-muted-foreground block text-[13px] leading-[18px]">
												{row.room ? `Room ${row.room}` : '—'}
											</span>
										</span>
									</Link>
								</TableCell>
								<TableCell title={row.medicines.join(', ')}>
									{formatMedicineList(row.medicines)}
								</TableCell>
								<TableCell>
									<Badge tone={status.tone}>{status.label}</Badge>
								</TableCell>
								<TableCell className="text-muted-foreground">
									{row.given_by ?? '–'}
								</TableCell>
								<TableCell className="text-muted-foreground">
									{row.given_at ?? '–'}
								</TableCell>
								<TableCell className="text-right">
									<Link
										to={profilePath}
										aria-label={`Open ${row.resident_name}'s medication`}
										className={buttonVariants({ variant: 'outline' })}
									>
										Open
									</Link>
								</TableCell>
							</TableRow>
						)
					})
				) : (
					<MessageRow>
						<PillIcon className="size-6" />
						<span>No medicines are due at this round on this floor.</span>
					</MessageRow>
				)}
			</TableBody>
		</Table>
	)
}
