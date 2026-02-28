import { apiRequest } from '@/lib/api'
import type { AuthUser, BackendUser, CreateUserPayload, LoginPayload, PageResult } from '@/types/auth'
import type { UserRole } from '@/types/ui'

const AUTH_STORAGE_KEY = 'tm_auth'

const isBrowser = typeof window !== 'undefined'

export async function login(payload: LoginPayload) {
  return apiRequest<AuthUser>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
}

export async function createUser(payload: CreateUserPayload, token: string) {
  return apiRequest(
    '/api/users',
    {
      method: 'POST',
      body: JSON.stringify(payload)
    },
    token
  )
}

export async function getUsers(page = 0, size = 10, token?: string) {
  return apiRequest<PageResult<BackendUser>>(`/api/users?page=${page}&size=${size}`, undefined, token)
}

export function saveAuth(user: AuthUser) {
  if (!isBrowser) return
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user))
}

export function getAuth(): AuthUser | null {
  if (!isBrowser) return null

  const raw = localStorage.getItem(AUTH_STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as AuthUser
  } catch {
    return null
  }
}

export function getPrimaryUiRole(auth: AuthUser | null): UserRole {
  if (!auth?.roles?.length) return 'Manager'

  if (auth.roles.includes('ADMIN')) return 'Admin'
  if (auth.roles.includes('MANAGER')) return 'Manager'
  if (auth.roles.includes('TECHNICIAN')) return 'Technician'
  return 'Reporter'
}

export function logout() {
  if (!isBrowser) return
  localStorage.removeItem(AUTH_STORAGE_KEY)
}
