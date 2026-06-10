import { useState, useEffect } from 'react'
import { matchCandidates, getAllJobs, getGapAndRoadmap } from '../services/api'

const scoreColor = s => s >= 70 ? '#16a34a' : s >= 40 ? '#ca8a04' : '#e11d48'
const barGradient = s => s >= 70
  ? 'linear-gradient(90deg,#22c55e,#16a34a)'
  : s >= 40
  ? 'linear-gradient(90deg,#fbbf24,#ca8a04)'
  : 'linear-gradient(90deg,#f87171,#e11d48)'
const borderColor = (rank) => {
  if (rank === 1) return '#f59e0b'
  if (rank === 2) return '#94a3b8'
  if (rank === 3) return '#b45309'
  return '#e2e8f0'
}
const badgeStyle = (rank) => {
  if (rank === 1) return { background: '#fef3c7', color: '#92400e' }
  if (rank === 2) return { background: '#f1f5f9', color: '#64748b' }
  if (rank === 3) return { background: '#fdf4e7', color: '#b45309' }
  return { background: '#f1f5f9', color: '#94a3b8' }
}

const priorityColor = (p) => {
  if (p === 'high') return { bg: '#fff1f2', border: '#fecdd3', color: '#e11d48' }
  if (p === 'medium') return { bg: '#fefce8', border: '#fde68a', color: '#ca8a04' }
  return { bg: '#f8fafc', border: '#e2e8f0', color: '#64748b' }
}

