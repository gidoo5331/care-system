import * as React from 'react'

import { cn } from '~/lib/utils'

function Table({
	className,
	containerClassName,
	...props
}: React.ComponentProps<'table'> & { containerClassName?: string }) {
	return (
		<div
			data-slot="table-container"
			className={cn('w-full overflow-x-auto', containerClassName)}
		>
			<table
				data-slot="table"
				className={cn('w-full border-collapse', className)}
				{...props}
			/>
		</div>
	)
}

function TableHeader(props: React.ComponentProps<'thead'>) {
	return <thead data-slot="table-header" {...props} />
}

function TableBody(props: React.ComponentProps<'tbody'>) {
	return <tbody data-slot="table-body" {...props} />
}

function TableRow({ className, ...props }: React.ComponentProps<'tr'>) {
	return (
		<tr
			data-slot="table-row"
			className={cn(
				'[tbody_&]:hover:bg-background border-b transition-colors [tbody_&:last-child]:border-b-0',
				className,
			)}
			{...props}
		/>
	)
}

function TableHead({ className, ...props }: React.ComponentProps<'th'>) {
	return (
		<th
			data-slot="table-head"
			scope="col"
			className={cn(
				'bg-background text-muted-foreground h-11 px-4 text-left text-[13px] leading-[18px] font-medium whitespace-nowrap',
				className,
			)}
			{...props}
		/>
	)
}

function TableCell({ className, ...props }: React.ComponentProps<'td'>) {
	return (
		<td
			data-slot="table-cell"
			className={cn(
				'h-16 px-4 py-2 align-middle text-[15px] leading-[22px]',
				className,
			)}
			{...props}
		/>
	)
}

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell }
