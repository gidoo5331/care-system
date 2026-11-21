const SHIFTS: Record<ShiftType, { label: string; className: string }> = {
	EARLY: {
		label: 'Early 07–15',
		className: 'bg-accent text-accent-foreground',
	},
	LATE: { label: 'Late 15–23', className: 'bg-info-tint text-info-ink' },
	NIGHT: {
		label: 'Night 23–07',
		className: 'bg-neutral-tint text-neutral-ink',
	},
	OPEN: { label: 'No one', className: 'bg-critical-tint text-critical-ink' },
	OFF: { label: 'Off', className: '' },
}

export function getShift(shift: ShiftType) {
	return SHIFTS[shift]
}
