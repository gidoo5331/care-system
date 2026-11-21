import { useQueryClient } from '@tanstack/react-query'
import {
	CheckCircle2Icon,
	LoaderCircleIcon,
	PencilIcon,
	PlusIcon,
} from 'lucide-react'
import { useState } from 'react'
import { Link, useFetcher, useRouteLoaderData } from 'react-router'
import { FormField } from '~/components/form-field'
import { Badge } from '~/components/ui/badge'
import { Button, buttonVariants } from '~/components/ui/button'
import {
	Card,
	CardAction,
	CardContent,
	CardHeader,
	CardTitle,
} from '~/components/ui/card'
import { Checkbox } from '~/components/ui/checkbox'
import { Label } from '~/components/ui/label'
import { NativeSelect } from '~/components/ui/native-select'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '~/components/ui/table'
import { QUERY_KEYS } from '~/lib/constants'
import { formatLongDate, formatShortDate } from '~/lib/date'
import { toJsonPayload } from '~/lib/json'
import {
	getStaffRoleDescription,
	getTrainingRecordStatus,
	STAFF_ROLE_OPTIONS,
} from '~/lib/staff.utils'
import type { loader } from '~/routes/_auth._dashboard.staff.$staffId'
import type { action } from '~/routes/_auth._dashboard.staff.$staffId._index'

function TrainingCard({ staff }: { staff: StaffMember }) {
	return (
		<Card aria-labelledby="training">
			<CardHeader>
				<CardTitle id="training">Training and certificates</CardTitle>
				<CardAction>
					<Link
						to={`/staff/${staff.id}/training/new`}
						className={buttonVariants({ variant: 'outline' })}
					>
						<PlusIcon strokeWidth={1.75} />
						Add record
					</Link>
				</CardAction>
			</CardHeader>
			<Table className="min-w-[600px]">
				<TableHeader>
					<TableRow>
						<TableHead>Course</TableHead>
						<TableHead>Completed</TableHead>
						<TableHead>Expires</TableHead>
						<TableHead>Status</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{staff.training.map((record) => {
						const status = getTrainingRecordStatus(record)
						return (
							<TableRow key={record.id}>
								<TableCell className="font-medium">{record.course}</TableCell>
								<TableCell className="text-muted-foreground">
									{formatShortDate(record.completed_at)}
								</TableCell>
								<TableCell className="text-muted-foreground">
									{formatShortDate(record.expires_at)}
								</TableCell>
								<TableCell>
									<Badge tone={status.tone}>{status.label}</Badge>
								</TableCell>
							</TableRow>
						)
					})}
				</TableBody>
			</Table>
		</Card>
	)
}

function DetailsCard({ staff }: { staff: StaffMember }) {
	const rows: Array<[string, React.ReactNode]> = [
		[
			'Phone',
			<a key="phone" href={`tel:${staff.phone_number.replace(/\s/g, '')}`}>
				{staff.phone_number}
			</a>,
		],
		[
			'Email',
			<a key="email" href={`mailto:${staff.email}`}>
				{staff.email}
			</a>,
		],
		['Works at', staff.works_at],
		['Started', formatLongDate(staff.started_at)],
	]

	return (
		<Card aria-labelledby="details">
			<CardHeader>
				<CardTitle id="details">Details</CardTitle>
				<CardAction>
					<Link
						to={`/staff/${staff.id}/edit`}
						className={buttonVariants({ variant: 'outline' })}
					>
						<PencilIcon strokeWidth={1.75} />
						Edit
					</Link>
				</CardAction>
			</CardHeader>
			<CardContent>
				<dl className="m-0 flex flex-col gap-3">
					{rows.map(([label, value]) => (
						<div key={label} className="flex min-w-0 flex-col gap-0.5">
							<dt className="text-muted-foreground text-[13px] leading-[18px]">
								{label}
							</dt>
							<dd className="m-0 truncate text-[15px] leading-[22px]">
								{value}
							</dd>
						</div>
					))}
				</dl>
			</CardContent>
		</Card>
	)
}

