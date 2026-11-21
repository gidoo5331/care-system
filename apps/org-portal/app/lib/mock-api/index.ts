/**
 * Stands in for the backend until it exists. Selected by leaving API_ADDRESS
 * empty; requests then go to MOCK_API_ADDRESS and are answered here, so the
 * api/ layer, session and middleware run exactly as they will against the
 * real service. Server-only — the browser reaches it via routes/mock-api.$.ts.
 */
import { MOCK_API_ADDRESS } from './address'
import {
	filterCarePlans,
	findCarePlan,
	findCarePlanForResident,
	getCarePlanCounts,
} from './care-plans'
import { fail, noContent, ok, paginate, readBearer, readJson } from './http'
import {
	addPrescription,
	getMedicationCounts,
	getMedicationRound,
	validatePrescriptionInput,
} from './medication'
import {
	getAttentionList,
	getOpenAttention,
	handleAttention,
} from './needs-attention'
import {
	handleIncidents,
	handleRecords,
	handleSettings,
	handleStaff,
	handleVisits,
	type WorkspaceRequest,
} from './operations'
import { careHomeOverview, homecareOverview } from './overview'
import { countAppointmentsToday } from './records'
import {
	createResident,
	filterResidents,
	findResident,
	getResidentCounts,
	validateResidentInput,
} from './residents'
import { getResidentSummary } from './summary'
import { demoUser, workspaces } from './users'

const DEMO_PASSWORD = 'password'
const ACCESS_TOKEN_PREFIX = 'demo-access-'
const REFRESH_TOKEN_PREFIX = 'demo-refresh-'

function issueTokenPair() {
	const stamp = Date.now().toString(36)
	return {
		token: `${ACCESS_TOKEN_PREFIX}${stamp}`,
		expires_in: 3600,
		refresh_token: `${REFRESH_TOKEN_PREFIX}${stamp}`,
		refresh_expires_in: 60 * 60 * 24 * 90,
	}
}

function handleAuth(method: string, path: string, init?: RequestInit) {
	if (method !== 'POST') return null

	if (path === '/v1/admin/users/login') {
		if (readJson(init).password !== DEMO_PASSWORD) {
			return fail('Incorrect email or password.', 401)
		}
		return ok({ ...issueTokenPair(), user: demoUser })
	}

	if (path === '/v1/admin/users/refresh') {
		const refreshToken = String(readJson(init).refresh_token ?? '')
		if (!refreshToken.startsWith(REFRESH_TOKEN_PREFIX)) {
			return fail('Unauthorized', 401)
		}
		return ok(issueTokenPair())
	}

	if (
		path === '/v1/admin/users/logout' ||
		path === '/v1/admin/users/forgot-password'
	) {
		return noContent()
	}

	return null
}

function handleResidents({
	method,
	rest,
	searchParams,
	init,
}: WorkspaceRequest) {
	if (rest === '/residents') {
		if (method === 'POST') {
			const input = readJson(init) as Partial<CreateResidentInput>
			const error = validateResidentInput(input)
			if (error) return fail(error, 400)
			return ok(createResident(input as CreateResidentInput), 201)
		}
		return ok(paginate(filterResidents(searchParams), searchParams))
	}

	if (rest === '/residents/counts') {
		return ok({
			...getResidentCounts(),
			appointments_today: countAppointmentsToday(),
		})
	}

	const match = rest.match(/^\/residents\/([^/]+)(\/[a-z-]+)?$/)
	if (!match) return null

	const resident = findResident(match[1] ?? '')
	if (!resident) return fail('Resident not found', 404)

	switch (`${method} ${match[2] ?? ''}`) {
		case 'GET ':
			return ok(resident)
		case 'GET /summary':
			return ok(getResidentSummary(resident))
		case 'GET /care-plan': {
			const plan = findCarePlanForResident(resident.id)
			return plan ? ok(plan) : fail('No care plan yet', 404)
		}
		case 'POST /prescriptions': {
			const input = readJson(init) as Partial<CreatePrescriptionInput>
			const error = validatePrescriptionInput(resident, input)
			if (error) return fail(error.message, error.status)
			return ok(
				addPrescription(resident, input as CreatePrescriptionInput),
				201,
			)
		}
		default:
			return null
	}
}

function handleCarePlans({ method, rest, searchParams }: WorkspaceRequest) {
	if (method !== 'GET') return null
	if (rest === '/care-plans') {
		return ok(paginate(filterCarePlans(searchParams), searchParams))
	}
	if (rest === '/care-plans/counts') return ok(getCarePlanCounts())

	const match = rest.match(/^\/care-plans\/([^/]+)$/)
	if (!match) return null
	const plan = findCarePlan(match[1] ?? '')
	return plan ? ok(plan) : fail('Care plan not found', 404)
}

function handleMedication({ method, rest, searchParams }: WorkspaceRequest) {
	if (method !== 'GET') return null
	if (rest === '/medication-rounds') return ok(getMedicationRound(searchParams))
	if (rest === '/medication/counts') return ok(getMedicationCounts())
	return null
}

function handleWorkspace(
	method: string,
	path: string,
	searchParams: URLSearchParams,
	init?: RequestInit,
) {
	const match = path.match(/^\/v1\/admin\/workspaces\/([^/]+)(\/.*)$/)
	if (!match) return null

	const [, workspaceId, rest = ''] = match
	const workspace = workspaces.find((w) => w.id === workspaceId)
	if (!workspace) return fail('Workspace not found', 404)

	if (method === 'GET' && rest === '/overview') {
		const open = getOpenAttention(workspace)
		return ok({
			...(workspace.type === 'CARE_HOME' ? careHomeOverview : homecareOverview),
			needs_attention: open.slice(0, 5),
			needs_attention_count: open.length,
		})
	}
	if (method === 'GET' && rest === '/needs-attention') {
		return ok(getAttentionList(workspace, searchParams))
	}
	if (method === 'POST' && rest === '/needs-attention/handle') {
		const result = handleAttention(
			workspace,
			readJson(init) as Partial<HandleAttentionInput>,
			demoUser.name,
		)
		return result.error ? fail(result.error, 409) : ok(result.item)
	}

	const request: WorkspaceRequest = {
		method,
		rest,
		workspace,
		searchParams,
		init,
	}
	return (
		handleRecords(request) ??
		handleResidents(request) ??
		handleCarePlans(request) ??
		handleMedication(request) ??
		handleIncidents(request) ??
		handleVisits(request) ??
		handleStaff(request) ??
		handleSettings(request)
	)
}

export async function mockFetch(
	url: string,
	init?: RequestInit,
): Promise<Response> {
	const parsed = new URL(url.slice(MOCK_API_ADDRESS.length), 'http://mock')
	const path = parsed.pathname
	const method = (init?.method ?? 'GET').toUpperCase()

	const authResponse = handleAuth(method, path, init)
	if (authResponse) return authResponse

	if (!readBearer(init).startsWith(ACCESS_TOKEN_PREFIX)) {
		return fail('Unauthorized', 401)
	}

	if (method === 'GET' && path === '/v1/admin/users/me') {
		return ok(demoUser)
	}

	return (
		handleWorkspace(method, path, parsed.searchParams, init) ??
		fail(`No mock for ${method} ${path}`, 404)
	)
}
