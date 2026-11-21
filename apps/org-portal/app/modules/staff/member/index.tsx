import { MessageSquareIcon } from 'lucide-react'
import { Link, Outlet, useLoaderData } from 'react-router'
import { RouteTabs } from '~/components/route-tabs'
import { Avatar } from '~/components/ui/avatar'
import { Badge } from '~/components/ui/badge'
import { buttonVariants } from '~/components/ui/button'
import {
	getStaffRoleLabel,
	getStaffToday,
	getTrainingSummary,
} from '~/lib/staff.utils'
import { getInitials } from '~/lib/strings'
import type { loader } from '~/routes/_auth._dashboard.staff.$staffId'

const SECTIONS = [
	{ label: 'Training', path: '', end: true },
	{ label: 'Rota', path: '/rota' },
	{ label: 'Documents', path: '/documents' },
	{ label: 'Activity', path: '/activity' },
] as const

function getMetaLine(staff: StaffMember) {
	const parts = [getStaffRoleLabel(staff.role), staff.works_at]
	if (staff.today === 'ON_SHIFT' && staff.shift_ends_at) {
		parts.push(`on shift until ${staff.shift_ends_at}`)
	} else if (staff.today === 'ON_VISITS' && staff.shift_ends_at) {
		parts.push(`on visits until ${staff.shift_ends_at}`)
	}
	return parts.join(' · ')
}

export function StaffMemberModule() {
	const { staff } = useLoaderData<typeof loader>()
	const today = getStaffToday(staff.today)
	const training = getTrainingSummary(staff)
	const basePath = `/staff/${staff.id}`

	return (
		<>
			<section
				aria-label={`${staff.name} overview`}
				className="bg-card flex flex-wrap items-start gap-5 rounded-xl border p-6"
			>
				<Avatar size="xl" initials={getInitials(staff.name)} />
				<div className="flex min-w-0 flex-[1_1_320px] flex-col gap-3">
					<div>
						<h1 className="m-0 text-2xl leading-8 font-semibold">
							{staff.name}
						</h1>
						<p className="text-muted-foreground m-0 text-sm">
							{getMetaLine(staff)}
						</p>
					</div>
					<div className="flex flex-wrap gap-2">
						<Badge tone={today.tone}>{today.label}</Badge>
						<Badge tone={training.tone}>
							{training.tone === 'success'
								? 'Training up to date'
								: `Training: ${training.label}`}
						</Badge>
					</div>
				</div>
				<div className="flex flex-wrap items-center gap-2">
					<a
						href={`sms:${staff.phone_number.replace(/\s/g, '')}`}
						className={buttonVariants({ variant: 'outline' })}
					>
						<MessageSquareIcon strokeWidth={1.75} />
						Message
					</a>
					<Link to="/visits/rota" className={buttonVariants()}>
						Add to rota
					</Link>
				</div>
			</section>

			<RouteTabs
				label="Sections"
				tabs={SECTIONS.map((section) => ({
					label: section.label,
					to: `${basePath}${section.path}`,
					end: 'end' in section ? section.end : undefined,
				}))}
			/>
			<Outlet />
		</>
	)
}
