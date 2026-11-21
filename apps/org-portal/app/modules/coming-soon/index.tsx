import { HammerIcon } from 'lucide-react'
import { Link } from 'react-router'
import { ModuleLayout } from '~/components/module-layout'
import { SubNavLink, SubNavTitle } from '~/components/sub-nav'
import { buttonVariants } from '~/components/ui/button'

export function ComingSoonModule() {
	return (
		<ModuleLayout
			label="Overview"
			nav={
				<>
					<SubNavTitle>Overview</SubNavTitle>
					<SubNavLink to="/" end>
						Today
					</SubNavLink>
				</>
			}
		>
			<div className="bg-card flex flex-col items-center gap-4 rounded-xl border px-6 py-16 text-center">
				<HammerIcon className="text-subtle-foreground size-8" />
				<div>
					<h1 className="m-0 text-2xl leading-8 font-semibold">
						This section is on its way
					</h1>
					<p className="text-muted-foreground mt-1 mb-0 text-sm">
						It hasn't been built yet. Everything on the overview is live.
					</p>
				</div>
				<Link to="/" className={buttonVariants({ variant: 'outline' })}>
					Back to overview
				</Link>
			</div>
		</ModuleLayout>
	)
}
