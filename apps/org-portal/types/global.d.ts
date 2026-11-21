type PossiblyUndefined<T> = T | undefined
type Nullable<T> = T | null
type Maybe<T> = T | null | undefined
type StringList = Array<string>
type NumberLike = string | number

interface ApiResponse<T> {
	data: T
	errors: Nullable<{ message: string }>
}

interface Pagination {
	per?: NumberLike
	page?: NumberLike
}

interface Sorter {
	sort?: 'asc' | 'desc'
	sort_by?: string
}

interface Search {
	query?: string
	fields?: StringList
}

interface FetchMultipleDataInputParams<FilterT> {
	pagination?: Pagination
	sorter?: Sorter
	filters?: FilterT
	search?: Search
}

interface FetchMultipleDataResponse<T> {
	rows: T[]
	meta: {
		total: number
		page: number
		page_size: number
		has_prev_page: boolean
		has_next_page: boolean
	}
}

interface ApiConfigForServerConfig {
	authToken?: string
	baseUrl: string
}
