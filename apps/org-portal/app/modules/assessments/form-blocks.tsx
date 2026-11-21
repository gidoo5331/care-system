import { PlusIcon, XIcon } from 'lucide-react'
import { BodyMap } from './body-map'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Checkbox } from '~/components/ui/checkbox'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Textarea } from '~/components/ui/textarea'
import {
	getFields,
	getList,
	getMarks,
	getRows,
	getText,
	getYesNo,
} from '~/lib/assessment.utils'
import { cn } from '~/lib/utils'

interface BlockProps<T extends AssessmentBlock['type']> {
	block: Extract<AssessmentBlock, { type: T }>
	answers: AssessmentAnswers
	onChange?: (blockId: string, value: AssessmentAnswer) => void
	unanswered: Set<string>
}

function YesNoBlock({
	block,
	answers,
	onChange,
	unanswered,
}: BlockProps<'yes_no'>) {
	const values = getYesNo(answers, block.id)
	const readOnly = !onChange

	const set = (itemId: string, patch: Partial<YesNoAnswer>) =>
		onChange?.(block.id, {
			...values,
			[itemId]: { answer: null, comment: '', ...values[itemId], ...patch },
		})

	return (
		<ul className="m-0 list-none divide-y p-0">
			{block.items.map((item) => {
				const value = values[item.id]
				const missing = unanswered.has(item.id)
				const groupId = `${block.id}-${item.id}`
				return (
					<li
						key={item.id}
						data-unanswered={missing || undefined}
						className={cn(
							'flex flex-col gap-3 py-3 sm:flex-row sm:items-start',
							missing && 'bg-warning-tint/60 -mx-6 px-6',
						)}
					>
						<p id={groupId} className="m-0 flex-1 text-[15px] leading-[22px]">
							{item.staff_only ? (
								<Badge className="mr-2 align-middle">Staff only</Badge>
							) : null}
							{item.text}
							{missing ? (
								<span className="text-warning-ink block text-[13px]">
									Needs an answer
								</span>
							) : null}
						</p>
						<div className="flex shrink-0 flex-col gap-2 sm:w-[min(320px,45%)]">
							<div
								role="radiogroup"
								aria-labelledby={groupId}
								className="flex gap-2"
							>
								{(['YES', 'NO'] as const).map((option) => {
									const selected = value?.answer === option
									return (
										<button
											key={option}
											type="button"
											role="radio"
											aria-checked={selected}
											disabled={readOnly}
											onClick={() =>
												set(item.id, { answer: selected ? null : option })
											}
											className={cn(
												'h-9 min-w-16 flex-1 rounded-lg border text-sm font-medium transition-colors sm:flex-none',
												selected
													? 'bg-primary border-primary text-primary-foreground'
													: 'bg-card text-foreground border-border-strong',
												!readOnly &&
													!selected &&
													'hover:bg-muted cursor-pointer',
												readOnly && !selected && 'opacity-50',
											)}
										>
											{option === 'YES' ? 'Yes' : 'No'}
										</button>
									)
								})}
							</div>
							{block.comment_label || value?.comment ? (
								readOnly ? (
									value?.comment ? (
										<p className="text-muted-foreground m-0 text-sm">
											{value.comment}
										</p>
									) : null
								) : (
									<Input
										aria-label={`${block.comment_label ?? 'Comment'}: ${item.text}`}
										placeholder={block.comment_label ?? 'Comment'}
										value={value?.comment ?? ''}
										onChange={(e) => set(item.id, { comment: e.target.value })}
									/>
								)
							) : !readOnly && value?.answer === 'YES' ? (
								<Input
									aria-label={`Details: ${item.text}`}
									placeholder="Details (optional)"
									value={value.comment}
									onChange={(e) => set(item.id, { comment: e.target.value })}
								/>
							) : null}
						</div>
					</li>
				)
			})}
		</ul>
	)
}

function TextBlock({ block, answers, onChange }: BlockProps<'text'>) {
	const id = `text-${block.id}`
	const value = getText(answers, block.id)
	if (!onChange) {
		return (
			<p className="m-0 text-[15px] whitespace-pre-wrap">
				{value || <span className="text-subtle-foreground">Not filled in</span>}
			</p>
		)
	}
	return (block.rows ?? 3) === 1 ? (
		<Input
			id={id}
			aria-label={block.label}
			value={value}
			onChange={(e) => onChange(block.id, e.target.value)}
		/>
	) : (
		<Textarea
			id={id}
			aria-label={block.label}
			rows={block.rows ?? 3}
			value={value}
			onChange={(e) => onChange(block.id, e.target.value)}
		/>
	)
}

