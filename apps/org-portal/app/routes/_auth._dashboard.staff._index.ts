import { APP_NAME } from '~/lib/constants'
import { StaffModule } from '~/modules'

export const handle = {
	breadcrumb: 'All',
}

export function meta() {
	return [{ title: `Staff - ${APP_NAME}` }]
}

export default StaffModule
