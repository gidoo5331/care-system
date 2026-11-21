import { zodResolver } from '@hookform/resolvers/zod'
import {
	AlertCircleIcon,
	CheckCircle2Icon,
	EyeIcon,
	EyeOffIcon,
	InfoIcon,
	LoaderCircleIcon,
} from 'lucide-react'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Link, useFetcher, useLoaderData } from 'react-router'
import { z } from 'zod'
import { AuthCardLayout } from '~/components/auth-card-layout'
import { Alert } from '~/components/ui/alert'
import { Button } from '~/components/ui/button'
import { Checkbox } from '~/components/ui/checkbox'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import type { loader } from '~/routes/login'

const ValidationSchema = z.object({
	email: z
		.email('Enter a valid email address')
		.transform((val) => val.toLowerCase().trim()),
	password: z.string().min(1, 'Enter your password'),
	keep_signed_in: z.boolean(),
})

type FormSchema = z.infer<typeof ValidationSchema>

export function LoginModule() {
	const { error, success, isDemoApi } = useLoaderData<typeof loader>()
	const fetcher = useFetcher()
	const [showPassword, setShowPassword] = useState(false)

	const {
		control,
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<FormSchema>({
		resolver: zodResolver(ValidationSchema),
		defaultValues: { email: '', password: '', keep_signed_in: true },
	})

	const onSubmit = handleSubmit((data) =>
		fetcher.submit(
			{ ...data, keep_signed_in: data.keep_signed_in ? 'on' : '' },
			{ method: 'post' },
		),
	)

	const isSubmitting = fetcher.state !== 'idle'

	return (
		<AuthCardLayout
			title="Sign in"
			description="For managers, nurses and office staff."
			footer="Carers use the mobile app instead."
		>
			<form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
				{success ? (
					<Alert tone="success">
						<CheckCircle2Icon />
						<span>{success}</span>
					</Alert>
				) : null}
				{error ? (
					<Alert tone="critical">
						<AlertCircleIcon />
						<span>{error}</span>
					</Alert>
				) : null}
				{isDemoApi ? (
					<Alert tone="info">
						<InfoIcon />
						<span>
							Demo mode — no backend configured. Sign in with any email and the
							password <strong>password</strong>.
						</span>
					</Alert>
				) : null}

				<div className="flex min-w-0 flex-col gap-5">
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

					<div className="flex flex-col gap-2">
						<Label htmlFor="password">Password</Label>
						<div className="relative">
							<Input
								id="password"
								type={showPassword ? 'text' : 'password'}
								autoComplete="current-password"
								className="pr-11"
								aria-invalid={Boolean(errors.password)}
								aria-describedby={
									errors.password ? 'password-error' : undefined
								}
								{...register('password')}
							/>
							<button
								type="button"
								onClick={() => setShowPassword((prev) => !prev)}
								className="text-subtle-foreground hover:text-foreground absolute top-1/2 right-1 flex size-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md"
								aria-label={showPassword ? 'Hide password' : 'Show password'}
							>
								{showPassword ? (
									<EyeOffIcon className="size-[18px]" />
								) : (
									<EyeIcon className="size-[18px]" />
								)}
							</button>
						</div>
						{errors.password ? (
							<p
								id="password-error"
								className="text-destructive m-0 text-[13px]"
							>
								{errors.password.message}
							</p>
						) : null}
					</div>

					<div className="flex flex-wrap items-center gap-3">
						<div className="flex items-center gap-3">
							<Controller
								name="keep_signed_in"
								control={control}
								render={({ field }) => (
									<Checkbox
										id="keep_signed_in"
										checked={field.value}
										onCheckedChange={(checked) =>
											field.onChange(checked === true)
										}
									/>
								)}
							/>
							<Label
								htmlFor="keep_signed_in"
								className="cursor-pointer text-[15px] font-normal"
							>
								Keep me signed in on this computer
							</Label>
						</div>
						<Link
							to="/forgot-your-password"
							className="text-primary hover:text-primary-hover ml-auto text-sm font-medium"
						>
							Forgot password?
						</Link>
					</div>
				</div>

				<Button
					type="submit"
					size="lg"
					disabled={isSubmitting}
					className="w-full"
				>
					{isSubmitting ? <LoaderCircleIcon className="animate-spin" /> : null}
					Sign in
				</Button>
			</form>
		</AuthCardLayout>
	)
}