function FieldsBlock({ block, answers, onChange }: BlockProps<'fields'>) {
	const values = getFields(answers, block.id)
	return (
		<div className="grid gap-4 sm:grid-cols-2">
			{block.fields.map((field) => {
				const id = `${block.id}-${field.id}`
				const value = values[field.id] ?? ''
				return (
					<div
						key={field.id}
						className={cn(
							'flex flex-col gap-2',
							field.kind === 'textarea' && 'sm:col-span-2',
						)}
					>
						<Label htmlFor={id}>{field.label}</Label>
						{!onChange ? (
							<p className="m-0 text-[15px] whitespace-pre-wrap">
								{value || <span className="text-subtle-foreground">–</span>}
							</p>
						) : field.kind === 'textarea' ? (
							<Textarea
								id={id}
								rows={2}
								value={value}
								onChange={(e) =>
									onChange(block.id, { ...values, [field.id]: e.target.value })
								}
							/>
						) : (
							<Input
								id={id}
								type={field.kind === 'date' ? 'date' : 'text'}
								value={value}
								onChange={(e) =>
									onChange(block.id, { ...values, [field.id]: e.target.value })
								}
							/>
						)}
						{field.hint && onChange ? (
							<p className="text-subtle-foreground m-0 text-[13px]">
								{field.hint}
							</p>
						) : null}
					</div>
				)
			})}
		</div>
	)
}

function ChoiceBlock({ block, answers, onChange }: BlockProps<'choice'>) {
	const value = getText(answers, block.id)
	return (
		<div
			role="radiogroup"
			aria-label={block.label}
			className="flex flex-wrap gap-2"
		>
			{block.options.map((option) => {
				const selected = value === option
				return (
					<button
						key={option}
						type="button"
						role="radio"
						aria-checked={selected}
						disabled={!onChange}
						onClick={() => onChange?.(block.id, selected ? '' : option)}
						className={cn(
							'rounded-full border px-3 py-1.5 text-sm transition-colors',
							selected
								? 'bg-accent text-accent-foreground border-primary font-medium'
								: 'bg-card border-border-strong',
							onChange && !selected && 'hover:bg-muted cursor-pointer',
							!onChange && !selected && 'opacity-50',
						)}
					>
						{option}
					</button>
				)
			})}
		</div>
	)
}

function ChecklistBlock({ block, answers, onChange }: BlockProps<'checklist'>) {
	const checked = new Set(getList(answers, block.id))
	return (
		<ul className="m-0 grid list-none gap-3 p-0 sm:grid-cols-2">
			{block.items.map((item, index) => {
				const id = `${block.id}-${index}`
				return (
					<li key={item} className="flex items-start gap-3">
						<Checkbox
							id={id}
							className="mt-0.5"
							checked={checked.has(item)}
							disabled={!onChange}
							onCheckedChange={(on) => {
								const next = new Set(checked)
								if (on === true) next.add(item)
								else next.delete(item)
								onChange?.(
									block.id,
									block.items.filter((i) => next.has(i)),
								)
							}}
						/>
						<Label
							htmlFor={id}
							className="text-[15px] leading-[22px] font-normal"
						>
							{item}
						</Label>
					</li>
				)
			})}
		</ul>
	)
}

