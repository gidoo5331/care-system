import * as React from 'react'

import { cn } from '~/lib/utils'

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
	return (
		<textarea
			data-slot="textarea"
			className={cn(
				'border-input bg-card text-foreground placeholder:text-subtle-foreground min-h-20 w-full min-w-0 rounded-lg border px-3 py-2 text-[15px] outline-none disabled:cursor-not-allowed disabled:opacity-50',
				'focus-visible:border-ring focus-visible:ring-ring/30 focus-visible:ring-[3px]',
				'aria-invalid:border-destructive',
				className,
			)}
			{...props}
		/>
	)
}

export { Textarea }
