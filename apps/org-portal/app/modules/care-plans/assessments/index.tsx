import { SearchXIcon } from 'lucide-react'
import { Link, useSearchParams } from 'react-router'
import { useGetRiskAssessments } from '~/api/care-plans'
import { PageHeader } from '~/components/page-header'
import { Pagination } from '~/components/pagination'
import { SearchInput } from '~/components/search-input'
import { TableBodyContent } from '~/components/table-states'
import { Avatar } from '~/components/ui/avatar'
import { Badge } from '~/components/ui/badge'
import { buttonVariants } from '~/components/ui/button'
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
import { getCarePlanResidentPlace } from '~/lib/care-plan.utils'
import { formatShortDate } from '~/lib/date'
import { getRiskLevelLabel, getRiskTone } from '~/lib/resident.utils'
import { getInitials, safeString } from '~/lib/strings'
import { cn } from '~/lib/utils'
import { useWorkspace } from '~/providers/workspace-provider'

const COLUMNS = ['Resident', 'Assessment', 'Level', 'Last reviewed', '']

const LEVEL_OPTIONS = [
	{ value: 'ALL', label: 'All' },
	{ value: 'HIGH', label: 'High' },
	{ value: 'MEDIUM', label: 'Medium' },
	{ value: 'LOW', label: 'Low' },
] as const

const LEVELS: ReadonlyArray<RiskLevel> = ['HIGH', 'MEDIUM', 'LOW']

export function RiskAssessmentsModule() {
	const { workspaceUser } = useWorkspace()
	const [searchParams, setSearchParams] = useSearchParams()
	const level = LEVELS.find((l) => l === searchParams.get('level'))
	const page = Number(searchParams.get('page')) || 1

	const { data, isPending, isPlaceholderData, error, refetch } =
		useGetRiskAssessments(safeString(workspaceUser?.workspace_id), {
			level,
			query: searchParams.get('query') ?? undefined,
			page,
		})

	return (
		<>
			<PageHeader
				title="Assessments"
				description="Risk assessments from every care plan, highest risk first"
			/>

			<div className="flex flex-wrap items-center gap-3">
				<SearchInput
					label="Search assessments"
					placeholder="Search by name or assessment"
					className="max-w-[360px] flex-[1_1_280px]"
				/>
				<SegmentedControl
					label="Level"
					options={LEVEL_OPTIONS}
					value={level ?? 'ALL'}
					onValueChange={(value) =>
						setSearchParams((prev) => {
							if (value === 'ALL') prev.delete('level')
							else prev.set('level', value)
							prev.delete('page')
							return prev
						})
					}
				/>
			</div>

			<Card
				aria-label="Risk assessments"
				aria-busy={isPending || isPlaceholderData}
				className={cn(isPlaceholderData && 'opacity-70 transition-opacity')}
			>
				<Table className="min-w-[760px]">
					<TableHeader>
						<TableRow>
							{COLUMNS.map((column, index) => (
								<TableHead key={column || index}>
									{column || <span className="sr-only">Actions</span>}
								</TableHead>
							))}
						</TableRow>
					</TableHeader>
					<TableBody>
						<TableBodyContent
							columnCount={COLUMNS.length}
							rows={data?.rows}
							isLoading={isPending}
							error={error}
							onRetry={() => void refetch()}
							emptyIcon={SearchXIcon}
							emptyMessage="No assessments match."
							errorMessage="We couldn’t load assessments."
							renderRow={(row) => {
								const name = `${row.resident.first_name} ${row.resident.last_name}`
								return (
									<TableRow key={row.id}>
										<TableCell>
											<span className="flex items-center gap-3">
												<Avatar size="sm" initials={getInitials(name)} />
												<span className="min-w-0">
													<span className="block font-medium">{name}</span>
													<span className="text-muted-foreground block text-[13px] leading-[18px]">
														{getCarePlanResidentPlace(row.resident)}
													</span>
												</span>
											</span>
										</TableCell>
										<TableCell>{row.name}</TableCell>
										<TableCell>
											<Badge tone={getRiskTone(row.level)}>
												{getRiskLevelLabel(row.level)}
											</Badge>
										</TableCell>
										<TableCell className="text-muted-foreground">
											{row.reviewed_at
												? formatShortDate(row.reviewed_at)
												: 'Not yet'}
										</TableCell>
										<TableCell className="text-right">
											<Link
												to={`/care-plans/${row.care_plan_id}/edit#risk-assessments`}
												aria-label={`Update ${name}'s ${row.name} assessment`}
												className={buttonVariants({ variant: 'outline' })}
											>
												Update
											</Link>
										</TableCell>
									</TableRow>
								)
							}}
						/>
					</TableBody>
				</Table>
				{data && data.meta.total > 0 ? (
					<Pagination meta={data.meta} rowCount={data.rows.length} />
				) : null}
			</Card>
		</>
	)
}
