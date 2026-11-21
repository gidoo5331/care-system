import { createCookieSessionStorage, type Session } from 'react-router'
import { KEEP_SIGNED_IN_MAX_AGE_SECONDS, USER_CIPHER } from '../constants'
import { environmentVariables } from './env.server'

type SessionData = {
	authToken: string
	// Never exposed to the browser — deliberately absent from root.tsx's ENV
	// block. It outlives the access token by months; handing it to window.ENV
	// would give any XSS the better prize.
	refreshToken: string
	selectedWorkspaceId: string
	keepSignedIn: boolean
}

type SessionFlashData = {
	error: string
	success: string
}

type AuthSession = Session<SessionData, SessionFlashData>

const env = environmentVariables()

const { getSession, commitSession, destroySession } =
	createCookieSessionStorage<SessionData, SessionFlashData>({
		cookie: {
			name: USER_CIPHER,
			httpOnly: true,
			path: '/',
			sameSite: 'lax',
			secrets: [env.SESSION_SECRET],
			secure: env.NODE_ENV === 'production',
		},
	})

const getAuthSession = getSession

/**
 * Every commit re-issues the cookie, so "Keep me signed in" has to be
 * re-applied each time — otherwise the first token rotation would quietly
 * downgrade a persistent cookie to a browser-session one.
 */
const saveAuthSession = (session: AuthSession) =>
	commitSession(session, {
		maxAge: session.get('keepSignedIn')
			? KEEP_SIGNED_IN_MAX_AGE_SECONDS
			: undefined,
	})

const deleteAuthSession = destroySession

export { getAuthSession, saveAuthSession, deleteAuthSession }
