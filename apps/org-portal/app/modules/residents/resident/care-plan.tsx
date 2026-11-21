import { ClipboardListIcon } from 'lucide-react'
import { Link, useLoaderData } from 'react-router'
import { Badge } from '~/components/ui/badge'
import { buttonVariants } from '~/components/ui/button'
import {
	getCarePlanStatusLabel,
	getCarePlanStatusTone,
} from '~/lib/care-plan.utils'
import {
	CarePlanActions,
	getCarePlanSubtitle,
} from '~/modules/care-plans/plan/plan-actions'
import { CarePlanView } from '~/modules/care-plans/plan/plan-view'
import type { loader } from '~/routes/_auth._dashboard.residents.$residentId.care-plan'

export function ResidentCarePlanModule() {
	const { plan } = useLoaderData<typeof loader>()

	if (!plan) {
		return (
			<div className="bg-card flex flex-col items-center gap-4 rounded-xl border px-6 py-16 text-center">
				<ClipboardListIcon className="text-subtle-foreground size-8" />
				<div>
					<h2 className="m-0 text-lg leading-[26px] font-semibold">
						No care plan yet
					</h2>
					<p className="text-muted-foreground mt-1 mb-0 text-sm">
						Write one so staff know how to support them.
					</p>
				</div>
				<Link to="/care-plans/new" className={buttonVariants()}>
					Write care plan
				</Link>
			</div>
		)
	}

	return (
		<>
			<div className="flex flex-wrap items-center justify-between gap-4">
				<div className="flex flex-wrap items-center gap-3">
					<Badge tone={getCarePlanStatusTone(plan.status)}>
						{getCarePlanStatusLabel(plan.status)}
					</Badge>
					<p className="text-muted-foreground m-0 text-sm">
						{getCarePlanSubtitle(plan)}
					</p>
				</div>
				<div className="flex flex-wrap items-center gap-2">
					<CarePlanActions plan={plan} />
				</div>
			</div>
			<CarePlanView plan={plan} />
		</>
	)
}
