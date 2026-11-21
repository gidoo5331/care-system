import { APP_NAME } from '~/lib/constants'
import { IncidentsModule } from '~/modules'

export const handle = {
	breadcrumb: 'All',
}

export function meta() {
	return [{ title: `Incidents - ${APP_NAME}` }]
}

export default IncidentsModule
