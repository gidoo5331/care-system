export const NODE_ENV = process.env.NODE_ENV
export const APP_NAME = 'Care Platform'
export const APP_DOMAIN =
	NODE_ENV === 'production' ? 'app.careplatform.com' : 'localhost'

export const USER_CIPHER = 'care-platform-account'

export const KEEP_SIGNED_IN_MAX_AGE_SECONDS = 60 * 60 * 24 * 30

export const SELECT_WORKSPACE_ROUTE = '/select-workspace'

export const QUERY_KEYS = {
	CURRENT_USER: 'current-user',
	WORKSPACE_OVERVIEW: 'workspace-overview',
	RESIDENTS: 'residents',
	RESIDENT: 'resident',
	RESIDENT_SUMMARY: 'resident-summary',
} as const

export const PAGINATION_DEFAULTS = {
	PAGE: 1,
	PER_PAGE: 20,
} as const
