import { z } from 'zod'

const TaskSchema = z.object({
	id: z.string().optional(),
	description: z.string().trim(),
	frequency: z.string().trim(),
})

const SectionSchema = z
	.object({
		id: z.string().optional(),
		title: z.string().trim().min(1, 'Give this section a title'),
		needs: z.string().trim(),
		goal: z.string().trim(),
		support: z.string().trim(),
		tasks: z.array(TaskSchema),
	})
	.superRefine((section, ctx) => {
		if (!section.needs) {
			ctx.addIssue({
				code: 'custom',
				path: ['needs'],
				message: 'Describe what they need',
			})
		}
		if (!section.support) {
			ctx.addIssue({
				code: 'custom',
				path: ['support'],
				message: 'Describe how staff should support them',
			})
		}
	})

export const CarePlanEditorSchema = z.object({
	resident_id: z.string(),
	sections: z.array(SectionSchema).min(1, 'Add at least one section'),
	risk_assessments: z.array(
		z.object({
			id: z.string().optional(),
			name: z.string().trim(),
			level: z.enum(['LOW', 'MEDIUM', 'HIGH']),
		}),
	),
})

export type CarePlanEditorValues = z.infer<typeof CarePlanEditorSchema>

const emptySection = (title: string) => ({
	title,
	needs: '',
	goal: '',
	support: '',
	tasks: [{ description: '', frequency: '' }],
})

export const NEW_PLAN_DEFAULTS: CarePlanEditorValues = {
	resident_id: '',
	sections: [
		emptySection('Personal care'),
		emptySection('Eating and drinking'),
		emptySection('Moving around'),
	],
	risk_assessments: [
		{ name: 'Falls', level: 'LOW' },
		{ name: 'Nutrition (weight and appetite)', level: 'LOW' },
		{ name: 'Pressure sores', level: 'LOW' },
	],
}

export function planToValues(plan: CarePlan): CarePlanEditorValues {
	return {
		resident_id: plan.resident.id,
		sections: plan.sections.map((section) => ({
			id: section.id,
			title: section.title,
			needs: section.needs,
			goal: section.goal,
			support: section.support,
			tasks: section.tasks.map((task) => ({
				id: task.id,
				description: task.description,
				frequency: task.frequency,
			})),
		})),
		risk_assessments: plan.risk_assessments.map((assessment) => ({
			id: assessment.id,
			name: assessment.name,
			level: assessment.level,
		})),
	}
}

export const EMPTY_SECTION = emptySection('')
