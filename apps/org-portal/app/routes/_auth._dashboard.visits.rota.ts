import { APP_NAME } from '~/lib/constants'
import { RotaModule } from '~/modules'

export const handle = {
	breadcrumb: 'Rota',
}

export function meta() {
	return [{ title: `Rota - ${APP_NAME}` }]
}

export default RotaModule
