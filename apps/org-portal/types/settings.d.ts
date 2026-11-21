type PermissionRole = 'OWNER' | 'MANAGER' | 'NURSE' | 'CARER' | 'OFFICE'

type Permission =
	| 'SEE_RESIDENTS'
	| 'EDIT_CARE_PLANS'
	| 'APPROVE_CARE_PLANS'
	| 'RECORD_MEDICATION'
	| 'ADD_PRESCRIPTIONS'
	| 'REPORT_INCIDENTS'
	| 'REVIEW_INCIDENTS'
	| 'MANAGE_STAFF'
	| 'SEE_REPORTS'
	| 'CHANGE_SETTINGS'

type RolePermissions = Record<PermissionRole, Array<Permission>>

type ReportKey =
	| 'medication'
	| 'visits'
	| 'incidents'
	| 'care-plan-reviews'
	| 'staff-training'
	| 'occupancy'

type ReportRange = 'week' | 'month' | 'quarter'

interface ReportTable {
	columns: StringList
	rows: Array<Array<string | number>>
}
