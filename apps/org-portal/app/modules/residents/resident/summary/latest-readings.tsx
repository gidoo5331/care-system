import dayjs from 'dayjs'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { cn } from '~/lib/utils'

const READING_TONE_CLASS: Record<StatusTone, string> = {
	neutral: 'bg-background',
	info: 'bg-info-tint text-info-ink',
	success: 'bg-success-tint text-success-ink',
	warning: 'bg-warning-tint text-warning-ink',
	critical: 'bg-critical-tint text-critical-ink',
}

interface Props {
	latestReadings: ResidentSummary['latest_readings']
}

function formatRecordedAt(date: Date) {
	const recordedAt = dayjs(date)
	return recordedAt.isSame(dayjs(), 'day')
		? `${recordedAt.format('HH:mm')} today`
		: recordedAt.format('D MMM, HH:mm')
}

export function LatestReadings({ latestReadings }: Props) {
	return (
		<Card aria-labelledby="latest-readings">
			<CardHeader>
				<CardTitle id="latest-readings">Latest readings</CardTitle>
			</CardHeader>
			<CardContent>
				{latestReadings ? (
					<>
						<p
							className="text-muted-foreground m-0 text-sm"
							suppressHydrationWarning
						>
							{formatRecordedAt(latestReadings.recorded_at)} ·{' '}
							{latestReadings.recorded_by}
						</p>
						<dl className="m-0 grid grid-cols-2 gap-2">
							{latestReadings.readings.map((reading) => {
								const isFlagged = reading.tone !== 'neutral'
								return (
									<div
										key={reading.id}
										className={cn(
											'rounded-lg px-4 py-3',
											READING_TONE_CLASS[reading.tone],
										)}
									>
										<dt
											className={cn(
												'text-[13px] leading-[18px]',
												!isFlagged && 'text-muted-foreground',
											)}
										>
											{reading.label}
										</dt>
										<dd className="m-0 text-xl leading-7 font-semibold">
											{reading.value}
										</dd>
									</div>
								)
							})}
						</dl>
					</>
				) : (
					<p className="text-muted-foreground m-0 text-sm">
						No readings recorded yet.
					</p>
				)}
			</CardContent>
		</Card>
	)
}
