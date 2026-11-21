import { FileTextIcon, LoaderCircleIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useFetcher, useLoaderData } from 'react-router'
import { FormField } from '~/components/form-field'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { NativeSelect } from '~/components/ui/native-select'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '~/components/ui/table'
import { formatShortDate } from '~/lib/date'
import { toJsonPayload } from '~/lib/json'
import {
	DOCUMENT_CATEGORY_OPTIONS,
	getDocumentCategoryLabel,
} from '~/lib/resident-records.utils'
import type {
	action,
	loader,
} from '~/routes/_auth._dashboard.residents.$residentId.documents'

function AddDocument() {
	const fetcher = useFetcher<typeof action>()
	const [title, setTitle] = useState('')
	const [category, setCategory] = useState<DocumentCategory>('MEDICAL')
	const [fileName, setFileName] = useState('')
	const [error, setError] = useState<string>()
	const fileRef = useRef<HTMLInputElement>(null)
	const isSubmitting = fetcher.state !== 'idle'

	useEffect(() => {
		if (
			fetcher.state === 'idle' &&
			fetcher.data &&
			'document' in fetcher.data
		) {
			setTitle('')
			setFileName('')
			if (fileRef.current) fileRef.current.value = ''
		}
	}, [fetcher.state, fetcher.data])

	const save = (event: React.FormEvent) => {
		event.preventDefault()
		if (!title.trim()) {
			setError('Give the document a title')
			return
		}
		const input: CreateDocumentInput = {
			title,
			category,
			file_name: fileName || undefined,
		}
		void fetcher.submit(toJsonPayload(input), {
			method: 'post',
			encType: 'application/json',
		})
	}

	return (
		<Card aria-labelledby="add-document">
			<CardHeader>
				<CardTitle id="add-document">Add a document</CardTitle>
			</CardHeader>
			<CardContent>
				<form noValidate onSubmit={save} className="flex flex-col gap-4">
					<FormField
						label="Title"
						error={
							error ??
							(fetcher.data && 'error' in fetcher.data
								? fetcher.data.error
								: undefined)
						}
					>
						<Input
							value={title}
							placeholder="Hospital discharge letter"
							onChange={(e) => {
								setTitle(e.target.value)
								setError(undefined)
							}}
						/>
					</FormField>
					<FormField label="Type">
						<NativeSelect
							value={category}
							onChange={(e) => setCategory(e.target.value as DocumentCategory)}
						>
							{DOCUMENT_CATEGORY_OPTIONS.map((option) => (
								<option key={option.value} value={option.value}>
									{option.label}
								</option>
							))}
						</NativeSelect>
					</FormField>
					<FormField
						label="File"
						optional
						hint="Until file storage is connected, only the file name is kept."
					>
						<Input
							ref={fileRef}
							type="file"
							accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
							className="pt-1.5"
							onChange={(e) => {
								const file = e.target.files?.[0]
								setFileName(file?.name ?? '')
								if (file && !title) setTitle(file.name.replace(/\.[^.]+$/, ''))
							}}
						/>
					</FormField>
					<div className="flex justify-end">
						<Button type="submit" disabled={isSubmitting}>
							{isSubmitting ? (
								<LoaderCircleIcon className="animate-spin" />
							) : null}
							Add document
						</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	)
}

export function ResidentDocumentsModule() {
	const { documents } = useLoaderData<typeof loader>()

	return (
		<div className="flex flex-wrap items-start gap-6">
			<div className="flex min-w-0 flex-[999_1_560px] flex-col gap-6">
				<Card aria-labelledby="documents">
					<CardHeader>
						<CardTitle id="documents">Documents</CardTitle>
					</CardHeader>
					{documents.length ? (
						<Table className="min-w-[560px]">
							<TableHeader>
								<TableRow>
									<TableHead>Document</TableHead>
									<TableHead>Type</TableHead>
									<TableHead>Added</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{documents.map((document) => (
									<TableRow key={document.id}>
										<TableCell>
											<span className="flex items-center gap-3">
												<FileTextIcon
													className="text-subtle-foreground size-5 shrink-0"
													strokeWidth={1.75}
												/>
												<span className="min-w-0">
													<span className="block font-medium">
														{document.title}
													</span>
													{document.file_name ? (
														<span className="text-muted-foreground block truncate text-[13px]">
															{document.file_name}
														</span>
													) : null}
												</span>
											</span>
										</TableCell>
										<TableCell className="text-muted-foreground">
											{getDocumentCategoryLabel(document.category)}
										</TableCell>
										<TableCell className="text-muted-foreground">
											{formatShortDate(document.added_at)} · {document.added_by}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					) : (
						<p className="text-muted-foreground m-0 px-6 py-8 text-sm">
							No documents yet.
						</p>
					)}
				</Card>
			</div>
			<div className="flex min-w-0 flex-[1_1_320px] flex-col gap-6">
				<AddDocument />
			</div>
		</div>
	)
}
