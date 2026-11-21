import { type ReactNode } from 'react'

interface Props {
	title: ReactNode
	description?: ReactNode
	actions?: ReactNode
}

export function PageHeader({ title, description, actions }: Props) {
	return (
		<div className="flex flex-wrap items-end justify-between gap-4">
			<div className="min-w-0">
				<h1 className="m-0 text-2xl leading-8 font-semibold">{title}</h1>
				{description ? (
					<p className="text-muted-foreground m-0 text-sm">{description}</p>
				) : null}
			</div>
			{actions ? (
				<div className="flex flex-wrap items-center gap-2">{actions}</div>
			) : null}
		</div>
	)
}
