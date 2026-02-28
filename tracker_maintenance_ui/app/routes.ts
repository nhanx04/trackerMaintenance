import { type RouteConfig, index, route } from '@react-router/dev/routes'

export default [index('welcome/welcome.tsx'), route('home', 'module/home/index.tsx')] satisfies RouteConfig
