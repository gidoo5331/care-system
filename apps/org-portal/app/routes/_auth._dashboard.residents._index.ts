import type { Route } from './+types/_auth._dashboard.residents._index'
import { APP_NAME } from '~/lib/constants'
import { getDisplayUrl, getDomainUrl } from '~/lib/misc'
import { getSocialMetas } from '~/lib/seo'
import { ResidentsModule } from '~/modules'

export async function loader({ request }: Route.LoaderArgs) {
	return { origin: getDomainUrl(request) }
}

export const handle = {
	breadcrumb: 'All',
}

export function meta({ loaderData, location }: Route.MetaArgs) {
	return getSocialMetas({
		title: `Residents and clients - ${APP_NAME}`,
		url: getDisplayUrl({
			origin: loaderData?.origin ?? '',
			path: location.pathname,
		}),
		origin: loaderData?.origin,
	})
}

export default ResidentsModule
