import * as SheetPrimitive from '@radix-ui/react-dialog'
import { XIcon } from 'lucide-react'
import * as React from 'react'

import { cn } from '~/lib/utils'

function Sheet({ ...props }: React.ComponentProps<typeof SheetPrimitive.Root>) {
	return <SheetPrimitive.Root data-slot="sheet" {...props} />
}

function SheetTrigger({
	...props
}: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
	return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />
}

function SheetClose({
	...props
}: React.ComponentProps<typeof SheetPrimitive.Close>) {
	return <SheetPrimitive.Close data-slot="sheet-close" {...props} />
}

function SheetOverlay({
	className,
	...props
}: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
	return (
		<SheetPrimitive.Overlay
			data-slot="sheet-overlay"
			className={cn(
				'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50',
				className,
			)}
			{...props}
		/>
	)
}

function SheetContent({
	className,
	children,
	side = 'left',
	...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & {
	side?: 'left' | 'right'
}) {
	return (
		<SheetPrimitive.Portal>
			<SheetOverlay />
			<SheetPrimitive.Content
				data-slot="sheet-content"
				className={cn(
					'bg-card text-foreground data-[state=open]:animate-in data-[state=closed]:animate-out fixed inset-y-0 z-50 flex h-full w-[85%] max-w-80 flex-col shadow-lg transition ease-in-out data-[state=closed]:duration-200 data-[state=open]:duration-300',
					side === 'left'
						? 'data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left left-0 border-r'
						: 'data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right right-0 border-l',
					className,
				)}
				{...props}
			>
				{children}
				<SheetPrimitive.Close className="text-muted-foreground hover:bg-muted focus-visible:ring-ring/40 absolute top-3 right-3 flex size-10 items-center justify-center rounded-lg outline-none focus-visible:ring-[3px]">
					<XIcon className="size-5" strokeWidth={1.75} />
					<span className="sr-only">Close menu</span>
				</SheetPrimitive.Close>
			</SheetPrimitive.Content>
		</SheetPrimitive.Portal>
	)
}

function SheetTitle({
	className,
	...props
}: React.ComponentProps<typeof SheetPrimitive.Title>) {
	return (
		<SheetPrimitive.Title
			data-slot="sheet-title"
			className={cn('text-foreground m-0 font-semibold', className)}
			{...props}
		/>
	)
}

function SheetDescription({
	className,
	...props
}: React.ComponentProps<typeof SheetPrimitive.Description>) {
	return (
		<SheetPrimitive.Description
			data-slot="sheet-description"
			className={cn('text-muted-foreground text-sm', className)}
			{...props}
		/>
	)
}

export {
	Sheet,
	SheetTrigger,
	SheetClose,
	SheetContent,
	SheetTitle,
	SheetDescription,
}
