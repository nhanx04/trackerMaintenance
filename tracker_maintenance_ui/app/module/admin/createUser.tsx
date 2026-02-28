import { useState } from 'react'

import { AppLayout } from '@/layouts/AppLayout'
import { PageHeader } from '@/components/ui-custom/PageHeader'
import { createUser, getAuth } from '@/lib/auth'
import type { BackendRole } from '@/types/auth'

const availableRoles: BackendRole[] = ['ADMIN', 'MANAGER', 'TECHNICIAN', 'REPORTER']

export default function AdminCreateUserPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [roles, setRoles] = useState<BackendRole[]>(['REPORTER'])
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const toggleRole = (role: BackendRole) => {
    setRoles((prev) => (prev.includes(role) ? prev.filter((item) => item !== role) : [...prev, role]))
  }

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
    } catch {
      setError('Create user failed. Please verify your admin token/permissions.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppLayout>
      <PageHeader
        title='Create User'
        subtitle='Provision new user accounts based on backend User entity.'
        breadcrumbs={[{ label: 'Admin' }, { label: 'Create User' }]}
      />

      <section className='max-w-3xl rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900'>
        <form className='space-y-4' onSubmit={handleSubmit}>
          <div className='grid gap-4 sm:grid-cols-2'>
            <input value={username} onChange={(event) => setUsername(event.target.value)} placeholder='Username' className='rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800' />
            <input type='password' value={password} onChange={(event) => setPassword(event.target.value)} placeholder='Password' className='rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800' />
            <input value={firstName} onChange={(event) => setFirstName(event.target.value)} placeholder='First name' className='rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800' />
            <input value={lastName} onChange={(event) => setLastName(event.target.value)} placeholder='Last name' className='rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800' />
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

          {message && <p className='rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300'>{message}</p>}
          {error && <p className='rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600 dark:bg-rose-500/10 dark:text-rose-300'>{error}</p>}

          <div className='flex justify-end'>
            <button type='submit' disabled={loading} className='rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60'>
              {loading ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </section>
    </AppLayout>
  )
}

