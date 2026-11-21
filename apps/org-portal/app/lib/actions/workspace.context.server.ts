import { createContext } from 'react-router'

export const workspaceContext = createContext<{
	workspaceUser: WorkspaceUser
} | null>(null)
