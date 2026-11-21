import { BellIcon, SearchIcon } from 'lucide-react'
import { Fragment, type PropsWithChildren, type ReactNode } from 'react'
import { Link, useMatches } from 'react-router'
import { NavUser } from './nav-user'
import { WorkspaceSwitcher } from './workspace-switcher'

interface Props {
	label: string
	nav: ReactNode
}

type BreadcrumbHandle = { breadcrumb: string | ((data: unknown) => string) }

function hasBreadcrumb(handle: unknown): handle is BreadcrumbHandle {
	return typeof handle === 'object' && handle !== null && 'breadcrumb' in handle
}

function useBreadcrumbs() {
	return useMatches()
		.filter((match) => hasBreadcrumb(match.handle))
		.map((match) => {
			const { breadcrumb } = match.handle as BreadcrumbHandle
			return {
				id: match.id,
				pathname: match.pathname,
				name:
					typeof breadcrumb === 'string'
						? breadcrumb
						: breadcrumb(match.loaderData),
			}
		})
}

export function ModuleLayout({
	label,
	nav,
	children,
}: PropsWithChildren<Props>) {
	const breadcrumbs = useBreadcrumbs()

	return (
		<div className="flex min-w-0 flex-1">
			<aside
				aria-label={label}
				className="bg-card sticky top-0 hidden h-svh w-64 shrink-0 flex-col gap-0.5 overflow-y-auto border-r px-3 py-4 lg:flex print:hidden"
			>
				<WorkspaceSwitcher />
				{nav}
			</aside>

			<div className="flex min-w-0 flex-1 flex-col">
				<header className="bg-card flex h-16 items-center gap-4 border-b px-4 md:px-8 print:hidden">
					<nav
						aria-label="Breadcrumb"
						className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden text-sm whitespace-nowrap"
					>
						{breadcrumbs.map((crumb, index) => {
							const isLast = index === breadcrumbs.length - 1
							return (
								<Fragment key={crumb.id}>
									{index > 0 ? (
										<span aria-hidden="true" className="text-subtle-foreground">
											/
										</span>
									) : null}
									{isLast ? (
										<span aria-current="page" className="font-semibold">
											{crumb.name}
										</span>
									) : (
										<Link
											to={crumb.pathname}
											className="text-muted-foreground hover:text-foreground no-underline"
										>
											{crumb.name}
										</Link>
									)}
								</Fragment>
							)
						})}
					</nav>

					<button
						type="button"
						className="bg-background text-subtle-foreground hidden h-10 w-[280px] max-w-[40%] cursor-pointer items-center gap-2 rounded-lg border px-3 text-sm md:flex"
					>
						<SearchIcon className="size-[18px]" strokeWidth={1.75} />
						Search residents, staff
						<kbd className="border-border-strong ml-auto rounded border px-1.5 font-sans text-xs">
							Ctrl K
						</kbd>
					</button>

					<Link
						to="/notifications"
						aria-label="Notifications"
						className="text-muted-foreground hover:bg-muted relative flex size-10 items-center justify-center rounded-lg border"
					>
						<BellIcon className="size-5" strokeWidth={1.75} />
					</Link>

					<NavUser />
				</header>

				<main className="mx-auto flex w-full max-w-[1200px] flex-col gap-6 p-4 md:p-8">
					{children}
				</main>
			</div>
		</div>
	)
}
