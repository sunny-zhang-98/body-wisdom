import type { OrganAssessment, SelfCheckResult, BehaviorMark, AppState } from '../types'

const STORAGE_KEY = 'body-wisdom-state'
const SELF_CHECK_KEY = 'body-wisdom-selfchecks'
const BEHAVIOR_MARKS_KEY = 'body-wisdom-behavior-marks'
const THEME_KEY = 'body-wisdom-theme'

export function loadAssessments(): Record<string, OrganAssessment> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    return JSON.parse(raw) as Record<string, OrganAssessment>
  } catch {
    return {}
  }
}

export function saveAssessments(assessments: Record<string, OrganAssessment>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(assessments))
  } catch {
    // storage full or unavailable
  }
}

export function clearAssessments() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}

export function loadSelfCheckResults(): Record<string, SelfCheckResult> {
  try {
    const raw = localStorage.getItem(SELF_CHECK_KEY)
    if (!raw) return {}
    return JSON.parse(raw) as Record<string, SelfCheckResult>
  } catch {
    return {}
  }
}

export function saveSelfCheckResults(results: Record<string, SelfCheckResult>) {
  try {
    localStorage.setItem(SELF_CHECK_KEY, JSON.stringify(results))
  } catch {
    // storage full or unavailable
  }
}

export function clearSelfCheckResults() {
  try {
    localStorage.removeItem(SELF_CHECK_KEY)
  } catch {
    // ignore
  }
}

export function loadBehaviorMarks(): Record<string, BehaviorMark> {
  try {
    const raw = localStorage.getItem(BEHAVIOR_MARKS_KEY)
    if (!raw) return {}
    return JSON.parse(raw) as Record<string, BehaviorMark>
  } catch {
    return {}
  }
}

export function saveBehaviorMarks(marks: Record<string, BehaviorMark>) {
  try {
    localStorage.setItem(BEHAVIOR_MARKS_KEY, JSON.stringify(marks))
  } catch {
    // storage full or unavailable
  }
}

export function clearBehaviorMarks() {
  try {
    localStorage.removeItem(BEHAVIOR_MARKS_KEY)
  } catch {
    // ignore
  }
}

export function loadTheme(): 'light' | 'dark' {
  const saved = localStorage.getItem(THEME_KEY)
  if (saved === 'light' || saved === 'dark') return saved
  // auto-detect
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function saveTheme(theme: 'light' | 'dark') {
  localStorage.setItem(THEME_KEY, theme)
}

export function applyTheme(theme: 'light' | 'dark') {
  document.documentElement.setAttribute('data-theme', theme)
}

export function loadState(): AppState {
  return {
    assessments: loadAssessments(),
    selfCheckResults: loadSelfCheckResults(),
    behaviorMarks: loadBehaviorMarks(),
    theme: loadTheme(),
  }
}
