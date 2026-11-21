/**
 * Stands in for the backend until it exists. Selected by leaving API_ADDRESS
 * empty; requests then go to MOCK_API_ADDRESS and are answered here, so the
 * api/ layer, session and middleware run exactly as they will against the
 * real service.
 */
export const MOCK_API_ADDRESS = 'mock://care-platform/api'

const DEMO_PASSWORD = 'password'
const ACCESS_TOKEN_PREFIX = 'demo-access-'
const REFRESH_TOKEN_PREFIX = 'demo-refresh-'

export function isMockApiUrl(url: string) {
	return url.startsWith(MOCK_API_ADDRESS)
}

const now = new Date('2026-11-20T08:00:00Z')

const workspaces: Array<Workspace> = [
	{
		id: 'ws_care_home_east_legon',
		name: 'Oasis Homecare',
		location: 'East Legon',
		type: 'CARE_HOME',
		created_at: now,
		updated_at: now,
	},
	{
		id: 'ws_homecare_dansoman',
		name: 'Oasis Homecare',
		location: 'Dansoman branch',
		type: 'HOMECARE',
		created_at: now,
		updated_at: now,
	},
	{
		id: 'ws_homecare_tema',
		name: 'Oasis Homecare',
		location: 'Tema branch',
		type: 'HOMECARE',
		created_at: now,
		updated_at: now,
	},
]

const DEMO_USER_ID = 'usr_ama_mensah'

const demoUser: User = {
	id: DEMO_USER_ID,
	name: 'Ama Mensah',
	email: 'ama.mensah@oasishomecare.com.gh',
	phone_number: '+233200000000',
	profile_photo_url: null,
	password_changed_at: now,
	created_at: now,
	updated_at: now,
	workspace_users: workspaces.map((workspace) => ({
		id: `wu_${workspace.id}`,
		user_id: DEMO_USER_ID,
		workspace_id: workspace.id,
		workspace,
		role: 'MANAGER',
		status: 'WorkspaceUser.Status.Active',
		created_at: now,
		updated_at: now,
	})),
}

const careHomeOverview: WorkspaceOverview = {
	stats: [
		{
			id: 'residents',
			label: 'Residents',
			value: '42',
			detail: '2 in hospital · 3 beds free',
			tone: 'neutral',
		},
		{
			id: 'staff',
			label: 'Staff on shift',
			value: '11 of 12',
			detail: '1 sick call, cover needed',
			tone: 'warning',
		},
		{
			id: 'medication',
			label: 'Medication round',
			value: '87%',
			detail: '8 doses still due',
			tone: 'warning',
		},
		{
			id: 'incidents',
			label: 'Open incidents',
			value: '3',
			detail: '1 safeguarding concern',
			tone: 'critical',
		},
	],
	needs_attention: [
		{
			id: 'na_1',
			kind: 'Missed dose',
			tone: 'critical',
			title: 'Kofi Asante · metformin 08:00',
			detail: 'Room 12 · nothing recorded',
			action_label: 'Open eMAR',
			action_href: '/residents',
		},
		{
			id: 'na_2',
			kind: 'Fall',
			tone: 'critical',
			title: 'Efua Darko · fall in bathroom',
			detail: 'Room 4 · reported 07:42 by Esi Quaye',
			action_label: 'Review',
			action_href: '/incidents',
		},
		{
			id: 'na_3',
			kind: 'Late visit',
			tone: 'warning',
			title: 'Abena Owusu · 09:00 visit',
			detail: 'Dansoman · Yaw Boateng 20 min late',
			action_label: 'Call carer',
			action_href: '/visits',
		},
		{
			id: 'na_4',
			kind: 'Review due',
			tone: 'warning',
			title: 'Nana Agyeman · care plan',
			detail: 'Room 9 · 3 days overdue',
			action_label: 'Start review',
			action_href: '/care-plans',
		},
		{
			id: 'na_5',
			kind: 'Training',
			tone: 'warning',
			title: 'Manual handling certificates',
			detail: '4 staff · expire within 14 days',
			action_label: 'See staff',
			action_href: '/staff',
		},
	],
	needs_attention_count: 5,
	handover_new_count: 2,
	medication_round: {
		name: 'Morning medication round',
		window: '08:00 to 10:00',
		total_doses: 62,
		given: 52,
		due: 8,
		refused: 1,
		missed: 1,
	},
	on_shift: [
		{ id: 's_1', name: 'Esi Quaye', role: 'Nurse', unit: 'ground floor' },
		{
			id: 's_2',
			name: 'Kwame Addo',
			role: 'Senior carer',
			unit: 'first floor',
		},
		{ id: 's_3', name: 'Akosua Badu', role: 'Carer', unit: 'first floor' },
	],
	units: [
		{ id: 'u_ground', name: 'Ground floor', resident_count: 18 },
		{ id: 'u_first', name: 'First floor', resident_count: 24 },
	],
}

