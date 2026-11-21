import type { Route } from './+types/mock-api.$'
import { environmentVariables } from '~/lib/actions/env.server'
import { mockFetch } from '~/lib/mock-api'
import { MOCK_API_ADDRESS } from '~/lib/mock-api/address'

async function relay({ request, url, params }: Route.LoaderArgs) {
	if (environmentVariables().API_ADDRESS !== MOCK_API_ADDRESS) {
		throw new Response(null, { status: 404 })
	}

	const method = request.method.toUpperCase()
	const body =
		method === 'GET' || method === 'HEAD' ? undefined : await request.text()

	return mockFetch(`${MOCK_API_ADDRESS}/${params['*']}${url.search}`, {
		method,
		headers: request.headers,
		body,
	})
}

export const loader = relay
export const action = relay
