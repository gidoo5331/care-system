import { useLoaderData } from 'react-router'
import { CarePlanActions, getCarePlanSubtitle } from './plan-actions'
import { CarePlanView } from './plan-view'
import { PageHeader } from '~/components/page-header'
import type { loader } from '~/routes/_auth._dashboard.care-plans.$carePlanId'

export function CarePlanModule() {
	const { plan } = useLoaderData<typeof loader>()

	return (
		<>
			<PageHeader
				title={`${plan.resident.first_name} ${plan.resident.last_name}'s care plan`}
				description={getCarePlanSubtitle(plan)}
				actions={<CarePlanActions plan={plan} />}
			/>
			<CarePlanView plan={plan} />
		</>
	)
}
