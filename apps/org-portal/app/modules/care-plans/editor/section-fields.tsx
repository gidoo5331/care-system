import { PlusIcon, Trash2Icon, XIcon } from 'lucide-react'
import { useFieldArray, useFormContext } from 'react-hook-form'
import { type CarePlanEditorValues } from './schema'
import { FormField } from '~/components/form-field'
import { Button } from '~/components/ui/button'
import {
	Card,
	CardAction,
	CardContent,
	CardHeader,
	CardTitle,
} from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Textarea } from '~/components/ui/textarea'

interface Props {
	index: number
	anchorId: string
	pronouns: { needs: string; support: string }
	onRemove?: () => void
}

export function SectionFields({ index, anchorId, pronouns, onRemove }: Props) {
	const {
		control,
		register,
		watch,
		formState: { errors },
	} = useFormContext<CarePlanEditorValues>()
	const tasks = useFieldArray({ control, name: `sections.${index}.tasks` })
	const sectionErrors = errors.sections?.[index]
	const title = watch(`sections.${index}.title`)
	const headingId = `${anchorId}-heading`

	return (
		<Card id={anchorId} aria-labelledby={headingId} className="scroll-mt-6">
			<CardHeader>
				<CardTitle id={headingId}>{title || 'New section'}</CardTitle>
				{onRemove ? (
					<CardAction>
						<Button
							type="button"
							variant="ghost"
							onClick={onRemove}
							aria-label={`Remove ${title || 'this section'}`}
						>
							<Trash2Icon strokeWidth={1.75} />
							Remove
						</Button>
					</CardAction>
				) : null}
			</CardHeader>
			<CardContent>
				<FormField label="Section title" error={sectionErrors?.title?.message}>
					<Input
						placeholder="Eating and drinking"
						{...register(`sections.${index}.title`)}
					/>
				</FormField>
				<FormField label={pronouns.needs} error={sectionErrors?.needs?.message}>
					<Textarea rows={2} {...register(`sections.${index}.needs`)} />
				</FormField>
				<FormField label="What we want to achieve" optional>
					<Textarea rows={2} {...register(`sections.${index}.goal`)} />
				</FormField>
				<FormField
					label={pronouns.support}
					error={sectionErrors?.support?.message}
				>
					<Textarea rows={3} {...register(`sections.${index}.support`)} />
				</FormField>

				<fieldset className="m-0 flex flex-col gap-3 border-0 p-0">
					<legend className="text-foreground mb-2 p-0 text-sm font-medium">
						Daily tasks
					</legend>
					{tasks.fields.map((task, taskIndex) => (
						<div
							key={task.id}
							className="grid items-end gap-2 sm:grid-cols-[minmax(0,1fr)_180px_auto]"
						>
							<div className="flex flex-col gap-1">
								<Label
									htmlFor={`${anchorId}-task-${taskIndex}`}
									className="sr-only"
								>
									Task {taskIndex + 1}
								</Label>
								<Input
									id={`${anchorId}-task-${taskIndex}`}
									placeholder="Offer breakfast, lunch and supper"
									{...register(
										`sections.${index}.tasks.${taskIndex}.description`,
									)}
								/>
							</div>
							<div className="flex flex-col gap-1">
								<Label
									htmlFor={`${anchorId}-task-${taskIndex}-frequency`}
									className="sr-only"
								>
									How often
								</Label>
								<Input
									id={`${anchorId}-task-${taskIndex}-frequency`}
									placeholder="3 times a day"
									{...register(
										`sections.${index}.tasks.${taskIndex}.frequency`,
									)}
								/>
							</div>
							<Button
								type="button"
								variant="ghost"
								size="icon"
								aria-label={`Remove task ${taskIndex + 1}`}
								onClick={() => tasks.remove(taskIndex)}
							>
								<XIcon />
							</Button>
						</div>
					))}
					<div>
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={() => tasks.append({ description: '', frequency: '' })}
						>
							<PlusIcon strokeWidth={1.75} />
							Add task
						</Button>
					</div>
				</fieldset>
			</CardContent>
		</Card>
	)
}
