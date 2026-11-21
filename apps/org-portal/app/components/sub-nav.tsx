import { type PropsWithChildren, type ReactNode } from 'react'
import { Link, NavLink } from 'react-router'
import { cn } from '~/lib/utils'

export function SubNavTitle({ children }: PropsWithChildren) {
	return (
		<h2 className="mx-3 mt-0 mb-2 text-lg leading-6 font-semibold">
			{children}
		</h2>
	)
}

export function SubNavSectionLabel({ children }: PropsWithChildren) {
	return (
		<p className="text-subtle-foreground mx-3 mt-4 mb-1 text-xs leading-4 font-semibold tracking-[0.04em] uppercase">
			{children}
		</p>
	)
}

interface SubNavLinkProps {
	to: string
	end?: boolean
	children: ReactNode
	trailing?: ReactNode
	/**
	 * NavLink matches on pathname only, so links that differ by search params
	 * (saved views) would all light up together. Pass this to decide yourself.
	 */
	active?: boolean
}

const linkClass = (isActive: boolean) =>
	cn(
		'flex h-10 items-center gap-2 rounded-lg px-3 text-sm no-underline transition-colors',
		isActive
			? 'bg-accent text-accent-foreground font-semibold'
			: 'text-neutral-ink hover:bg-muted font-medium',
	)

export function SubNavLink({
	children,
	trailing,
	active,
	...props
}: SubNavLinkProps) {
	const content = (
		<>
			{children}
			{trailing ? <span className="ml-auto">{trailing}</span> : null}
		</>
	)

	if (active !== undefined) {
		return (
			<Link
				to={props.to}
				aria-current={active ? 'page' : undefined}
				className={linkClass(active)}
			>
				{content}
			</Link>
		)
	}

	return (
		<NavLink {...props} className={({ isActive }) => linkClass(isActive)}>
			{content}
		</NavLink>
	)
}
