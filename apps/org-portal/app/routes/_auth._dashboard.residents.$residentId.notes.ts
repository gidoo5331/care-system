import { data } from 'react-router'
import type { Route } from './+types/_auth._dashboard.residents.$residentId.notes'
import {
	addResidentNoteForServer,
	getResidentNotesForServer,
} from '~/api/residents/server'
import { errorMessage, getApiContext } from '~/lib/actions/api-context.server'
import { ResidentNotesModule } from '~/modules'

export async function loader({ request, context, params }: Route.LoaderArgs) {
	const { workspaceId, apiConfig } = await getApiContext({ request, context })
	return {
		notes: await getResidentNotesForServer(
			workspaceId,
			params.residentId,
			apiConfig,
		),
	}
}

export async function action({ request, context, params }: Route.ActionArgs) {
	const { workspaceId, apiConfig } = await getApiContext({ request, context })
	const input = (await request.json()) as CreateNoteInput
	try {
		return {
			note: await addResidentNoteForServer(
				workspaceId,
				params.residentId,
				input,
				apiConfig,
			),
		}
	} catch (error: unknown) {
		return data(
			{ error: errorMessage(error, 'We couldn’t save the note.') },
			{ status: 400 },
		)
	}
}

export default ResidentNotesModule
