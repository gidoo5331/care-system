import dayjs from 'dayjs'
import { PlusIcon, PrinterIcon } from 'lucide-react'
import { Link, useSearchParams } from 'react-router'
import { RoundTable } from './round-table'
import { useGetMedicationRound } from '~/api/medication'
import { PageHeader } from '~/components/page-header'
import { StatCard } from '~/components/stat-card'
import { Button, buttonVariants } from '~/components/ui/button'
import { Card } from '~/components/ui/card'
import { SegmentedControl } from '~/components/ui/segmented-control'
import {
	getCurrentRoundTime,
	MEDICATION_ROUND_TIMES,
} from '~/lib/medication.utils'
import { safeString } from '~/lib/strings'
import { cn } from '~/lib/utils'
import { useWorkspace } from '~/providers/workspace-provider'

const UNIT_OPTIONS = [
	{ value: 'ground floor', label: 'Ground floor' },
	{ value: 'first floor', label: 'First floor' },
] as const

type UnitOption = (typeof UNIT_OPTIONS)[number]['value']

function isUnit(value: string | null): value is UnitOption {
	return UNIT_OPTIONS.some((option) => option.value === value)
}

function buildStats(round: MedicationRound): Array<OverviewStat> {
	const { stats } = round
	return [
		{
			id: 'given',
			label: 'Given',
			value: String(stats.given),
			detail: `of ${stats.total} doses`,
			tone: 'neutral',
		},
		{
			id: 'due',
			label: 'Still due',
			value: String(stats.due),
			detail: `by ${stats.due_by}`,
			tone: stats.due ? 'warning' : 'neutral',
		},
		{
			id: 'refused',
			label: 'Refused',
			value: String(stats.refused),
			detail: 'reason recorded',
			tone: 'neutral',
		},
		{
			id: 'missed',
			label: 'Missed',
			value: String(stats.missed),
			detail: stats.missed ? 'needs follow-up' : 'none this round',
			tone: stats.missed ? 'critical' : 'neutral',
		},
	]
}

export function MedicationRoundModule() {
	const { workspaceUser } = useWorkspace()
	const [searchParams, setSearchParams] = useSearchParams()

	const timeParam = searchParams.get('time')
	const unitParam = searchParams.get('unit')
	const roundTime =
		timeParam && MEDICATION_ROUND_TIMES.includes(timeParam)
			? timeParam
			: getCurrentRoundTime()
	const unit: UnitOption = isUnit(unitParam) ? unitParam : 'ground floor'

	const { data, isPending, isPlaceholderData, error, refetch } =
		useGetMedicationRound(safeString(workspaceUser?.workspace_id), {
			time: roundTime,
			unit,
		})

	const setParam = (key: 'time' | 'unit', value: string) =>
		setSearchParams(
			(prev) => {
				prev.set(key, value)
				return prev
			},
			{ replace: true },
		)

	return (
		<>
			<PageHeader
				title="Medication rounds"
				description={
					<span suppressHydrationWarning>
						{dayjs().format('dddd D MMMM')} · {unit}
					</span>
				}
				actions={
					<>
						<Button variant="outline" onClick={() => window.print()}>
							<PrinterIcon strokeWidth={1.75} />
							Print MAR
						</Button>
						<Link
							to="/medication/prescriptions/new"
							className={buttonVariants()}
						>
							<PlusIcon strokeWidth={1.75} />
							Add prescription
						</Link>
					</>
				}
			/>

			{data ? (
				<div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
					{buildStats(data).map((stat) => (
						<StatCard key={stat.id} stat={stat} />
					))}
				</div>
			) : null}

			<div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
				<SegmentedControl
					label="Round"
					options={MEDICATION_ROUND_TIMES.map((time) => ({
						value: time,
						label: time,
					}))}
					value={roundTime}
					onValueChange={(value) => setParam('time', value)}
				/>
				<SegmentedControl
					label="Floor"
					options={UNIT_OPTIONS}
					value={unit}
					onValueChange={(value) => setParam('unit', value)}
				/>
			</div>

			<Card
				aria-label={`${roundTime} round, ${unit}`}
				aria-busy={isPending || isPlaceholderData}
				className={cn(isPlaceholderData && 'opacity-70 transition-opacity')}
			>
				<RoundTable
					rows={data?.rows}
					isLoading={isPending}
					error={error}
					onRetry={() => void refetch()}
				/>
			</Card>
		</>
	)
}
