import { CheckCircle2Icon } from 'lucide-react'
import { Link } from 'react-router'
import { Badge } from '~/components/ui/badge'
import { buttonVariants } from '~/components/ui/button'
import { Card, CardAction, CardHeader, CardTitle } from '~/components/ui/card'

interface Props {
	items: Array<OverviewAttentionItem>
}

export function NeedsAttention({ items }: Props) {
	return (
		<Card aria-labelledby="needs-attention">
			<CardHeader>
				<CardTitle id="needs-attention">Needs attention</CardTitle>
				<CardAction>
					<Link
						to="/needs-attention"
						className={buttonVariants({ variant: 'outline' })}
					>
						View all
					</Link>
				</CardAction>
			</CardHeader>

			{items.length ? (
				<ul className="m-0 list-none p-0">
					{items.map((item) => (
						<li
							key={item.id}
							className="flex min-h-[72px] flex-wrap items-center gap-x-4 gap-y-2 border-b px-6 py-3 last:border-b-0 sm:flex-nowrap"
						>
							<span className="w-[120px] shrink-0">
								<Badge tone={item.tone}>{item.kind}</Badge>
							</span>
							<span className="min-w-0 flex-1 basis-48">
								<span className="block text-[15px] leading-[22px] font-medium">
									{item.title}
								</span>
								<span className="text-muted-foreground block text-sm">
									{item.detail}
								</span>
							</span>
							<Link
								to={item.action_href}
								className={buttonVariants({ variant: 'outline' })}
							>
								{item.action_label}
							</Link>
						</li>
					))}
				</ul>
			) : (
				<div className="text-muted-foreground flex items-center gap-3 px-6 py-8 text-sm">
					<CheckCircle2Icon className="text-success size-5" />
					Nothing needs your attention right now.
				</div>
			)}
		</Card>
	)
}
