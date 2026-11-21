import { PrinterIcon } from 'lucide-react'
import { Link } from 'react-router'
import { Button, buttonVariants } from '~/components/ui/button'
import { getCarePlanStatusLabel } from '~/lib/care-plan.utils'
import { formatLongDate } from '~/lib/date'

export function getCarePlanSubtitle(plan: CarePlan) {
	if (plan.status === 'ACTIVE' && plan.active_since) {
		return `Version ${plan.version} · active since ${formatLongDate(plan.active_since)}`
	}
	return `Version ${plan.version} · ${getCarePlanStatusLabel(plan.status).toLowerCase()} · written by ${plan.written_by}`
}

export function CarePlanActions({ plan }: { plan: CarePlan }) {
	const primary =
		plan.status === 'ACTIVE'
			? { label: 'Start review', path: 'edit' }
			: plan.status === 'AWAITING_APPROVAL'
				? { label: 'Review and approve', path: 'edit' }
				: { label: 'Continue draft', path: 'edit' }

	return (
		<>
			<Button variant="outline" onClick={() => window.print()}>
				<PrinterIcon strokeWidth={1.75} />
				Print
			</Button>
			<Link
				to={`/care-plans/${plan.id}/${primary.path}`}
				className={buttonVariants()}
			>
				{primary.label}
			</Link>
		</>
	)
}
