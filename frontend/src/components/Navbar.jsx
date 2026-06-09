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
    <nav style={{
      background: 'rgba(255,255,255,0.85)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid #e8e6e1',
      padding: '0 32px',
      height: '60px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 10,
      fontFamily: 'Inter, sans-serif'
    }}>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: '32px', height: '32px', background: '#0070f3',
          borderRadius: '8px', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontWeight: 700, fontSize: '11px',
          color: 'white', letterSpacing: '-0.5px'
        }}>
          AI
        </div>
        <span style={{ fontWeight: 600, fontSize: '14px', color: '#111' }}>
          Resume Matcher
        </span>
      </div>

      <div style={{ display: 'flex', gap: '2px' }}>
        {links.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            style={({ isActive }) => ({
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: isActive ? 500 : 400,
              color: isActive ? '#0070f3' : '#666',
              background: isActive ? '#eff6ff' : 'transparent',
              textDecoration: 'none',
              transition: 'all 0.15s'
            })}
          >
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}