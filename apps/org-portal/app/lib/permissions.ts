export const PERMISSION_ROLES: ReadonlyArray<{
	value: PermissionRole
	label: string
}> = [
	{ value: 'OWNER', label: 'Owner' },
	{ value: 'MANAGER', label: 'Manager' },
	{ value: 'NURSE', label: 'Nurse' },
	{ value: 'CARER', label: 'Carer' },
	{ value: 'OFFICE', label: 'Office' },
]

export const PERMISSIONS: ReadonlyArray<{ value: Permission; label: string }> =
	[
		{ value: 'SEE_RESIDENTS', label: 'See residents and clients' },
		{ value: 'EDIT_CARE_PLANS', label: 'Write and edit care plans' },
		{ value: 'APPROVE_CARE_PLANS', label: 'Approve care plans' },
		{ value: 'RECORD_MEDICATION', label: 'Record medication' },
		{ value: 'ADD_PRESCRIPTIONS', label: 'Add prescriptions' },
		{ value: 'REPORT_INCIDENTS', label: 'Report incidents' },
		{ value: 'REVIEW_INCIDENTS', label: 'Review incidents' },
		{ value: 'MANAGE_STAFF', label: 'Manage staff and rota' },
		{ value: 'SEE_REPORTS', label: 'See reports' },
		{ value: 'CHANGE_SETTINGS', label: 'Change settings' },
	]

export const ALL_PERMISSIONS = PERMISSIONS.map((p) => p.value)

/** Owner is never editable, so no organisation can lock itself out. */
export function withOwnerPermissions(
	permissions: RolePermissions,
): RolePermissions {
	return { ...permissions, OWNER: [...ALL_PERMISSIONS] }
}
