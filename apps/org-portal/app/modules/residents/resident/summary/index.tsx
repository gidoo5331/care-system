import { useLoaderData } from 'react-router'
import { LatestReadings } from './latest-readings'
import { MedicationToday } from './medication-today'
import { TodayTimeline } from './today-timeline'
import { useGetResidentSummary } from '~/api/residents'
import type { loader } from '~/routes/_auth._dashboard.residents.$residentId._index'

export function ResidentSummaryModule() {
	const loaderData = useLoaderData<typeof loader>()
	const { data } = useGetResidentSummary(
		loaderData.workspaceId,
		loaderData.residentId,
		loaderData.summary,
	)
	const summary = data ?? loaderData.summary

	return (
		<div className="flex flex-wrap items-start gap-6">
			<div className="flex min-w-0 flex-[999_1_560px] flex-col gap-6">
				<MedicationToday
					residentId={loaderData.residentId}
					roundTimes={summary.round_times}
					medications={summary.medications}
				/>
			</div>
			<div className="flex min-w-0 flex-[1_1_320px] flex-col gap-6">
				<LatestReadings latestReadings={summary.latest_readings} />
				<TodayTimeline
					residentId={loaderData.residentId}
					entries={summary.today}
				/>
			</div>
		</div>
	)
}
