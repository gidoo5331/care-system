import { ArrowLeftRightIcon, LogOutIcon } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Link, useSubmit } from 'react-router'
import { Avatar } from './ui/avatar'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { SELECT_WORKSPACE_ROUTE } from '~/lib/constants'
import { getInitials } from '~/lib/strings'
import { useAuth } from '~/providers/auth-provider'

export function NavUser() {
	const { currentUser } = useAuth()
	const { theme, setTheme } = useTheme()
	const submit = useSubmit()

	if (!currentUser) return null

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				aria-label={`Your account, ${currentUser.name}`}
				className="focus-visible:ring-ring/40 cursor-pointer rounded-full outline-none focus-visible:ring-[3px]"
			>
				<Avatar initials={getInitials(currentUser.name)} />
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuLabel>
					<span className="block font-semibold">{currentUser.name}</span>
					<span className="text-muted-foreground block truncate text-[13px] font-normal">
						{currentUser.email}
					</span>
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuItem asChild>
					<Link to={SELECT_WORKSPACE_ROUTE}>
						<ArrowLeftRightIcon />
						Switch workplace
					</Link>
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuLabel className="text-subtle-foreground text-xs font-semibold tracking-wide uppercase">
					Appearance
				</DropdownMenuLabel>
				<DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
					<DropdownMenuRadioItem value="light">Light</DropdownMenuRadioItem>
					<DropdownMenuRadioItem value="dark">Dark</DropdownMenuRadioItem>
					<DropdownMenuRadioItem value="system">System</DropdownMenuRadioItem>
				</DropdownMenuRadioGroup>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					onSelect={() =>
						void submit(null, { method: 'post', action: '/logout' })
					}
				>
					<LogOutIcon />
					Sign out
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
