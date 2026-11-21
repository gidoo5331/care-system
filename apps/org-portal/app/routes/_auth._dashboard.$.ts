import { APP_NAME } from '~/lib/constants'
import { ComingSoonModule } from '~/modules'

export const handle = {
	breadcrumb: 'Coming soon',
}

export function meta() {
	return [{ title: `Coming soon - ${APP_NAME}` }]
}

export default ComingSoonModule
