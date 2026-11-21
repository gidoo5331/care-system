import { ArrowLeftIcon, PrinterIcon } from 'lucide-react'
import { Link, useParams } from 'react-router'
import { AssessmentBlocks } from './form-blocks'
import { PageHeader } from '~/components/page-header'
import { Alert } from '~/components/ui/alert'
import { Badge } from '~/components/ui/badge'
import { Button, buttonVariants } from '~/components/ui/button'
import { Card } from '~/components/ui/card'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '~/components/ui/table'
import {
	ASSESSMENT_TEMPLATES,
	CARE_PLAN_SECTIONS,
	findAssessmentTemplate,
} from '~/lib/assessment-templates'

function questionCount(template: AssessmentTemplate) {
	return template.blocks.reduce(
		(sum, block) =>
			sum +
			(block.type === 'yes_no'
				? block.items.length
				: block.type === 'body_map'
					? 0
					: 1),
		0,
	)
}

export function AssessmentTemplatesModule() {
	return (
		<>
			<PageHeader
				title="Assessment templates"
				description="The Oasis Client Assessment Booklet, forms OHS-01 to OHS-24"
			/>
			<Alert tone="info">
				<span>
					Staff fill these in from a resident’s profile, under Assessments. The
					wording matches the paper booklet.
				</span>
			</Alert>
			<Card aria-label="Assessment templates">
				<Table className="min-w-[720px]">
					<TableHeader>
						<TableRow>
							<TableHead>Form</TableHead>
							<TableHead>Assessment</TableHead>
							<TableHead>Feeds care plan section</TableHead>
							<TableHead>Questions</TableHead>
							<TableHead>
								<span className="sr-only">Actions</span>
							</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{ASSESSMENT_TEMPLATES.map((template) => (
							<TableRow key={template.code}>
								<TableCell className="text-muted-foreground font-mono text-[13px]">
									{template.code}
								</TableCell>
								<TableCell>
									<span className="block font-medium">{template.title}</span>
									<span className="text-muted-foreground block text-[13px] leading-[18px]">
										{template.description}
									</span>
								</TableCell>
								<TableCell>
									{template.care_plan_section ? (
										<Badge>{template.care_plan_section}</Badge>
									) : (
										<span className="text-subtle-foreground">–</span>
									)}
								</TableCell>
								<TableCell className="text-muted-foreground">
									{questionCount(template) || '–'}
								</TableCell>
								<TableCell className="text-right">
									<Link
										to={`/care-plans/templates/${template.code}`}
										aria-label={`Preview ${template.title}`}
										className={buttonVariants({ variant: 'outline' })}
									>
										Preview
									</Link>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</Card>
		</>
	)
}

export function AssessmentTemplateModule() {
	const { code = '' } = useParams()
	const template = findAssessmentTemplate(code)

	if (!template) {
		return (
			<Alert tone="critical">
				<span>
					There is no form {code}.{' '}
					<Link to="/care-plans/templates">See all forms</Link>
				</span>
			</Alert>
		)
	}

	return (
		<>
			<PageHeader
				title={template.title}
				description={`Form ${template.code} · preview`}
				actions={
					<>
						<Link
							to="/care-plans/templates"
							className={buttonVariants({ variant: 'outline' })}
						>
							<ArrowLeftIcon strokeWidth={1.75} />
							All forms
						</Link>
						<Button variant="outline" onClick={() => window.print()}>
							<PrinterIcon strokeWidth={1.75} />
							Print blank form
						</Button>
					</>
				}
			/>
			<AssessmentBlocks template={template} answers={{}} />
		</>
	)
}

export function CarePlanSectionsModule() {
	return (
		<>
			<PageHeader
				title="Care plan sections"
				description="The standard sections of an Oasis care plan, and the booklet forms that inform each"
			/>
			<Card aria-label="Care plan sections">
				<Table className="min-w-[560px]">
					<TableHeader>
						<TableRow>
							<TableHead>Section</TableHead>
							<TableHead>Filled from</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{CARE_PLAN_SECTIONS.map((section) => (
							<TableRow key={section.title}>
								<TableCell className="font-medium">{section.title}</TableCell>
								<TableCell>
									<span className="flex flex-wrap gap-2">
										{section.forms.map((code) => {
											const template = findAssessmentTemplate(code)
											return (
												<Link
													key={code}
													to={`/care-plans/templates/${code}`}
													className="text-sm"
												>
													{code} {template?.short_title}
												</Link>
											)
										})}
									</span>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</Card>
			<p className="text-muted-foreground m-0 text-sm">
				When writing a care plan, “Add section” offers these titles. Completing
				a form on a resident’s profile can fill in its section for you.
			</p>
		</>
	)
}
