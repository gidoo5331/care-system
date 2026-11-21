import { useParams } from 'react-router'
import { ComingSoonPanel } from '~/components/coming-soon-panel'

export function ResidentTabComingSoonModule() {
	const { residentId } = useParams()

	return (
		<ComingSoonPanel
			backTo={`/residents/${residentId}`}
			backLabel="Back to summary"
		/>
	)
}
