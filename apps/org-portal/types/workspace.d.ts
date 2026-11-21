type WorkspaceType = 'CARE_HOME' | 'HOMECARE'

interface Workspace {
	id: string
	name: string
	location: string
	type: WorkspaceType
	created_at: Date
	updated_at: Date
}

interface WorkspaceUser {
	id: string
	user_id: string
	workspace_id: string
	workspace: Workspace
	role: 'OWNER' | 'MANAGER' | 'NURSE' | 'OFFICE'
	status: 'WorkspaceUser.Status.Active' | 'WorkspaceUser.Status.Inactive'
	created_at: Date
	updated_at: Date
}