function TableBlock({ block, answers, onChange }: BlockProps<'table'>) {
	const rows = getRows(answers, block.id)
	const shown = onChange && !rows.length ? [{}] : rows

	const updateRow = (index: number, columnId: string, value: string) => {
		const next = shown.map((row, i) =>
			i === index ? { ...row, [columnId]: value } : row,
		)
		onChange?.(block.id, next as Array<Record<string, string>>)
	}

	if (!onChange && !rows.length) {
		return (
			<p className="text-subtle-foreground m-0 text-sm">Nothing recorded.</p>
		)
	}

	return (
		<div className="flex flex-col gap-3">
			<div className="overflow-x-auto">
				<table className="w-full min-w-[560px] border-collapse text-sm">
					<thead>
						<tr>
							{block.columns.map((column) => (
								<th
									key={column.id}
									scope="col"
									className="text-muted-foreground px-1 pb-2 text-left text-[13px] font-medium"
								>
									{column.label}
								</th>
							))}
							{onChange ? (
								<th className="w-10">
									<span className="sr-only">Remove</span>
								</th>
							) : null}
						</tr>
					</thead>
					<tbody>
						{shown.map((row: Record<string, string>, index) => (
							<tr key={index}>
								{block.columns.map((column) => (
									<td key={column.id} className="px-1 py-1 align-top">
										{onChange ? (
											<Input
												aria-label={`${column.label}, row ${index + 1}`}
												value={row[column.id] ?? ''}
												onChange={(e) =>
													updateRow(index, column.id, e.target.value)
												}
											/>
										) : (
											<span className="block py-1">
												{row[column.id] || '–'}
											</span>
										)}
									</td>
								))}
								{onChange ? (
									<td className="px-1 py-1">
										<Button
											type="button"
											variant="ghost"
											size="icon"
											aria-label={`Remove row ${index + 1}`}
											onClick={() =>
												onChange(
													block.id,
													shown.filter((_, i) => i !== index) as Array<
														Record<string, string>
													>,
												)
											}
										>
											<XIcon />
										</Button>
									</td>
								) : null}
							</tr>
						))}
					</tbody>
				</table>
			</div>
			{onChange ? (
				<div>
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={() =>
							onChange(block.id, [...shown, {}] as Array<
								Record<string, string>
							>)
						}
					>
						<PlusIcon strokeWidth={1.75} />
						Add row
					</Button>
				</div>
			) : null}
		</div>
	)
}

function blockTitle(block: AssessmentBlock) {
	switch (block.type) {
		case 'body_map':
			return 'Body map'
		case 'yes_no':
		case 'fields':
			return block.label ?? null
		default:
			return block.label
	}
}

function blockHint(block: AssessmentBlock) {
	return 'hint' in block ? block.hint : undefined
}

interface Props {
	template: AssessmentTemplate
	answers: AssessmentAnswers
	onChange?: (blockId: string, value: AssessmentAnswer) => void
	unanswered?: Set<string>
}

export function AssessmentBlocks({
	template,
	answers,
	onChange,
	unanswered = new Set(),
}: Props) {
	return template.blocks.map((block) => {
		const title = blockTitle(block)
		const hint = blockHint(block)
		const headingId = `block-${block.id}`
		const isStaff = block.type === 'checklist' && block.staff_only

		let content: React.ReactNode
		switch (block.type) {
			case 'yes_no':
				content = (
					<YesNoBlock
						block={block}
						answers={answers}
						onChange={onChange}
						unanswered={unanswered}
					/>
				)
				break
			case 'text':
				content = (
					<TextBlock
						block={block}
						answers={answers}
						onChange={onChange}
						unanswered={unanswered}
					/>
				)
				break
			case 'fields':
				content = (
					<FieldsBlock
						block={block}
						answers={answers}
						onChange={onChange}
						unanswered={unanswered}
					/>
				)
				break
			case 'choice':
				content = (
					<ChoiceBlock
						block={block}
						answers={answers}
						onChange={onChange}
						unanswered={unanswered}
					/>
				)
				break
			case 'checklist':
				content = (
					<ChecklistBlock
						block={block}
						answers={answers}
						onChange={onChange}
						unanswered={unanswered}
					/>
				)
				break
			case 'table':
				content = (
					<TableBlock
						block={block}
						answers={answers}
						onChange={onChange}
						unanswered={unanswered}
					/>
				)
				break
			case 'body_map':
				content = (
					<BodyMap
						marks={getMarks(answers, block.id)}
						onChange={
							onChange ? (marks) => onChange(block.id, marks) : undefined
						}
					/>
				)
				break
		}

		return (
			<Card
				key={block.id}
				aria-labelledby={title ? headingId : undefined}
				className="break-inside-avoid"
			>
				{title ? (
					<CardHeader className="flex-col items-start justify-center gap-1">
						<CardTitle id={headingId} className="flex items-center gap-2">
							{title}
							{isStaff ? <Badge>Staff only</Badge> : null}
						</CardTitle>
						{hint ? (
							<p className="text-muted-foreground m-0 text-[13px] font-normal italic">
								{hint}
							</p>
						) : null}
					</CardHeader>
				) : null}
				<CardContent className={cn(block.type === 'yes_no' && 'py-2')}>
					{content}
				</CardContent>
			</Card>
		)
	})
}
