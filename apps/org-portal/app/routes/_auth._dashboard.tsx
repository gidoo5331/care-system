import { Outlet } from 'react-router'
import { AppRail } from '~/components/app-rail'

export default function AuthDashboard() {
	return (
		<div className="flex min-h-svh">
			<AppRail />
			<Outlet />
		</div>
	)
}