function AccessCard({ staff }: { staff: StaffMember }) {
	const fetcher = useFetcher<typeof action>()
	const queryClient = useQueryClient()
	const [role, setRole] = useState<StaffRole>(staff.role)
	const [canApprove, setCanApprove] = useState(staff.can_approve_care_plans)

	const isDirty =
		role !== staff.role || canApprove !== staff.can_approve_care_plans
	const isSubmitting = fetcher.state !== 'idle'
	const justSaved =
		fetcher.state === 'idle' &&
		fetcher.data &&
		'saved' in fetcher.data &&
		!isDirty

	const save = () => {
		queryClient.removeQueries({ queryKey: [QUERY_KEYS.STAFF] })
		const input: UpdateStaffAccessInput = {
			role,
			can_approve_care_plans: canApprove,
		}
		void fetcher.submit(toJsonPayload(input), {
			method: 'post',
			encType: 'application/json',
		})
	}

	return (
		<Card aria-labelledby="access">
			<CardHeader>
				<CardTitle id="access">Access</CardTitle>
			</CardHeader>
			<CardContent>
				<FormField label="Role" hint={getStaffRoleDescription(role)}>
					<NativeSelect
						value={role}
						onChange={(event) => setRole(event.target.value as StaffRole)}
					>
						{STAFF_ROLE_OPTIONS.map((option) => (
							<option key={option.value} value={option.value}>
								{option.label}
							</option>
						))}
					</NativeSelect>
				</FormField>
				<div className="flex items-center gap-3">
					<Checkbox
						id="can-approve"
						checked={canApprove}
						onCheckedChange={(checked) => setCanApprove(checked === true)}
					/>
					<Label
						htmlFor="can-approve"
						className="cursor-pointer text-[15px] font-normal"
					>
						Can approve care plans
					</Label>
				</div>
				{fetcher.data && 'error' in fetcher.data ? (
					<p className="text-destructive m-0 text-[13px]">
						{fetcher.data.error}
					</p>
				) : null}
				{isDirty || isSubmitting ? (
					<div className="flex justify-end gap-2">
						<Button
							variant="outline"
							onClick={() => {
								setRole(staff.role)
								setCanApprove(staff.can_approve_care_plans)
							}}
						>
							Cancel
						</Button>
						<Button onClick={save} disabled={isSubmitting}>
							{isSubmitting ? (
								<LoaderCircleIcon className="animate-spin" />
							) : null}
							Save access
						</Button>
					</div>
				) : justSaved ? (
					<p className="text-success-ink m-0 flex items-center gap-2 text-sm">
						<CheckCircle2Icon className="size-4" />
						Access saved
					</p>
				) : null}
			</CardContent>
		</Card>
	)
}

export function StaffTrainingModule() {
	const data = useRouteLoaderData<typeof loader>(
		'routes/_auth._dashboard.staff.$staffId',
	)
	if (!data) return null
	const { staff } = data

	return (
		<div className="flex flex-wrap items-start gap-6">
			<div className="flex min-w-0 flex-[999_1_560px] flex-col gap-6">
				<TrainingCard staff={staff} />
			</div>
			<div className="flex min-w-0 flex-[1_1_320px] flex-col gap-6">
				<DetailsCard staff={staff} />
				<AccessCard key={staff.id} staff={staff} />
			</div>
		</div>
	)
}

export function StaffTabComingSoonModule() {
	const data = useRouteLoaderData<typeof loader>(
		'routes/_auth._dashboard.staff.$staffId',
	)
	return (
		<div className="bg-card text-muted-foreground rounded-xl border px-6 py-16 text-center text-sm">
			This part of {data?.staff.name ?? 'their'} profile is on its way.{' '}
			<Link to={data ? `/staff/${data.staff.id}` : '/staff'}>
				Back to training
			</Link>
		</div>
	)
}
