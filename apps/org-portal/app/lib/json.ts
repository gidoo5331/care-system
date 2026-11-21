import { type SubmitTarget } from 'react-router'

/**
 * `fetcher.submit` accepts only plain JSON values, which rules out interfaces
 * with optional fields. A round-trip yields exactly what goes over the wire,
 * with `undefined` fields dropped.
 */
export function toJsonPayload(value: object): SubmitTarget {
	return JSON.parse(JSON.stringify(value)) as SubmitTarget
}
