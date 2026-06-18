import type { AppState, AppAction } from '../types'
import { loadState } from '../utils/storage'

export function getInitialState(): AppState {
  return loadState()
}

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_ASSESSMENT':
      return {
        ...state,
        assessments: {
          ...state.assessments,
          [action.organId]: {
            damageLevel: action.level,
            updatedAt: new Date().toISOString(),
          },
        },
      }
    case 'RESET_ASSESSMENTS':
      return { ...state, assessments: {} }
    case 'SET_THEME':
      return { ...state, theme: action.theme }
    default:
      return state
  }
}
