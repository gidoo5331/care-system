import { PlusIcon } from 'lucide-react'
import { Link } from 'react-router'
import { Badge } from '~/components/ui/badge'
import { buttonVariants } from '~/components/ui/button'
import { Card, CardAction, CardHeader, CardTitle } from '~/components/ui/card'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '~/components/ui/table'
import { getDoseDetail } from '~/lib/medication.utils'
import { cn } from '~/lib/utils'

const DOSE_STYLE: Record<DoseStatus, { label: string; className: string }> = {
	GIVEN: { label: 'Given', className: 'bg-success-tint text-success-ink' },
	MISSED: { label: 'Missed', className: 'bg-critical-tint text-critical-ink' },
	REFUSED: { label: 'Refused', className: 'bg-info-tint text-info-ink' },
	DUE: {
		label: 'Due',
		className:
			'border-border-strong text-muted-foreground border border-dashed',
	},
}

function DoseTile({ dose }: { dose: ScheduledDose }) {
	const style = DOSE_STYLE[dose.status]
	return (
		<div
			className={cn(
				'w-[88px] rounded-lg px-2 py-1.5 text-[13px] leading-[18px]',
				style.className,
			)}
		>
			<b className="block font-semibold">{style.label}</b>
			{/* "in 2 h" depends on the viewer's clock. */}
			<span className="block min-h-[18px]" suppressHydrationWarning>
				{getDoseDetail(dose)}
			</span>
		</div>
	)
}

function EmptySlot() {
	return (
		<span aria-label="Not scheduled" className="text-subtle-foreground">
			–
		</span>
	)
}

interface Props {
	residentId: string
	roundTimes: StringList
	medications: Array<ResidentMedication>
}

export function MedicationToday({
	residentId,
	roundTimes,
	medications,
}: Props) {
	const medicationPath = `/residents/${residentId}/medication`

	return (
		<Card aria-labelledby="medication-today">
			<CardHeader>
				<CardTitle id="medication-today">Medication today</CardTitle>
				<CardAction>
					<Link
						to={`/medication/prescriptions/new?resident=${residentId}`}
						className={buttonVariants({ variant: 'outline' })}
					>
						<PlusIcon strokeWidth={1.75} />
						Add prescription
					</Link>
				</CardAction>
			</CardHeader>

			{medications.length ? (
				<Table className="min-w-[700px]">
					<TableHeader>
						<TableRow>
							<TableHead>Medicine</TableHead>
							{roundTimes.map((time) => (
								<TableHead key={time}>{time}</TableHead>
							))}
						</TableRow>
					</TableHeader>
					<TableBody>
						{medications.map((medication) => (
							<TableRow key={medication.id}>
								<TableCell>
									<span className="flex flex-wrap items-center gap-2 font-medium">
										{medication.name}
										{medication.is_as_needed ? (
											<Badge tone="info">As needed</Badge>
										) : null}
									</span>
									<span className="text-muted-foreground block text-[13px] leading-[18px]">
										{medication.instructions}
									</span>
								</TableCell>

								{medication.is_as_needed ? (
									<>
										<TableCell
											colSpan={Math.max(roundTimes.length - 1, 1)}
											className="text-muted-foreground text-sm"
										>
											{medication.last_given_label}
										</TableCell>
										<TableCell>
											<Link
												to={medicationPath}
												className="text-primary hover:text-primary-hover text-sm font-medium"
											>
												Give dose
											</Link>
										</TableCell>
									</>
								) : (
									roundTimes.map((time) => {
										const dose = medication.doses.find((d) => d.time === time)
										return (
											<TableCell key={time}>
												{dose ? <DoseTile dose={dose} /> : <EmptySlot />}
											</TableCell>
										)
									})
								)}
							</TableRow>
						))}
					</TableBody>
				</Table>
			) : (
				<p className="text-muted-foreground m-0 px-6 py-8 text-sm">
					No medication prescribed.
				</p>
			)}
		</Card>
	)
}
