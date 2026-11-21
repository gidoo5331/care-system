import { Link } from 'react-router'
import { BrandMark } from '~/components/brand-mark'
import { buttonVariants } from '~/components/ui/button'

interface Props {
	status?: number
	title?: string
	message?: string
}

export function NotFoundModule({ status = 404, title, message }: Props) {
	return (
		<main className="bg-background flex min-h-svh flex-col items-center justify-center gap-10 px-6 py-24">
			<BrandMark size="lg" withName />
			<div className="text-center">
				<p className="text-primary m-0 text-base font-semibold">{status}</p>
				<h1 className="mt-4 mb-0 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
					{title ?? 'Page not found'}
				</h1>
				<p className="text-muted-foreground mt-6 mb-0 text-lg text-pretty">
					{message || 'Sorry, we couldn’t find the page you’re looking for.'}
				</p>
				<div className="mt-10">
					<Link to="/" className={buttonVariants()}>
						Go back home
					</Link>
				</div>
			</div>
		</main>
	)
}
