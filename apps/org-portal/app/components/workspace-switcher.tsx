import { ChevronDownIcon } from 'lucide-react'
import { Link } from 'react-router'
import { Avatar } from './ui/avatar'
import { SELECT_WORKSPACE_ROUTE } from '~/lib/constants'
import {
	getWorkspaceInitials,
	getWorkspaceTypeLabel,
} from '~/lib/workspace.utils'
import { useWorkspace } from '~/providers/workspace-provider'

export function WorkspaceSwitcher() {
	const { workspaceUser } = useWorkspace()
	const workspace = workspaceUser?.workspace
	if (!workspace) return null

	return (
		<Link
			to={SELECT_WORKSPACE_ROUTE}
			aria-label={`Current workplace: ${workspace.name}, ${workspace.location}. Switch workplace`}
			className="hover:bg-muted text-foreground mb-3 flex items-center gap-3 rounded-xl border p-2 no-underline transition-colors"
		>
			<Avatar size="sm" initials={getWorkspaceInitials(workspace)} />
			<span className="min-w-0 flex-1">
				<span className="block truncate text-sm leading-5 font-semibold">
					{workspace.name}
				</span>
				<span className="text-muted-foreground block truncate text-[13px] leading-[18px]">
					{workspace.location} ·{' '}
					{getWorkspaceTypeLabel(workspace.type).toLowerCase()}
				</span>
			</span>
			<ChevronDownIcon
				className="text-muted-foreground size-[18px]"
				strokeWidth={1.75}
			/>
		</Link>
	)
}
