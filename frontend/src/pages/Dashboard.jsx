import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getAllJobs, getHealth } from '../services/api'

const StatCard = ({ icon, value, label, trend, trendLabel, iconBg, iconColor, valueSize, cardClass, countId }) => (
  <div className={`stat-card ${cardClass}`}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
      <div className="stat-icon" style={{ width: '36px', height: '36px', borderRadius: '10px', background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <i className={`ti ${icon}`} style={{ color: iconColor, fontSize: '17px' }} aria-hidden="true" />
      </div>
      {trend && (
        <span style={{ fontSize: '11px', color: '#16a34a', background: '#f0fdf4', borderRadius: '100px', padding: '2px 7px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '3px' }}>
          <i className="ti ti-trending-up" style={{ fontSize: '11px' }} aria-hidden="true" />
          {trendLabel}
        </span>
      )}
      {!trend && trendLabel === 'Live' && (
        <span style={{ fontSize: '11px', color: '#16a34a', background: '#f0fdf4', borderRadius: '100px', padding: '2px 7px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span className="live-dot" />Live
        </span>
      )}
      {!trend && trendLabel && trendLabel !== 'Live' && (
        <span style={{ fontSize: '11px', color: iconColor, background: iconBg, borderRadius: '100px', padding: '2px 7px', fontWeight: 500 }}>
          {trendLabel}
        </span>
      )}
    </div>
    <div className="stat-value" id={countId} style={{ fontSize: valueSize || '24px', fontWeight: 700, color: '#111', marginBottom: '2px', transition: 'color 0.2s' }}>
      {value}
    </div>
    <div style={{ fontSize: '12px', color: '#94a3b8' }}>{label}</div>
  </div>
)

const getInitials = (name) => {
  if (!name) return 'JB'
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

const avatarColors = [
  { bg: '#eff6ff', color: '#2563eb' },
  { bg: '#f0fdf4', color: '#16a34a' },
  { bg: '#fdf4ff', color: '#9333ea' },
  { bg: '#fefce8', color: '#ca8a04' },
  { bg: '#fff1f2', color: '#e11d48' },
]

export default function Dashboard() {
  const [jobs, setJobs] = useState([])
  const [health, setHealth] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const load = async () => {
      try {
        const [jobData, healthData] = await Promise.all([
          getAllJobs(),
          getHealth()
        ])
        setJobs(jobData.jobs || [])
        setHealth(healthData)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  useEffect(() => {
    if (loading) return
    const countUp = (id, target, duration) => {
      const el = document.getElementById(id)
      if (!el || typeof target !== 'number') return
      let start = 0
      const step = target / (duration / 16)
      const timer = setInterval(() => {
        start += step
        if (start >= target) { el.textContent = target; clearInterval(timer); return }
        el.textContent = Math.floor(start)
      }, 16)
    }
    setTimeout(() => {
      countUp('jobs-count', jobs.length, 800)
      countUp('skills-count', totalSkills, 1000)
      countUp('hero-jobs', jobs.length, 900)
      countUp('hero-skills', totalSkills, 1100)
    }, 100)
  }, [loading])

  const totalSkills = jobs.reduce(
    (acc, j) => acc + j.requiredSkills.length + j.preferredSkills.length, 0
  )
  const isConnected = health?.mongodb === 'connected'

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f7f6f3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#94a3b8', fontSize: '14px' }}>Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f7f6f3', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ padding: '32px 48px' }}>

        {/* ── Hero ── */}
        <div style={{
          background: 'white', border: '1px solid #e8e6e1', borderRadius: '16px',
          padding: '32px 36px', marginBottom: '16px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '24px',
          position: 'relative', overflow: 'hidden'
        }}>
          {/* Decorative circle */}
          <div style={{
            position: 'absolute', right: '-60px', top: '-60px',
            width: '220px', height: '220px', borderRadius: '50%',
            background: '#eff6ff', opacity: 0.6, pointerEvents: 'none'
          }} />

          <div style={{ maxWidth: '460px', position: 'relative', zIndex: 1 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              background: '#eff6ff', border: '1px solid #bfdbfe',
              borderRadius: '100px', padding: '3px 10px',
              fontSize: '11px', color: '#2563eb', fontWeight: 500, marginBottom: '12px'
            }}>
              <div className="badge-dot" />
              AI-Powered · DSA Engine Active
            </div>

            <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#111', lineHeight: 1.3, marginBottom: '8px' }}>
              Match the{' '}
              <span style={{ color: '#0070f3' }}>Perfect Candidate</span>
              <br />to Every Role
            </h1>

            <p style={{ fontSize: '12px', color: '#666', lineHeight: 1.7, marginBottom: '18px' }}>
              Upload resumes, post job descriptions, and let the AI-powered
              DSA engine rank candidates by skill match — instantly.
            </p>

            <div style={{ display: 'flex', gap: '10px' }}>
              <Link to="/upload" className="hero-btn-blue">
                <i className="ti ti-upload" style={{ fontSize: '13px' }} aria-hidden="true" />
                Upload Resume
              </Link>
              <Link to="/jobs" className="hero-btn-outline">
                <i className="ti ti-briefcase" style={{ fontSize: '13px' }} aria-hidden="true" />
                Post a Job
              </Link>
            </div>
          </div>

          {/* Score box */}
          <div style={{
            background: '#f8faff', border: '1px solid #dbeafe', borderRadius: '14px',
            padding: '20px 28px', textAlign: 'center', flexShrink: 0,
            position: 'relative', zIndex: 1
          }}>
            <div id="hero-jobs" style={{ fontSize: '42px', fontWeight: 700, color: '#0070f3', lineHeight: 1 }}>
              {jobs.length}
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '3px' }}>jobs posted</div>
            <div style={{ width: '40px', height: '1px', background: '#dbeafe', margin: '10px auto' }} />
            <div id="hero-skills" style={{ fontSize: '20px', fontWeight: 700, color: '#2563eb' }}>
              {totalSkills}
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>skills indexed</div>
          </div>
        </div>

        {/* ── Stats Grid ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '16px' }}>
          <StatCard icon="ti-briefcase" value={jobs.length} label="Jobs Posted"
            trend trendLabel={`+${jobs.length}`} countId="jobs-count"
            iconBg="#eff6ff" iconColor="#2563eb" cardClass="card-blue" />
          <StatCard icon="ti-file-text" value={totalSkills} label="Skills Indexed"
            trend trendLabel={`${totalSkills}`} countId="skills-count"
            iconBg="#f0fdf4" iconColor="#16a34a" cardClass="card-green" />
          <StatCard icon="ti-database"
            value={isConnected ? 'Connected' : 'Offline'} label="MongoDB Atlas"
            trendLabel="Live"
            iconBg="#fefce8" iconColor="#ca8a04"
            cardClass="card-yellow" valueSize="16px" />
          <StatCard icon="ti-cpu" value="Gemini 2.0" label="AI Engine"
            trendLabel="Ready"
            iconBg="#fdf4ff" iconColor="#9333ea"
            cardClass="card-purple" valueSize="16px" />
        </div>

        {/* ── Bottom Grid ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '16px' }}>

          {/* Recent Jobs */}
          <div style={{ background: 'white', border: '1px solid #e8e6e1', borderRadius: '16px', padding: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#111' }}>Recent Jobs</span>
              <Link to="/jobs" style={{ fontSize: '11px', color: '#0070f3', textDecoration: 'none' }}>
                + Post new job
              </Link>
            </div>

            {jobs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '28px 0' }}>
                <div style={{ width: '44px', height: '44px', background: '#f1f5f9', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                  <i className="ti ti-briefcase" style={{ color: '#94a3b8', fontSize: '20px' }} aria-hidden="true" />
                </div>
                <p style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '10px' }}>No jobs posted yet</p>
                <Link to="/jobs" style={{ fontSize: '12px', color: '#0070f3', textDecoration: 'none', fontWeight: 500 }}>
                  Post your first job →
                </Link>
              </div>
            ) : (
              jobs.slice(0, 4).map((job, index) => {
                const av = avatarColors[index % avatarColors.length]
                return (
                  <div key={job._id} className="job-row">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '32px', height: '32px', borderRadius: '8px',
                        background: av.bg, color: av.color,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '10px', fontWeight: 700, flexShrink: 0
                      }}>
                        {getInitials(job.company)}
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: '#111', marginBottom: '1px' }}>
                          {job.title}
                        </div>
                        <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '4px' }}>
                          {job.company} · {job.experienceLevel}
                        </div>
                        <div>
                          {job.requiredSkills.slice(0, 3).map((s, i) => (
                            <span key={i} style={{
                              display: 'inline-block', padding: '1px 7px',
                              background: '#eff6ff', border: '1px solid #bfdbfe',
                              borderRadius: '100px', fontSize: '9px', color: '#2563eb',
                              marginRight: '3px'
                            }}>{s}</span>
                          ))}
                          {job.requiredSkills.length > 3 && (
                            <span style={{ fontSize: '9px', color: '#94a3b8' }}>
                              +{job.requiredSkills.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate('/match')}
                      style={{
                        padding: '4px 10px', background: '#eff6ff',
                        border: '1px solid #bfdbfe', borderRadius: '7px',
                        fontSize: '10px', color: '#2563eb', cursor: 'pointer',
                        fontWeight: 500, whiteSpace: 'nowrap', marginLeft: '10px'
                      }}>
                      Match →
                    </button>
                  </div>
                )
              })
            )}
          </div>

          {/* How it works */}
          <div style={{ background: 'white', border: '1px solid #e8e6e1', borderRadius: '16px', padding: '22px' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#111', marginBottom: '16px' }}>
              How it works
            </div>

            {[
              { num: '01', title: 'Upload Resume',     desc: 'PDF parsed via pdf-parse, text extracted',   bg: '#eff6ff', color: '#2563eb' },
              { num: '02', title: 'AI Extracts Skills', desc: 'Gemini 2.0 identifies all technical skills', bg: '#fdf4ff', color: '#9333ea' },
              { num: '03', title: 'Post a Job',         desc: 'AI analyzes required vs preferred skills',   bg: '#fefce8', color: '#ca8a04' },
              { num: '04', title: 'DSA Ranking',        desc: 'HashMap + HashSet engine ranks candidates',  bg: '#f0fdf4', color: '#16a34a' },
            ].map(({ num, title, desc, bg, color }, i, arr) => (
              <div key={num}>
                <div className="step-row">
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '8px',
                    background: bg, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: '10px', fontWeight: 700,
                    color, flexShrink: 0
                  }}>
                    {num}
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#111', marginBottom: '1px' }}>
                      {title}
                    </div>
                    <div style={{ fontSize: '10px', color: '#94a3b8', lineHeight: 1.5 }}>
                      {desc}
                    </div>
                  </div>
                </div>
                {i < arr.length - 1 && (
                  <div style={{ width: '1px', background: '#e8e6e1', height: '10px', margin: '0 0 0 23px' }} />
                )}
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  )
}