export function ok<T>(data: T, status = 200) {
	return Response.json({ data, errors: null }, { status })
}

export function noContent() {
	return new Response(null, { status: 204 })
}

export function fail(message: string, status: number) {
	return Response.json({ data: null, errors: { message } }, { status })
}

export function readBearer(init?: RequestInit) {
	const header = new Headers(init?.headers).get('Authorization') ?? ''
	return header.replace(/^Bearer\s+/i, '')
}

export function readJson(init?: RequestInit): Record<string, unknown> {
	if (typeof init?.body !== 'string') return {}
	try {
		return JSON.parse(init.body) as Record<string, unknown>
	} catch {
		return {}
	}
}

export function paginate<T>(
	rows: Array<T>,
	searchParams: URLSearchParams,
): FetchMultipleDataResponse<T> {
	const page = Math.max(1, Number(searchParams.get('page')) || 1)
	const pageSize = Math.max(1, Number(searchParams.get('page_size')) || 20)
	const start = (page - 1) * pageSize

	return {
		rows: rows.slice(start, start + pageSize),
		meta: {
			total: rows.length,
			page,
			page_size: pageSize,
			has_prev_page: page > 1,
			has_next_page: start + pageSize < rows.length,
		},
	}
}

export const daysAgo = (days: number) =>
	new Date(Date.now() - days * 24 * 60 * 60 * 1000)

export const daysFromNow = (days: number) => daysAgo(-days)

export function todayAt(time: string) {
	const [hours = 0, minutes = 0] = time.split(':').map(Number)
	const date = new Date()
	date.setHours(hours, minutes, 0, 0)
	return date
}
