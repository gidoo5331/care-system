import dayjs from 'dayjs'
import { CalendarX2Icon, PlusIcon } from 'lucide-react'
import { Link, useSearchParams } from 'react-router'
import { useGetRotaWeek } from '~/api/visits'
import { PageHeader } from '~/components/page-header'
import { TableBodyContent } from '~/components/table-states'
import { Alert } from '~/components/ui/alert'
import { Avatar } from '~/components/ui/avatar'
import { Badge } from '~/components/ui/badge'
import { Button, buttonVariants } from '~/components/ui/button'
import { Card } from '~/components/ui/card'
import { SegmentedControl } from '~/components/ui/segmented-control'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '~/components/ui/table'
import { getShift } from '~/lib/rota.utils'
import { getInitials, safeString } from '~/lib/strings'
import { cn } from '~/lib/utils'
import { useWorkspace } from '~/providers/workspace-provider'

const UNIT_OPTIONS = [
	{ value: 'ground floor', label: 'Ground floor' },
	{ value: 'first floor', label: 'First floor' },
] as const

function ShiftCell({ shift }: { shift: ShiftType }) {
	const { label, className } = getShift(shift)
	if (shift === 'OFF') {
		return <span className="text-muted-foreground">{label}</span>
	}
	return (
		<span
			className={cn(
				'inline-flex h-6 items-center rounded-full px-2.5 text-[13px] leading-[18px] font-medium whitespace-nowrap',
				className,
			)}
		>
			{label}
		</span>
	)
}

export function RotaModule() {
	const { workspaceUser } = useWorkspace()
	const [searchParams, setSearchParams] = useSearchParams()
	const week = Number(searchParams.get('week')) || 0
	const unit =
		searchParams.get('unit') === 'first floor' ? 'first floor' : 'ground floor'

	const { data, isPending, isPlaceholderData, error, refetch } = useGetRotaWeek(
		safeString(workspaceUser?.workspace_id),
		{ week, unit },
	)

	const weekStart = data ? dayjs(data.week_start) : null
	const days = weekStart
		? Array.from({ length: 7 }, (_, i) => weekStart.add(i, 'day'))
		: []

	const setParam = (key: 'week' | 'unit', value: string | null) =>
		setSearchParams(
			(prev) => {
				if (value === null) prev.delete(key)
				else prev.set(key, value)
				return prev
			},
			{ replace: true },
		)

	return (
		<>
			<PageHeader
				title="Rota"
				description={
					weekStart
						? `Week of ${weekStart.format('D MMMM')} · ${workspaceUser?.workspace.name ?? ''}`
						: 'Loading week…'
				}
				actions={
					<>
						<Link
							to="/visits/rota/copy"
							className={buttonVariants({ variant: 'outline' })}
						>
							Copy last week
						</Link>
						<Link to="/visits/rota/new" className={buttonVariants()}>
							<PlusIcon strokeWidth={1.75} />
							Add shift
						</Link>
					</>
				}
			/>

			{data?.open_shift_count ? (
				<Alert tone="warning" className="items-center">
					<CalendarX2Icon />
					<span className="flex-1">
						{data.open_shift_count === 1
							? '1 shift this week has no one assigned.'
							: `${data.open_shift_count} shifts this week have no one assigned.`}
					</span>
					<a
						href="#open-shifts"
						className="font-semibold text-current underline underline-offset-4"
					>
						Fill shifts
					</a>
				</Alert>
			) : null}

			<div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
				<div
					className="flex flex-wrap items-center gap-2"
					role="group"
					aria-label="Week"
				>
					<Button
						variant="outline"
						onClick={() => setParam('week', String(week - 1))}
					>
						Previous week
					</Button>
					<Button
						variant={week === 0 ? 'default' : 'outline'}
						aria-pressed={week === 0}
						onClick={() => setParam('week', null)}
					>
						This week
					</Button>
					<Button
						variant="outline"
						onClick={() => setParam('week', String(week + 1))}
					>
						Next week
					</Button>
				</div>
				<SegmentedControl
					label="Floor"
					options={UNIT_OPTIONS}
					value={unit}
					onValueChange={(value) =>
						setParam('unit', value === 'ground floor' ? null : value)
					}
				/>
			</div>

			<Card
				aria-label="Rota"
				aria-busy={isPending || isPlaceholderData}
				className={cn(isPlaceholderData && 'opacity-70 transition-opacity')}
			>
				<Table className="min-w-[1000px]">
					<TableHeader>
						<TableRow>
							<TableHead>Staff</TableHead>
							{days.length
								? days.map((day) => (
										<TableHead
											key={day.toISOString()}
											className={cn(
												day.isSame(dayjs(), 'day') &&
													'text-primary font-semibold',
											)}
										>
											{day.format('ddd D')}
										</TableHead>
									))
								: Array.from({ length: 7 }, (_, i) => <TableHead key={i} />)}
						</TableRow>
					</TableHeader>
					<TableBody>
						<TableBodyContent
							columnCount={8}
							rows={data?.rows}
							isLoading={isPending}
							error={error}
							onRetry={() => void refetch()}
							emptyIcon={CalendarX2Icon}
							emptyMessage="No one is on the rota for this floor."
							errorMessage="We couldn’t load the rota."
							renderRow={(row) => (
								<TableRow
									key={row.staff_id ?? 'open'}
									id={row.staff_id ? undefined : 'open-shifts'}
								>
									<TableCell>
										{row.staff_id ? (
											<Link
												to={`/staff/${row.staff_id}`}
												className="text-foreground group flex items-center gap-3 no-underline"
											>
												<Avatar
													size="sm"
													initials={getInitials(row.staff_name)}
												/>
												<span className="min-w-0">
													<span className="group-hover:text-primary block font-medium">
														{row.staff_name}
													</span>
													<span className="text-muted-foreground block text-[13px] leading-[18px]">
														{row.role}
													</span>
												</span>
											</Link>
										) : (
											<span className="flex items-center gap-3">
												<Badge tone="critical">No one</Badge>
												<span className="font-medium">{row.staff_name}</span>
											</span>
										)}
									</TableCell>
									{row.shifts.map((shift, index) => (
										<TableCell key={index}>
											<ShiftCell shift={shift} />
										</TableCell>
									))}
								</TableRow>
							)}
						/>
					</TableBody>
				</Table>
			</Card>
		</>
	)
}
