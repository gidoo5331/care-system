import { findAssessment, listAssessments, saveAssessment } from './assessments'
import { findCarePlan } from './care-plans'
import { fail, ok, paginate, readJson } from './http'
import {
	filterIncidents,
	findIncident,
	getIncidentCounts,
	reportIncident,
	reviewIncident,
	validateIncidentReport,
} from './incidents'
import {
	createCarePlan,
	listRiskAssessments,
	saveCarePlan,
	validatePlanInput,
} from './plan-editing'
import {
	addAppointment,
	addContact,
	addDocument,
	addNote,
	getAppointments,
	getDocuments,
	getMovementsOverview,
	getNotes,
	importResidents,
	recordMovement,
} from './records'
import { findResident } from './residents'
import { getRotaWeek } from './rota'
import {
	buildReport,
	getRolePermissions,
	isReportKey,
	saveRolePermissions,
} from './settings'
import {
	filterStaff,
	findStaff,
	getStaffCounts,
	updateStaffAccess,
} from './staff'
import { demoUser } from './users'
import { assignVisit, getVisitCarers, getVisitDay } from './visits'

/**
 * Runs before the generic resident and care plan handlers, which would
 * otherwise read `/residents/import` as a resident with the id "import".
 */
export function handleRecords({
	method,
	rest,
	searchParams,
	init,
}: WorkspaceRequest) {
	const actor = demoUser.name
	const body = () => readJson(init)

	if (rest === '/residents/import' && method === 'POST') {
		const rows = (body().rows ?? []) as Array<Partial<CreateResidentInput>>
		const outcome = importResidents(rows)
		return outcome.error ? fail(outcome.error, 400) : ok(outcome.result, 201)
	}

	if (rest === '/residents/movements') {
		if (method === 'GET') return ok(getMovementsOverview())
		const outcome = recordMovement(
			body() as Partial<CreateMovementInput>,
			actor,
		)
		return outcome.error ? fail(outcome.error, 400) : ok(outcome.movement, 201)
	}

	if (rest === '/appointments') {
		if (method === 'GET') return ok(getAppointments(searchParams))
		const outcome = addAppointment(body() as Partial<CreateAppointmentInput>)
		return outcome.error
			? fail(outcome.error, 400)
			: ok(outcome.appointment, 201)
	}

	if (rest === '/care-plans/assessments' && method === 'GET') {
		return ok(paginate(listRiskAssessments(searchParams), searchParams))
	}

	if (rest === '/care-plans' && method === 'POST') {
		const input = body() as Partial<CreateCarePlanInput>
		const error = validatePlanInput(input)
		if (error) return fail(error, 400)
		const outcome = createCarePlan(input as CreateCarePlanInput, actor)
		return outcome.error ? fail(outcome.error, 409) : ok(outcome.plan, 201)
	}

	const planMatch = rest.match(/^\/care-plans\/([^/]+)$/)
	if (planMatch && method === 'POST') {
		const plan = findCarePlan(planMatch[1] ?? '')
		if (!plan) return fail('Care plan not found', 404)
		const input = body() as Partial<SaveCarePlanInput>
		const error = validatePlanInput(input)
		if (error) return fail(error, 400)
		const outcome = saveCarePlan(plan, input as SaveCarePlanInput, actor)
		return outcome.error ? fail(outcome.error, 409) : ok(outcome.plan)
	}

	const assessmentMatch = rest.match(
		/^\/residents\/([^/]+)\/assessments(?:\/([A-Za-z0-9-]+))?$/,
	)
	if (assessmentMatch) {
		const resident = findResident(assessmentMatch[1] ?? '')
		if (!resident) return fail('Resident not found', 404)
		const code = assessmentMatch[2]
		if (!code) return method === 'GET' ? ok(listAssessments(resident.id)) : null
		if (method === 'GET') {
			const assessment = findAssessment(resident.id, code.toUpperCase())
			return assessment ? ok(assessment) : fail('Not started', 404)
		}
		const outcome = saveAssessment(
			resident.id,
			code,
			body() as Partial<SaveAssessmentInput>,
			actor,
		)
		return outcome.error ? fail(outcome.error, 400) : ok(outcome.assessment)
	}

	const recordMatch = rest.match(
		/^\/residents\/([^/]+)\/(notes|documents|contacts)$/,
	)
	if (!recordMatch) return null
	const resident = findResident(recordMatch[1] ?? '')
	if (!resident) return fail('Resident not found', 404)

	switch (`${method} ${recordMatch[2]}`) {
		case 'GET notes':
			return ok(getNotes(resident))
		case 'POST notes': {
			const outcome = addNote(
				resident,
				body() as Partial<CreateNoteInput>,
				actor,
			)
			return outcome.error ? fail(outcome.error, 400) : ok(outcome.note, 201)
		}
		case 'GET documents':
			return ok(getDocuments(resident))
		case 'POST documents': {
			const outcome = addDocument(
				resident,
				body() as Partial<CreateDocumentInput>,
				actor,
			)
			return outcome.error
				? fail(outcome.error, 400)
				: ok(outcome.document, 201)
		}
		case 'POST contacts': {
			const outcome = addContact(resident, body() as Partial<ResidentContact>)
			return outcome.error ? fail(outcome.error, 400) : ok(outcome.contact, 201)
		}
		default:
			return null
	}
}

