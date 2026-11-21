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
		`${residentsPath(workspaceId)}?page_size=500`,
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

export const getResidentNotesForServer = (
	workspaceId: string,
	residentId: string,
	apiConfig: ApiConfigForServerConfig,
) =>
	getForServer<Array<ResidentNoteEntry>>(
		`${residentsPath(workspaceId)}/${residentId}/notes`,
		apiConfig,
	)

export const addResidentNoteForServer = (
	workspaceId: string,
	residentId: string,
	input: CreateNoteInput,
	apiConfig: ApiConfigForServerConfig,
) =>
	postForServer<ResidentNoteEntry>(
		`${residentsPath(workspaceId)}/${residentId}/notes`,
		input,
		apiConfig,
	)

export const getResidentDocumentsForServer = (
	workspaceId: string,
	residentId: string,
	apiConfig: ApiConfigForServerConfig,
) =>
	getForServer<Array<ResidentDocument>>(
		`${residentsPath(workspaceId)}/${residentId}/documents`,
		apiConfig,
	)

export const addResidentDocumentForServer = (
	workspaceId: string,
	residentId: string,
	input: CreateDocumentInput,
	apiConfig: ApiConfigForServerConfig,
) =>
	postForServer<ResidentDocument>(
		`${residentsPath(workspaceId)}/${residentId}/documents`,
		input,
		apiConfig,
	)

export const addResidentContactForServer = (
	workspaceId: string,
	residentId: string,
	input: ResidentContact,
	apiConfig: ApiConfigForServerConfig,
) =>
	postForServer<ResidentContact>(
		`${residentsPath(workspaceId)}/${residentId}/contacts`,
		input,
		apiConfig,
	)

export const importResidentsForServer = (
	workspaceId: string,
	rows: Array<CreateResidentInput>,
	apiConfig: ApiConfigForServerConfig,
) =>
	postForServer<ImportResidentsResult>(
		`${residentsPath(workspaceId)}/import`,
		{ rows },
		apiConfig,
	)

export const getMovementsForServer = (
	workspaceId: string,
	apiConfig: ApiConfigForServerConfig,
) =>
	getForServer<MovementsOverview>(
		`${residentsPath(workspaceId)}/movements`,
		apiConfig,
	)

export const recordMovementForServer = (
	workspaceId: string,
	input: CreateMovementInput,
	apiConfig: ApiConfigForServerConfig,
) =>
	postForServer<ResidentMovement>(
		`${residentsPath(workspaceId)}/movements`,
		input,
		apiConfig,
	)

export const getAppointmentsForServer = (
	workspaceId: string,
	range: 'today' | 'week' | 'month',
	apiConfig: ApiConfigForServerConfig,
) =>
	getForServer<Array<Appointment>>(
		`/v1/admin/workspaces/${workspaceId}/appointments?range=${range}`,
		apiConfig,
	)

export const addAppointmentForServer = (
	workspaceId: string,
	input: CreateAppointmentInput,
	apiConfig: ApiConfigForServerConfig,
) =>
	postForServer<Appointment>(
		`/v1/admin/workspaces/${workspaceId}/appointments`,
		input,
		apiConfig,
	)

export const getResidentAssessmentsForServer = (
	workspaceId: string,
	residentId: string,
	apiConfig: ApiConfigForServerConfig,
) =>
	getForServer<Array<ResidentAssessment>>(
		`${residentsPath(workspaceId)}/${residentId}/assessments`,
		apiConfig,
	)

export const getResidentAssessmentForServer = async (
	workspaceId: string,
	residentId: string,
	code: string,
	apiConfig: ApiConfigForServerConfig,
) => {
	try {
		return await getForServer<ResidentAssessment>(
			`${residentsPath(workspaceId)}/${residentId}/assessments/${code}`,
			apiConfig,
		)
	} catch {
		return null
	}
}

export const saveResidentAssessmentForServer = (
	workspaceId: string,
	residentId: string,
	code: string,
	input: SaveAssessmentInput,
	apiConfig: ApiConfigForServerConfig,
) =>
	postForServer<ResidentAssessment>(
		`${residentsPath(workspaceId)}/${residentId}/assessments/${code}`,
		input,
		apiConfig,
	)
