import { data } from 'react-router'
import type { Route } from './+types/_auth._dashboard.residents.$residentId.documents'
import {
	addResidentDocumentForServer,
	getResidentDocumentsForServer,
} from '~/api/residents/server'
import { errorMessage, getApiContext } from '~/lib/actions/api-context.server'
import { ResidentDocumentsModule } from '~/modules'

export async function loader({ request, context, params }: Route.LoaderArgs) {
	const { workspaceId, apiConfig } = await getApiContext({ request, context })
	return {
		documents: await getResidentDocumentsForServer(
			workspaceId,
			params.residentId,
			apiConfig,
		),
	}
}

export async function action({ request, context, params }: Route.ActionArgs) {
	const { workspaceId, apiConfig } = await getApiContext({ request, context })
	const input = (await request.json()) as CreateDocumentInput
	try {
		return {
			document: await addResidentDocumentForServer(
				workspaceId,
				params.residentId,
				input,
				apiConfig,
			),
		}
	} catch (error: unknown) {
		return data(
			{ error: errorMessage(error, 'We couldn’t add the document.') },
			{ status: 400 },
		)
	}
}

export default ResidentDocumentsModule
