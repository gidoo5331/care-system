import { todayAt } from './http'
import { getResidentMedication, getRoundTimes } from './medication'

const kofiReadings: ResidentSummary['latest_readings'] = {
	recorded_at: todayAt('07:30'),
	recorded_by: 'Esi Quaye',
	readings: [
		{ id: 'bp', label: 'Blood pressure', value: '138/84', tone: 'neutral' },
		{ id: 'pulse', label: 'Pulse', value: '76 bpm', tone: 'neutral' },
		{ id: 'sugar', label: 'Blood sugar', value: '9.8 mmol/L', tone: 'warning' },
		{ id: 'temp', label: 'Temperature', value: '36.7 °C', tone: 'neutral' },
	],
}

const kofiToday: Array<ResidentTimelineEntry> = [
	{
		id: 't1',
		time: '07:50',
		title: 'Refused breakfast',
		detail: 'Said he felt full · Akosua Badu',
	},
	{
		id: 't2',
		time: '07:30',
		title: 'Readings taken',
		detail: 'Blood sugar above usual · Esi Quaye',
	},
	{
		id: 't3',
		time: '07:10',
		title: 'Washed and dressed',
		detail: 'Help of one · Akosua Badu',
	},
	{
		id: 't4',
		time: '06:00',
		title: 'Night handover',
		detail: 'Slept well · Kwame Addo',
	},
]

function genericReadings(
	resident: Resident,
): ResidentSummary['latest_readings'] {
	return {
		recorded_at: todayAt('07:45'),
		recorded_by: resident.service === 'CARE_HOME' ? 'Esi Quaye' : 'Yaw Boateng',
		readings: [
			{ id: 'bp', label: 'Blood pressure', value: '126/78', tone: 'neutral' },
			{ id: 'pulse', label: 'Pulse', value: '72 bpm', tone: 'neutral' },
			{
				id: 'sugar',
				label: 'Blood sugar',
				value: '6.1 mmol/L',
				tone: 'neutral',
			},
			{ id: 'temp', label: 'Temperature', value: '36.5 °C', tone: 'neutral' },
		],
	}
}

function genericToday(resident: Resident): Array<ResidentTimelineEntry> {
	const isCareHome = resident.service === 'CARE_HOME'
	return [
		{
			id: 't1',
			time: '07:45',
			title: 'Readings taken',
			detail: `All within usual range · ${isCareHome ? 'Esi Quaye' : 'Yaw Boateng'}`,
		},
		{
			id: 't2',
			time: isCareHome ? '06:00' : '07:30',
			title: isCareHome ? 'Night handover' : 'Morning visit',
			detail: isCareHome
				? 'Slept well · Kwame Addo'
				: 'Washed and dressed · Yaw Boateng',
		},
	]
}

export function getResidentSummary(resident: Resident): ResidentSummary {
	const medications = getResidentMedication(resident)
	const isKofi = resident.id === 'res_kofi_asante'
	const admittedToday =
		new Date(resident.admitted_at).getTime() >= todayAt('00:00').getTime()

	if (admittedToday) {
		return {
			round_times: getRoundTimes(medications),
			medications,
			latest_readings: null,
			today: [],
		}
	}

	return {
		round_times: getRoundTimes(medications),
		medications,
		latest_readings: isKofi ? kofiReadings : genericReadings(resident),
		today: isKofi ? kofiToday : genericToday(resident),
	}
}
