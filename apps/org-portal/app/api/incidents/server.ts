import { getForServer, postForServer } from '~/lib/server-request'

const incidentsPath = (workspaceId: string) =>
	`/v1/admin/workspaces/${workspaceId}/incidents`

export const getIncidentCountsForServer = (
	workspaceId: string,
	apiConfig: ApiConfigForServerConfig,
) =>
	getForServer<IncidentCounts>(
		`${incidentsPath(workspaceId)}/counts`,
		apiConfig,
	)

export const getIncidentForServer = (
	workspaceId: string,
	incidentId: string,
	apiConfig: ApiConfigForServerConfig,
) =>
	getForServer<Incident>(
		`${incidentsPath(workspaceId)}/${incidentId}`,
		apiConfig,
	)

export const reviewIncidentForServer = (
	workspaceId: string,
	incidentId: string,
	input: ReviewIncidentInput,
	apiConfig: ApiConfigForServerConfig,
) =>
	postForServer<Incident>(
		`${incidentsPath(workspaceId)}/${incidentId}/review`,
		input,
		apiConfig,
	)

export const reportIncidentForServer = (
	workspaceId: string,
	input: ReportIncidentInput,
	apiConfig: ApiConfigForServerConfig,
) => postForServer<Incident>(incidentsPath(workspaceId), input, apiConfig)
