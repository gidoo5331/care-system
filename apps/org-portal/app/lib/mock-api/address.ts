export const MOCK_API_ADDRESS = 'mock://care-platform/api'

/** Where the browser reaches the mock: a resource route on this app's server. */
export const MOCK_API_RELAY_PATH = '/mock-api'

export function isMockApiUrl(url: string) {
	return url.startsWith(MOCK_API_ADDRESS)
}
