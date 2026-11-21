import { Link } from 'react-router'
import { Avatar } from '~/components/ui/avatar'
import { buttonVariants } from '~/components/ui/button'
import {
	Card,
	CardAction,
	CardContent,
	CardHeader,
	CardTitle,
} from '~/components/ui/card'
import { getInitials } from '~/lib/strings'

interface Props {
	staff: Array<OverviewStaffOnShift>
}

export function OnShift({ staff }: Props) {
	return (
		<Card aria-labelledby="on-shift">
			<CardHeader>
				<CardTitle id="on-shift">On shift now</CardTitle>
				<CardAction>
					<Link to="/visits" className={buttonVariants({ variant: 'outline' })}>
						Rota
					</Link>
				</CardAction>
			</CardHeader>
			<CardContent>
				{staff.length ? (
					<ul className="m-0 flex list-none flex-col gap-4 p-0">
						{staff.map((member) => (
							<li key={member.id} className="flex items-center gap-3">
								<Avatar size="sm" initials={getInitials(member.name)} />
								<span className="min-w-0">
									<span className="block text-[15px] leading-[22px] font-medium">
										{member.name}
									</span>
									<span className="text-muted-foreground block text-[13px] leading-[18px]">
										{member.role} · {member.unit}
									</span>
								</span>
							</li>
						))}
					</ul>
				) : (
					<p className="text-muted-foreground m-0 text-sm">
						No one is clocked in yet.
					</p>
				)}
			</CardContent>
		</Card>
	)
}
