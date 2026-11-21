const WORKSPACE_TYPE_LABEL: Record<WorkspaceType, string> = {
	CARE_HOME: 'Care home',
	HOMECARE: 'Homecare',
}

export function getWorkspaceTypeLabel(type: WorkspaceType) {
	return WORKSPACE_TYPE_LABEL[type]
}

/**
 * Branches of one organisation share a name ("Oasis Homecare"), so name
 * initials alone collide. Pairing the name with the location keeps each
 * branch's avatar distinct.
 */
export function getWorkspaceInitials(workspace: Workspace) {
	const nameInitial = workspace.name.trim()[0] ?? ''
	const locationInitial = workspace.location.trim()[0] ?? ''
	return `${nameInitial}${locationInitial}`.toUpperCase()
}

export function isWorkspaceUserActive(workspaceUser: WorkspaceUser) {
	return workspaceUser.status === 'WorkspaceUser.Status.Active'
}
