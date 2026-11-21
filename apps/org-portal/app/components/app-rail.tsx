import {
	CalendarDaysIcon,
	ChartColumnIcon,
	ClipboardListIcon,
	LayoutDashboardIcon,
	PillIcon,
	SettingsIcon,
	TriangleAlertIcon,
	UserRoundIcon,
	UsersIcon,
	type LucideIcon,
} from 'lucide-react'
import { Link, NavLink } from 'react-router'
import { BrandMark } from './brand-mark'
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip'
import { cn } from '~/lib/utils'

interface RailItem {
	label: string
	to: string
	icon: LucideIcon
	end?: boolean
}

const MODULES: Array<RailItem> = [
	{ label: 'Overview', to: '/', icon: LayoutDashboardIcon, end: true },
	{ label: 'Residents and clients', to: '/residents', icon: UsersIcon },
	{ label: 'Care plans', to: '/care-plans', icon: ClipboardListIcon },
	{ label: 'Medication', to: '/medication', icon: PillIcon },
	{ label: 'Visits and rota', to: '/visits', icon: CalendarDaysIcon },
	{ label: 'Incidents', to: '/incidents', icon: TriangleAlertIcon },
	{ label: 'Staff', to: '/staff', icon: UserRoundIcon },
	{ label: 'Reports', to: '/reports', icon: ChartColumnIcon },
]

const SETTINGS: RailItem = {
	label: 'Settings',
	to: '/settings',
	icon: SettingsIcon,
}

function RailLink({ item }: { item: RailItem }) {
	const Icon = item.icon
	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<NavLink
					to={item.to}
					end={item.end}
					aria-label={item.label}
					className={({ isActive }) =>
						cn(
							'focus-visible:ring-primary relative flex size-12 items-center justify-center rounded-xl transition-colors outline-none focus-visible:ring-2',
							isActive
								? 'bg-navy-raised text-white'
								: 'text-navy-muted hover:bg-navy-raised hover:text-white',
						)
					}
				>
					<Icon className="size-[22px]" strokeWidth={1.75} />
				</NavLink>
			</TooltipTrigger>
			<TooltipContent side="right">{item.label}</TooltipContent>
		</Tooltip>
	)
}

export function AppRail() {
	return (
		<nav
			aria-label="Modules"
			className="bg-navy sticky top-0 flex h-svh w-[72px] shrink-0 flex-col items-center gap-2 overflow-y-auto py-4"
		>
			<Link to="/" aria-label="Overview" className="mb-4">
				<BrandMark />
			</Link>
			{MODULES.map((item) => (
				<RailLink key={item.to} item={item} />
			))}
			<span className="flex-1" />
			<RailLink item={SETTINGS} />
		</nav>
	)
}
