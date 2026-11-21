import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '~/lib/utils'

const avatarVariants = cva(
	'bg-accent text-accent-foreground inline-flex shrink-0 items-center justify-center rounded-full font-semibold',
	{
		variants: {
			size: {
				sm: 'size-9 text-[13px]',
				default: 'size-10 text-base',
				lg: 'size-11 text-base',
			},
		},
		defaultVariants: {
			size: 'default',
		},
	},
)

function Avatar({
	className,
	size,
	initials,
	...props
}: React.ComponentProps<'span'> &
	VariantProps<typeof avatarVariants> & { initials: string }) {
	return (
		<span
			data-slot="avatar"
			aria-hidden="true"
			className={cn(avatarVariants({ size }), className)}
			{...props}
		>
			{initials}
		</span>
	)
}

export { Avatar }
