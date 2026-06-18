import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react'
import type { AppState, AppAction } from '../types'
import { appReducer, getInitialState } from './reducer'
import { saveAssessments, saveSelfCheckResults, saveBehaviorMarks, saveTheme, applyTheme } from '../utils/storage'

interface AppContextValue {
  state: AppState
  dispatch: React.Dispatch<AppAction>
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, undefined, getInitialState)

  // persist assessments on change
  useEffect(() => {
    saveAssessments(state.assessments)
  }, [state.assessments])

  // persist self-check results on change
  useEffect(() => {
    saveSelfCheckResults(state.selfCheckResults)
  }, [state.selfCheckResults])

  // persist behavior marks on change
  useEffect(() => {
    saveBehaviorMarks(state.behaviorMarks)
  }, [state.behaviorMarks])

  // persist + apply theme on change
  useEffect(() => {
    saveTheme(state.theme)
    applyTheme(state.theme)
  }, [state.theme])

  // initial theme apply
  useEffect(() => {
    applyTheme(state.theme)
  }, [])

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  )
}

export function useAppState() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useAppState must be used within AppProvider')
  return ctx
}
