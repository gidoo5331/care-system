import { cn } from '~/lib/utils'

const DETAIL_TONE_CLASS: Record<StatusTone, string> = {
	neutral: 'text-muted-foreground',
	info: 'text-info-ink',
	success: 'text-success-ink',
	warning: 'text-warning-ink',
	critical: 'text-critical-ink',
}

interface Props {
	stat: OverviewStat
}

export function StatCard({ stat }: Props) {
	return (
		<div className="bg-card flex flex-col gap-1 rounded-xl border px-6 py-5">
			<p className="text-muted-foreground m-0 text-sm font-medium">
				{stat.label}
			</p>
			<p className="m-0 text-[28px] leading-9 font-semibold">{stat.value}</p>
			<p
				className={cn(
					'm-0 text-[13px] leading-[18px]',
					DETAIL_TONE_CLASS[stat.tone],
				)}
			>
				{stat.detail}
			</p>
		</div>
	)
}
