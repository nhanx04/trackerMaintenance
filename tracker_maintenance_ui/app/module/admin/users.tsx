import { useEffect, useState } from 'react'

import { PageHeader } from '@/components/ui-custom/PageHeader'
import { createUser, getAuth, getUsers } from '@/lib/auth'
import { AppLayout } from '@/layouts/AppLayout'
import type { BackendRole, BackendUser } from '@/types/auth'

const availableRoles: BackendRole[] = ['ADMIN', 'MANAGER', 'TECHNICIAN', 'REPORTER']

const roleBadgeClass: Record<BackendRole, string> = {
  ADMIN: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-300',
  MANAGER: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/40 dark:bg-blue-500/10 dark:text-blue-300',
  TECHNICIAN:
    'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-300',
  REPORTER:
    'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-300'
}

export default function AdminUsersPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [roles, setRoles] = useState<BackendRole[]>(['REPORTER'])
  const [users, setUsers] = useState<BackendUser[]>([])
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetchingUsers, setFetchingUsers] = useState(false)

  const toggleRole = (role: BackendRole) => {
    setRoles((prev) => (prev.includes(role) ? prev.filter((item) => item !== role) : [...prev, role]))
  }

  const loadUsers = async () => {
    const auth = getAuth()
    if (!auth?.token) {
      setError('Please login as ADMIN to view users.')
      return
    }

    setFetchingUsers(true)
    try {
      const data = await getUsers(0, 50, auth.token)
      setUsers(data.content)
    } catch {
      setError('Cannot load users list. Please verify your token/permissions.')
    } finally {
      setFetchingUsers(false)
    }
  }

  useEffect(() => {
    void loadUsers()
  }, [])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setMessage('')

    const auth = getAuth()
    if (!auth?.token) {
      setError('Please login as ADMIN to create users.')
      return
    }

    if (!roles.length) {
      setError('Please select at least one role.')
      return
    }

    setLoading(true)
    try {
      await createUser({ username, password, firstName, lastName, roles }, auth.token)
      setMessage('User created successfully.')
      setUsername('')
      setPassword('')
      setFirstName('')
      setLastName('')
      setRoles(['REPORTER'])
      await loadUsers()
    } catch {
      setError('Create user failed. Please verify your admin token/permissions.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppLayout>
      <PageHeader
        title='User Management'
        subtitle='Create and view all platform users in one place.'
        breadcrumbs={[{ label: 'Admin' }, { label: 'Users' }]}
      />

      <div className='grid gap-5 lg:grid-cols-2'>
        <section className='rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900'>
          <h3 className='mb-4 text-base font-semibold'>Create User</h3>
          <form className='space-y-4' onSubmit={handleSubmit}>
            <div className='grid gap-4 sm:grid-cols-2'>
              <input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder='Username'
                className='rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800'
              />
              <input
                type='password'
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder='Password'
                className='rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800'
              />
              <input
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                placeholder='First name'
                className='rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800'
              />
              <input
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                placeholder='Last name'
                className='rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800'
              />
            </div>

            <div>
              <p className='mb-2 text-sm font-medium text-slate-700 dark:text-slate-300'>Roles</p>
              <div className='flex flex-wrap gap-2'>
                {availableRoles.map((role) => {
                  const active = roles.includes(role)
                  return (
                    <button
                      key={role}
                      type='button'
                      onClick={() => toggleRole(role)}
                      className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${active ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 text-slate-700 dark:border-slate-700 dark:text-slate-200'}`}
                    >
                      {role}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className='flex justify-end'>
              <button
                type='submit'
                disabled={loading}
                className='rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60'
              >
                {loading ? 'Creating...' : 'Create User'}
              </button>
            </div>
          </form>
        </section>

        <section className='rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900'>
          <div className='mb-4 flex items-center justify-between'>
            <h3 className='text-base font-semibold'>User List</h3>
            <button
              type='button'
              onClick={() => void loadUsers()}
              className='rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold dark:border-slate-700'
            >
              Refresh
            </button>
          </div>
          <div className='space-y-2'>
            {fetchingUsers ? (
              <p className='text-sm text-slate-500'>Loading users...</p>
            ) : users.length ? (
              users.map((user) => (
                <div key={user.id} className='rounded-lg border border-slate-200 p-3 text-sm dark:border-slate-800'>
                  <p className='font-semibold'>{user.username}</p>
                  <p className='text-slate-500'>
                    {[user.firstName, user.lastName].filter(Boolean).join(' ') || 'No full name'}
                  </p>
                  <div className='mt-2 flex flex-wrap items-center gap-1.5'>
                    {user.roles.map((role) => (
                      <span
                        key={`${user.id}-${role}`}
                        className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${roleBadgeClass[role]}`}
                      >
                        {role}
                      </span>
                    ))}
                    <span
                      className={`ml-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
                        user.active
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-300'
                          : 'border-slate-300 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {user.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className='text-sm text-slate-500'>No users found.</p>
            )}
          </div>
        </section>
      </div>

      {message && (
        <p className='mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300'>
          {message}
        </p>
      )}
      {error && (
        <p className='mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600 dark:bg-rose-500/10 dark:text-rose-300'>
          {error}
        </p>
      )}
    </AppLayout>
  )
}
