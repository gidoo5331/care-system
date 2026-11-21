import { Link } from 'react-router'
import { buttonVariants } from '~/components/ui/button'
import {
	Card,
	CardAction,
	CardContent,
	CardHeader,
	CardTitle,
} from '~/components/ui/card'

interface Props {
	residentId: string
	entries: Array<ResidentTimelineEntry>
}

export function TodayTimeline({ residentId, entries }: Props) {
	return (
		<Card aria-labelledby="today-timeline">
			<CardHeader>
				<CardTitle id="today-timeline">Today</CardTitle>
				<CardAction>
					<Link
						to={`/residents/${residentId}/notes`}
						className={buttonVariants({ variant: 'outline' })}
					>
						Full timeline
					</Link>
				</CardAction>
			</CardHeader>
			<CardContent>
				{entries.length ? (
					<ol className="m-0 flex list-none flex-col gap-4 p-0">
						{entries.map((entry) => (
							<li key={entry.id} className="flex gap-4">
								<time className="text-muted-foreground w-11 shrink-0 text-sm leading-[22px]">
									{entry.time}
								</time>
								<span className="min-w-0">
									<p className="m-0 text-[15px] leading-[22px] font-medium">
										{entry.title}
									</p>
									<p className="text-muted-foreground m-0 text-sm">
										{entry.detail}
									</p>
								</span>
							</li>
						))}
					</ol>
				) : (
					<p className="text-muted-foreground m-0 text-sm">
						Nothing recorded yet today.
					</p>
				)}
			</CardContent>
		</Card>
	)
}
