import { APP_NAME } from '~/lib/constants'
import { ReportsModule } from '~/modules'

export const handle = {
	breadcrumb: 'All reports',
}

export function meta() {
	return [{ title: `Reports - ${APP_NAME}` }]
}

export default ReportsModule
