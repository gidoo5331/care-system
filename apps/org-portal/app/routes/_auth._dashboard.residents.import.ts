import { data } from 'react-router'
import type { Route } from './+types/_auth._dashboard.residents.import'
import { importResidentsForServer } from '~/api/residents/server'
import { errorMessage, getApiContext } from '~/lib/actions/api-context.server'
import { APP_NAME } from '~/lib/constants'
import { ImportResidentsModule } from '~/modules'

export async function action({ request, context }: Route.ActionArgs) {
	const { workspaceId, apiConfig } = await getApiContext({ request, context })
	const { rows } = (await request.json()) as {
		rows: Array<CreateResidentInput>
	}
	try {
		return {
			result: await importResidentsForServer(workspaceId, rows, apiConfig),
		}
	} catch (error: unknown) {
		return data(
			{ error: errorMessage(error, 'We couldn’t import the list.') },
			{ status: 400 },
		)
	}
}

export const handle = {
	breadcrumb: 'Import list',
}

export function meta() {
	return [{ title: `Import list - ${APP_NAME}` }]
}

export default ImportResidentsModule
