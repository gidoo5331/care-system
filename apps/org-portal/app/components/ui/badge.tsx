import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '~/lib/utils'

const badgeVariants = cva(
	'inline-flex h-6 shrink-0 items-center rounded-full px-2.5 text-[13px] leading-[18px] font-medium whitespace-nowrap',
	{
		variants: {
			tone: {
				neutral: 'bg-neutral-tint text-neutral-ink',
				success: 'bg-success-tint text-success-ink',
				warning: 'bg-warning-tint text-warning-ink',
				critical: 'bg-critical-tint text-critical-ink',
				info: 'bg-info-tint text-info-ink',
			},
		},
		defaultVariants: {
			tone: 'neutral',
		},
	},
)

function Badge({
	className,
	tone,
	...props
}: React.ComponentProps<'span'> & VariantProps<typeof badgeVariants>) {
	return (
		<span
			data-slot="badge"
			className={cn(badgeVariants({ tone }), className)}
			{...props}
		/>
	)
}

export { Badge, badgeVariants }
