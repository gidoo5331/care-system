import { cleanParams } from './remove-nulls'

export const getQueryParams = <FilterT extends object>(
	props: FetchMultipleDataInputParams<FilterT>,
) => {
	const filters: object = props.filters ?? {}

	const baseParams = cleanParams({
		page_size: props.pagination ? props.pagination.per : undefined,
		page: props.pagination ? props.pagination.page : undefined,
		query: props.search?.query,
		search_fields: props.search?.fields
			? props.search.fields.join(',')
			: undefined,
		order: props.sorter?.sort,
		order_by: props.sorter?.sort_by,
	})

	const params = new URLSearchParams(baseParams)

	for (const [key, value] of Object.entries(filters)) {
		if (value === null || value === undefined || value === '') continue

		if (Array.isArray(value)) {
			for (const item of value) {
				params.append(key, String(item))
			}
		} else {
			params.set(key, String(value))
		}
	}

	return params
}
