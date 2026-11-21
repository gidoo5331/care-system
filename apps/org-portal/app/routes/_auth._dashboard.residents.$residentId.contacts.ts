import { data } from 'react-router'
import type { Route } from './+types/_auth._dashboard.residents.$residentId.contacts'
import { addResidentContactForServer } from '~/api/residents/server'
import { errorMessage, getApiContext } from '~/lib/actions/api-context.server'
import { ResidentContactsModule } from '~/modules'

export async function action({ request, context, params }: Route.ActionArgs) {
	const { workspaceId, apiConfig } = await getApiContext({ request, context })
	const input = (await request.json()) as ResidentContact
	try {
		return {
			contact: await addResidentContactForServer(
				workspaceId,
				params.residentId,
				input,
				apiConfig,
			),
		}
	} catch (error: unknown) {
		return data(
			{ error: errorMessage(error, 'We couldn’t add the contact.') },
			{ status: 400 },
		)
	}
}

export default ResidentContactsModule
