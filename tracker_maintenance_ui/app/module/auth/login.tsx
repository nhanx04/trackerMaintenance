import { useState } from 'react'
import { Link, useNavigate } from 'react-router'

import { AuthLayout } from '@/layouts/AuthLayout'
import { getPrimaryUiRole, login, saveAuth } from '@/lib/auth'

export default function LoginPage() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const auth = await login({ username, password })
      saveAuth(auth)

      const role = getPrimaryUiRole(auth)
      const rolePath: Record<typeof role, string> = {
        Admin: '/admin/dashboard',
        Manager: '/manager/dashboard',
        Technician: '/technician/my-tickets',
        Reporter: '/reporter/my-tickets'
      }

      navigate(rolePath[role])
    } catch {
      setError('Login failed. Please check username/password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <form className='space-y-4' onSubmit={handleSubmit}>
        <div>
          <label className='mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300'>Username</label>
          <input
            type='text'
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder='admin'
            className='w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none ring-blue-500/20 focus:ring-4 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100'
          />
        </div>
        <div>
          <label className='mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300'>Password</label>
          <input
            type='password'
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder='••••••••'
            className='w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none ring-blue-500/20 focus:ring-4 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100'
          />
        </div>

        {error && (
          <p className='rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600 dark:bg-rose-500/10 dark:text-rose-300'>
            {error}
          </p>
        )}

        <button
          type='submit'
          disabled={loading}
          className='w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60'
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>

        <p className='text-center text-sm text-slate-500 dark:text-slate-400'>
          Return to{' '}
          <Link to='/' className='font-medium text-blue-600 hover:underline dark:text-blue-400'>
            Welcome
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}
