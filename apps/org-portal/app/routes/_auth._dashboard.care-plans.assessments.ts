import { APP_NAME } from '~/lib/constants'
import { RiskAssessmentsModule } from '~/modules'

export const handle = {
	breadcrumb: 'Assessments',
}

export function meta() {
	return [{ title: `Assessments - ${APP_NAME}` }]
}

export default RiskAssessmentsModule
