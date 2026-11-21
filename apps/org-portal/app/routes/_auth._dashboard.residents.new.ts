import { data, redirect } from 'react-router'
import type { Route } from './+types/_auth._dashboard.residents.new'
import { createResidentForServer } from '~/api/residents/server'
import { resolveAuthToken } from '~/lib/actions/auth.token.server'
import { environmentVariables } from '~/lib/actions/env.server'
import { workspaceContext } from '~/lib/actions/workspace.context.server'
import { APP_NAME } from '~/lib/constants'
import { AddResidentModule } from '~/modules'

export async function action({ request, context }: Route.ActionArgs) {
	const workspaceData = context.get(workspaceContext)
	if (!workspaceData) throw new Error('No workplace selected')

	const input = (await request.json()) as CreateResidentInput

	try {
		const resident = await createResidentForServer(
			workspaceData.workspaceUser.workspace_id,
			input,
			{
				authToken: await resolveAuthToken(request, context),
				baseUrl: environmentVariables().API_ADDRESS,
			},
		)
		return redirect(`/residents/${resident.id}`)
	} catch (error: unknown) {
		return data(
			{
				error:
					error instanceof Error
						? error.message
						: 'We couldn’t admit them. Please try again.',
			},
			{ status: 400 },
		)
	}
}

export const handle = {
	breadcrumb: 'Admit someone new',
}

export function meta() {
	return [{ title: `Admit someone new - ${APP_NAME}` }]
}

export default AddResidentModule
