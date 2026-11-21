import dayjs from 'dayjs'
import { useEffect, useRef, useState } from 'react'
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
	'MISSED',
	'UPCOMING',
]

const CARER_COLUMN_PX = 200
const HOUR_PX = 150
const TIMELINE_PX = TIMELINE_HOURS.length * HOUR_PX

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

function useScrollToNow(nowPosition: number | null) {
	const ref = useRef<HTMLDivElement>(null)
	const scrolled = useRef(false)

	useEffect(() => {
		const el = ref.current
		if (!el || scrolled.current || nowPosition === null) return
		scrolled.current = true
		const nowPx = (nowPosition / 100) * TIMELINE_PX
		const visible = el.clientWidth - CARER_COLUMN_PX
		el.scrollLeft = Math.max(0, nowPx - visible / 3)
	}, [nowPosition])

	return ref
}

function VisitBlock({ visit }: { visit: Visit }) {
	const { left, width } = getTimelinePosition(visit)
	const status = getVisitStatus(visit.status)
	if (width <= 0) return null

	const endTime = getVisitEndTime(visit)
	const label = `${visit.client_name}, ${visit.start_time} to ${endTime}, ${visit.task}. ${status.label}.`

	return (
		<span
			title={label}
			aria-label={label}
			role="listitem"
			className={cn(
				'absolute top-1.5 bottom-1.5 flex flex-col justify-center overflow-hidden rounded-md border px-2 whitespace-nowrap',
				status.className,
			)}
			style={{ left: `calc(${left}% + 2px)`, width: `calc(${width}% - 4px)` }}
		>
			<span className="truncate text-[13px] leading-[18px] font-medium">
				{visit.client_name}
			</span>
			<span className="truncate text-xs leading-4 opacity-80">
				{visit.start_time}–{endTime}
			</span>
		</span>
	)
}

export function CarerTimeline({ carers }: { carers: Array<VisitCarer> }) {
	const nowPosition = useNowPosition()
	const scrollRef = useScrollToNow(nowPosition)
	const columns = `${CARER_COLUMN_PX}px minmax(${TIMELINE_PX}px, 1fr)`

	return (
		<div>
			<div ref={scrollRef} className="overflow-x-auto">
				<div style={{ minWidth: CARER_COLUMN_PX + TIMELINE_PX }}>
					<div
						className="bg-background grid border-b"
						style={{ gridTemplateColumns: columns }}
					>
						<span className="text-muted-foreground bg-background sticky left-0 z-10 border-r px-4 py-3 text-[13px] font-medium">
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
									className="text-muted-foreground border-l py-3 pl-2 text-[13px] font-medium first:border-l-0"
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
								className="grid border-b last:border-b-0"
								style={{ gridTemplateColumns: columns }}
							>
								<div className="bg-card sticky left-0 z-10 flex items-center gap-3 border-r px-4 py-3">
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
				<li className="flex items-center gap-2 text-[13px]">
					<span aria-hidden="true" className="bg-critical h-3 w-0.5" />
					Now
				</li>
			</ul>
		</div>
	)
}
