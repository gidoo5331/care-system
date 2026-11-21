/**
 * Stands in for the backend until it exists. Selected by leaving API_ADDRESS
 * empty; requests then go to MOCK_API_ADDRESS and are answered here, so the
 * api/ layer, session and middleware run exactly as they will against the
 * real service.
 */
import { fail, noContent, ok, paginate, readBearer, readJson } from './http'
import { careHomeOverview, homecareOverview } from './overview'
import {
	filterResidents,
	getResidentCounts,
	getResidentSummary,
	residents,
} from './residents'
import { demoUser, workspaces } from './users'

export const MOCK_API_ADDRESS = 'mock://care-platform/api'

const DEMO_PASSWORD = 'password'
const ACCESS_TOKEN_PREFIX = 'demo-access-'
const REFRESH_TOKEN_PREFIX = 'demo-refresh-'

export function isMockApiUrl(url: string) {
	return url.startsWith(MOCK_API_ADDRESS)
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

function handleWorkspace(
	method: string,
	path: string,
	searchParams: URLSearchParams,
) {
	const match = path.match(/^\/v1\/admin\/workspaces\/([^/]+)(\/.*)$/)
	if (!match || method !== 'GET') return null

	const [, workspaceId, rest = ''] = match
	const workspace = workspaces.find((w) => w.id === workspaceId)
	if (!workspace) return fail('Workspace not found', 404)

	if (rest === '/overview') {
		return ok(
			workspace.type === 'CARE_HOME' ? careHomeOverview : homecareOverview,
		)
	}

	if (rest === '/residents') {
		return ok(paginate(filterResidents(searchParams), searchParams))
	}

	if (rest === '/residents/counts') {
		return ok(getResidentCounts())
	}

	const residentMatch = rest.match(/^\/residents\/([^/]+)(\/summary)?$/)
	if (residentMatch) {
		const resident = residents.find((r) => r.id === residentMatch[1])
		if (!resident) return fail('Resident not found', 404)
		return ok(residentMatch[2] ? getResidentSummary(resident) : resident)
	}

	return null
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
		handleWorkspace(method, path, parsed.searchParams) ??
		fail(`No mock for ${method} ${path}`, 404)
	)
}
