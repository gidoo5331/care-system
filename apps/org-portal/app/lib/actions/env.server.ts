import { config } from 'dotenv'
import * as z from 'zod'
import { MOCK_API_ADDRESS } from '../mock-api/address'

config()

const environmentSchema = z.object({
	NODE_ENV: z
		.enum(['development', 'production', 'test', 'staging'])
		.default('development'),
	API_ADDRESS: z
		.string()
		.transform((value) => value.trim() || MOCK_API_ADDRESS)
		.default(MOCK_API_ADDRESS),
	SESSION_SECRET: z
		.string()
		.transform((value) => value.trim() || 'dev-session-secret')
		.default('dev-session-secret'),
})

const environmentVariables = () => environmentSchema.parse(process.env)

export { environmentVariables }
