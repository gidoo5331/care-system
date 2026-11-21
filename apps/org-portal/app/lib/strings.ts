export const safeString = (
	str: PossiblyUndefined<Nullable<string>>,
): string => {
	if (!str) return ''

	return str.trim()
}

export const getInitials = (name: string): string => {
	return name
		.split(' ')
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part[0]?.toUpperCase() ?? '')
		.join('')
}

export const getFirstName = (name: string): string =>
	safeString(name).split(' ')[0] ?? ''