export interface WorkspaceRequest {
	method: string
	rest: string
	workspace: Workspace
	searchParams: URLSearchParams
	init?: RequestInit
}

export function handleIncidents({
	method,
	rest,
	searchParams,
	init,
}: WorkspaceRequest) {
	if (rest === '/incidents') {
		if (method === 'POST') {
			const input = readJson(init) as Partial<ReportIncidentInput>
			const error = validateIncidentReport(input)
			if (error) return fail(error, 400)
			return ok(
				reportIncident(input as ReportIncidentInput, demoUser.name),
				201,
			)
		}
		return ok(paginate(filterIncidents(searchParams), searchParams))
	}
	if (rest === '/incidents/counts') return ok(getIncidentCounts())

	const match = rest.match(/^\/incidents\/([^/]+)(\/review)?$/)
	if (!match) return null
	const incident = findIncident(match[1] ?? '')
	if (!incident) return fail('Incident not found', 404)

	if (method === 'GET' && !match[2]) return ok(incident)
	if (method === 'POST' && match[2]) {
		const input = readJson(init) as Partial<ReviewIncidentInput>
		if (!input.severity || !input.status) {
			return fail('Choose a severity and status.', 400)
		}
		return ok(
			reviewIncident(incident, {
				severity: input.severity,
				status: input.status,
				manager_notes: input.manager_notes ?? '',
				completed_action_ids: input.completed_action_ids ?? [],
				new_actions: input.new_actions ?? [],
				notified_ids: input.notified_ids ?? [],
			}),
		)
	}
	return null
}

export function handleVisits({
	method,
	rest,
	searchParams,
	init,
}: WorkspaceRequest) {
	if (method === 'GET' && rest === '/visits')
		return ok(getVisitDay(searchParams))
	if (method === 'GET' && rest === '/visits/carers') return ok(getVisitCarers())
	if (method === 'POST' && rest === '/visits/assign') {
		const result = assignVisit(readJson(init) as Partial<AssignVisitInput>)
		return result.error ? fail(result.error, 409) : ok(result.visit)
	}
	if (method === 'GET' && rest === '/rota') return ok(getRotaWeek(searchParams))
	return null
}

export function handleStaff({
	method,
	rest,
	searchParams,
	init,
}: WorkspaceRequest) {
	if (method === 'GET' && rest === '/staff') {
		return ok(paginate(filterStaff(searchParams), searchParams))
	}
	if (method === 'GET' && rest === '/staff/counts') return ok(getStaffCounts())

	const match = rest.match(/^\/staff\/([^/]+)(\/access)?$/)
	if (!match) return null
	const staff = findStaff(match[1] ?? '')
	if (!staff) return fail('Staff member not found', 404)

	if (method === 'GET' && !match[2]) return ok(staff)
	if (method === 'POST' && match[2]) {
		const result = updateStaffAccess(
			staff,
			readJson(init) as Partial<UpdateStaffAccessInput>,
		)
		return result.error ? fail(result.error, 400) : ok(result.staff)
	}
	return null
}

export function handleSettings({ method, rest, init }: WorkspaceRequest) {
	if (rest === '/settings/roles') {
		if (method === 'POST') {
			return ok(saveRolePermissions(readJson(init) as Partial<RolePermissions>))
		}
		return ok(getRolePermissions())
	}

	const report = rest.match(/^\/reports\/([a-z-]+)$/)
	if (method === 'GET' && report) {
		const key = report[1] ?? ''
		return isReportKey(key)
			? ok(buildReport(key))
			: fail('Report not found', 404)
	}
	return null
}
