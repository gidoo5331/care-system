import { useLoaderData } from 'react-router'
import { CarePlanEditor } from '.'
import type { loader as editLoader } from '~/routes/_auth._dashboard.care-plans.$carePlanId_.edit'
import type { loader as newLoader } from '~/routes/_auth._dashboard.care-plans.new'

export function NewCarePlanModule() {
	const { residentOptions, prefill } = useLoaderData<typeof newLoader>()
	return <CarePlanEditor residentOptions={residentOptions} prefill={prefill} />
}

export function EditCarePlanModule() {
	const { plan, prefill } = useLoaderData<typeof editLoader>()
	return (
		<CarePlanEditor
			key={`${plan.id}-${plan.version}-${plan.status}-${prefill?.formTitle ?? ''}`}
			plan={plan}
			prefill={prefill}
		/>
	)
}
