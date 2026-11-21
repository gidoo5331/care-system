import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat.js'
import { parseCsv } from '~/lib/csv'

dayjs.extend(customParseFormat)

export const TEMPLATE: ReportTable = {
	columns: [
		'first_name',
		'last_name',
		'date_of_birth',
		'gender',
		'service',
		'room',
		'floor',
		'area',
		'allergies',
		'conditions',
		'next_of_kin_name',
		'next_of_kin_phone',
	],
	rows: [
		[
			'Yaa',
			'Asantewaa',
			'02/05/1947',
			'Female',
			'Care home',
			'6',
			'Ground floor',
			'',
			'Penicillin',
			'Hypertension',
			'Kwame Asantewaa',
			'+233 24 000 0001',
		],
		[
			'Kojo',
			'Mensah',
			'15/11/1950',
			'Male',
			'Homecare',
			'',
			'',
			'Dansoman',
			'',
			'Type 2 diabetes; Walks with a stick',
			'Ama Mensah',
			'+233 24 000 0002',
		],
	],
}

export interface ParsedRow {
	line: number
	name: string
	input: Nullable<CreateResidentInput>
	error: Nullable<string>
}

const DATE_FORMATS = ['YYYY-MM-DD', 'DD/MM/YYYY', 'D/M/YYYY', 'DD-MM-YYYY']

const list = (value = '') =>
	value
		.split(/[;|]/)
		.map((item) => item.trim())
		.filter(Boolean)

function parseRow(
	cells: Record<string, string>,
): Pick<ParsedRow, 'input' | 'error'> {
	const firstName = cells.first_name?.trim()
	const lastName = cells.last_name?.trim()
	if (!firstName || !lastName)
		return { input: null, error: 'First and last name are needed' }

	const dob = dayjs(cells.date_of_birth?.trim(), DATE_FORMATS, true)
	if (!dob.isValid())
		return { input: null, error: 'Date of birth must look like 02/05/1947' }
	if (dob.isAfter(dayjs()))
		return { input: null, error: 'Date of birth is in the future' }

	const gender = cells.gender?.trim().toLowerCase()
	if (!['f', 'female', 'm', 'male'].includes(gender ?? '')) {
		return { input: null, error: 'Gender must be Female or Male' }
	}

	const serviceText = cells.service
		?.trim()
		.toLowerCase()
		.replace(/[\s_-]/g, '')
	const service: Nullable<WorkspaceType> =
		serviceText === 'carehome'
			? 'CARE_HOME'
			: serviceText === 'homecare'
				? 'HOMECARE'
				: null
	if (!service)
		return { input: null, error: 'Service must be Care home or Homecare' }

	const room = cells.room?.trim()
	const area = cells.area?.trim()
	if (service === 'CARE_HOME' && !room)
		return { input: null, error: 'Care home residents need a room' }
	if (service === 'HOMECARE' && !area)
		return { input: null, error: 'Homecare clients need an area' }

	const kinName = cells.next_of_kin_name?.trim()
	const kinPhone = cells.next_of_kin_phone?.trim()

	return {
		error: null,
		input: {
			first_name: firstName,
			last_name: lastName,
			date_of_birth: dob.format('YYYY-MM-DD'),
			gender: gender?.startsWith('f') ? 'FEMALE' : 'MALE',
			service,
			languages: [],
			allergies: list(cells.allergies),
			conditions: list(cells.conditions),
			risk_level: 'LOW',
			room: service === 'CARE_HOME' ? room : undefined,
			unit_name:
				service === 'CARE_HOME'
					? cells.floor?.trim().toLowerCase() || 'ground floor'
					: undefined,
			area: service === 'HOMECARE' ? area : undefined,
			contacts:
				kinName && kinPhone
					? [
							{
								name: kinName,
								relationship: 'Next of kin',
								phone_number: kinPhone,
								is_next_of_kin: true,
							},
						]
					: [],
		},
	}
}

export function parseResidentsCsv(text: string): {
	rows: Array<ParsedRow>
	error: Nullable<string>
} {
	const [header, ...body] = parseCsv(text.replace(/^﻿/, ''))
	if (!header) return { rows: [], error: 'The file is empty.' }

	const columns = header.map((h) => h.trim().toLowerCase().replace(/\s+/g, '_'))
	const missing = [
		'first_name',
		'last_name',
		'date_of_birth',
		'gender',
		'service',
	].filter((column) => !columns.includes(column))
	if (missing.length) {
		return {
			rows: [],
			error: `The file is missing these columns: ${missing.join(', ')}. Download the template to see the layout.`,
		}
	}
	if (!body.length)
		return { rows: [], error: 'The file has a header but no rows.' }

	return {
		error: null,
		rows: body.map((cells, index) => {
			const record = Object.fromEntries(
				columns.map((c, i) => [c, cells[i] ?? '']),
			)
			return {
				line: index + 2,
				name:
					`${record.first_name ?? ''} ${record.last_name ?? ''}`.trim() || '—',
				...parseRow(record),
			}
		}),
	}
}
