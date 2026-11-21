import { todayAt } from './http'
import {
	ATTENTION_CATEGORIES,
	parseAttentionCategory,
} from '~/lib/needs-attention.utils'

type Seed = Omit<AttentionItem, 'raised_at' | 'handled'> & {
	raised: string
	handled?: { by: string; at: string; note: string }
}

const CARE_HOME_SEEDS: Array<Seed> = [
	{
		id: 'kofi-missed-dose',
		category: 'MEDICATION',
		kind: 'Missed dose',
		tone: 'critical',
		title: 'Kofi Asante · metformin 08:00',
		detail: 'Ground floor · nothing recorded on the eMAR',
		action_label: 'Open eMAR',
		action_href: '/residents/res_kofi_asante/medication',
		raised: '08:30',
	},
	{
		id: 'efua-fall',
		category: 'INCIDENT',
		kind: 'Fall',
		tone: 'critical',
		title: 'Efua Darko · fall in bathroom',
		detail: 'Reported 07:42 by Esi Quaye · waiting for manager review',
		action_label: 'Review',
		action_href: '/incidents/inc_0142',
		raised: '07:42',
	},
	{
		id: 'akosua-sick',
		category: 'STAFF',
		kind: 'Short staffed',
		tone: 'critical',
		title: 'Late shift · one carer short',
		detail: 'Akosua Badu called in sick · first floor, 14:00 to 22:00',
		action_label: 'Find cover',
		action_href: '/visits/rota',
		raised: '06:55',
	},
	{
		id: 'yaw-refused',
		category: 'MEDICATION',
		kind: 'Refused dose',
		tone: 'warning',
		title: 'Yaw Ofori · amlodipine 08:00',
		detail: 'First floor · refused twice this week',
		action_label: 'Open eMAR',
		action_href: '/residents/res_yaw_ofori/medication',
		raised: '08:20',
	},
	{
		id: 'kwabena-stock',
		category: 'MEDICATION',
		kind: 'Low stock',
		tone: 'warning',
		title: 'Kwabena Mensah · paracetamol',
		detail: 'First floor · 4 doses left',
		action_label: 'See prescriptions',
		action_href: '/residents/res_kwabena_mensah/medication',
		raised: '09:05',
	},
	{
		id: 'nana-review',
		category: 'CARE_PLAN',
		kind: 'Review due',
		tone: 'warning',
		title: 'Nana Agyeman · care plan',
		detail: 'First floor · 3 days overdue',
		action_label: 'Start review',
		action_href: '/residents/res_nana_agyeman/care-plan',
		raised: '06:00',
	},
	{
		id: 'adwoa-moving',
		category: 'CARE_PLAN',
		kind: 'Assessment',
		tone: 'warning',
		title: 'Adwoa Frimpong · moving and handling (OHS-14)',
		detail: 'Ground floor · not started',
		action_label: 'Start assessment',
		action_href: '/residents/res_adwoa_frimpong/assessments/OHS-14',
		raised: '06:00',
	},
	{
		id: 'training',
		category: 'STAFF',
		kind: 'Training',
		tone: 'warning',
		title: 'Training certificates',
		detail: '4 staff · due soon or expired',
		action_label: 'See staff',
		action_href: '/staff?view=training-due',
		raised: '06:00',
	},
	{
		id: 'yaa-late-insulin',
		category: 'MEDICATION',
		kind: 'Late dose',
		tone: 'warning',
		title: 'Yaa Asantewaa · insulin 06:00',
		detail: 'Ground floor · given 40 minutes late',
		action_label: 'Open eMAR',
		action_href: '/residents/res_yaa_asantewaa/medication',
		raised: '06:40',
		handled: {
			by: 'Esi Quaye',
			at: '07:15',
			note: 'Breakfast was delayed. Blood sugar checked at 07:10, 6.4 mmol/L.',
		},
	},
]

