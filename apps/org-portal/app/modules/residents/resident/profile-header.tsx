import dayjs from 'dayjs'
import { NotebookPenIcon } from 'lucide-react'
import { Link } from 'react-router'
import { Avatar } from '~/components/ui/avatar'
import { Badge } from '~/components/ui/badge'
import { buttonVariants } from '~/components/ui/button'
import {
	getResidentAge,
	getResidentName,
	getRiskLevelLabel,
	getRiskTone,
} from '~/lib/resident.utils'
import { getInitials } from '~/lib/strings'

interface Props {
	resident: Resident
}

function getMetaLine(resident: Resident) {
	const isCareHome = resident.service === 'CARE_HOME'
	const place = isCareHome
		? [resident.room ? `Room ${resident.room}` : null, resident.unit_name]
				.filter(Boolean)
				.join(', ')
		: resident.area
	const since = dayjs(resident.admitted_at).format('D MMMM YYYY')

	return [
		`${getResidentAge(resident)} years`,
		place,
		resident.code,
		`${isCareHome ? 'admitted' : 'care started'} ${since}`,
	]
		.filter(Boolean)
		.join(' · ')
}

export function ResidentProfileHeader({ resident }: Props) {
	const name = getResidentName(resident)
	const basePath = `/residents/${resident.id}`

	return (
		<section
			aria-label={`${name} overview`}
			className="bg-card flex flex-wrap items-start gap-5 rounded-xl border p-6"
		>
			<Avatar size="xl" initials={getInitials(name)} />
			<div className="flex min-w-0 flex-[1_1_320px] flex-col gap-3">
				<div>
					<h1 className="m-0 text-2xl leading-8 font-semibold">{name}</h1>
					<p className="text-muted-foreground m-0 text-sm">
						{getMetaLine(resident)}
					</p>
				</div>
				<ul className="m-0 flex list-none flex-wrap gap-2 p-0">
					{resident.status === 'IN_HOSPITAL' ? (
						<li>
							<Badge tone="info">In hospital</Badge>
						</li>
					) : null}
					{resident.allergies.map((allergy) => (
						<li key={allergy}>
							<Badge tone="critical">Allergy: {allergy.toLowerCase()}</Badge>
						</li>
					))}
					{resident.risk_level !== 'LOW' ? (
						<li>
							<Badge tone={getRiskTone(resident.risk_level)}>
								{getRiskLevelLabel(resident.risk_level)} risk
								{resident.risk_reason ? `: ${resident.risk_reason}` : ''}
							</Badge>
						</li>
					) : null}
					{resident.conditions.map((condition) => (
						<li key={condition}>
							<Badge>{condition}</Badge>
						</li>
					))}
				</ul>
			</div>
			<div className="flex flex-wrap items-center gap-2">
				<Link
					to={`${basePath}/notes`}
					className={buttonVariants({ variant: 'outline' })}
				>
					<NotebookPenIcon strokeWidth={1.75} />
					Add note
				</Link>
				<Link to={`${basePath}/medication`} className={buttonVariants()}>
					Record medication
				</Link>
			</div>
		</section>
	)
}
