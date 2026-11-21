import { PlusIcon } from 'lucide-react'
import { Link, useLoaderData } from 'react-router'
import { MedicationToday } from '../summary/medication-today'
import { Badge } from '~/components/ui/badge'
import { buttonVariants } from '~/components/ui/button'
import { Card, CardAction, CardHeader, CardTitle } from '~/components/ui/card'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '~/components/ui/table'
import type { loader } from '~/routes/_auth._dashboard.residents.$residentId.medication'

export function ResidentMedicationModule() {
	const { residentId, summary } = useLoaderData<typeof loader>()

	return (
		<>
			<MedicationToday
				residentId={residentId}
				roundTimes={summary.round_times}
				medications={summary.medications}
			/>

			<Card aria-labelledby="all-medicines">
				<CardHeader>
					<CardTitle id="all-medicines">All medicines</CardTitle>
					<CardAction>
						<Link
							to={`/medication/prescriptions/new?resident=${residentId}`}
							className={buttonVariants({ variant: 'outline' })}
						>
							<PlusIcon strokeWidth={1.75} />
							Add prescription
						</Link>
					</CardAction>
				</CardHeader>
				{summary.medications.length ? (
					<Table className="min-w-[640px]">
						<TableHeader>
							<TableRow>
								<TableHead>Medicine</TableHead>
								<TableHead>How to give it</TableHead>
								<TableHead>When</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{summary.medications.map((medication) => (
								<TableRow key={medication.id}>
									<TableCell className="font-medium">
										{medication.name}
									</TableCell>
									<TableCell className="text-muted-foreground">
										{medication.instructions}
									</TableCell>
									<TableCell>
										{medication.is_as_needed ? (
											<span className="flex flex-wrap items-center gap-2">
												<Badge tone="info">As needed</Badge>
												<span className="text-muted-foreground text-sm">
													{medication.last_given_label}
												</span>
											</span>
										) : medication.doses.length ? (
											medication.doses.map((dose) => dose.time).join(', ')
										) : (
											<span className="text-muted-foreground">
												Starts later
											</span>
										)}
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				) : (
					<p className="text-muted-foreground m-0 px-6 py-8 text-sm">
						No medicines prescribed.
					</p>
				)}
			</Card>
		</>
	)
}
