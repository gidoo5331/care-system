import { CheckIcon } from 'lucide-react'
import { Fragment } from 'react'
import { cn } from '~/lib/utils'

interface Props {
	steps: ReadonlyArray<string>
	current: number
}

export function Stepper({ steps, current }: Props) {
	return (
		<ol
			aria-label="Steps"
			className="m-0 flex list-none flex-wrap items-center gap-3 p-0"
		>
			{steps.map((step, index) => {
				const isCurrent = index === current
				const isDone = index < current
				return (
					<Fragment key={step}>
						{index > 0 ? (
							<li
								aria-hidden="true"
								className="bg-border-strong h-px min-w-4 flex-[1_1_24px]"
							/>
						) : null}
						<li
							aria-current={isCurrent ? 'step' : undefined}
							className={cn(
								'flex items-center gap-2 text-sm',
								isCurrent
									? 'text-foreground font-semibold'
									: 'text-muted-foreground font-medium',
							)}
						>
							<span
								className={cn(
									'flex size-7 items-center justify-center rounded-full text-[13px] font-semibold',
									isCurrent || isDone
										? 'bg-primary text-primary-foreground'
										: 'bg-muted text-muted-foreground',
								)}
							>
								{isDone ? (
									<CheckIcon className="size-4" strokeWidth={2.5} />
								) : (
									index + 1
								)}
							</span>
							{step}
						</li>
					</Fragment>
				)
			})}
		</ol>
	)
}
