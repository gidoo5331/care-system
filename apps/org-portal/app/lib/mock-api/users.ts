const createdAt = new Date('2025-01-06T08:00:00Z')

export const workspaces: Array<Workspace> = [
	{
		id: 'ws_care_home_east_legon',
		name: 'Oasis Homecare',
		location: 'East Legon',
		type: 'CARE_HOME',
		created_at: createdAt,
		updated_at: createdAt,
	},
	{
		id: 'ws_homecare_dansoman',
		name: 'Oasis Homecare',
		location: 'Dansoman branch',
		type: 'HOMECARE',
		created_at: createdAt,
		updated_at: createdAt,
	},
	{
		id: 'ws_homecare_tema',
		name: 'Oasis Homecare',
		location: 'Tema branch',
		type: 'HOMECARE',
		created_at: createdAt,
		updated_at: createdAt,
	},
]

const DEMO_USER_ID = 'usr_ama_mensah'

export const demoUser: User = {
	id: DEMO_USER_ID,
	name: 'Ama Mensah',
	email: 'ama.mensah@oasishomecare.com.gh',
	phone_number: '+233200000000',
	profile_photo_url: null,
	password_changed_at: createdAt,
	created_at: createdAt,
	updated_at: createdAt,
	workspace_users: workspaces.map((workspace) => ({
		id: `wu_${workspace.id}`,
		user_id: DEMO_USER_ID,
		workspace_id: workspace.id,
		workspace,
		role: 'MANAGER',
		status: 'WorkspaceUser.Status.Active',
		created_at: createdAt,
		updated_at: createdAt,
	})),
}
