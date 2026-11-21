import { APP_NAME } from '~/lib/constants'
import { CarePlansModule } from '~/modules'

export const handle = {
	breadcrumb: 'All',
}

export function meta() {
	return [{ title: `Care plans - ${APP_NAME}` }]
}

export default CarePlansModule
