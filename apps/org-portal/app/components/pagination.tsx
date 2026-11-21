import { useSearchParams } from 'react-router'
import { Button } from './ui/button'

interface Props {
	meta: FetchMultipleDataResponse<unknown>['meta']
	rowCount: number
}

export function Pagination({ meta, rowCount }: Props) {
	const [, setSearchParams] = useSearchParams()
	const from = meta.total === 0 ? 0 : (meta.page - 1) * meta.page_size + 1
	const to = from === 0 ? 0 : from + rowCount - 1

	const goTo = (page: number) =>
		setSearchParams((prev) => {
			if (page <= 1) prev.delete('page')
			else prev.set('page', String(page))
			return prev
		})

	return (
		<div className="flex flex-wrap items-center justify-between gap-3 border-t px-6 py-3">
			<p className="text-muted-foreground m-0 text-sm">
				Showing {from} to {to} of {meta.total}
			</p>
			<div className="flex items-center gap-2">
				<Button
					variant="outline"
					disabled={!meta.has_prev_page}
					onClick={() => goTo(meta.page - 1)}
				>
					Previous
				</Button>
				<Button
					variant="outline"
					disabled={!meta.has_next_page}
					onClick={() => goTo(meta.page + 1)}
				>
					Next
				</Button>
			</div>
		</div>
	)
}
