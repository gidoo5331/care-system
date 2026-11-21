import { createContext, useContext, type PropsWithChildren } from 'react'

interface Props {
	data?: WorkspaceUser
}

interface IWorkspaceContext {
	workspaceUser?: WorkspaceUser
}

const WorkspaceContext = createContext<IWorkspaceContext | null>(null)

export function WorkspaceProvider({
	data,
	children,
}: PropsWithChildren<Props>) {
	return (
		<WorkspaceContext.Provider value={{ workspaceUser: data ?? undefined }}>
			{children}
		</WorkspaceContext.Provider>
	)
}

export function useWorkspace() {
	const context = useContext(WorkspaceContext)
	if (!context) {
		throw new Error('useWorkspace must be used within a WorkspaceProvider')
	}
	return context
}
