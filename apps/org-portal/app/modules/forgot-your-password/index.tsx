import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircleIcon, LoaderCircleIcon } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Link, useFetcher, useLoaderData } from 'react-router'
import { z } from 'zod'
import { AuthCardLayout } from '~/components/auth-card-layout'
import { Alert } from '~/components/ui/alert'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import type { loader } from '~/routes/forgot-your-password'

const ValidationSchema = z.object({
	email: z
		.email('Enter a valid email address')
		.transform((val) => val.toLowerCase().trim()),
})

type FormSchema = z.infer<typeof ValidationSchema>

export function ForgotYourPasswordModule() {
	const { error } = useLoaderData<typeof loader>()
	const fetcher = useFetcher()

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<FormSchema>({
		resolver: zodResolver(ValidationSchema),
		defaultValues: { email: '' },
	})

	const onSubmit = handleSubmit((data) =>
		fetcher.submit(data, { method: 'post' }),
	)

	const isSubmitting = fetcher.state !== 'idle'

	return (
		<AuthCardLayout
			title="Reset your password"
			description="We'll email you a link to choose a new one."
		>
			<form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
				{error ? (
					<Alert tone="critical">
						<AlertCircleIcon />
						<span>{error}</span>
					</Alert>
				) : null}

				<div className="flex flex-col gap-2">
					<Label htmlFor="email">Email</Label>
					<Input
						id="email"
						type="email"
						autoComplete="email"
						aria-invalid={Boolean(errors.email)}
						aria-describedby={errors.email ? 'email-error' : undefined}
						{...register('email')}
					/>
					{errors.email ? (
						<p id="email-error" className="text-destructive m-0 text-[13px]">
							{errors.email.message}
						</p>
					) : null}
				</div>

				<Button
					type="submit"
					size="lg"
					disabled={isSubmitting}
					className="w-full"
				>
					{isSubmitting ? <LoaderCircleIcon className="animate-spin" /> : null}
					Send reset link
				</Button>

				<Link
					to="/login"
					className="text-primary hover:text-primary-hover text-sm font-medium"
				>
					Back to sign in
				</Link>
			</form>
		</AuthCardLayout>
	)
}
