import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '~/lib/utils'

const buttonVariants = cva(
	"focus-visible:ring-ring/40 aria-invalid:border-destructive inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg border text-sm font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-[18px]",
	{
		variants: {
			variant: {
				default:
					'bg-primary text-primary-foreground border-primary hover:bg-primary-hover hover:border-primary-hover',
				outline: 'bg-card text-foreground border-border-strong hover:bg-muted',
				ghost:
					'text-foreground hover:bg-muted border-transparent bg-transparent',
				destructive:
					'bg-destructive border-destructive text-white hover:opacity-90',
				link: 'text-primary hover:text-primary-hover border-transparent bg-transparent underline-offset-4 hover:underline',
			},
			size: {
				default: 'h-10 px-4',
				sm: 'h-8 gap-1.5 px-3',
				lg: 'h-12 px-6 text-[15px]',
				icon: 'size-10',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'default',
		},
	},
)

function Button({
	className,
	variant,
	size,
	asChild = false,
	...props
}: React.ComponentProps<'button'> &
	VariantProps<typeof buttonVariants> & {
		asChild?: boolean
	}) {
	const Comp = asChild ? Slot : 'button'

	return (
		<Comp
			data-slot="button"
			className={cn(buttonVariants({ variant, size, className }))}
			{...props}
		/>
	)
}

export { Button, buttonVariants }
