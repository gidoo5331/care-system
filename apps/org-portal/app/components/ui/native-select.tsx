import { ChevronDownIcon } from 'lucide-react'
import * as React from 'react'

import { cn } from '~/lib/utils'

function NativeSelect({
	className,
	children,
	...props
}: React.ComponentProps<'select'>) {
	return (
		<div className="relative">
			<select
				data-slot="native-select"
				className={cn(
					'border-input bg-card text-foreground h-10 w-full min-w-0 cursor-pointer appearance-none rounded-lg border pr-10 pl-3 text-[15px] outline-none disabled:cursor-not-allowed disabled:opacity-50',
					'focus-visible:border-ring focus-visible:ring-ring/30 focus-visible:ring-[3px]',
					'aria-invalid:border-destructive',
					className,
				)}
				{...props}
			>
				{children}
			</select>
			<ChevronDownIcon
				aria-hidden="true"
				className="text-subtle-foreground pointer-events-none absolute top-1/2 right-3 size-[18px] -translate-y-1/2"
				strokeWidth={1.75}
			/>
		</div>
	)
}

export { NativeSelect }
