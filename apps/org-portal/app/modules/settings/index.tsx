import {
	CheckCircle2Icon,
	InfoIcon,
	LoaderCircleIcon,
	PlusIcon,
} from 'lucide-react'
import { useState } from 'react'
import { Link, Outlet, useFetcher, useLoaderData } from 'react-router'
import { ComingSoonPanel } from '~/components/coming-soon-panel'
import { ModuleLayout } from '~/components/module-layout'
import { PageHeader } from '~/components/page-header'
import { SubNavLink, SubNavTitle } from '~/components/sub-nav'
import { Alert } from '~/components/ui/alert'
import { Button, buttonVariants } from '~/components/ui/button'
import { Card } from '~/components/ui/card'
import { Checkbox } from '~/components/ui/checkbox'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '~/components/ui/table'
import { toJsonPayload } from '~/lib/json'
import { PERMISSION_ROLES, PERMISSIONS } from '~/lib/permissions'
import type { action, loader } from '~/routes/_auth._dashboard.settings.roles'

export function SettingsLayoutModule() {
	return (
		<ModuleLayout
			label="Settings"
			nav={
				<>
					<SubNavTitle>Settings</SubNavTitle>
					<SubNavLink to="/settings/organisation">Organisation</SubNavLink>
					<SubNavLink to="/settings/facilities">
						Facilities and rooms
					</SubNavLink>
					<SubNavLink to="/settings/roles">Roles and permissions</SubNavLink>
					<SubNavLink to="/settings/users">Users</SubNavLink>
					<SubNavLink to="/settings/notifications">Notifications</SubNavLink>
				</>
			}
		>
			<Outlet />
		</ModuleLayout>
	)
}

export function SettingsComingSoonModule() {
	return (
		<ComingSoonPanel
			backTo="/settings/roles"
			backLabel="Back to roles and permissions"
		/>
	)
}

const permissionKey = (role: PermissionRole, permission: Permission) =>
	`${role}:${permission}`

function toSet(permissions: RolePermissions) {
	return new Set(
		PERMISSION_ROLES.flatMap(({ value: role }) =>
			permissions[role].map((p) => permissionKey(role, p)),
		),
	)
}

export function RolesModule() {
	const { permissions } = useLoaderData<typeof loader>()
	const fetcher = useFetcher<typeof action>()
	const saved = toSet(permissions)
	const [granted, setGranted] = useState(saved)

	const isDirty =
		granted.size !== saved.size || [...granted].some((key) => !saved.has(key))
	const isSubmitting = fetcher.state !== 'idle'
	const justSaved =
		!isDirty &&
		fetcher.state === 'idle' &&
		fetcher.data &&
		'saved' in fetcher.data

	const toggle = (role: PermissionRole, permission: Permission, on: boolean) =>
		setGranted((current) => {
			const next = new Set(current)
			const key = permissionKey(role, permission)
			if (on) next.add(key)
			else next.delete(key)
			return next
		})

	const save = () => {
		const input = Object.fromEntries(
			PERMISSION_ROLES.map(({ value: role }) => [
				role,
				PERMISSIONS.filter((p) =>
					granted.has(permissionKey(role, p.value)),
				).map((p) => p.value),
			]),
		) as RolePermissions
		void fetcher.submit(toJsonPayload(input), {
			method: 'post',
			encType: 'application/json',
		})
	}

	return (
		<>
			<PageHeader
				title="Roles and permissions"
				description="Decide what each role can see and do"
				actions={
					<Link to="/settings/roles/new" className={buttonVariants()}>
						<PlusIcon strokeWidth={1.75} />
						Add role
					</Link>
				}
			/>

			<Alert tone="info" className="items-center">
				<InfoIcon />
				<span>
					Owner always has every permission, so no one can be locked out.
				</span>
			</Alert>

			<Card aria-label="Permissions by role">
				<Table className="min-w-[720px]">
					<TableHeader>
						<TableRow>
							<TableHead>What they can do</TableHead>
							{PERMISSION_ROLES.map((role) => (
								<TableHead key={role.value} className="text-center">
									{role.label}
								</TableHead>
							))}
						</TableRow>
					</TableHeader>
					<TableBody>
						{PERMISSIONS.map((permission) => (
							<TableRow key={permission.value}>
								<TableCell>{permission.label}</TableCell>
								{PERMISSION_ROLES.map((role) => {
									const isOwner = role.value === 'OWNER'
									return (
										<TableCell key={role.value} className="text-center">
											<Checkbox
												aria-label={`${role.label}: ${permission.label}`}
												checked={
													isOwner ||
													granted.has(
														permissionKey(role.value, permission.value),
													)
												}
												disabled={isOwner}
												onCheckedChange={(checked) =>
													toggle(role.value, permission.value, checked === true)
												}
											/>
										</TableCell>
									)
								})}
							</TableRow>
						))}
					</TableBody>
				</Table>
				<div className="flex flex-wrap items-center justify-end gap-3 border-t px-6 py-4">
					{fetcher.data && 'error' in fetcher.data ? (
						<p className="text-destructive m-0 mr-auto text-sm">
							{fetcher.data.error}
						</p>
					) : justSaved ? (
						<p className="text-success-ink m-0 mr-auto flex items-center gap-2 text-sm">
							<CheckCircle2Icon className="size-4" />
							Changes saved
						</p>
					) : null}
					<Button
						variant="outline"
						disabled={!isDirty || isSubmitting}
						onClick={() => setGranted(saved)}
					>
						Cancel
					</Button>
					<Button disabled={!isDirty || isSubmitting} onClick={save}>
						{isSubmitting ? (
							<LoaderCircleIcon className="animate-spin" />
						) : null}
						Save changes
					</Button>
				</div>
			</Card>
		</>
	)
}
