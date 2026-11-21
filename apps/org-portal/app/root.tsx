import './app.css'

import dayjs from 'dayjs'
import 'dayjs/locale/en-gb.js'
import { ThemeProvider } from 'next-themes'
import {
	isRouteErrorResponse,
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	useLoaderData,
} from 'react-router'
import type { Route } from './+types/root'

import { getAuthSession } from './lib/actions/auth.session.server'
import { resolveAuthToken } from './lib/actions/auth.token.server'
import { environmentVariables } from './lib/actions/env.server'
import { safeString } from './lib/strings'
import { NotFoundModule } from './modules'
import { Providers } from './providers'

dayjs.locale('en-gb')

export const links: Route.LinksFunction = () => [
	{ rel: 'preconnect', href: 'https://fonts.googleapis.com' },
	{
		rel: 'preconnect',
		href: 'https://fonts.gstatic.com',
		crossOrigin: 'anonymous',
	},
	{
		rel: 'stylesheet',
		href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=IBM+Plex+Mono&display=swap',
	},
]

export async function loader({ request, context }: Route.LoaderArgs) {
	const env = environmentVariables()
	const authSession = await getAuthSession(request.headers.get('Cookie'))

	return {
		ENV: {
			API_ADDRESS: env.API_ADDRESS,
			AUTH_TOKEN: await resolveAuthToken(request, context),
			SELECTED_WORKSPACE_ID: safeString(authSession.get('selectedWorkspaceId')),
		},
	}
}

export function Layout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en-GB" suppressHydrationWarning>
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<meta
					name="theme-color"
					media="(prefers-color-scheme: light)"
					content="#0F2A3D"
				/>
				<meta
					name="theme-color"
					media="(prefers-color-scheme: dark)"
					content="#0A1D2A"
				/>
				<Meta />
				<Links />
			</head>
			<body>
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange
				>
					{children}
				</ThemeProvider>
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	)
}

export default function App() {
	const { ENV } = useLoaderData<typeof loader>()

	if (typeof window !== 'undefined') {
		window.ENV = ENV
	}

	return (
		<Providers>
			<Outlet />
		</Providers>
	)
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
	let message = 'Something went wrong'
	let details = 'An unexpected error occurred.'
	let status = 500

	if (isRouteErrorResponse(error)) {
		status = error.status
		if (error.status === 403) {
			message = 'Forbidden'
			details = "You don't have permission to access this page."
		} else if (error.status === 404) {
			message = 'Page not found'
			details = 'The requested page could not be found.'
		} else {
			details = error.statusText || details
		}
	} else if (import.meta.env.DEV && error instanceof Error) {
		message = error.message
		details = error.stack || details
	}

	return <NotFoundModule status={status} title={message} message={details} />
}
