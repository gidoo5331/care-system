import { MenuIcon } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { Link, useLocation, useMatch } from 'react-router'
import { MODULES, SETTINGS, type RailItem } from './app-rail'
import { BrandMark } from './brand-mark'
import { SubNavSectionLabel } from './sub-nav'
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetTitle,
	SheetTrigger,
} from './ui/sheet'
import { WorkspaceSwitcher } from './workspace-switcher'
import { cn } from '~/lib/utils'

function ModuleLink({ item }: { item: RailItem }) {
	const Icon = item.icon
	const isActive = Boolean(useMatch({ path: item.to, end: item.end ?? false }))
	return (
		<Link
			to={item.to}
			aria-current={isActive ? 'page' : undefined}
			className={cn(
				'flex h-10 items-center gap-3 rounded-lg px-3 text-sm no-underline transition-colors',
				isActive
					? 'bg-accent text-accent-foreground font-semibold'
					: 'text-neutral-ink hover:bg-muted font-medium',
			)}
		>
			<Icon className="size-[18px]" strokeWidth={1.75} />
			{item.label}
		</Link>
	)
}

interface Props {
	label: string
	nav: ReactNode
}

export function MobileNav({ label, nav }: Props) {
	const [open, setOpen] = useState(false)
	const location = useLocation()

	useEffect(() => {
		setOpen(false)
	}, [location.pathname, location.search])

	return (
		<Sheet open={open} onOpenChange={setOpen}>
			<SheetTrigger
				aria-label="Open menu"
				className="text-foreground hover:bg-muted -ml-2 flex size-10 shrink-0 items-center justify-center rounded-lg lg:hidden"
			>
				<MenuIcon className="size-[22px]" strokeWidth={1.75} />
			</SheetTrigger>
			<SheetContent>
				<div className="flex h-16 shrink-0 items-center gap-3 border-b px-4 pr-14">
					<BrandMark />
					<div className="min-w-0">
						<SheetTitle className="text-[15px]">{label}</SheetTitle>
						<SheetDescription className="sr-only">
							Switch workplace, module or page
						</SheetDescription>
					</div>
				</div>
				<nav
					aria-label={label}
					className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 py-4"
				>
					<WorkspaceSwitcher />
					{nav}
					<div className="flex flex-col gap-0.5 md:hidden">
						<SubNavSectionLabel>Modules</SubNavSectionLabel>
						{[...MODULES, SETTINGS].map((item) => (
							<ModuleLink key={item.to} item={item} />
						))}
					</div>
				</nav>
			</SheetContent>
		</Sheet>
	)
}
