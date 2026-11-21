import { ChevronRightIcon, SearchXIcon } from 'lucide-react'
import { Form, useLoaderData, useNavigation } from 'react-router'
import { AuthCardLayout } from '~/components/auth-card-layout'
import { Avatar } from '~/components/ui/avatar'
import { Badge } from '~/components/ui/badge'
import { safeString } from '~/lib/strings'
import { cn } from '~/lib/utils'
import {
	getWorkspaceInitials,
	getWorkspaceTypeLabel,
	isWorkspaceUserActive,
} from '~/lib/workspace.utils'
import { useAuth } from '~/providers/auth-provider'
import type { loader } from '~/routes/_auth.select-workspace'

export function SelectWorkspaceModule() {
	const { workspaceUsers, selectedWorkspaceId } = useLoaderData<typeof loader>()
	const { currentUser } = useAuth()
	const navigation = useNavigation()
	const pendingWorkspaceId =
		navigation.state === 'submitting'
			? navigation.formData?.get('workspace_id')
			: null

	if (!workspaceUsers.length) {
		return (
			<AuthCardLayout
				title="No workplaces yet"
				description="Your account isn't linked to a care home or branch. Ask your manager to add you."
			>
				<div className="text-muted-foreground flex flex-col items-center gap-3 rounded-xl border border-dashed py-10 text-center text-sm">
					<SearchXIcon className="size-6" />
					No workplaces found
				</div>
				<Form method="post" action="/logout">
					<button
						type="submit"
						className="text-primary hover:text-primary-hover cursor-pointer text-sm font-medium"
					>
						Sign out
					</button>
				</Form>
			</AuthCardLayout>
		)
	}

	return (
		<AuthCardLayout
			title="Where are you working today?"
			description={`Signed in as ${safeString(currentUser?.name)}. You can switch at any time.`}
			footer={
				<Form method="post" action="/logout" className="inline">
					Not you?{' '}
					<button
						type="submit"
						className="text-primary hover:text-primary-hover cursor-pointer font-medium"
					>
						Sign out
					</button>
				</Form>
			}
		>
			<Form method="post" className="flex min-w-0 flex-col gap-3">
				{workspaceUsers.map((workspaceUser) => {
					const { workspace } = workspaceUser
					const isActive = isWorkspaceUserActive(workspaceUser)
					const isCurrent = workspace.id === selectedWorkspaceId
					const isPending = pendingWorkspaceId === workspace.id

					return (
						<button
							key={workspace.id}
							type="submit"
							name="workspace_id"
							value={workspace.id}
							disabled={!isActive || Boolean(pendingWorkspaceId)}
							aria-current={isCurrent ? 'true' : undefined}
							className={cn(
								'text-foreground flex w-full cursor-pointer items-center gap-4 rounded-xl border p-4 text-left transition-colors',
								'hover:bg-muted focus-visible:ring-ring/40 outline-none focus-visible:ring-[3px]',
								'disabled:cursor-not-allowed disabled:hover:bg-transparent',
								!isActive && 'opacity-60',
								isCurrent && 'border-primary',
								isPending && 'bg-muted',
							)}
						>
							<Avatar size="lg" initials={getWorkspaceInitials(workspace)} />
							<span className="min-w-0 flex-1">
								<span className="block truncate text-base leading-6 font-semibold">
									{workspace.name}
								</span>
								<span className="text-muted-foreground block truncate text-sm">
									{isActive
										? workspace.location
										: 'Access paused — contact your manager'}
								</span>
							</span>
							<Badge tone={isActive ? 'neutral' : 'critical'}>
								{isActive ? getWorkspaceTypeLabel(workspace.type) : 'Inactive'}
							</Badge>
							<ChevronRightIcon
								className="text-subtle-foreground size-5"
								strokeWidth={1.75}
							/>
						</button>
					)
				})}
			</Form>
		</AuthCardLayout>
	)
}
