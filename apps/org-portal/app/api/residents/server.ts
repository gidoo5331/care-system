import { getForServer, postForServer } from '~/lib/server-request'

const residentsPath = (workspaceId: string) =>
	`/v1/admin/workspaces/${workspaceId}/residents`

export const getResidentCountsForServer = (
	workspaceId: string,
	apiConfig: ApiConfigForServerConfig,
) =>
	getForServer<ResidentCounts>(
		`${residentsPath(workspaceId)}/counts`,
		apiConfig,
	)

export const getResidentForServer = (
	workspaceId: string,
	residentId: string,
	apiConfig: ApiConfigForServerConfig,
) =>
	getForServer<Resident>(
		`${residentsPath(workspaceId)}/${residentId}`,
		apiConfig,
	)

export const getResidentSummaryForServer = (
	workspaceId: string,
	residentId: string,
	apiConfig: ApiConfigForServerConfig,
) =>
	getForServer<ResidentSummary>(
		`${residentsPath(workspaceId)}/${residentId}/summary`,
		apiConfig,
	)

export const getResidentCarePlanForServer = (
	workspaceId: string,
	residentId: string,
	apiConfig: ApiConfigForServerConfig,
) =>
	getForServer<CarePlan>(
		`${residentsPath(workspaceId)}/${residentId}/care-plan`,
		apiConfig,
	)

export const getResidentOptionsForServer = async (
	workspaceId: string,
	apiConfig: ApiConfigForServerConfig,
) => {
	const page = await getForServer<FetchMultipleDataResponse<Resident>>(
		`${residentsPath(workspaceId)}?service=CARE_HOME&page_size=500`,
		apiConfig,
	)
	return page.rows
}

export const createResidentForServer = (
	workspaceId: string,
	input: CreateResidentInput,
	apiConfig: ApiConfigForServerConfig,
) => postForServer<Resident>(residentsPath(workspaceId), input, apiConfig)

export const createPrescriptionForServer = (
	workspaceId: string,
	residentId: string,
	input: CreatePrescriptionInput,
	apiConfig: ApiConfigForServerConfig,
) =>
	postForServer<ResidentMedication>(
		`${residentsPath(workspaceId)}/${residentId}/prescriptions`,
		input,
		apiConfig,
	)
