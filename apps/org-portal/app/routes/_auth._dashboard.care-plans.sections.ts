import { APP_NAME } from '~/lib/constants'
import { CarePlanSectionsModule } from '~/modules'

export const handle = {
	breadcrumb: 'Care plan sections',
}

export function meta() {
	return [{ title: `Care plan sections - ${APP_NAME}` }]
}

export default CarePlanSectionsModule
