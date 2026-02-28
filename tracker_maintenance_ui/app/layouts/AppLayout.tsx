import { useEffect, useMemo, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router'
import { FiBell, FiChevronDown, FiLogOut, FiMenu, FiMoon, FiSearch, FiSun, FiUser, FiX } from 'react-icons/fi'

import { roleMenu } from '@/lib/navigation'
import { cn } from '@/lib/cn'
import type { UserRole } from '@/types/ui'
import { RoleBadge } from '@/components/ui-custom/RoleBadge'

type AppLayoutProps = {
  children: React.ReactNode
}

const roleFromPath = (pathname: string): UserRole => {
  if (pathname.startsWith('/technician')) return 'Technician'
  if (pathname.startsWith('/reporter')) return 'Reporter'
  return 'Manager'
}

export function AppLayout({ children }: AppLayoutProps) {
  const { pathname } = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [dark, setDark] = useState(false)

  const role = useMemo(() => roleFromPath(pathname), [pathname])
  const items = roleMenu[role]

  useEffect(() => {
    const saved = localStorage.getItem('theme')
    const isDark = saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches
    setDark(isDark)
    document.documentElement.classList.toggle('dark', isDark)
  }, [])

  const toggleTheme = () => {
    const next = !dark
    setDark(next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
    document.documentElement.classList.toggle('dark', next)
  }

  return (
    <div className='h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white'>
      <div className='flex h-full'>
        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-40 w-72 border-r border-slate-200 bg-white p-4 transition-transform dark:border-slate-800 dark:bg-slate-900 lg:static lg:translate-x-0',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <div className='mb-6 flex items-center justify-between'>
            <Link to='/' className='text-lg font-bold tracking-tight text-blue-700 dark:text-blue-400'>
              Maintenance Tracker
            </Link>
            <button onClick={() => setSidebarOpen(false)} className='rounded-md p-2 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden'>
              <FiX className='h-5 w-5' />
            </button>
          </div>

          <div className='mb-4'>
            <RoleBadge role={role} />
          </div>

          <nav className='space-y-1'>
            {items.map(({ icon: Icon, label, path }) => (
              <NavLink
                key={path}
                to={path}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300'
                      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                  )
                }
              >
                <Icon className='h-4 w-4' />
                {label}
              </NavLink>
            ))}
          </nav>
        </aside>

        {sidebarOpen && <button className='fixed inset-0 z-30 bg-slate-950/40 lg:hidden' onClick={() => setSidebarOpen(false)} />}

        <div className='flex min-w-0 flex-1 flex-col'>
          <header className='sticky top-0 z-20 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90 lg:px-6'>
            <div className='flex items-center justify-between gap-3'>
              <div className='flex items-center gap-2'>
                <button onClick={() => setSidebarOpen(true)} className='rounded-md p-2 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden'>
                  <FiMenu className='h-5 w-5' />
                </button>
                <div className='hidden items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800 sm:flex'>
                  <FiSearch className='h-4 w-4 text-slate-400' />
                  <input
                    type='text'
                    placeholder='Search...'
                    className='w-52 bg-transparent text-sm outline-none placeholder:text-slate-400'
                  />
                </div>
              </div>

              <div className='flex items-center gap-2'>
                <button onClick={toggleTheme} className='rounded-md p-2 hover:bg-slate-100 dark:hover:bg-slate-800'>
                  {dark ? <FiSun className='h-5 w-5' /> : <FiMoon className='h-5 w-5' />}
                </button>
                <button className='rounded-md p-2 hover:bg-slate-100 dark:hover:bg-slate-800'>
                  <FiBell className='h-5 w-5' />
                </button>

                <div className='relative'>
                  <button
                    onClick={() => setMenuOpen((v) => !v)}
                    className='flex items-center gap-2 rounded-lg border border-slate-200 px-2 py-1.5 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800'
                  >
                    <div className='flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300'>
                      <FiUser className='h-4 w-4' />
                    </div>
                    <div className='hidden text-left sm:block'>
                      <p className='text-xs font-semibold'>John Doe</p>
                      <RoleBadge role={role} className='mt-0.5' />
                    </div>
                    <FiChevronDown className='h-4 w-4 text-slate-500' />
                  </button>

                  {menuOpen && (
                    <div className='absolute right-0 mt-2 w-44 rounded-lg border border-slate-200 bg-white p-1 shadow-lg dark:border-slate-700 dark:bg-slate-800'>
                      <button className='flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700'>
                        <FiUser className='h-4 w-4' /> Profile
                      </button>
                      <button className='flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10'>
                        <FiLogOut className='h-4 w-4' /> Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </header>

          <main className='min-h-0 flex-1 overflow-y-auto p-4 lg:p-6'>{children}</main>
        </div>
      </div>
    </div>
  )
}

