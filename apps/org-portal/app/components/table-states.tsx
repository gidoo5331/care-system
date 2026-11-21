import { AlertCircleIcon, type LucideIcon } from 'lucide-react'
import { type ReactNode } from 'react'
import { Button } from './ui/button'
import { Skeleton } from './ui/skeleton'
import { TableCell, TableRow } from './ui/table'

function MessageRow({
	columnCount,
	children,
}: {
	columnCount: number
	children: ReactNode
}) {
	return (
		<TableRow>
			<TableCell colSpan={columnCount} className="h-48">
				<div className="text-muted-foreground flex flex-col items-center gap-3 text-center text-sm">
					{children}
				</div>
			</TableCell>
		</TableRow>
	)
}

interface Props<T> {
	columnCount: number
	rows?: Array<T>
	isLoading: boolean
	error: Nullable<Error>
	onRetry: () => void
	emptyIcon: LucideIcon
	emptyMessage: string
	errorMessage: string
	renderRow: (row: T) => ReactNode
	skeletonRows?: number
}

export function TableBodyContent<T>({
	columnCount,
	rows,
	isLoading,
	error,
	onRetry,
	emptyIcon: EmptyIcon,
	emptyMessage,
	errorMessage,
	renderRow,
	skeletonRows = 6,
}: Props<T>) {
	if (error) {
		return (
			<MessageRow columnCount={columnCount}>
				<AlertCircleIcon className="text-critical size-6" />
				<span>
					{errorMessage} {error.message}
				</span>
				<Button variant="outline" onClick={onRetry}>
					Try again
				</Button>
			</MessageRow>
		)
	}

	if (isLoading && !rows) {
		return Array.from({ length: skeletonRows }, (_, row) => (
			<TableRow key={row}>
				{Array.from({ length: columnCount }, (_, cell) => (
					<TableCell key={cell}>
						<Skeleton className="h-4 w-24" />
					</TableCell>
				))}
			</TableRow>
		))
	}

	if (!rows?.length) {
		return (
			<MessageRow columnCount={columnCount}>
				<EmptyIcon className="size-6" />
				<span>{emptyMessage}</span>
			</MessageRow>
		)
	}

	return rows.map(renderRow)
}
