export const TIMELINE_START_HOUR = 7
export const TIMELINE_END_HOUR = 19

const TIMELINE_MINUTES = (TIMELINE_END_HOUR - TIMELINE_START_HOUR) * 60

export const TIMELINE_HOURS = Array.from(
	{ length: TIMELINE_END_HOUR - TIMELINE_START_HOUR },
	(_, i) => `${String(TIMELINE_START_HOUR + i).padStart(2, '0')}:00`,
)

export function toMinutes(time: string) {
	const [hours = 0, minutes = 0] = time.split(':').map(Number)
	return hours * 60 + minutes
}

/** Left offset and width as percentages of the visible day. */
export function getTimelinePosition(visit: Visit) {
	const start = toMinutes(visit.start_time) - TIMELINE_START_HOUR * 60
	const clampedStart = Math.max(0, Math.min(start, TIMELINE_MINUTES))
	const end = Math.min(start + visit.duration_minutes, TIMELINE_MINUTES)
	return {
		left: (clampedStart / TIMELINE_MINUTES) * 100,
		width: (Math.max(end - clampedStart, 0) / TIMELINE_MINUTES) * 100,
	}
}

const STATUS: Record<
	VisitStatus,
	{ label: string; tone: StatusTone; className: string }
> = {
	DONE: {
		label: 'Done',
		tone: 'success',
		className: 'bg-success-tint text-success-ink border-transparent',
	},
	LATE: {
		label: 'Late',
		tone: 'warning',
		className: 'bg-warning-tint text-warning-ink border-transparent',
	},
	MISSED: {
		label: 'Missed',
		tone: 'critical',
		className: 'bg-critical-tint text-critical-ink border-transparent',
	},
	IN_PROGRESS: {
		label: 'In progress',
		tone: 'info',
		className: 'bg-info-tint text-info-ink border-info',
	},
	UPCOMING: {
		label: 'Upcoming',
		tone: 'neutral',
		className: 'bg-card text-foreground border-border-strong',
	},
}

export function getVisitStatus(status: VisitStatus) {
	return STATUS[status]
}

export function getVisitEndTime(visit: Visit) {
	const end = toMinutes(visit.start_time) + visit.duration_minutes
	return `${String(Math.floor(end / 60)).padStart(2, '0')}:${String(end % 60).padStart(2, '0')}`
}
