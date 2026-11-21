import { APP_NAME } from '~/lib/constants'
import { MedicationRoundModule } from '~/modules'

export const handle = {
	breadcrumb: "Today's rounds",
}

export function meta() {
	return [{ title: `Medication rounds - ${APP_NAME}` }]
}

export default MedicationRoundModule
