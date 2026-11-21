import { useQueryClient } from '@tanstack/react-query'
import {
	AlertCircleIcon,
	CheckCircle2Icon,
	DownloadIcon,
	LoaderCircleIcon,
	UploadIcon,
} from 'lucide-react'
import { useId, useState } from 'react'
import { Link, useFetcher } from 'react-router'
import { parseResidentsCsv, TEMPLATE, type ParsedRow } from './parse'
import { PageHeader } from '~/components/page-header'
import { Alert } from '~/components/ui/alert'
import { Badge } from '~/components/ui/badge'
import { Button, buttonVariants } from '~/components/ui/button'
import {
	Card,
	CardAction,
	CardContent,
	CardHeader,
	CardTitle,
} from '~/components/ui/card'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '~/components/ui/table'
import { QUERY_KEYS } from '~/lib/constants'
import { downloadCsv } from '~/lib/csv'
import { toJsonPayload } from '~/lib/json'
import type { action } from '~/routes/_auth._dashboard.residents.import'

function placeOf(input: CreateResidentInput) {
	return input.service === 'CARE_HOME'
		? `Room ${input.room ?? ''}, ${input.unit_name ?? ''}`
		: (input.area ?? '')
}

export function ImportResidentsModule() {
	const fetcher = useFetcher<typeof action>()
	const queryClient = useQueryClient()
	const inputId = useId()
	const [fileName, setFileName] = useState('')
	const [rows, setRows] = useState<Array<ParsedRow>>([])
	const [fileError, setFileError] = useState<Nullable<string>>(null)

	const validRows = rows.filter((row) => row.input)
	const invalidCount = rows.length - validRows.length
	const isSubmitting = fetcher.state !== 'idle'
	const result =
		fetcher.data && 'result' in fetcher.data ? fetcher.data.result : null

	const readFile = async (file: File | undefined) => {
		if (!file) return
		setFileName(file.name)
		if (!file.name.toLowerCase().endsWith('.csv')) {
			setRows([])
			setFileError(
				'Choose a .csv file. In Excel or Google Sheets, use “Save as CSV”.',
			)
			return
		}
		const parsed = parseResidentsCsv(await file.text())
		setRows(parsed.rows)
		setFileError(parsed.error)
	}

	const importRows = () => {
		queryClient.removeQueries({ queryKey: [QUERY_KEYS.RESIDENTS] })
		void fetcher.submit(
			toJsonPayload({ rows: validRows.map((row) => row.input) }),
			{ method: 'post', encType: 'application/json' },
		)
	}

	if (result) {
		return (
			<>
				<PageHeader title="Import list" />
				<Alert tone="success" className="items-center">
					<CheckCircle2Icon />
					<span className="flex-1">
						{result.created === 1
							? '1 person was added.'
							: `${result.created} people were added.`}{' '}
						Each still needs a care plan.
					</span>
				</Alert>
				<Card aria-labelledby="imported">
					<CardHeader>
						<CardTitle id="imported">Added</CardTitle>
					</CardHeader>
					<ul className="m-0 list-none p-0">
						{result.residents.map((resident) => (
							<li
								key={resident.id}
								className="flex items-center justify-between gap-4 border-b px-6 py-3 last:border-b-0"
							>
								<span>
									<span className="font-medium">
										{resident.first_name} {resident.last_name}
									</span>{' '}
									<span className="text-muted-foreground text-sm">
										{resident.code}
									</span>
								</span>
								<Link
									to={`/residents/${resident.id}`}
									className="text-sm font-medium"
								>
									Open profile
								</Link>
							</li>
						))}
					</ul>
				</Card>
				<div>
					<Link to="/residents" className={buttonVariants()}>
						Back to residents
					</Link>
				</div>
			</>
		)
	}

	return (
		<>
			<PageHeader
				title="Import list"
				description="Add many residents and clients at once from a spreadsheet"
				actions={
					<Button
						variant="outline"
						onClick={() => downloadCsv('residents-template.csv', TEMPLATE)}
					>
						<DownloadIcon strokeWidth={1.75} />
						Download template
					</Button>
				}
			/>

			<Card aria-labelledby="choose-file">
				<CardHeader>
					<CardTitle id="choose-file">Choose a file</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-muted-foreground m-0 text-sm">
						Use the template’s columns. Separate several allergies or conditions
						with a semicolon. Dates can be 02/05/1947 or 1947-05-02.
					</p>
					<label
						htmlFor={inputId}
						onDragOver={(event) => event.preventDefault()}
						onDrop={(event) => {
							event.preventDefault()
							void readFile(event.dataTransfer.files[0])
						}}
						className="border-border-strong hover:bg-muted focus-within:ring-ring/40 flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-dashed px-6 py-10 text-center transition-colors focus-within:ring-[3px]"
					>
						<UploadIcon
							className="text-subtle-foreground size-6"
							strokeWidth={1.75}
						/>
						<span className="font-medium">
							{fileName || 'Choose a CSV file'}
						</span>
						<span className="text-muted-foreground text-sm">
							{fileName ? 'Choose a different file' : 'Or drag it here'}
						</span>
						<input
							id={inputId}
							type="file"
							accept=".csv,text/csv"
							className="sr-only"
							onChange={(event) => void readFile(event.target.files?.[0])}
						/>
					</label>
					{fileError ? (
						<Alert tone="critical">
							<AlertCircleIcon />
							<span>{fileError}</span>
						</Alert>
					) : null}
				</CardContent>
			</Card>

			{rows.length ? (
				<Card aria-labelledby="preview">
					<CardHeader>
						<CardTitle id="preview">Check before importing</CardTitle>
						<CardAction>
							{invalidCount ? (
								<Badge tone="warning">
									{invalidCount} {invalidCount === 1 ? 'row' : 'rows'} will be
									skipped
								</Badge>
							) : (
								<Badge tone="success">All rows look right</Badge>
							)}
						</CardAction>
					</CardHeader>
					<Table className="min-w-[720px]">
						<TableHeader>
							<TableRow>
								<TableHead>Row</TableHead>
								<TableHead>Name</TableHead>
								<TableHead>Born</TableHead>
								<TableHead>Service</TableHead>
								<TableHead>Room or area</TableHead>
								<TableHead>Check</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{rows.map((row) => (
								<TableRow key={row.line}>
									<TableCell className="text-muted-foreground">
										{row.line}
									</TableCell>
									<TableCell className="font-medium">{row.name}</TableCell>
									<TableCell className="text-muted-foreground">
										{row.input?.date_of_birth ?? '–'}
									</TableCell>
									<TableCell>
										{row.input
											? row.input.service === 'CARE_HOME'
												? 'Care home'
												: 'Homecare'
											: '–'}
									</TableCell>
									<TableCell className="text-muted-foreground">
										{row.input ? placeOf(row.input) : '–'}
									</TableCell>
									<TableCell>
										{row.error ? (
											<span className="text-critical-ink text-sm">
												{row.error}
											</span>
										) : (
											<Badge tone="success">Ready</Badge>
										)}
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
					<div className="flex flex-wrap items-center justify-end gap-3 border-t px-6 py-4">
						{fetcher.data && 'error' in fetcher.data ? (
							<p className="text-destructive m-0 mr-auto text-sm">
								{fetcher.data.error}
							</p>
						) : null}
						<Link
							to="/residents"
							className={buttonVariants({ variant: 'outline' })}
						>
							Cancel
						</Link>
						<Button
							disabled={!validRows.length || isSubmitting}
							onClick={importRows}
						>
							{isSubmitting ? (
								<LoaderCircleIcon className="animate-spin" />
							) : null}
							Import {validRows.length}{' '}
							{validRows.length === 1 ? 'person' : 'people'}
						</Button>
					</div>
				</Card>
			) : null}
		</>
	)
}
