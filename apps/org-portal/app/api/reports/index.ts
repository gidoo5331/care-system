import { getForClient } from '~/lib/client-request'

export const getReport = (
	workspaceId: string,
	key: ReportKey,
	query: { range: ReportRange; workspace?: string },
) => {
	const params = new URLSearchParams({ range: query.range })
	if (query.workspace) params.set('workspace', query.workspace)
	return getForClient<ReportTable>(
		`/v1/admin/workspaces/${workspaceId}/reports/${key}?${params.toString()}`,
	)
}
