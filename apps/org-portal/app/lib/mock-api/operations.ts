import { fail, ok, paginate, readJson } from './http'
import {
	filterIncidents,
	findIncident,
	getIncidentCounts,
	reportIncident,
	reviewIncident,
	validateIncidentReport,
} from './incidents'
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
