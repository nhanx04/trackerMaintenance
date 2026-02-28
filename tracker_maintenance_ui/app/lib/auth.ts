import { apiRequest } from '@/lib/api'
import type { AuthUser, CreateUserPayload, LoginPayload } from '@/types/auth'
import type { UserRole } from '@/types/ui'

const AUTH_STORAGE_KEY = 'tm_auth'

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

export function saveAuth(user: AuthUser) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user))
}

export function getAuth(): AuthUser | null {
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
  localStorage.removeItem(AUTH_STORAGE_KEY)
}
