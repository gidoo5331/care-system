import dayjs from 'dayjs'

export const REVIEW_DUE_SOON_DAYS = 7

export const CARE_PLAN_REVIEW_CYCLE_MONTHS = 3

/** Whole calendar days from today to `date`; negative once it has passed. */
export function daysUntil(date: Maybe<Date | string>) {
	if (!date) return null
	return dayjs(date).startOf('day').diff(dayjs().startOf('day'), 'day')
}

export function isDueSoon(date: Maybe<Date | string>) {
	const days = daysUntil(date)
	return days !== null && days <= REVIEW_DUE_SOON_DAYS
}

const plural = (count: number, word: string) =>
	`${count} ${count === 1 ? word : `${word}s`}`

/**
 * "3 days overdue", "Due today", "Due in 5 days" — or null when the date is
 * far enough away that it is not worth flagging.
 */
export function getDueLabel(
	date: Maybe<Date | string>,
	{ futurePrefix = 'Due in' }: { futurePrefix?: string } = {},
) {
	const days = daysUntil(date)
	if (days === null) return null
	if (days < 0) return `${plural(Math.abs(days), 'day')} overdue`
	if (days === 0) return 'Due today'
	if (days <= REVIEW_DUE_SOON_DAYS)
		return `${futurePrefix} ${plural(days, 'day')}`
	return null
}

/** "12 Aug" this year, "12 Aug 2025" otherwise. */
export function formatShortDate(date: Date | string) {
	const value = dayjs(date)
	return value.isSame(dayjs(), 'year')
		? value.format('D MMM')
		: value.format('D MMM YYYY')
}

export function formatLongDate(date: Date | string) {
	const value = dayjs(date)
	return value.isSame(dayjs(), 'year')
		? value.format('D MMMM')
		: value.format('D MMMM YYYY')
}
