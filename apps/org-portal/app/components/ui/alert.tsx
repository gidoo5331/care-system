import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '~/lib/utils'

const alertVariants = cva(
	'flex items-start gap-3 rounded-lg px-4 py-3 text-sm [&>svg]:mt-0.5 [&>svg]:size-4 [&>svg]:shrink-0',
	{
		variants: {
			tone: {
				critical: 'bg-critical-tint text-critical-ink',
				success: 'bg-success-tint text-success-ink',
				info: 'bg-info-tint text-info-ink',
			},
		},
		defaultVariants: {
			tone: 'info',
		},
	},
)

function Alert({
	className,
	tone,
	...props
}: React.ComponentProps<'div'> & VariantProps<typeof alertVariants>) {
	return (
		<div
			data-slot="alert"
			role="alert"
			className={cn(alertVariants({ tone }), className)}
			{...props}
		/>
	)
}

export { Alert }
