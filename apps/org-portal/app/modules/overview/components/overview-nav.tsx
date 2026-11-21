import {
	SubNavLink,
	SubNavSectionLabel,
	SubNavTitle,
} from '~/components/sub-nav'
import { Badge } from '~/components/ui/badge'

interface Props {
	overview?: WorkspaceOverview
}

export function OverviewNav({ overview }: Props) {
	const needsAttentionCount = overview?.needs_attention_count ?? 0
	const handoverNewCount = overview?.handover_new_count ?? 0

	return (
		<>
			<SubNavTitle>Overview</SubNavTitle>
			<SubNavLink to="/" end>
				Today
			</SubNavLink>
			<SubNavLink
				to="/needs-attention"
				trailing={
					needsAttentionCount ? (
						<Badge tone="critical">{needsAttentionCount}</Badge>
					) : null
				}
			>
				Needs attention
			</SubNavLink>
			<SubNavLink
				to="/handover"
				trailing={
					handoverNewCount ? <Badge>{handoverNewCount} new</Badge> : null
				}
			>
				Handover notes
			</SubNavLink>
			<SubNavLink to="/occupancy">Occupancy</SubNavLink>

			{overview?.units.length ? (
				<>
					<SubNavSectionLabel>Units</SubNavSectionLabel>
					{overview.units.map((unit) => (
						<SubNavLink
							key={unit.id}
							to={`/residents?unit=${unit.id}`}
							trailing={<Badge>{unit.resident_count}</Badge>}
						>
							{unit.name}
						</SubNavLink>
					))}
				</>
			) : null}
		</>
	)
}
