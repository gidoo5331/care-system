import { SlidersHorizontalIcon, XIcon } from 'lucide-react'
import { useSearchParams } from 'react-router'
import { SearchInput } from '~/components/search-input'
import { Button } from '~/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { SegmentedControl } from '~/components/ui/segmented-control'
import { getRiskLevelLabel } from '~/lib/resident.utils'

const SERVICE_OPTIONS = [
	{ value: 'ALL', label: 'All' },
	{ value: 'CARE_HOME', label: 'Care home' },
	{ value: 'HOMECARE', label: 'Homecare' },
] as const

type ServiceOption = (typeof SERVICE_OPTIONS)[number]['value']

const RISK_LEVELS: ReadonlyArray<RiskLevel> = ['HIGH', 'MEDIUM', 'LOW']

const VIEW_LABEL: Record<ResidentListView, string> = {
	'high-risk': 'High risk',
	'review-due': 'Care plan review due',
	'in-hospital': 'In hospital',
}

function isServiceOption(value: string | null): value is ServiceOption {
	return SERVICE_OPTIONS.some((option) => option.value === value)
}

function isView(value: string | null): value is ResidentListView {
	return value !== null && value in VIEW_LABEL
}

export function ResidentsController() {
	const [searchParams, setSearchParams] = useSearchParams()
	const serviceParam = searchParams.get('service')
	const service = isServiceOption(serviceParam) ? serviceParam : 'ALL'
	const riskLevel = searchParams.get('risk_level') ?? 'ANY'
	const view = searchParams.get('view')

	const setParam = (key: string, value: string | null) =>
		setSearchParams((prev) => {
			if (value) prev.set(key, value)
			else prev.delete(key)
			prev.delete('page')
			return prev
		})

	return (
		<div className="flex flex-wrap items-center gap-3">
			<SearchInput
				label="Search residents and clients"
				placeholder="Search by name, room or ID"
				className="max-w-[360px] flex-[1_1_280px]"
			/>
			<SegmentedControl
				label="Service"
				options={SERVICE_OPTIONS}
				value={service}
				onValueChange={(value) =>
					setParam('service', value === 'ALL' ? null : value)
				}
			/>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="outline">
						<SlidersHorizontalIcon strokeWidth={1.75} />
						Filters
						{riskLevel !== 'ANY' ? (
							<span className="bg-primary text-primary-foreground ml-1 inline-flex size-5 items-center justify-center rounded-full text-xs">
								1
							</span>
						) : null}
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="start">
					<DropdownMenuLabel className="text-subtle-foreground text-xs font-semibold tracking-wide uppercase">
						Risk
					</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<DropdownMenuRadioGroup
						value={riskLevel}
						onValueChange={(value) =>
							setParam('risk_level', value === 'ANY' ? null : value)
						}
					>
						<DropdownMenuRadioItem value="ANY">Any risk</DropdownMenuRadioItem>
						{RISK_LEVELS.map((level) => (
							<DropdownMenuRadioItem key={level} value={level}>
								{getRiskLevelLabel(level)}
							</DropdownMenuRadioItem>
						))}
					</DropdownMenuRadioGroup>
				</DropdownMenuContent>
			</DropdownMenu>
			{isView(view) ? (
				<Button variant="ghost" onClick={() => setParam('view', null)}>
					{VIEW_LABEL[view]}
					<XIcon aria-label="Clear saved view" />
				</Button>
			) : null}
		</div>
	)
}
