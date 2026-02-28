export type BackendRole = 'ADMIN' | 'MANAGER' | 'TECHNICIAN' | 'REPORTER'

export type AuthUser = {
  id: string
  username: string
  firstName?: string
  lastName?: string
  roles: BackendRole[]
  token: string
  authenticated: boolean
}

export type LoginPayload = {
  username: string
  password: string
}

export type CreateUserPayload = {
  username: string
  password: string
  firstName?: string
  lastName?: string
  roles: BackendRole[]
}

