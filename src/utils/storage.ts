import type { OrganAssessment, SelfCheckResult, AppState } from '../types'

const STORAGE_KEY = 'body-wisdom-state'
const SELF_CHECK_KEY = 'body-wisdom-selfchecks'
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
    theme: loadTheme(),
  }
}
