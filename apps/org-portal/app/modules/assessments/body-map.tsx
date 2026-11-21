import { XIcon } from 'lucide-react'
import { useState } from 'react'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { NativeSelect } from '~/components/ui/native-select'
import { cn } from '~/lib/utils'

export const BODY_MARK_KEY: ReadonlyArray<{
	code: BodyMarkCode
	label: string
}> = [
	{ code: 'W', label: 'Wound' },
	{ code: 'B', label: 'Bruise' },
	{ code: 'R', label: 'Rash' },
	{ code: 'P', label: 'Pressure sore' },
	{ code: 'S', label: 'Scar' },
	{ code: 'SW', label: 'Swelling' },
	{ code: 'O', label: 'Other' },
]

const VIEWS: ReadonlyArray<{
	view: BodyMark['view']
	label: string
	left: string
	right: string
}> = [
	{ view: 'back', label: 'Back', left: 'Left', right: 'Right' },
	{ view: 'front', label: 'Front', left: 'Right', right: 'Left' },
]

function Figure() {
	return (
		<g
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinejoin="round"
			strokeLinecap="round"
		>
			<circle cx="100" cy="38" r="22" />
			<path d="M90 60v10M110 60v10" />
			<path d="M64 78c8-6 22-8 36-8s28 2 36 8l6 70c1 12-2 30-6 42H64c-4-12-7-30-6-42z" />
			<path d="M64 80c-12 6-18 20-20 40l-8 70c-1 8 2 14 6 16M136 80c12 6 18 20 20 40l8 70c1 8-2 14-6 16" />
			<path d="M70 190l-4 90 6 90c0 8 4 12 12 12M130 190l4 90-6 90c0 8-4 12-12 12" />
			<path d="M100 200v90l-6 80M100 290l6 80" />
		</g>
	)
}

interface Props {
	marks: Array<BodyMark>
	onChange?: (marks: Array<BodyMark>) => void
}

export function BodyMap({ marks, onChange }: Props) {
	const [code, setCode] = useState<BodyMarkCode>('B')
	const readOnly = !onChange

	const addMark = (
		view: BodyMark['view'],
		event: React.MouseEvent<SVGSVGElement>,
	) => {
		if (!onChange) return
		const box = event.currentTarget.getBoundingClientRect()
		onChange([
			...marks,
			{
				id: `mark_${Date.now().toString(36)}`,
				view,
				x: ((event.clientX - box.left) / box.width) * 200,
				y: ((event.clientY - box.top) / box.height) * 400,
				code,
				note: '',
			},
		])
	}

	const update = (id: string, patch: Partial<BodyMark>) =>
		onChange?.(marks.map((m) => (m.id === id ? { ...m, ...patch } : m)))

	return (
		<div className="flex flex-col gap-4">
			{!readOnly ? (
				<div className="flex flex-wrap items-end gap-3">
					<div className="flex flex-col gap-2">
						<Label htmlFor="body-mark-code">Mark to add</Label>
						<NativeSelect
							id="body-mark-code"
							value={code}
							onChange={(e) => setCode(e.target.value as BodyMarkCode)}
							className="w-48"
						>
							{BODY_MARK_KEY.map((key) => (
								<option key={key.code} value={key.code}>
									{key.code} – {key.label}
								</option>
							))}
						</NativeSelect>
					</div>
					<p className="text-muted-foreground m-0 pb-2 text-sm">
						Click on the body where it is. Describe it in the list below.
					</p>
				</div>
			) : null}

			<div className="grid grid-cols-2 gap-4">
				{VIEWS.map(({ view, label, left, right }) => (
					<figure key={view} className="m-0 flex flex-col items-center gap-2">
						<figcaption className="text-muted-foreground text-[13px] font-medium">
							{label}
						</figcaption>
						<div className="text-muted-foreground relative w-full max-w-[220px]">
							<span className="absolute top-1/2 left-0 text-[11px] font-semibold tracking-wide uppercase">
								{left}
							</span>
							<span className="absolute top-1/2 right-0 text-[11px] font-semibold tracking-wide uppercase">
								{right}
							</span>
							<svg
								viewBox="0 0 200 400"
								role="img"
								aria-label={`${label} of body${marks.some((m) => m.view === view) ? ', with marks' : ''}`}
								onClick={(e) => addMark(view, e)}
								className={cn(
									'text-border-strong mx-auto block w-3/4',
									!readOnly && 'cursor-crosshair',
								)}
							>
								<Figure />
								{marks
									.filter((m) => m.view === view)
									.map((mark) => (
										<g key={mark.id}>
											<circle
												cx={mark.x}
												cy={mark.y}
												r="9"
												className="fill-critical stroke-card"
												strokeWidth="2"
											/>
											<text
												x={mark.x}
												y={mark.y + 3.5}
												textAnchor="middle"
												className="fill-white text-[9px] font-bold"
											>
												{marks.indexOf(mark) + 1}
											</text>
										</g>
									))}
							</svg>
						</div>
					</figure>
				))}
			</div>

			<p className="text-muted-foreground m-0 text-[13px]">
				Key: {BODY_MARK_KEY.map((k) => `${k.code} = ${k.label}`).join(' · ')}
			</p>

			{marks.length ? (
				<ol className="m-0 flex list-none flex-col gap-2 p-0">
					{marks.map((mark, index) => (
						<li
							key={mark.id}
							className="grid items-center gap-2 sm:grid-cols-[32px_180px_minmax(0,1fr)_auto]"
						>
							<span className="bg-critical flex size-6 items-center justify-center rounded-full text-[11px] font-bold text-white">
								{index + 1}
							</span>
							{readOnly ? (
								<>
									<span className="text-sm font-medium">
										{BODY_MARK_KEY.find((k) => k.code === mark.code)?.label} ·{' '}
										{mark.view}
									</span>
									<span className="text-muted-foreground text-sm">
										{mark.note || '–'}
									</span>
								</>
							) : (
								<>
									<NativeSelect
										aria-label={`Mark ${index + 1} type`}
										value={mark.code}
										onChange={(e) =>
											update(mark.id, { code: e.target.value as BodyMarkCode })
										}
									>
										{BODY_MARK_KEY.map((key) => (
											<option key={key.code} value={key.code}>
												{key.code} – {key.label}
											</option>
										))}
									</NativeSelect>
									<Input
										aria-label={`Mark ${index + 1} description`}
										placeholder="Size, colour, when first seen"
										value={mark.note}
										onChange={(e) => update(mark.id, { note: e.target.value })}
									/>
									<Button
										type="button"
										variant="ghost"
										size="icon"
										aria-label={`Remove mark ${index + 1}`}
										onClick={() =>
											onChange?.(marks.filter((m) => m.id !== mark.id))
										}
									>
										<XIcon />
									</Button>
								</>
							)}
						</li>
					))}
				</ol>
			) : (
				<p className="text-muted-foreground m-0 text-sm">No marks recorded.</p>
			)}
		</div>
	)
}
