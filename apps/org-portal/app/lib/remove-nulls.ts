export type ObjectT = Record<
	string,
	string | undefined | null | number | StringList
>

export function removeNulls(obj: ObjectT): Partial<ObjectT> {
	const nonNullableObject: Partial<ObjectT> = {}
	Object.keys(obj).forEach((key) => {
		if (obj[key] !== null && obj[key] !== undefined) {
			nonNullableObject[key] = obj[key]
		}
	})
	return nonNullableObject
}

export function stringifyValues(obj: Partial<ObjectT>): Record<string, string> {
	const stringifiedObject: Record<string, string> = {}
	Object.keys(obj).forEach((key) => {
		stringifiedObject[key] = String(obj[key])
	})
	return stringifiedObject
}

export function cleanParams(obj: ObjectT): Record<string, string> {
	return stringifyValues(removeNulls(obj))
}
