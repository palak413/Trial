import { useState, useEffect } from 'react'
import { getLeaderboard } from '../services/api'

const scoreColor = (s) => s >= 70 ? '#16a34a' : s >= 40 ? '#0070f3' : '#f97316'
const barGradient = (s) => s >= 70
  ? 'linear-gradient(90deg,#4ade80,#16a34a)'
  : s >= 40
  ? 'linear-gradient(90deg,#60a5fa,#0070f3)'
  : 'linear-gradient(90deg,#fdba74,#f97316)'

const medals = ['🥇', '🥈', '🥉']
const borderColors = ['#f59e0b', '#94a3b8', '#f97316']

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    getLeaderboard()
      .then(data => {
        setLeaderboard(data.leaderboard || [])
        setLoading(false)
        setTimeout(() => setAnimated(true), 100)
      })
      .catch(err => { setError(err.message); setLoading(false) })
  }, [])

  const top3 = leaderboard.slice(0, 3)
  const rest = leaderboard.slice(3)

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f7f6f3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#94a3b8', fontSize: '14px' }}>Calculating rankings...</div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f7f6f3', fontFamily: 'Inter, sans-serif', padding: '28px 48px' }}>

      {/* Animated bar keyframes */}
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fillBar {
          from { width: 0%; }
          to   { width: var(--target-width); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .animated-bar {
          height: 100%;
          border-radius: 100px;
          background-size: 200% auto;
          animation: fillBar 1.2s ease forwards, shimmer 2s linear infinite;
        }
        .podium-card { animation: fadeUp 0.4s ease both; }
        .lb-row { animation: fadeUp 0.4s ease both; }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '20px', fontWeight: 700, color: '#111', marginBottom: '3px' }}>Leaderboard</div>
        <div style={{ fontSize: '13px', color: '#94a3b8' }}>
          Candidates ranked by average match score across all jobs
        </div>
      </div>

      {error && (
        <div style={{ padding: '10px 14px', background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '10px', marginBottom: '16px' }}>
          <p style={{ fontSize: '12px', color: '#e11d48' }}>{error}</p>
        </div>
      )}

      {leaderboard.length === 0 && !loading && (
        <div style={{ background: 'white', border: '1px solid #ebe9e4', borderRadius: '16px', padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>🏆</div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>No data yet</div>
          <div style={{ fontSize: '12px', color: '#cbd5e1' }}>Upload resumes and post jobs to see the leaderboard</div>
        </div>
      )}

      {/* Top 3 podium */}
      {top3.length > 0 && (
        <>
          <div style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '10px' }}>
            🏆 Top Performers
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
            {top3.map((c, i) => (
              <div
                key={c.candidateId}
                className="podium-card"
                style={{
                  background: 'white',
                  border: '1px solid #ebe9e4',
                  borderTop: `3px solid ${borderColors[i]}`,
                  borderRadius: '14px',
                  padding: '18px 16px',
                  textAlign: 'center',
                  cursor: 'default',
                  animationDelay: `${i * 0.05 + 0.05}s`,
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.07)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
              >
                <div style={{ fontSize: '22px', marginBottom: '8px' }}>{medals[i]}</div>
                <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 500, marginBottom: '4px' }}>Rank #{c.rank}</div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#111', marginBottom: '1px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {c.name}
                </div>
                <div style={{ fontSize: '10px', color: '#b0b8c4', marginBottom: '12px', textTransform: 'capitalize' }}>
                  {c.experienceLevel} · {c.totalExperienceYears} yr{c.totalExperienceYears !== 1 ? 's' : ''}
                </div>

                <div style={{ fontSize: '28px', fontWeight: 700, lineHeight: 1, color: scoreColor(c.averageScore), marginBottom: '2px' }}>
                  {c.averageScore}%
                </div>
                <div style={{ fontSize: '9px', color: '#b0b8c4', marginBottom: '10px' }}>avg match score</div>

                {/* Animated progress bar */}
                <div style={{ width: '100%', background: '#f1f5f9', borderRadius: '100px', height: '4px', overflow: 'hidden', marginBottom: '8px' }}>
                  <div
                    className="animated-bar"
                    style={{
                      '--target-width': `${c.averageScore}%`,
                      background: `${barGradient(c.averageScore)}, linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)`,
                      backgroundSize: '200% auto',
                      width: animated ? `${c.averageScore}%` : '0%',
                      transition: 'width 1.2s ease',
                    }}
                  />
                </div>

                <div style={{ fontSize: '10px', color: '#b0b8c4' }}>
                  {c.jobCount} job{c.jobCount !== 1 ? 's' : ''} · best {c.bestScore}%
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Rest of leaderboard */}
      {rest.length > 0 && (
        <>
          <div style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '10px' }}>
            All Candidates
          </div>

          {rest.map((c, i) => (
            <div
              key={c.candidateId}
              className="lb-row"
              style={{
                background: 'white', border: '1px solid #ebe9e4',
                borderRadius: '12px', padding: '14px 18px',
                marginBottom: '8px',
                display: 'flex', alignItems: 'center', gap: '14px',
                animationDelay: `${i * 0.05 + 0.22}s`,
                transition: 'transform 0.18s, box-shadow 0.18s'
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateX(3px)'; e.currentTarget.style.boxShadow = '0 3px 12px rgba(0,0,0,0.05)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateX(0)'; e.currentTarget.style.boxShadow = 'none' }}
            >
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#c8cfd8', width: '24px', flexShrink: 0 }}>
                #{c.rank}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#111', marginBottom: '1px' }}>{c.name}</div>
                <div style={{ fontSize: '10px', color: '#b0b8c4', textTransform: 'capitalize' }}>
                  {c.experienceLevel} · {c.totalExperienceYears} yr{c.totalExperienceYears !== 1 ? 's' : ''} exp
                </div>
                <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '220px' }}>
                  Best: {c.bestJob}
                </div>
              </div>

              {/* Animated bar */}
              <div style={{ width: '120px', flexShrink: 0 }}>
                <div style={{ width: '100%', background: '#f1f5f9', borderRadius: '100px', height: '4px', overflow: 'hidden', marginBottom: '4px' }}>
                  <div
                    style={{
                      height: '100%',
                      borderRadius: '100px',
                      background: barGradient(c.averageScore),
                      backgroundSize: '200% auto',
                      width: animated ? `${c.averageScore}%` : '0%',
                      transition: `width 1.2s ease ${i * 0.1 + 0.3}s`,
                      animation: animated ? `shimmer 2s linear ${i * 0.1 + 1.5}s infinite` : 'none'
                    }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#b0b8c4' }}>
                  <span>{c.jobCount} job{c.jobCount !== 1 ? 's' : ''}</span>
                  <span>avg</span>
                </div>
              </div>

              <div style={{ textAlign: 'right', flexShrink: 0, minWidth: '52px' }}>
                <div style={{ fontSize: '18px', fontWeight: 700, color: scoreColor(c.averageScore) }}>
                  {c.averageScore}%
                </div>
                <div style={{ fontSize: '9px', color: '#b0b8c4' }}>avg score</div>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  )
}