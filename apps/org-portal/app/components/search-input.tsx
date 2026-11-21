import { SearchIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'
import { cn } from '~/lib/utils'

interface Props {
	label: string
	placeholder?: string
	className?: string
}

export function SearchInput({ label, placeholder, className }: Props) {
	const [searchParams, setSearchParams] = useSearchParams()
	const urlQuery = searchParams.get('query') ?? ''
	const [query, setQuery] = useState(urlQuery)
	const [syncedUrlQuery, setSyncedUrlQuery] = useState(urlQuery)

	if (urlQuery !== syncedUrlQuery) {
		setSyncedUrlQuery(urlQuery)
		setQuery(urlQuery)
	}

	useEffect(() => {
		if (query === urlQuery) return
		const handler = setTimeout(() => {
			setSearchParams(
				(prev) => {
					if (query) prev.set('query', query)
					else prev.delete('query')
					prev.delete('page')
					return prev
				},
				{ replace: true },
			)
		}, 300)
		return () => clearTimeout(handler)
	}, [query, urlQuery, setSearchParams])

	return (
		<label
			className={cn(
				'border-input bg-card text-subtle-foreground focus-within:border-ring focus-within:ring-ring/30 flex h-10 items-center gap-2 rounded-lg border px-3 focus-within:ring-[3px]',
				className,
			)}
		>
			<SearchIcon className="size-[18px] shrink-0" strokeWidth={1.75} />
			<span className="sr-only">{label}</span>
			<input
				type="search"
				value={query}
				placeholder={placeholder}
				onChange={(event) => setQuery(event.target.value)}
				className="text-foreground placeholder:text-subtle-foreground h-full min-w-0 flex-1 bg-transparent text-[15px] outline-none"
			/>
		</label>
	)
}
