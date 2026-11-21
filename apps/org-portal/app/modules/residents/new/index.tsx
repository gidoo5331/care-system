import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { AlertCircleIcon, LoaderCircleIcon } from 'lucide-react'
import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { Link, useFetcher } from 'react-router'
import {
	AddResidentSchema,
	DEFAULT_VALUES,
	STEP_FIELDS,
	STEPS,
	toCreateResidentInput,
	type AddResidentValues,
} from './schema'
import {
	ContactsStep,
	HealthStep,
	PersonalDetailsStep,
	PlaceStep,
} from './steps'
import { PageHeader } from '~/components/page-header'
import { Stepper } from '~/components/stepper'
import { Alert } from '~/components/ui/alert'
import { Button, buttonVariants } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { QUERY_KEYS } from '~/lib/constants'
import { toJsonPayload } from '~/lib/json'
import type { action } from '~/routes/_auth._dashboard.residents.new'

const STEP_CONTENT = [PersonalDetailsStep, HealthStep, PlaceStep, ContactsStep]

export function AddResidentModule() {
	const [step, setStep] = useState(0)
	const fetcher = useFetcher<typeof action>()
	const queryClient = useQueryClient()

	const form = useForm<AddResidentValues>({
		resolver: zodResolver(AddResidentSchema),
		defaultValues: DEFAULT_VALUES,
		mode: 'onTouched',
	})

	const isLastStep = step === STEPS.length - 1
	const isSubmitting = fetcher.state !== 'idle'
	const StepContent = STEP_CONTENT[step] ?? PersonalDetailsStep
	const headingId = `step-${step}`

	const goNext = async () => {
		const isValid = await form.trigger([...(STEP_FIELDS[step] ?? [])])
		if (isValid) setStep((current) => current + 1)
	}

	const onSubmit = form.handleSubmit(async (values) => {
		// The list must not show its pre-admission cache when we land back on it.
		queryClient.removeQueries({ queryKey: [QUERY_KEYS.RESIDENTS] })
		await fetcher.submit(toJsonPayload(toCreateResidentInput(values)), {
			method: 'post',
			encType: 'application/json',
		})
	})

	return (
		<>
			<PageHeader
				title="Admit someone new"
				description="Takes about 5 minutes. Check each step before you admit."
			/>

			<Stepper steps={STEPS} current={step} />

			{fetcher.data?.error ? (
				<Alert tone="critical">
					<AlertCircleIcon />
					<span>{fetcher.data.error}</span>
				</Alert>
			) : null}

			<FormProvider {...form}>
				<form
					noValidate
					onSubmit={(event) => {
						event.preventDefault()
						if (isLastStep) void onSubmit()
						else void goNext()
					}}
				>
					<Card aria-labelledby={headingId}>
						<CardHeader>
							<CardTitle id={headingId}>{STEPS[step]}</CardTitle>
						</CardHeader>
						<CardContent className="grid gap-5 sm:grid-cols-2">
							<StepContent />
						</CardContent>
						<div className="flex flex-wrap items-center justify-end gap-2 border-t px-6 py-4">
							<Link
								to="/residents"
								className={buttonVariants({ variant: 'outline' })}
							>
								Cancel
							</Link>
							{step > 0 ? (
								<Button
									type="button"
									variant="outline"
									onClick={() => setStep((current) => current - 1)}
								>
									Back
								</Button>
							) : null}
							<Button type="submit" disabled={isSubmitting}>
								{isSubmitting ? (
									<LoaderCircleIcon className="animate-spin" />
								) : null}
								{isLastStep ? 'Admit' : 'Continue'}
							</Button>
						</div>
					</Card>
				</form>
			</FormProvider>
		</>
	)
}