export default function MatchPage() {
  const [jobs, setJobs] = useState([])
  const [selectedJobId, setSelectedJobId] = useState('')
  const [status, setStatus] = useState('idle')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [roadmapData, setRoadmapData] = useState({})
  const [loadingRoadmap, setLoadingRoadmap] = useState({})
  const [openRoadmap, setOpenRoadmap] = useState({})

  useEffect(() => {
    getAllJobs()
      .then(data => setJobs(data.jobs || []))
      .catch(console.error)
  }, [])

  const handleMatch = async () => {
    if (!selectedJobId) { setError('Please select a job'); return }
    setStatus('loading'); setError(''); setResult(null); setRoadmapData({}); setOpenRoadmap({})
    try {
      const data = await matchCandidates(selectedJobId)
      setResult(data); setStatus('success')
    } catch (err) {
      setError(err.message); setStatus('error')
    }
  }

  const handleGetRoadmap = async (candidateId) => {
    if (openRoadmap[candidateId]) {
      setOpenRoadmap(prev => ({ ...prev, [candidateId]: false }))
      return
    }
    if (roadmapData[candidateId]) {
      setOpenRoadmap(prev => ({ ...prev, [candidateId]: true }))
      return
    }
    setLoadingRoadmap(prev => ({ ...prev, [candidateId]: true }))
    try {
      const data = await getGapAndRoadmap(selectedJobId, candidateId)
      setRoadmapData(prev => ({ ...prev, [candidateId]: data }))
      setOpenRoadmap(prev => ({ ...prev, [candidateId]: true }))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoadingRoadmap(prev => ({ ...prev, [candidateId]: false }))
    }
  }

  const selectedJob = jobs.find(j => j._id === selectedJobId)

  return (
    <div style={{ minHeight: '100vh', background: '#f7f6f3', fontFamily: 'Inter, sans-serif', padding: '32px 48px' }}>

      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '20px', fontWeight: 700, color: '#111', marginBottom: '4px' }}>Match & Rank</div>
        <div style={{ fontSize: '13px', color: '#94a3b8' }}>
          Select a job — the DSA engine ranks all candidates by skill match instantly
        </div>
      </div>

      {/* Selector Card */}
      <div style={{ background: 'white', border: '1px solid #e8e6e1', borderRadius: '16px', padding: '22px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <div style={{ width: '28px', height: '28px', background: '#eff6ff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="ti ti-filter" style={{ color: '#0070f3', fontSize: '14px' }} aria-hidden="true" />
          </div>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#111' }}>Select Job</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '12px', alignItems: 'end' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151', display: 'block', marginBottom: '6px' }}>
              Choose a job to match against
            </label>
            <select
              value={selectedJobId}
              onChange={e => { setSelectedJobId(e.target.value); setResult(null); setRoadmapData({}); setOpenRoadmap({}) }}
              style={{
                width: '100%', padding: '10px 36px 10px 14px',
                background: '#fafafa', border: '1px solid #e2e8f0',
                borderRadius: '10px', fontSize: '13px', color: '#111',
                fontFamily: 'Inter, sans-serif', outline: 'none',
                appearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center'
              }}
            >
              <option value="">-- Select a job --</option>
              {jobs.map(job => (
                <option key={job._id} value={job._id}>
                  {job.title} @ {job.company}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleMatch}
            disabled={!selectedJobId || status === 'loading'}
            style={{
              padding: '10px 20px',
              background: !selectedJobId || status === 'loading' ? '#e2e8f0' : '#0070f3',
              color: !selectedJobId || status === 'loading' ? '#94a3b8' : 'white',
              border: 'none', borderRadius: '11px', fontSize: '13px', fontWeight: 600,
              cursor: !selectedJobId || status === 'loading' ? 'not-allowed' : 'pointer',
              whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '8px',
              transition: 'background 0.15s, transform 0.15s, box-shadow 0.15s'
            }}
            onMouseEnter={e => { if (selectedJobId && status !== 'loading') { e.currentTarget.style.background = '#0060d9'; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,112,243,0.25)' } }}
            onMouseLeave={e => { e.currentTarget.style.background = !selectedJobId || status === 'loading' ? '#e2e8f0' : '#0070f3'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
          >
            <i className="ti ti-trophy" style={{ fontSize: '14px' }} aria-hidden="true" />
            {status === 'loading' ? '⚙️ Ranking...' : 'Rank All Candidates'}
          </button>
        </div>

        {error && (
          <div style={{ marginTop: '12px', padding: '10px 14px', background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '10px' }}>
            <p style={{ fontSize: '12px', color: '#e11d48' }}>{error}</p>
          </div>
        )}
      </div>

      {/* Job Summary Strip */}
      {status === 'success' && result && (
        <div style={{
          background: '#f8faff', border: '1px solid #dbeafe', borderRadius: '12px',
          padding: '14px 18px', marginBottom: '20px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          animation: 'fadeUp 0.3s ease both', flexWrap: 'wrap', gap: '12px'
        }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#111', marginBottom: '2px' }}>
              {result.job.title} @ {result.job.company}
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>
              {result.totalCandidates} candidate{result.totalCandidates !== 1 ? 's' : ''} ranked
            </div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {result.job.requiredSkills.map((s, i) => (
              <span key={i} style={{
                padding: '2px 8px', background: '#eff6ff', border: '1px solid #bfdbfe',
                borderRadius: '100px', fontSize: '10px', color: '#2563eb'
              }}>{s}</span>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {status === 'idle' && (
        <div style={{
          background: 'white', border: '1px solid #e8e6e1', borderRadius: '16px',
          padding: '80px 20px', textAlign: 'center'
        }}>
          <div style={{ width: '52px', height: '52px', background: '#f1f5f9', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
            <i className="ti ti-trophy" style={{ color: '#94a3b8', fontSize: '24px' }} aria-hidden="true" />
          </div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>
            Rankings will appear here
          </div>
          <div style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: 1.6 }}>
            Select a job above and click Rank All Candidates
          </div>
        </div>
      )}

      {/* No candidates */}
      {status === 'success' && result?.rankedCandidates?.length === 0 && (
        <div style={{ background: 'white', border: '1px solid #e8e6e1', borderRadius: '16px', padding: '60px 20px', textAlign: 'center' }}>
          <p style={{ color: '#94a3b8', fontSize: '13px' }}>No candidates found. Upload some resumes first.</p>
        </div>
      )}

      {/* Ranked Candidates */}
      {status === 'success' && result?.rankedCandidates?.map((c, idx) => (
        <div key={c.candidateId} style={{
          background: 'white',
          borderLeft: `3px solid ${borderColor(c.rank)}`,
          border: `1px solid #e8e6e1`,
          borderLeft: `3px solid ${borderColor(c.rank)}`,
          borderRadius: '14px', padding: '20px 22px',
          marginBottom: '12px',
          animation: `fadeUp 0.4s ease ${idx * 0.05 + 0.05}s both`,
          transition: 'transform 0.2s, box-shadow 0.2s'
        }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.07)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
        >
          {/* Top row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: '14px', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, ...badgeStyle(c.rank) }}>
              #{c.rank}
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#111', marginBottom: '2px' }}>{c.name}</div>
              <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'capitalize' }}>
                {c.experienceLevel} · {c.totalExperienceYears} yr{c.totalExperienceYears !== 1 ? 's' : ''} experience
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '30px', fontWeight: 700, lineHeight: 1, color: scoreColor(c.score) }}>{c.score}%</div>
              <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>match score</div>
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ width: '100%', background: '#f1f5f9', borderRadius: '100px', height: '6px', marginBottom: '14px', overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: '100px', width: `${c.score}%`, background: barGradient(c.score), transition: 'width 1s ease' }} />
          </div>

          {/* Skills row */}
          <div style={{ display: 'flex', gap: '24px', marginBottom: '14px', flexWrap: 'wrap' }}>
            {c.matchedSkills.length > 0 && (
              <div style={{ flex: 1, minWidth: '200px' }}>
                <div style={{ fontSize: '10px', fontWeight: 600, color: '#16a34a', marginBottom: '6px' }}>
                  ✓ Matched ({c.matchedSkills.length})
                </div>
                <div>
                  {c.matchedSkills.map((s, i) => (
                    <span key={i} style={{ display: 'inline-block', padding: '2px 8px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '100px', fontSize: '10px', color: '#16a34a', marginRight: '4px', marginBottom: '4px' }}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {c.missingSkills.length > 0 && (
              <div style={{ flex: 1, minWidth: '200px' }}>
                <div style={{ fontSize: '10px', fontWeight: 600, color: '#e11d48', marginBottom: '6px' }}>
                  ✗ Missing ({c.missingSkills.length})
                </div>
                <div>
                  {c.missingSkills.map((s, i) => (
                    <span key={i} style={{ display: 'inline-block', padding: '2px 8px', background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '100px', fontSize: '10px', color: '#e11d48', marginRight: '4px', marginBottom: '4px' }}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Roadmap button */}
          {c.missingSkills.length > 0 && (
            <div>
              <button
                onClick={() => handleGetRoadmap(c.candidateId)}
                style={{
                  padding: '7px 14px', background: openRoadmap[c.candidateId] ? '#eff6ff' : '#f8faff',
                  border: `1px solid ${openRoadmap[c.candidateId] ? '#bfdbfe' : '#dbeafe'}`,
                  borderRadius: '9px', fontSize: '11px', color: '#2563eb',
                  cursor: 'pointer', fontWeight: 500,
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  transition: 'background 0.15s, border-color 0.15s'
                }}
              >
                <i className="ti ti-map" style={{ fontSize: '12px' }} aria-hidden="true" />
                {loadingRoadmap[c.candidateId]
                  ? '🤖 Generating roadmap...'
                  : openRoadmap[c.candidateId]
                  ? 'Hide Roadmap'
                  : 'Generate AI Learning Roadmap'}
              </button>

              {/* Roadmap content */}
              {openRoadmap[c.candidateId] && roadmapData[c.candidateId] && (
                <div style={{ marginTop: '14px', padding: '16px', background: '#f8faff', border: '1px solid #dbeafe', borderRadius: '12px', animation: 'fadeUp 0.3s ease both' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#111' }}>Learning Roadmap</div>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                      ~{roadmapData[c.candidateId]?.roadmap?.totalWeeks || roadmapData[c.candidateId]?.totalWeeks || '?'} weeks total
                    </span>
                  </div>

                  {(roadmapData[c.candidateId]?.roadmap?.summary || roadmapData[c.candidateId]?.summary) && (
                    <div style={{ padding: '10px 12px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '10px', marginBottom: '12px' }}>
                      <div style={{ fontSize: '11px', color: '#374151', lineHeight: 1.6 }}>
                        💡 {roadmapData[c.candidateId]?.roadmap?.summary || roadmapData[c.candidateId]?.summary}
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {(roadmapData[c.candidateId]?.roadmap?.roadmap || roadmapData[c.candidateId]?.roadmap || []).map((item, i) => {
                      const pc = priorityColor(item.priority)
                      return (
                        <div key={i} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 14px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '10px', padding: '2px 8px', background: pc.bg, border: `1px solid ${pc.border}`, borderRadius: '100px', color: pc.color, fontWeight: 600 }}>
                                {item.priority}
                              </span>
                              <span style={{ fontSize: '12px', fontWeight: 600, color: '#111' }}>{item.skill}</span>
                            </div>
                            <span style={{ fontSize: '10px', color: '#94a3b8' }}>~{item.estimatedWeeks}w</span>
                          </div>
                          <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '6px', lineHeight: 1.5 }}>{item.description}</div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                            {item.resources?.map((r, j) => (
                              <span key={j} style={{ fontSize: '10px', background: '#f1f5f9', color: '#64748b', padding: '2px 8px', borderRadius: '100px' }}>{r}</span>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}