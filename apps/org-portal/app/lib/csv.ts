function escapeCell(value: string | number) {
	const text = String(value)
	return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

export function toCsv(table: ReportTable) {
	return [table.columns, ...table.rows]
		.map((row) => row.map(escapeCell).join(','))
		.join('\n')
}

/** Handles quoted cells, escaped quotes and CRLF line endings. */
export function parseCsv(text: string): Array<Array<string>> {
	const rows: Array<Array<string>> = []
	let row: Array<string> = []
	let cell = ''
	let inQuotes = false

	for (let i = 0; i < text.length; i++) {
		const char = text[i]
		if (inQuotes) {
			if (char === '"' && text[i + 1] === '"') {
				cell += '"'
				i++
			} else if (char === '"') {
				inQuotes = false
			} else {
				cell += char
			}
		} else if (char === '"') {
			inQuotes = true
		} else if (char === ',') {
			row.push(cell)
			cell = ''
		} else if (char === '\n' || char === '\r') {
			if (char === '\r' && text[i + 1] === '\n') i++
			row.push(cell)
			rows.push(row)
			row = []
			cell = ''
		} else {
			cell += char
		}
	}
	if (cell || row.length) {
		row.push(cell)
		rows.push(row)
	}
	return rows.filter((r) => r.some((value) => value.trim()))
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
