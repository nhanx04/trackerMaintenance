import { Link } from 'react-router'

export default function WelcomePage() {
  return (
    <main className='flex min-h-screen items-center justify-center bg-slate-50 p-6 dark:bg-slate-950'>
      <div className='max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900'>
        <h1 className='text-3xl font-bold tracking-tight text-slate-900 dark:text-white'>Maintenance Tracker UI Foundation</h1>
        <p className='mt-3 text-slate-600 dark:text-slate-400'>Enterprise-ready design system with role-based navigation and reusable dashboard components.</p>
        <div className='mt-6 flex justify-center gap-3'>
          <Link to='/home' className='rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700'>
            Open Dashboard
          </Link>
          <Link
            to='/login'
            className='rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800'
          >
            Login UI
          </Link>
        </div>
      </div>
    </main>
  )
}

