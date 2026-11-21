import { useFormContext } from 'react-hook-form'
import { type AddResidentValues } from './schema'
import { FormField } from '~/components/form-field'
import { Input } from '~/components/ui/input'
import { NativeSelect } from '~/components/ui/native-select'

function useStepForm() {
	const {
		register,
		watch,
		formState: { errors },
	} = useFormContext<AddResidentValues>()
	return { register, watch, errors }
}

export function PersonalDetailsStep() {
	const { register, errors } = useStepForm()
	return (
		<>
			<FormField label="First name" error={errors.first_name?.message}>
				<Input autoComplete="off" {...register('first_name')} />
			</FormField>
			<FormField label="Last name" error={errors.last_name?.message}>
				<Input autoComplete="off" {...register('last_name')} />
			</FormField>
			<FormField label="Preferred name" optional>
				<Input
					placeholder="What they like to be called"
					{...register('preferred_name')}
				/>
			</FormField>
			<FormField label="Date of birth" error={errors.date_of_birth?.message}>
				<Input type="date" {...register('date_of_birth')} />
			</FormField>
			<FormField label="Gender">
				<NativeSelect {...register('gender')}>
					<option value="FEMALE">Female</option>
					<option value="MALE">Male</option>
				</NativeSelect>
			</FormField>
			<FormField label="Service">
				<NativeSelect {...register('service')}>
					<option value="CARE_HOME">Care home</option>
					<option value="HOMECARE">Homecare</option>
				</NativeSelect>
			</FormField>
			<FormField
				label="Ghana Card number"
				optional
				error={errors.ghana_card_number?.message}
			>
				<Input
					placeholder="GHA-000000000-0"
					{...register('ghana_card_number')}
				/>
			</FormField>
			<FormField label="NHIS number" optional>
				<Input {...register('nhis_number')} />
			</FormField>
			<FormField
				label="Languages spoken"
				hint="Separate with commas"
				className="sm:col-span-2"
			>
				<Input {...register('languages')} />
			</FormField>
		</>
	)
}

export function HealthStep() {
	const { register, watch, errors } = useStepForm()
	const riskLevel = watch('risk_level')

	return (
		<>
			<FormField
				label="Allergies"
				hint="Separate with commas. Leave empty if none are known."
				className="sm:col-span-2"
			>
				<Input placeholder="Penicillin, shellfish" {...register('allergies')} />
			</FormField>
			<FormField
				label="Conditions and needs"
				hint="Separate with commas. These show on their profile."
				className="sm:col-span-2"
			>
				<Input
					placeholder="Type 2 diabetes, walks with a frame"
					{...register('conditions')}
				/>
			</FormField>
			<FormField label="Overall risk">
				<NativeSelect {...register('risk_level')}>
					<option value="LOW">Low</option>
					<option value="MEDIUM">Medium</option>
					<option value="HIGH">High</option>
				</NativeSelect>
			</FormField>
			{riskLevel !== 'LOW' ? (
				<FormField label="Main risk" error={errors.risk_reason?.message}>
					<Input placeholder="falls" {...register('risk_reason')} />
				</FormField>
			) : null}
		</>
	)
}

export function PlaceStep() {
	const { register, watch, errors } = useStepForm()
	const isCareHome = watch('service') === 'CARE_HOME'

	if (isCareHome) {
		return (
			<>
				<FormField label="Room" error={errors.room?.message}>
					<Input inputMode="numeric" placeholder="6" {...register('room')} />
				</FormField>
				<FormField label="Floor">
					<NativeSelect {...register('unit_name')}>
						<option value="ground floor">Ground floor</option>
						<option value="first floor">First floor</option>
					</NativeSelect>
				</FormField>
			</>
		)
	}

	return (
		<>
			<FormField
				label="Area"
				hint="Used to plan visit runs"
				error={errors.area?.message}
			>
				<Input placeholder="Dansoman" {...register('area')} />
			</FormField>
			<FormField label="Home address" optional>
				<Input
					placeholder="House number and street, or digital address"
					{...register('address')}
				/>
			</FormField>
		</>
	)
}

export function ContactsStep() {
	const { register, errors } = useStepForm()
	return (
		<>
			<FormField label="Next of kin name" optional>
				<Input autoComplete="off" {...register('contact_name')} />
			</FormField>
			<FormField label="Relationship" optional>
				<Input placeholder="Daughter" {...register('contact_relationship')} />
			</FormField>
			<FormField label="Phone number" error={errors.contact_phone?.message}>
				<Input
					type="tel"
					placeholder="+233 24 000 0000"
					{...register('contact_phone')}
				/>
			</FormField>
		</>
	)
}