const homecareOverview: WorkspaceOverview = {
	stats: [
		{
			id: 'clients',
			label: 'Clients',
			value: '68',
			detail: '4 new this month',
			tone: 'neutral',
		},
		{
			id: 'visits',
			label: 'Visits today',
			value: '31 of 54',
			detail: '2 running late',
			tone: 'warning',
		},
		{
			id: 'medication',
			label: 'Medication prompts',
			value: '92%',
			detail: '3 still due',
			tone: 'warning',
		},
		{
			id: 'incidents',
			label: 'Open incidents',
			value: '1',
			detail: 'No safeguarding concerns',
			tone: 'neutral',
		},
	],
	needs_attention: [
		{
			id: 'na_1',
			kind: 'Late visit',
			tone: 'warning',
			title: 'Abena Owusu · 09:00 visit',
			detail: 'Yaw Boateng 20 min late',
			action_label: 'Call carer',
			action_href: '/visits',
		},
		{
			id: 'na_2',
			kind: 'Missed visit',
			tone: 'critical',
			title: 'Kojo Mensah · 07:30 visit',
			detail: 'No check-in recorded',
			action_label: 'Reassign',
			action_href: '/visits',
		},
	],
	needs_attention_count: 2,
	handover_new_count: 0,
	medication_round: null,
	on_shift: [
		{ id: 's_1', name: 'Yaw Boateng', role: 'Carer', unit: 'run A' },
		{ id: 's_2', name: 'Adwoa Sarpong', role: 'Carer', unit: 'run B' },
	],
	units: [
		{ id: 'u_run_a', name: 'Run A', resident_count: 34 },
		{ id: 'u_run_b', name: 'Run B', resident_count: 34 },
	],
}

function ok<T>(data: T, status = 200) {
	return Response.json({ data, errors: null }, { status })
}

function fail(message: string, status: number) {
	return Response.json({ data: null, errors: { message } }, { status })
}

function readBearer(init?: RequestInit) {
	const header = new Headers(init?.headers).get('Authorization') ?? ''
	return header.replace(/^Bearer\s+/i, '')
}

function issueTokenPair() {
	const stamp = Date.now().toString(36)
	return {
		token: `${ACCESS_TOKEN_PREFIX}${stamp}`,
		expires_in: 3600,
		refresh_token: `${REFRESH_TOKEN_PREFIX}${stamp}`,
		refresh_expires_in: 60 * 60 * 24 * 90,
	}
}

function readJson(init?: RequestInit): Record<string, unknown> {
	if (typeof init?.body !== 'string') return {}
	try {
		return JSON.parse(init.body) as Record<string, unknown>
	} catch {
		return {}
	}
}

export async function mockFetch(
	url: string,
	init?: RequestInit,
): Promise<Response> {
	const path = url.slice(MOCK_API_ADDRESS.length)
	const method = (init?.method ?? 'GET').toUpperCase()
	const isAuthorized = readBearer(init).startsWith(ACCESS_TOKEN_PREFIX)

	if (method === 'POST' && path === '/v1/admin/users/login') {
		const body = readJson(init)
		if (body.password !== DEMO_PASSWORD) {
			return fail('Incorrect email or password.', 401)
		}
		return ok({ ...issueTokenPair(), user: demoUser })
	}

	if (method === 'POST' && path === '/v1/admin/users/refresh') {
		const body = readJson(init)
		const refreshToken = String(body.refresh_token ?? '')
		if (!refreshToken.startsWith(REFRESH_TOKEN_PREFIX)) {
			return fail('Unauthorized', 401)
		}
		return ok(issueTokenPair())
	}

	if (method === 'POST' && path === '/v1/admin/users/logout') {
		return new Response(null, { status: 204 })
	}

	if (method === 'POST' && path === '/v1/admin/users/forgot-password') {
		return new Response(null, { status: 204 })
	}

	if (!isAuthorized) {
		return fail('Unauthorized', 401)
	}

	if (method === 'GET' && path === '/v1/admin/users/me') {
		return ok(demoUser)
	}

	const overviewMatch = path.match(
		/^\/v1\/admin\/workspaces\/([^/]+)\/overview$/,
	)
	if (method === 'GET' && overviewMatch) {
		const workspace = workspaces.find((w) => w.id === overviewMatch[1])
		if (!workspace) return fail('Workspace not found', 404)
		return ok(
			workspace.type === 'CARE_HOME' ? careHomeOverview : homecareOverview,
		)
	}

	return fail(`No mock for ${method} ${path}`, 404)
}
