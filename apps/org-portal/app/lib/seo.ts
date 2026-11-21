import { APP_NAME } from './constants'

const MAX_LENGTH_META_DESCRIPTION = 200

export function getSocialMetas({
	url,
	title = APP_NAME,
	description = 'Care home and homecare management for managers, nurses and office staff.',
	origin,
}: {
	url: string
	title?: string
	description?: string
	origin?: string
}) {
	const truncatedDescription =
		description.length > MAX_LENGTH_META_DESCRIPTION
			? description.slice(0, MAX_LENGTH_META_DESCRIPTION) + '...'
			: description

	const fullUrl = url.startsWith('http') ? url : `https://${url}`
	const images = origin ? [`${origin}/logo.png`] : []

	return [
		{ title },
		{ name: 'title', content: title },
		{ name: 'description', content: truncatedDescription },
		{ tagName: 'link', rel: 'canonical', href: fullUrl },
		{ name: 'og:url', content: fullUrl },
		{ name: 'og:site_name', content: APP_NAME },
		{ name: 'og:type', content: 'website' },
		{ name: 'og:title', content: title },
		{ name: 'og:description', content: truncatedDescription },
		...images.map((image) => ({ name: 'og:image', content: image })),
		{ name: 'twitter:card', content: 'summary' },
		{ name: 'twitter:title', content: title },
		{ name: 'twitter:description', content: truncatedDescription },
	]
}
