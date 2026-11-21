import { APP_NAME } from '~/lib/constants'
import { AssessmentTemplatesModule } from '~/modules'

export const handle = {
	breadcrumb: 'Assessment templates',
}

export function meta() {
	return [{ title: `Assessment templates - ${APP_NAME}` }]
}

export default AssessmentTemplatesModule
