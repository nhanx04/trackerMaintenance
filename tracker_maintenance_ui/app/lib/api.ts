export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

const AUTH_STORAGE_KEY = 'tm_auth'
const isBrowser = typeof window !== 'undefined'

type ApiResponse<T> = {
  code?: number
  message?: string
  result: T
}

export type StoredAuth = {
  id: string
  username: string
  firstName?: string
  lastName?: string
  roles: string[]
  token: string
  authenticated: boolean
}

const extractRoleName = (role: unknown): string | null => {
  if (typeof role === 'string') return role
  if (role && typeof role === 'object' && 'name' in role) {
    const name = (role as { name?: unknown }).name
    return typeof name === 'string' ? name : null
  }
  return null
}

const normalizeRoles = (roles: unknown): string[] => {
  if (!Array.isArray(roles)) return []
  return roles.map(extractRoleName).filter((role): role is string => Boolean(role))
}

const normalizeStoredAuth = (auth: StoredAuth | Record<string, unknown>): StoredAuth => {
  const roles = normalizeRoles((auth as { roles?: unknown }).roles)
  return {
    id: String((auth as { id?: unknown }).id ?? ''),
    username: String((auth as { username?: unknown }).username ?? ''),
    firstName:
      typeof (auth as { firstName?: unknown }).firstName === 'string'
        ? ((auth as { firstName?: string }).firstName ?? undefined)
        : undefined,
    lastName:
      typeof (auth as { lastName?: unknown }).lastName === 'string'
        ? ((auth as { lastName?: string }).lastName ?? undefined)
        : undefined,
    roles,
    token: String((auth as { token?: unknown }).token ?? ''),
    authenticated: Boolean((auth as { authenticated?: unknown }).authenticated)
  }
}

export function getStoredAuth(): StoredAuth | null {
  if (!isBrowser) return null
  const raw = localStorage.getItem(AUTH_STORAGE_KEY)
  if (!raw) return null
  try {
    return normalizeStoredAuth(JSON.parse(raw) as Record<string, unknown>)
  } catch {
    return null
  }
}

export function saveStoredAuth(auth: StoredAuth) {
  if (!isBrowser) return
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(normalizeStoredAuth(auth)))
}

export function clearStoredAuth() {
  if (!isBrowser) return
  localStorage.removeItem(AUTH_STORAGE_KEY)
}

async function tryRefreshToken(expiredToken: string): Promise<string | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: expiredToken })
    })

    if (!response.ok) return null

    const data = (await response.json()) as ApiResponse<StoredAuth>
    const refreshed = data.result
    if (!refreshed?.token) return null

    const current = getStoredAuth()
    if (current) {
      saveStoredAuth({ ...current, ...refreshed, token: refreshed.token, authenticated: true })
    }

    return refreshed.token
  } catch {
    return null
  }
}

export async function authFetch(path: string, init?: RequestInit, token?: string): Promise<Response> {
  const stored = getStoredAuth()
  const activeToken = token ?? stored?.token

  const doFetch = (bearer?: string) =>
    fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}),
        ...(init?.headers ?? {})
      }
    })

  let response = await doFetch(activeToken)

  if (response.status === 401 && activeToken) {
    const newToken = await tryRefreshToken(activeToken)
    if (newToken) {
      response = await doFetch(newToken)
    } else {
      clearStoredAuth()
    }
  }

  return response
}

export async function apiRequest<T>(path: string, init?: RequestInit, token?: string): Promise<T> {
  const response = await authFetch(
    path,
    {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers ?? {})
      }
    },
    token
  )

  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || `Request failed with status ${response.status}`)
  }

  const data = (await response.json()) as ApiResponse<T>
  return data.result
}
