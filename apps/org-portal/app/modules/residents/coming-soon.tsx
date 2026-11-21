import { HammerIcon } from 'lucide-react'
import { Link } from 'react-router'
import { buttonVariants } from '~/components/ui/button'

interface Props {
	backTo: string
	backLabel: string
}

export function ComingSoonPanel({ backTo, backLabel }: Props) {
	return (
		<div className="bg-card flex flex-col items-center gap-4 rounded-xl border px-6 py-16 text-center">
			<HammerIcon className="text-subtle-foreground size-8" />
			<div>
				<h2 className="m-0 text-lg leading-[26px] font-semibold">
					This part is on its way
				</h2>
				<p className="text-muted-foreground mt-1 mb-0 text-sm">
					It hasn't been built yet.
				</p>
			</div>
			<Link to={backTo} className={buttonVariants({ variant: 'outline' })}>
				{backLabel}
			</Link>
		</div>
	)
}

export function ResidentsComingSoonModule() {
	return <ComingSoonPanel backTo="/residents" backLabel="Back to residents" />
}
