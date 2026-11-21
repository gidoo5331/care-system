import dayjs from 'dayjs'
import { todayAt } from './http'
import { toMinutes } from '~/lib/visit.utils'

type VisitSeed = [
	start: string,
	minutes: number,
	client: string,
	area: string,
	task: string,
	status: VisitStatus,
]

const CARER_SEEDS: Array<{
	id: string
	name: string
	visits: Array<VisitSeed>
}> = [
	{
		id: 'stf_yaw_boateng',
		name: 'Yaw Boateng',
		visits: [
			['07:30', 45, 'Esi Takyi', 'Dansoman', 'morning care', 'DONE'],
			['09:20', 40, 'Abena Owusu', 'Dansoman', 'pressure area care', 'LATE'],
			['10:45', 45, 'Kojo Ampofo', 'Mamprobi', 'meals', 'UPCOMING'],
			[
				'12:00',
				45,
				'Akua Sarpong',
				'Kaneshie',
				'lunch and insulin',
				'UPCOMING',
			],
			['13:15', 45, 'Ekow Mensah', 'Dansoman', 'meals', 'UPCOMING'],
			['16:30', 45, 'Esi Takyi', 'Dansoman', 'tea and medication', 'UPCOMING'],
		],
	},
	{
		id: 'stf_adjoa_dankwa',
		name: 'Adjoa Dankwa',
		visits: [
			['07:00', 45, 'Mary Ansah', 'Korle Gonno', 'morning care', 'DONE'],
			['08:00', 60, 'Kweku Bonsu', 'Dansoman', 'wash and dress', 'DONE'],
			['09:15', 45, 'Ama Serwaa', 'Dansoman', 'medication', 'IN_PROGRESS'],
			['11:00', 45, 'Ekow Mensah', 'Dansoman', 'meals', 'UPCOMING'],
			['13:15', 45, 'Ekow Mensah', 'Dansoman', 'meals', 'UPCOMING'],
		],
	},
	{
		id: 'stf_fiifi_arthur',
		name: 'Fiifi Arthur',
		visits: [
			['08:00', 45, 'Nii Lamptey', 'Chorkor', 'morning care', 'DONE'],
			['09:30', 45, 'Afia Pokua', 'Mamprobi', 'medication', 'IN_PROGRESS'],
			['12:00', 60, 'Kofi Mensah', 'Dansoman', 'bath', 'UPCOMING'],
			['15:30', 45, 'Nii Lamptey', 'Chorkor', 'tea', 'UPCOMING'],
		],
	},
	{
		id: 'stf_gifty_osei',
		name: 'Gifty Osei',
		visits: [
			['07:00', 60, 'Akos Nyarko', 'Kaneshie', 'wash and dress', 'DONE'],
			['08:30', 45, 'Esi Asare', 'Kaneshie', 'medication', 'DONE'],
			['09:30', 60, 'Yaw Darko', 'Kaneshie', 'morning care', 'LATE'],
			['11:30', 45, 'Akos Nyarko', 'Kaneshie', 'lunch', 'UPCOMING'],
			['14:00', 45, 'Esi Asare', 'Kaneshie', 'meals', 'UPCOMING'],
		],
	},
	{
		id: 'stf_kwesi_ofori',
		name: 'Kwesi Ofori',
		visits: [
			['07:00', 45, 'Kwabena Tetteh', 'Mamprobi', 'morning care', 'DONE'],
			['08:00', 45, 'Adjoa Amoah', 'Mamprobi', 'medication', 'DONE'],
			['10:00', 60, 'Naa Lamptey', 'Chorkor', 'bath', 'UPCOMING'],
			['12:30', 45, 'Kwabena Tetteh', 'Mamprobi', 'lunch', 'UPCOMING'],
			['14:30', 45, 'Adjoa Amoah', 'Mamprobi', 'meals', 'UPCOMING'],
			['17:00', 45, 'Naa Lamptey', 'Chorkor', 'evening care', 'UPCOMING'],
		],
	},
	{
		id: 'stf_abena_sarpong',
		name: 'Abena Sarpong',
		visits: [
			['07:30', 45, 'Kojo Badu', 'Korle Bu', 'morning care', 'DONE'],
			['08:45', 45, 'Araba Quaye', 'Korle Bu', 'wash and dress', 'DONE'],
			['11:00', 45, 'Kojo Badu', 'Korle Bu', 'lunch', 'UPCOMING'],
			['13:00', 60, 'Araba Quaye', 'Korle Bu', 'bath', 'UPCOMING'],
			['16:00', 45, 'Kojo Badu', 'Korle Bu', 'tea', 'UPCOMING'],
			['18:00', 45, 'Araba Quaye', 'Korle Bu', 'evening care', 'UPCOMING'],
		],
	},
]

