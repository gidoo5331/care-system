import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { Avatar } from '~/components/ui/avatar'
import { getInitials } from '~/lib/strings'
import { cn } from '~/lib/utils'
import {
	getTimelinePosition,
	getVisitEndTime,
	getVisitStatus,
	TIMELINE_END_HOUR,
	TIMELINE_HOURS,
	TIMELINE_START_HOUR,
} from '~/lib/visit.utils'

const LEGEND: ReadonlyArray<VisitStatus> = [
	'DONE',
	'IN_PROGRESS',
	'LATE',
	'UPCOMING',
]

function useNowPosition() {
	const [position, setPosition] = useState<number | null>(null)

	useEffect(() => {
		const update = () => {
			const now = dayjs()
			const minutes = now.hour() * 60 + now.minute() - TIMELINE_START_HOUR * 60
			const total = (TIMELINE_END_HOUR - TIMELINE_START_HOUR) * 60
			setPosition(
				minutes >= 0 && minutes <= total ? (minutes / total) * 100 : null,
			)
		}
		update()
		const timer = setInterval(update, 60_000)
		return () => clearInterval(timer)
	}, [])

	return position
}

function VisitBlock({ visit }: { visit: Visit }) {
	const { left, width } = getTimelinePosition(visit)
	const status = getVisitStatus(visit.status)
	if (width <= 0) return null

	const label = `${visit.client_name}, ${visit.start_time} to ${getVisitEndTime(visit)}, ${visit.task}. ${status.label}.`

	return (
		<span
			title={label}
			aria-label={label}
			role="listitem"
			className={cn(
				'absolute top-2 bottom-2 flex items-center overflow-hidden rounded-md border px-2 text-[13px] leading-[18px] font-medium whitespace-nowrap',
				status.className,
			)}
			style={{ left: `calc(${left}% + 2px)`, width: `calc(${width}% - 4px)` }}
		>
			<span className="truncate">{visit.client_name}</span>
		</span>
	)
}

export function CarerTimeline({ carers }: { carers: Array<VisitCarer> }) {
	const nowPosition = useNowPosition()

	return (
		<div className="overflow-x-auto">
			<div className="min-w-[960px]">
				<div className="bg-background grid grid-cols-[200px_minmax(0,1fr)] border-b">
					<span className="text-muted-foreground px-4 py-3 text-[13px] font-medium">
						Carer
					</span>
					<div
						className="grid"
						style={{
							gridTemplateColumns: `repeat(${TIMELINE_HOURS.length}, minmax(0, 1fr))`,
						}}
					>
						{TIMELINE_HOURS.map((hour) => (
							<span
								key={hour}
								className="text-muted-foreground border-l py-3 pl-2 text-[13px] font-medium"
							>
								{hour}
							</span>
						))}
					</div>
				</div>

				{carers.length ? (
					carers.map((carer) => (
						<div
							key={carer.id}
							className="grid grid-cols-[200px_minmax(0,1fr)] border-b last:border-b-0"
						>
							<div className="flex items-center gap-3 px-4 py-3">
								<Avatar size="sm" initials={getInitials(carer.name)} />
								<span className="min-w-0">
									<span className="block truncate text-[15px] leading-[22px] font-medium">
										{carer.name}
									</span>
									<span className="text-muted-foreground block text-[13px] leading-[18px]">
										{carer.visits.length}{' '}
										{carer.visits.length === 1 ? 'visit' : 'visits'}
									</span>
								</span>
							</div>
							<div
								role="list"
								aria-label={`${carer.name}'s visits`}
								className="relative min-h-16"
								style={{
									backgroundImage:
										'linear-gradient(to right, var(--border) 1px, transparent 1px)',
									backgroundSize: `calc(100% / ${TIMELINE_HOURS.length}) 100%`,
								}}
							>
								{carer.visits.map((visit) => (
									<VisitBlock key={visit.id} visit={visit} />
								))}
								{nowPosition !== null ? (
									<span
										aria-hidden="true"
										className="bg-critical absolute top-0 bottom-0 w-0.5"
										style={{ left: `${nowPosition}%` }}
									/>
								) : null}
							</div>
						</div>
					))
				) : (
					<p className="text-muted-foreground m-0 px-6 py-10 text-center text-sm">
						No visits to show.
					</p>
				)}
			</div>

			<ul
				aria-label="Key"
				className="m-0 flex list-none flex-wrap gap-4 border-t px-6 py-3"
			>
				{LEGEND.map((status) => {
					const style = getVisitStatus(status)
					return (
						<li key={status} className="flex items-center gap-2 text-[13px]">
							<span
								aria-hidden="true"
								className={cn('size-3 rounded-sm border', style.className)}
							/>
							{style.label}
						</li>
					)
				})}
			</ul>
		</div>
	)
}
