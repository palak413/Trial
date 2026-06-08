import { NavLink } from 'react-router-dom'

const links = [
  { to: '/',            label: 'Dashboard' },
  { to: '/upload',      label: 'Upload Resume' },
  { to: '/jobs',        label: 'Post Job' },
  { to: '/match',       label: 'Match & Rank' },
  { to: '/leaderboard', label: 'Leaderboard' },   
]

export default function Navbar() {
  return (
    <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4">
      <div className="max-w-5xl mx-auto flex items-center justify-between">

        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
            AI
          </div>
          <span className="font-bold text-white">Resume Matcher</span>
        </div>

        {/* Nav Links */}
        <div className="flex items-center gap-1">
          {links.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${isActive
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  )
}