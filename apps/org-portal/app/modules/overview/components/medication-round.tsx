import { Link } from 'react-router'
import { buttonVariants } from '~/components/ui/button'
import {
	Card,
	CardAction,
	CardContent,
	CardHeader,
	CardTitle,
} from '~/components/ui/card'
import { cn } from '~/lib/utils'

interface Props {
	round: OverviewMedicationRound
}

const TILES = [
	{
		key: 'given',
		label: 'Given',
		className: 'bg-success-tint text-success-ink',
	},
	{
		key: 'due',
		label: 'Still due',
		className: 'bg-warning-tint text-warning-ink',
	},
	{ key: 'refused', label: 'Refused', className: 'bg-info-tint text-info-ink' },
	{
		key: 'missed',
		label: 'Missed',
		className: 'bg-critical-tint text-critical-ink',
	},
] as const

export function MedicationRound({ round }: Props) {
	const completed = round.total_doses - round.due
	const percent = round.total_doses
		? Math.round((completed / round.total_doses) * 100)
		: 0

	return (
		<Card aria-labelledby="medication-round">
			<CardHeader>
				<CardTitle id="medication-round">{round.name}</CardTitle>
				<CardAction>
					<Link
						to="/medication"
						className={buttonVariants({ variant: 'outline' })}
					>
						Open
					</Link>
				</CardAction>
			</CardHeader>
			<CardContent>
				<p className="text-muted-foreground m-0 text-sm">
					{round.window} · {round.total_doses} doses
				</p>
				<div
					role="progressbar"
					aria-label="Round progress"
					aria-valuenow={percent}
					aria-valuemin={0}
					aria-valuemax={100}
					className="bg-border h-2 overflow-hidden rounded-full"
				>
					<div
						className="bg-primary h-full rounded-full"
						style={{ width: `${percent}%` }}
					/>
				</div>
				<div className="grid grid-cols-2 gap-2">
					{TILES.map((tile) => (
						<div
							key={tile.key}
							className={cn('rounded-lg px-4 py-3', tile.className)}
						>
							<p className="m-0 text-[22px] leading-7 font-semibold">
								{round[tile.key]}
							</p>
							<p className="m-0 text-[13px] leading-[18px]">{tile.label}</p>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	)
}
