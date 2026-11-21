import * as React from 'react'

import { cn } from '~/lib/utils'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
	return (
		<input
			type={type}
			data-slot="input"
			className={cn(
				'border-input bg-card text-foreground placeholder:text-subtle-foreground h-10 w-full min-w-0 rounded-lg border px-3 text-[15px] transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50',
				'focus-visible:border-ring focus-visible:ring-ring/30 focus-visible:ring-[3px]',
				'aria-invalid:border-destructive aria-invalid:ring-destructive/20',
				className,
			)}
			{...props}
		/>
	)
}

export { Input }