let sequence = 0

function toVisit(seed: VisitSeed, carerId: Nullable<string>): Visit {
	const [start, minutes, client, area, task, status] = seed
	sequence += 1
	return {
		id: `vis_${sequence}`,
		client_name: client,
		area,
		start_time: start,
		duration_minutes: minutes,
		task,
		status,
		carer_id: carerId,
	}
}

const carers: Array<VisitCarer> = CARER_SEEDS.map((carer) => ({
	id: carer.id,
	name: carer.name,
	visits: carer.visits.map((seed) => toVisit(seed, carer.id)),
}))

const unassigned: Array<Visit> = [
	toVisit(['14:30', 45, 'Kwesi Appiah', 'Chorkor', 'meals', 'UPCOMING'], null),
	toVisit(
		['16:00', 30, 'Akua Sarpong', 'Kaneshie', 'blood sugar check', 'UPCOMING'],
		null,
	),
	toVisit(
		['18:00', 45, 'Abena Owusu', 'Dansoman', 'evening care', 'UPCOMING'],
		null,
	),
]

const byStart = (a: Visit, b: Visit) =>
	toMinutes(a.start_time) - toMinutes(b.start_time)

// Seeds only record lateness; everything else follows the clock so the
// timeline agrees with its now-line whenever the demo is opened.
function withLiveStatus(visit: Visit, now: number): Visit {
	if (visit.status === 'LATE' || visit.status === 'MISSED') return visit
	const start = toMinutes(visit.start_time)
	const end = start + visit.duration_minutes
	let status: VisitStatus = 'UPCOMING'
	if (now >= end) status = visit.carer_id ? 'DONE' : 'MISSED'
	else if (now >= start) status = visit.carer_id ? 'IN_PROGRESS' : 'LATE'
	return { ...visit, status }
}

export function getVisitDay(searchParams: URLSearchParams): VisitDay {
	const view = searchParams.get('view') as VisitListView | null
	const now = dayjs()
	const nowMinutes = now.hour() * 60 + now.minute()
	const live = (visits: Array<Visit>) =>
		visits.map((v) => withLiveStatus(v, nowMinutes)).sort(byStart)
	const isLateOrMissed = (v: Visit) =>
		v.status === 'LATE' || v.status === 'MISSED'

	const liveCarers = carers.map((carer) => ({
		...carer,
		visits: live(carer.visits),
	}))
	const liveUnassigned = live(unassigned)
	const all = [...liveCarers.flatMap((c) => c.visits), ...liveUnassigned]
	const done = all.filter((v) => v.status === 'DONE')

	const visibleCarers =
		view === 'unassigned'
			? []
			: view === 'late'
				? liveCarers
						.map((carer) => ({
							...carer,
							visits: carer.visits.filter(isLateOrMissed),
						}))
						.filter((carer) => carer.visits.length)
				: liveCarers

	return {
		date: todayAt('00:00'),
		branch_name: 'Oasis Homecare, Dansoman branch',
		carers: visibleCarers,
		unassigned: view === 'late' ? [] : liveUnassigned,
		stats: {
			total: all.length,
			done: done.length,
			on_time: done.length,
			late_or_missed: all.filter(isLateOrMissed).length,
			unassigned: unassigned.length,
		},
	}
}

export function getVisitCarers() {
	return carers.map(({ id, name }) => ({ id, name }))
}

export function assignVisit(input: Partial<AssignVisitInput>) {
	const index = unassigned.findIndex((v) => v.id === input.visit_id)
	const carer = carers.find((c) => c.id === input.carer_id)
	if (index === -1)
		return { error: 'That visit is no longer waiting for a carer.' }
	if (!carer) return { error: 'Choose a carer.' }

	const [visit] = unassigned.splice(index, 1)
	if (!visit) return { error: 'That visit is no longer waiting for a carer.' }
	const assigned = { ...visit, carer_id: carer.id }
	carer.visits.push(assigned)
	return { visit: assigned }
}
