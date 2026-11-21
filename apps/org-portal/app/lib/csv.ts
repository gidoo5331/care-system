function escapeCell(value: string | number) {
	const text = String(value)
	return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

export function toCsv(table: ReportTable) {
	return [table.columns, ...table.rows]
		.map((row) => row.map(escapeCell).join(','))
		.join('\n')
}

export function downloadCsv(filename: string, table: ReportTable) {
	const blob = new Blob([toCsv(table)], { type: 'text/csv;charset=utf-8' })
	const url = URL.createObjectURL(blob)
	const link = document.createElement('a')
	link.href = url
	link.download = filename
	link.click()
	URL.revokeObjectURL(url)
}
