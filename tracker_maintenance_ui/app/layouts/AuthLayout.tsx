import { Link } from 'react-router'

type AuthLayoutProps = {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className='relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-100 via-blue-50 to-slate-100 px-4 dark:from-slate-950 dark:via-blue-950/30 dark:to-slate-900'>
      <div className='absolute -left-20 -top-20 h-56 w-56 rounded-full bg-blue-200/40 blur-3xl dark:bg-blue-700/30' />
      <div className='absolute -bottom-24 -right-16 h-56 w-56 rounded-full bg-violet-200/40 blur-3xl dark:bg-violet-700/30' />

      <div className='relative z-10 w-full max-w-md rounded-2xl border border-slate-200 bg-white/95 p-8 shadow-xl backdrop-blur dark:border-slate-800 dark:bg-slate-900/90'>
        <div className='mb-6 text-center'>
          <Link to='/' className='text-xl font-bold tracking-tight text-blue-700 dark:text-blue-400'>
            Maintenance Tracker
          </Link>
          <p className='mt-1 text-sm text-slate-600 dark:text-slate-400'>Equipment Maintenance & Repair Management</p>
        </div>
        {children}
      </div>
    </div>
  )
}

