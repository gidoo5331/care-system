import * as React from 'react'

import { cn } from '~/lib/utils'

function Card({ className, ...props }: React.ComponentProps<'section'>) {
	return (
		<section
			data-slot="card"
			className={cn(
				'bg-card text-card-foreground min-w-0 overflow-hidden rounded-xl border',
				className,
			)}
			{...props}
		/>
	)
}

function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			data-slot="card-header"
			className={cn(
				'flex min-h-16 items-center justify-between gap-3 border-b px-6 py-3',
				className,
			)}
			{...props}
		/>
	)
}

function CardTitle({ className, ...props }: React.ComponentProps<'h2'>) {
	return (
		<h2
			data-slot="card-title"
			className={cn('m-0 text-base leading-6 font-semibold', className)}
			{...props}
		/>
	)
}

function CardAction({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			data-slot="card-action"
			className={cn('flex flex-wrap items-center gap-2', className)}
			{...props}
		/>
	)
}

function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			data-slot="card-content"
			className={cn('flex flex-col gap-4 p-6', className)}
			{...props}
		/>
	)
}

export { Card, CardHeader, CardTitle, CardAction, CardContent }
