import { postForServer } from '~/lib/server-request'

export const handleAttentionForServer = (
	workspaceId: string,
	input: HandleAttentionInput,
	apiConfig: ApiConfigForServerConfig,
) =>
	postForServer<AttentionItem>(
		`/v1/admin/workspaces/${workspaceId}/needs-attention/handle`,
		input,
		apiConfig,
	)
