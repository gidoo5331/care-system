import { APP_DOMAIN } from './constants'

export function removeTrailingSlash(s: string) {
	return s.endsWith('/') ? s.slice(0, -1) : s
}

function getOrigin(requestInfo?: { origin?: string; path: string }) {
	return requestInfo?.origin ?? `https://${APP_DOMAIN}`
}

function getUrl(requestInfo?: { origin: string; path: string }) {
	return removeTrailingSlash(
		`${getOrigin(requestInfo)}${requestInfo?.path ?? ''}`,
	)
}

export function getDisplayUrl(requestInfo?: { origin: string; path: string }) {
	return getUrl(requestInfo).replace(/^https?:\/\//, '')
}

/**
 * @returns domain URL (without a ending slash, like: https://${APP_DOMAIN})
 */
export function getDomainUrl(request: Request) {
	const host =
		request.headers.get('X-Forwarded-Host') ?? request.headers.get('host')
	if (!host) {
		throw new Error('Could not determine domain URL.')
	}
	const protocol = host.includes('localhost') ? 'http' : 'https'
	return `${protocol}://${host}`
}

/**
 * Only same-origin paths are honoured, so a crafted `return_to` cannot bounce
 * a freshly signed-in user to another site.
 */
export function getSafeReturnTo(url: URL, fallback = '/') {
	const returnTo = url.searchParams.get('return_to')
	if (!returnTo || !returnTo.startsWith('/') || returnTo.startsWith('//')) {
		return fallback
	}
	return returnTo
}
