import { useState } from 'react'
import { uploadResume } from '../services/api'

export default function UploadPage() {
  const [file, setFile] = useState(null)
  const [status, setStatus] = useState('idle')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleFileChange = (e) => {
    const selected = e.target.files[0]
    if (selected) { setFile(selected); setStatus('idle'); setResult(null); setError('') }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped && dropped.type === 'application/pdf') {
      setFile(dropped); setStatus('idle'); setResult(null); setError('')
    }
  }

  const handleUpload = async () => {
    if (!file) return
    setStatus('uploading'); setError('')
    try {
      const data = await uploadResume(file)
      setResult(data); setStatus('success')
    } catch (err) {
      setError(err.message); setStatus('error')
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(result.candidateId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const tips = [
    { emoji: '📄', title: 'Text-based PDF', desc: 'Export from Word or Google Docs, not scanned images' },
    { emoji: '🛠️', title: 'List skills clearly', desc: 'Add a dedicated Skills section for better extraction' },
    { emoji: '📋', title: 'Include projects', desc: 'Technologies in projects count as skills too' },
    { emoji: '📅', title: 'Add date ranges', desc: 'Experience years are calculated from work history dates' },
    { emoji: '📏', title: 'Keep under 5MB', desc: 'Plain text resumes parse fastest and most accurately' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#f7f6f3', fontFamily: 'Inter, sans-serif', padding: '32px 48px' }}>

      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '20px', fontWeight: 700, color: '#111', marginBottom: '4px' }}>
          Upload Resume
        </div>
        <div style={{ fontSize: '13px', color: '#94a3b8' }}>
          Upload a PDF resume — AI will extract all technical skills automatically
        </div>
      </div>

      {/* Row 1 — Upload + Result side by side */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>

        {/* Upload Card */}
        <div style={{ background: 'white', border: '1px solid #e8e6e1', borderRadius: '16px', padding: '24px' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#111', marginBottom: '14px' }}>
            Select your resume
          </div>

          {/* Drop Zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            style={{
              border: `2px dashed ${dragOver ? '#0070f3' : '#e2e8f0'}`,
              borderRadius: '14px', padding: '32px 20px', textAlign: 'center',
              background: dragOver ? '#f0f7ff' : 'white',
              transition: 'border-color 0.2s, background 0.2s', cursor: 'pointer'
            }}
          >
            <div style={{
              width: '52px', height: '52px', background: dragOver ? '#dbeafe' : '#eff6ff',
              borderRadius: '14px', display: 'flex', alignItems: 'center',
              justifyContent: 'center', margin: '0 auto 14px',
              transform: dragOver ? 'scale(1.08) translateY(-2px)' : 'scale(1)',
              transition: 'transform 0.2s, background 0.2s'
            }}>
              <i className="ti ti-cloud-upload" style={{ color: '#0070f3', fontSize: '24px' }} aria-hidden="true" />
            </div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#111', marginBottom: '4px' }}>
              Drag & drop your resume here
            </div>
            <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '14px' }}>
              or click the button below to browse
            </div>
            <label style={{
              padding: '8px 18px', background: '#0070f3', color: 'white',
              borderRadius: '9px', fontSize: '12px', fontWeight: 600,
              cursor: 'pointer', display: 'inline-block',
              transition: 'background 0.15s'
            }}>
              Browse PDF file
              <input type="file" accept=".pdf" onChange={handleFileChange} style={{ display: 'none' }} />
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '14px' }}>
              <div style={{ flex: 1, height: '1px', background: '#f1f0ec' }} />
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>PDF only · max 5MB</span>
              <div style={{ flex: 1, height: '1px', background: '#f1f0ec' }} />
            </div>
          </div>

          {/* File selected */}
          {file && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '12px', background: '#f8faff',
              border: '1px solid #bfdbfe', borderRadius: '10px', marginTop: '14px',
              animation: 'fadeUp 0.3s ease both'
            }}>
              <div style={{ width: '36px', height: '36px', background: '#eff6ff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <i className="ti ti-file-type-pdf" style={{ color: '#e11d48', fontSize: '18px' }} aria-hidden="true" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#111' }}>{file.name}</div>
                <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '1px' }}>
                  {(file.size / 1024).toFixed(1)} KB · Ready to upload
                </div>
              </div>
              <div
                onClick={() => { setFile(null); setStatus('idle'); setResult(null) }}
                style={{ color: '#94a3b8', cursor: 'pointer', fontSize: '18px', lineHeight: 1, padding: '2px 6px' }}
              >
                ×
              </div>
            </div>
          )}

          {/* Error */}
          {status === 'error' && (
            <div style={{ marginTop: '12px', padding: '10px 14px', background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '10px' }}>
              <p style={{ fontSize: '12px', color: '#e11d48' }}>{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleUpload}
            disabled={!file || status === 'uploading'}
            style={{
              width: '100%', padding: '11px', marginTop: '16px',
              background: !file || status === 'uploading' ? '#e2e8f0' : '#0070f3',
              color: !file || status === 'uploading' ? '#94a3b8' : 'white',
              border: 'none', borderRadius: '11px', fontSize: '13px', fontWeight: 600,
              cursor: !file || status === 'uploading' ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              transition: 'background 0.15s, transform 0.15s, box-shadow 0.15s'
            }}
          >
            <i className="ti ti-sparkles" style={{ fontSize: '14px' }} aria-hidden="true" />
            {status === 'uploading' ? '🤖 AI is analyzing...' : 'Upload & Extract Skills'}
          </button>
        </div>

        {/* Result Card */}
        <div style={{ background: 'white', border: '1px solid #e8e6e1', borderRadius: '16px', padding: '24px' }}>
          {status !== 'success' || !result ? (
            // Empty state
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', textAlign: 'center' }}>
              <div style={{ width: '52px', height: '52px', background: '#f1f5f9', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                <i className="ti ti-chart-bar" style={{ color: '#94a3b8', fontSize: '24px' }} aria-hidden="true" />
              </div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>
                Results will appear here
              </div>
              <div style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: 1.6 }}>
                Upload a resume to see extracted skills, experience level, and your candidate ID
              </div>
            </div>
          ) : (
            // Results
            <div style={{ animation: 'fadeUp 0.4s ease both' }}>

              {/* Success banner */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '12px', background: '#f0fdf4', border: '1px solid #bbf7d0',
                borderRadius: '10px', marginBottom: '16px'
              }}>
                <div style={{ width: '24px', height: '24px', background: '#16a34a', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '13px', flexShrink: 0 }}>✓</div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#15803d' }}>Skills extracted successfully</div>
                  <div style={{ fontSize: '11px', color: '#16a34a' }}>Saved to MongoDB · {result.filename}</div>
                </div>
              </div>

              {/* Mini stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px', marginBottom: '16px' }}>
                {[
                  { val: result.skills.length, label: 'Skills Found', color: '#0070f3' },
                  { val: result.experienceLevel, label: 'Level', color: '#9333ea' },
                  { val: result.totalExperienceYears, label: 'Years Exp.', color: '#16a34a' },
                ].map(({ val, label, color }) => (
                  <div key={label} style={{
                    background: '#f8faff', border: '1px solid #e2e8f0', borderRadius: '10px',
                    padding: '12px', textAlign: 'center',
                    transition: 'transform 0.15s, border-color 0.15s'
                  }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = '#bfdbfe' }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = '#e2e8f0' }}
                  >
                    <div style={{ fontSize: '18px', fontWeight: 700, color, textTransform: 'capitalize' }}>{val}</div>
                    <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>{label}</div>
                  </div>
                ))}
              </div>

              {/* Skills */}
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#111', marginBottom: '8px' }}>
                Extracted Skills
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                {result.skills.map((s, i) => (
                  <span key={i} style={{
                    padding: '3px 10px', background: '#eff6ff', border: '1px solid #bfdbfe',
                    borderRadius: '100px', fontSize: '11px', color: '#2563eb', fontWeight: 500,
                    cursor: 'default', transition: 'transform 0.15s, background 0.15s'
                  }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.background = '#dbeafe' }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = '#eff6ff' }}
                  >
                    {s}
                  </span>
                ))}
              </div>

              {/* Candidate ID */}
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#111', marginBottom: '8px' }}>
                Candidate ID
              </div>
              <div style={{
                background: '#f8faff', border: '1px solid #e2e8f0', borderRadius: '10px',
                padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '8px',
                marginBottom: '14px'
              }}>
                <div style={{ fontSize: '11px', color: '#2563eb', fontFamily: 'monospace', wordBreak: 'break-all', flex: 1 }}>
                  {result.candidateId}
                </div>
                <button onClick={handleCopy} style={{
                  padding: '4px 10px', background: copied ? '#f0fdf4' : '#eff6ff',
                  border: `1px solid ${copied ? '#bbf7d0' : '#bfdbfe'}`,
                  borderRadius: '6px', fontSize: '10px',
                  color: copied ? '#16a34a' : '#2563eb',
                  cursor: 'pointer', whiteSpace: 'nowrap', fontWeight: 500,
                  transition: 'all 0.2s'
                }}>
                  {copied ? '✓ Copied!' : 'Copy'}
                </button>
              </div>

              {/* Next step hint */}
              <div style={{ padding: '12px', background: '#f8faff', border: '1px solid #dbeafe', borderRadius: '10px' }}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#2563eb', marginBottom: '3px' }}>
                  💡 Next step
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', lineHeight: 1.6 }}>
                  Go to <strong>Match & Rank</strong> and select a job to see how this candidate scores.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tips Row */}
      <div>
        <div style={{ fontSize: '13px', fontWeight: 600, color: '#111', marginBottom: '12px' }}>
          Tips for best results
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
          {tips.map(({ emoji, title, desc }, i) => (
            <div
              key={i}
              style={{
                background: 'white', border: '1px solid #e8e6e1', borderRadius: '14px',
                padding: '16px 14px', textAlign: 'center',
                animation: `fadeUp 0.4s ease ${i * 0.05 + 0.1}s both`,
                transition: 'transform 0.2s, border-color 0.2s, box-shadow 0.2s',
                cursor: 'default'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.borderColor = '#bfdbfe'
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.07)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.borderColor = '#e8e6e1'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <div style={{ fontSize: '22px', marginBottom: '10px' }}>{emoji}</div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#111', marginBottom: '4px' }}>{title}</div>
              <div style={{ fontSize: '10px', color: '#94a3b8', lineHeight: 1.5 }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}