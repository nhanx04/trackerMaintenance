import { Link } from 'react-router'

import { AuthLayout } from '@/layouts/AuthLayout'

export default function LoginPage() {
  return (
    <AuthLayout>
      <form className='space-y-4'>
        <div>
          <label className='mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300'>Email</label>
          <input
            type='email'
            placeholder='name@company.com'
            className='w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none ring-blue-500/20 focus:ring-4 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100'
          />
        </div>
        <div>
          <label className='mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300'>Password</label>
          <input
            type='password'
            placeholder='••••••••'
            className='w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none ring-blue-500/20 focus:ring-4 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100'
          />
        </div>

        <button type='submit' className='w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700'>
          Sign in
        </button>

        <p className='text-center text-sm text-slate-500 dark:text-slate-400'>
          Return to{' '}
          <Link to='/home' className='font-medium text-blue-600 hover:underline dark:text-blue-400'>
            Dashboard
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}

