import { useState } from 'react'
import { createJob } from '../services/api'

export default function JobPage() {
  const [form, setForm] = useState({ title: '', company: '', description: '' })
  const [status, setStatus] = useState('idle')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [focused, setFocused] = useState('')

  const handleSubmit = async () => {
    if (!form.title || !form.description) {
      setError('Title and description are required')
      setStatus('error')
      return
    }
    setStatus('submitting')
    setError('')
    try {
      const data = await createJob(form)
      setResult(data)
      setStatus('success')
    } catch (err) {
      setError(err.message)
      setStatus('error')
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(result.jobId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const inputStyle = (name) => ({
    width: '100%', padding: '10px 14px',
    background: focused === name ? 'white' : '#fafafa',
    border: `1px solid ${focused === name ? '#0070f3' : '#e2e8f0'}`,
    borderRadius: '10px', fontSize: '13px', color: '#111',
    fontFamily: 'Inter, sans-serif', outline: 'none',
    boxShadow: focused === name ? '0 0 0 3px rgba(0,112,243,0.08)' : 'none',
    transition: 'border-color 0.15s, background 0.15s, box-shadow 0.15s'
  })

  return (
    <div style={{ minHeight: '100vh', background: '#f7f6f3', fontFamily: 'Inter, sans-serif', padding: '32px 48px' }}>

      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '20px', fontWeight: 700, color: '#111', marginBottom: '4px' }}>Post a Job</div>
        <div style={{ fontSize: '13px', color: '#94a3b8' }}>
          Fill in the job details — AI will extract required and preferred skills automatically
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>

        {/* ── Form Card ── */}
        <div style={{ background: 'white', border: '1px solid #e8e6e1', borderRadius: '16px', padding: '24px', animation: 'fadeUp 0.35s ease both' }}>

          {/* Card header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <div style={{ width: '28px', height: '28px', background: '#eff6ff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="ti ti-briefcase" style={{ color: '#0070f3', fontSize: '14px' }} aria-hidden="true" />
            </div>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#111' }}>Job Details</span>
          </div>

          {/* Title + Company row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151', display: 'block', marginBottom: '6px' }}>
                Job Title
                <span style={{ display: 'inline-block', width: '5px', height: '5px', background: '#0070f3', borderRadius: '50%', marginLeft: '4px', verticalAlign: 'middle' }} />
              </label>
              <input
                type="text"
                placeholder="e.g. Senior Frontend Developer"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                onFocus={() => setFocused('title')}
                onBlur={() => setFocused('')}
                style={inputStyle('title')}
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151', display: 'block', marginBottom: '6px' }}>
                Company Name
              </label>
              <input
                type="text"
                placeholder="e.g. Google"
                value={form.company}
                onChange={e => setForm({ ...form, company: e.target.value })}
                onFocus={() => setFocused('company')}
                onBlur={() => setFocused('')}
                style={inputStyle('company')}
              />
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: '4px' }}>
            <label style={{ fontSize: '12px', fontWeight: 500, color: '#374151', display: 'block', marginBottom: '6px' }}>
              Job Description
              <span style={{ display: 'inline-block', width: '5px', height: '5px', background: '#0070f3', borderRadius: '50%', marginLeft: '4px', verticalAlign: 'middle' }} />
            </label>
            <textarea
              rows={11}
              placeholder="Paste the full job description here — the more detail, the better the AI extraction..."
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              onFocus={() => setFocused('description')}
              onBlur={() => setFocused('')}
              style={{ ...inputStyle('description'), resize: 'none' }}
            />
            <div style={{ fontSize: '10px', color: '#94a3b8', textAlign: 'right', marginTop: '4px' }}>
              {form.description.length} / 6000 characters
            </div>
          </div>

          {/* Error */}
          {status === 'error' && (
            <div style={{ padding: '10px 14px', background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '10px', marginTop: '12px' }}>
              <p style={{ fontSize: '12px', color: '#e11d48' }}>{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={status === 'submitting'}
            style={{
              width: '100%', padding: '11px', marginTop: '16px',
              background: status === 'submitting' ? '#e2e8f0' : '#0070f3',
              color: status === 'submitting' ? '#94a3b8' : 'white',
              border: 'none', borderRadius: '11px', fontSize: '13px', fontWeight: 600,
              cursor: status === 'submitting' ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              transition: 'background 0.15s, transform 0.15s, box-shadow 0.15s'
            }}
            onMouseEnter={e => { if (status !== 'submitting') { e.currentTarget.style.background = '#0060d9'; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,112,243,0.25)' } }}
            onMouseLeave={e => { e.currentTarget.style.background = status === 'submitting' ? '#e2e8f0' : '#0070f3'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
          >
            <i className="ti ti-sparkles" style={{ fontSize: '14px' }} aria-hidden="true" />
            {status === 'submitting' ? '🤖 AI is analyzing the JD...' : 'Analyze & Save Job'}
          </button>
        </div>

        {/* ── Result Card ── */}
        <div style={{ background: 'white', border: '1px solid #e8e6e1', borderRadius: '16px', padding: '24px', animation: 'fadeUp 0.35s ease 0.1s both' }}>

          {status !== 'success' || !result ? (
            // Empty state
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', textAlign: 'center' }}>
              <div style={{ width: '52px', height: '52px', background: '#f1f5f9', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                <i className="ti ti-chart-bar" style={{ color: '#94a3b8', fontSize: '24px' }} aria-hidden="true" />
              </div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>
                Analysis will appear here
              </div>
              <div style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: 1.6 }}>
                Submit a job description to see extracted required and preferred skills
              </div>
            </div>
          ) : (
            <div style={{ animation: 'fadeUp 0.4s ease both' }}>

              {/* Success banner */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '12px', background: '#f0fdf4', border: '1px solid #bbf7d0',
                borderRadius: '10px', marginBottom: '16px'
              }}>
                <div style={{ width: '24px', height: '24px', background: '#16a34a', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '13px', flexShrink: 0 }}>✓</div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#15803d' }}>Job saved successfully</div>
                  <div style={{ fontSize: '11px', color: '#16a34a' }}>AI analysis complete · Saved to MongoDB</div>
                </div>
              </div>

              {/* Job title + meta */}
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#111', marginBottom: '2px' }}>
                {result.title}
              </div>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '18px' }}>
                {result.company} · {result.experienceLevel} · Min {result.minExperienceYears} yr exp
              </div>

              {/* Required skills */}
              {result.requiredSkills?.length > 0 && (
                <div style={{ marginBottom: '14px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#111', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '8px', height: '8px', background: '#0070f3', borderRadius: '50%' }} />
                    Required Skills
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {result.requiredSkills.map((s, i) => (
                      <span key={i}
                        style={{ padding: '3px 10px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '100px', fontSize: '11px', color: '#2563eb', fontWeight: 500, cursor: 'default', transition: 'transform 0.15s, background 0.15s' }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.background = '#dbeafe' }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = '#eff6ff' }}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Preferred skills */}
              {result.preferredSkills?.length > 0 && (
                <div style={{ marginBottom: '18px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#111', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '8px', height: '8px', background: '#94a3b8', borderRadius: '50%' }} />
                    Preferred Skills
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {result.preferredSkills.map((s, i) => (
                      <span key={i}
                        style={{ padding: '3px 10px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '100px', fontSize: '11px', color: '#64748b', cursor: 'default', transition: 'transform 0.15s' }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)' }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Job ID */}
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#111', marginBottom: '8px' }}>Job ID</div>
              <div style={{ background: '#f8faff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <div style={{ fontSize: '11px', color: '#2563eb', fontFamily: 'monospace', wordBreak: 'break-all', flex: 1 }}>
                  {result.jobId}
                </div>
                <button onClick={handleCopy} style={{
                  padding: '4px 10px',
                  background: copied ? '#f0fdf4' : '#eff6ff',
                  border: `1px solid ${copied ? '#bbf7d0' : '#bfdbfe'}`,
                  borderRadius: '6px', fontSize: '10px',
                  color: copied ? '#16a34a' : '#2563eb',
                  cursor: 'pointer', whiteSpace: 'nowrap', fontWeight: 500,
                  transition: 'all 0.2s'
                }}>
                  {copied ? '✓ Copied!' : 'Copy'}
                </button>
              </div>

              {/* Next step */}
              <div style={{ padding: '12px', background: '#f8faff', border: '1px solid #dbeafe', borderRadius: '10px' }}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#2563eb', marginBottom: '3px' }}>💡 Next step</div>
                <div style={{ fontSize: '11px', color: '#64748b', lineHeight: 1.6 }}>
                  Go to <strong>Match & Rank</strong>, select this job from the dropdown, and rank all uploaded candidates instantly.
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  )
}