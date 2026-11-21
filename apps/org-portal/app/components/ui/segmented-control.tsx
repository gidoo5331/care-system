import { cn } from '~/lib/utils'

interface Option<T extends string> {
	value: T
	label: string
}

interface Props<T extends string> {
	label: string
	options: ReadonlyArray<Option<T>>
	value: T
	onValueChange: (value: T) => void
	className?: string
}

export function SegmentedControl<T extends string>({
	label,
	options,
	value,
	onValueChange,
	className,
}: Props<T>) {
	return (
		<div
			role="radiogroup"
			aria-label={label}
			className={cn(
				'bg-muted inline-flex h-10 shrink-0 items-center gap-1 rounded-lg p-1',
				className,
			)}
		>
			{options.map((option) => {
				const isSelected = option.value === value
				return (
					<button
						key={option.value}
						type="button"
						role="radio"
						aria-checked={isSelected}
						onClick={() => onValueChange(option.value)}
						className={cn(
							'focus-visible:ring-ring/40 h-8 cursor-pointer rounded-md px-3 text-sm font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-[3px]',
							isSelected
								? 'bg-card text-foreground shadow-xs'
								: 'text-muted-foreground hover:text-foreground',
						)}
					>
						{option.label}
					</button>
				)
			})}
		</div>
	)
}
