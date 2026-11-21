import { type PropsWithChildren, type ReactNode } from 'react'
import { BrandMark } from './brand-mark'

interface Props {
	title: string
	description?: ReactNode
	footer?: ReactNode
}

export function AuthCardLayout({
	title,
	description,
	footer,
	children,
}: PropsWithChildren<Props>) {
	return (
		<div className="bg-background flex min-h-svh items-center justify-center px-6 py-12">
			<div className="flex w-full max-w-[440px] flex-col gap-6">
				<BrandMark size="lg" withName />
				<section className="bg-card flex flex-col gap-6 rounded-2xl border p-6 sm:p-8">
					<div>
						<h1 className="m-0 text-2xl leading-8 font-semibold">{title}</h1>
						{description ? (
							<p className="text-muted-foreground m-0 text-sm">{description}</p>
						) : null}
					</div>
					{children}
				</section>
				{footer ? (
					<p className="text-muted-foreground m-0 text-sm">{footer}</p>
				) : null}
			</div>
		</div>
	)
}
