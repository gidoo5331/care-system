import {
	cloneElement,
	isValidElement,
	useId,
	type ReactElement,
	type ReactNode,
} from 'react'
import { Label } from './ui/label'
import { cn } from '~/lib/utils'

interface Props {
	label: string
	/** A single control; it receives id, aria-invalid and aria-describedby. */
	children: ReactElement<Record<string, unknown>>
	hint?: ReactNode
	error?: string
	optional?: boolean
	className?: string
}

export function FormField({
	label,
	children,
	hint,
	error,
	optional,
	className,
}: Props) {
	const id = useId()
	const hintId = `${id}-hint`
	const errorId = `${id}-error`
	const describedBy =
		[hint ? hintId : null, error ? errorId : null].filter(Boolean).join(' ') ||
		undefined

	const control = isValidElement(children)
		? cloneElement(children, {
				id,
				'aria-invalid': error ? true : undefined,
				'aria-describedby': describedBy,
			})
		: children

	return (
		<div className={cn('flex min-w-0 flex-col gap-2', className)}>
			<Label htmlFor={id}>
				{label}
				{optional ? (
					<span className="text-subtle-foreground font-normal">Optional</span>
				) : null}
			</Label>
			{control}
			{hint ? (
				<p id={hintId} className="text-subtle-foreground m-0 text-[13px]">
					{hint}
				</p>
			) : null}
			{error ? (
				<p id={errorId} className="text-destructive m-0 text-[13px]">
					{error}
				</p>
			) : null}
		</div>
	)
}
