import { LoaderCircleIcon, PhoneIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useFetcher, useRouteLoaderData } from 'react-router'
import { FormField } from '~/components/form-field'
import { Avatar } from '~/components/ui/avatar'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Checkbox } from '~/components/ui/checkbox'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { toJsonPayload } from '~/lib/json'
import { getInitials } from '~/lib/strings'
import type { loader } from '~/routes/_auth._dashboard.residents.$residentId'
import type { action } from '~/routes/_auth._dashboard.residents.$residentId.contacts'

const EMPTY = {
	name: '',
	relationship: '',
	phone_number: '',
	is_next_of_kin: false,
}

function AddContact({ hasNextOfKin }: { hasNextOfKin: boolean }) {
	const fetcher = useFetcher<typeof action>()
	const [values, setValues] = useState({
		...EMPTY,
		is_next_of_kin: !hasNextOfKin,
	})
	const [errors, setErrors] = useState<{
		name?: string
		phone_number?: string
	}>({})
	const isSubmitting = fetcher.state !== 'idle'

	useEffect(() => {
		if (fetcher.state === 'idle' && fetcher.data && 'contact' in fetcher.data) {
			setValues(EMPTY)
		}
	}, [fetcher.state, fetcher.data])

	const save = (event: React.FormEvent) => {
		event.preventDefault()
		const nextErrors = {
			name: values.name.trim() ? undefined : 'Enter their name',
			phone_number: values.phone_number.trim()
				? undefined
				: 'Enter a phone number',
		}
		setErrors(nextErrors)
		if (nextErrors.name || nextErrors.phone_number) return
		void fetcher.submit(toJsonPayload(values), {
			method: 'post',
			encType: 'application/json',
		})
	}

	return (
		<Card aria-labelledby="add-contact">
			<CardHeader>
				<CardTitle id="add-contact">Add a contact</CardTitle>
			</CardHeader>
			<CardContent>
				<form noValidate onSubmit={save} className="flex flex-col gap-4">
					<FormField label="Name" error={errors.name}>
						<Input
							value={values.name}
							autoComplete="off"
							onChange={(e) =>
								setValues((v) => ({ ...v, name: e.target.value }))
							}
						/>
					</FormField>
					<FormField label="Relationship" optional>
						<Input
							value={values.relationship}
							placeholder="Daughter"
							onChange={(e) =>
								setValues((v) => ({ ...v, relationship: e.target.value }))
							}
						/>
					</FormField>
					<FormField label="Phone number" error={errors.phone_number}>
						<Input
							type="tel"
							value={values.phone_number}
							placeholder="+233 24 000 0000"
							onChange={(e) =>
								setValues((v) => ({ ...v, phone_number: e.target.value }))
							}
						/>
					</FormField>
					<div className="flex items-start gap-3">
						<Checkbox
							id="next-of-kin"
							className="mt-0.5"
							checked={values.is_next_of_kin}
							onCheckedChange={(checked) =>
								setValues((v) => ({ ...v, is_next_of_kin: checked === true }))
							}
						/>
						<div>
							<Label
								htmlFor="next-of-kin"
								className="cursor-pointer text-[15px] font-normal"
							>
								Next of kin
							</Label>
							{hasNextOfKin ? (
								<p className="text-subtle-foreground m-0 text-[13px]">
									Replaces the current next of kin.
								</p>
							) : null}
						</div>
					</div>
					{fetcher.data && 'error' in fetcher.data ? (
						<p className="text-destructive m-0 text-[13px]">
							{fetcher.data.error}
						</p>
					) : null}
					<div className="flex justify-end">
						<Button type="submit" disabled={isSubmitting}>
							{isSubmitting ? (
								<LoaderCircleIcon className="animate-spin" />
							) : null}
							Add contact
						</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	)
}

export function ResidentContactsModule() {
	const data = useRouteLoaderData<typeof loader>(
		'routes/_auth._dashboard.residents.$residentId',
	)
	const contacts = data?.resident.contacts ?? []

	return (
		<div className="flex flex-wrap items-start gap-6">
			<div className="flex min-w-0 flex-[999_1_560px] flex-col gap-6">
				<Card aria-labelledby="contacts">
					<CardHeader>
						<CardTitle id="contacts">Family and contacts</CardTitle>
					</CardHeader>
					{contacts.length ? (
						<ul className="m-0 list-none p-0">
							{[...contacts]
								.sort(
									(a, b) => Number(b.is_next_of_kin) - Number(a.is_next_of_kin),
								)
								.map((contact) => (
									<li
										key={`${contact.name}-${contact.phone_number}`}
										className="flex flex-wrap items-center gap-4 border-b px-6 py-4 last:border-b-0"
									>
										<Avatar size="sm" initials={getInitials(contact.name)} />
										<span className="min-w-0 flex-1">
											<span className="flex flex-wrap items-center gap-2 text-[15px] font-medium">
												{contact.name}
												{contact.is_next_of_kin ? (
													<Badge tone="info">Next of kin</Badge>
												) : null}
											</span>
											<span className="text-muted-foreground block text-sm">
												{contact.relationship}
											</span>
										</span>
										<a
											href={`tel:${contact.phone_number.replace(/\s/g, '')}`}
											className="flex items-center gap-2 text-sm font-medium"
										>
											<PhoneIcon className="size-4" strokeWidth={1.75} />
											{contact.phone_number}
										</a>
									</li>
								))}
						</ul>
					) : (
						<p className="text-muted-foreground m-0 px-6 py-8 text-sm">
							No contacts recorded yet.
						</p>
					)}
				</Card>
			</div>
			<div className="flex min-w-0 flex-[1_1_320px] flex-col gap-6">
				<AddContact hasNextOfKin={contacts.some((c) => c.is_next_of_kin)} />
			</div>
		</div>
	)
}