const HOMECARE_SEEDS: Array<Seed> = [
	{
		id: 'akua-missed-visit',
		category: 'VISIT',
		kind: 'Missed visit',
		tone: 'critical',
		title: 'Akua Sarpong · 07:30 visit',
		detail: 'Kaneshie · no check-in recorded',
		action_label: 'Reassign',
		action_href: '/visits?view=unassigned',
		raised: '08:00',
	},
	{
		id: 'abena-prompt',
		category: 'MEDICATION',
		kind: 'Missed prompt',
		tone: 'critical',
		title: 'Abena Owusu · morning medication',
		detail: 'Dansoman · carer did not record the prompt',
		action_label: 'Open eMAR',
		action_href: '/residents/res_abena_owusu/medication',
		raised: '10:05',
	},
	{
		id: 'abena-late-visit',
		category: 'VISIT',
		kind: 'Late visit',
		tone: 'warning',
		title: 'Abena Owusu · 09:20 visit',
		detail: 'Dansoman · Yaw Boateng 20 min late',
		action_label: 'See late visits',
		action_href: '/visits?view=late',
		raised: '09:40',
	},
	{
		id: 'unassigned-visits',
		category: 'VISIT',
		kind: 'No carer',
		tone: 'warning',
		title: 'Visits later today without a carer',
		detail: 'Chorkor, Kaneshie and Dansoman',
		action_label: 'Assign carers',
		action_href: '/visits?view=unassigned',
		raised: '06:00',
	},
	{
		id: 'akua-review',
		category: 'CARE_PLAN',
		kind: 'Review due',
		tone: 'warning',
		title: 'Akua Sarpong · care plan',
		detail: 'Kaneshie · due in 2 days',
		action_label: 'Start review',
		action_href: '/residents/res_akua_sarpong/care-plan',
		raised: '06:00',
	},
	{
		id: 'training',
		category: 'STAFF',
		kind: 'Training',
		tone: 'warning',
		title: 'Training certificates',
		detail: '2 carers · moving and handling expired',
		action_label: 'See staff',
		action_href: '/staff?view=training-due',
		raised: '06:00',
	},
	{
		id: 'kweku-late-visit',
		category: 'VISIT',
		kind: 'Late visit',
		tone: 'warning',
		title: 'Kweku Bonsu · 08:00 visit',
		detail: 'Dansoman · Adjoa Dankwa 15 min late',
		action_label: 'See visits',
		action_href: '/visits',
		raised: '08:15',
		handled: {
			by: 'Ama Mensah',
			at: '08:25',
			note: 'Called his daughter to let her know. Adjoa arrived 08:15.',
		},
	},
]

const stores = new Map<string, Array<AttentionItem>>()

function seedItems(workspace: Workspace): Array<AttentionItem> {
	const seeds =
		workspace.type === 'CARE_HOME' ? CARE_HOME_SEEDS : HOMECARE_SEEDS
	return seeds.map(({ raised, handled, ...item }) => ({
		...item,
		id: `att_${workspace.id}_${item.id}`,
		raised_at: todayAt(raised),
		handled: handled ? { ...handled, at: todayAt(handled.at) } : null,
	}))
}

function itemsFor(workspace: Workspace) {
	let items = stores.get(workspace.id)
	if (!items) {
		items = seedItems(workspace)
		stores.set(workspace.id, items)
	}
	return items
}

const TONE_RANK: Record<StatusTone, number> = {
	critical: 0,
	warning: 1,
	info: 2,
	neutral: 3,
	success: 4,
}

const byUrgency = (a: AttentionItem, b: AttentionItem) =>
	TONE_RANK[a.tone] - TONE_RANK[b.tone] ||
	a.raised_at.getTime() - b.raised_at.getTime()

export function getOpenAttention(workspace: Workspace) {
	return itemsFor(workspace)
		.filter((item) => !item.handled)
		.sort(byUrgency)
}

export function getAttentionList(
	workspace: Workspace,
	searchParams: URLSearchParams,
): AttentionList {
	const category = parseAttentionCategory(searchParams.get('category'))
	const inCategory = (item: AttentionItem) =>
		!category || item.category === category

	const open = getOpenAttention(workspace)
	const counts = Object.fromEntries(
		ATTENTION_CATEGORIES.map((c) => [
			c,
			open.filter((item) => item.category === c).length,
		]),
	) as Record<AttentionCategory, number>

	return {
		open: open.filter(inCategory),
		handled: itemsFor(workspace)
			.filter((item) => item.handled && inCategory(item))
			.sort(
				(a, b) =>
					(b.handled?.at.getTime() ?? 0) - (a.handled?.at.getTime() ?? 0),
			),
		counts,
		total_open: open.length,
	}
}

export function handleAttention(
	workspace: Workspace,
	input: Partial<HandleAttentionInput>,
	actor: string,
) {
	const item = itemsFor(workspace).find((i) => i.id === input.item_id)
	if (!item) return { error: 'We couldn’t find that item.' }
	if (item.handled) return { error: `${item.handled.by} already handled this.` }
	const note = input.note?.trim()
	if (!note) return { error: 'Say what was done.' }

	item.handled = { by: actor, at: new Date(), note }
	return { item }
}
