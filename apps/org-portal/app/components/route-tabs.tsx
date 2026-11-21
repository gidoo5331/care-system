import { NavLink } from 'react-router'
import { cn } from '~/lib/utils'

interface Tab {
	label: string
	to: string
	end?: boolean
}

interface Props {
	label: string
	tabs: ReadonlyArray<Tab>
}

export function RouteTabs({ label, tabs }: Props) {
	return (
		<nav
			aria-label={label}
			className="flex [scrollbar-width:none] gap-6 overflow-x-auto border-b"
		>
			{tabs.map((tab) => (
				<NavLink
					key={tab.to}
					to={tab.to}
					end={tab.end}
					className={({ isActive }) =>
						cn(
							'-mb-px flex h-12 shrink-0 items-center border-b-2 px-1 text-[15px] whitespace-nowrap no-underline transition-colors',
							isActive
								? 'border-primary text-foreground font-semibold'
								: 'text-muted-foreground hover:text-foreground border-transparent font-medium',
						)
					}
				>
					{tab.label}
				</NavLink>
			))}
		</nav>
	)
}
