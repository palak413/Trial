import { useState } from 'react'
import SkillBadge from '../components/SkillBadge'
import { createJob } from '../services/api'

export default function JobPage() {
  const [form, setForm] = useState({ title: '', company: '', description: '' })
  const [status, setStatus] = useState('idle')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!form.title || !form.description) {
      setError('Title and description are required')
      setStatus('error'); return
    }
    setStatus('submitting'); setError('')
    try {
      const data = await createJob(form)
      setResult(data)
      setStatus('success')
    } catch (err) {
      setError(err.message)
      setStatus('error')
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Post a Job</h1>
        <p className="text-gray-500 text-sm mt-1">
          Paste a job description — AI will extract required and preferred skills
        </p>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 space-y-5">
        {[
          { label: 'Job Title *', key: 'title', placeholder: 'e.g. Senior Frontend Developer', type: 'input' },
          { label: 'Company Name', key: 'company', placeholder: 'e.g. Google', type: 'input' },
          { label: 'Job Description *', key: 'description', placeholder: 'Paste the full job description here — the more detail, the better the skill extraction...', type: 'textarea' },
        ].map(({ label, key, placeholder, type }) => (
          <div key={key}>
            <label className="text-sm text-gray-400 mb-1.5 block">{label}</label>
            {type === 'input' ? (
              <input type="text" placeholder={placeholder} value={form[key]}
                onChange={e => setForm({ ...form, [key]: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 transition-colors" />
            ) : (
              <textarea rows={7} placeholder={placeholder} value={form[key]}
                onChange={e => setForm({ ...form, [key]: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 transition-colors resize-none" />
            )}
          </div>
        ))}

        <button onClick={handleSubmit} disabled={status === 'submitting'}
          className="w-full py-3 bg-teal-600 hover:bg-teal-500 disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors">
          {status === 'submitting' ? '🤖 AI is analyzing the JD...' : 'Analyze & Save Job'}
        </button>

        {status === 'error' && (
          <div className="p-3 bg-red-950 border border-red-800 rounded-xl">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}
      </div>

      {status === 'success' && result && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-5">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="font-bold text-xl text-white">{result.title}</h2>
              <p className="text-gray-500 text-sm">{result.company} · {result.experienceLevel}</p>
            </div>
            <span className="text-xs text-green-400 bg-green-950 px-2 py-1 rounded-lg shrink-0">
              ✓ Saved to MongoDB
            </span>
          </div>

          <div>
            <p className="text-sm text-gray-400 mb-2 font-medium">Required Skills</p>
            <div className="flex flex-wrap gap-2">
              {result.requiredSkills.map((s, i) => <SkillBadge key={i} skill={s} variant="teal" />)}
            </div>
          </div>

          {result.preferredSkills?.length > 0 && (
            <div>
              <p className="text-sm text-gray-400 mb-2 font-medium">Preferred Skills</p>
              <div className="flex flex-wrap gap-2">
                {result.preferredSkills.map((s, i) => <SkillBadge key={i} skill={s} variant="gray" />)}
              </div>
            </div>
          )}

          <div className="border-t border-gray-800 pt-4">
            <p className="text-xs text-gray-500 mb-1">Job ID — copy this for matching:</p>
            <div className="flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-2">
              <code className="text-xs text-teal-300 flex-1 break-all">{result.jobId}</code>
              <button
                onClick={() => navigator.clipboard.writeText(result.jobId)}
                className="text-xs text-gray-500 hover:text-white transition-colors shrink-0">
                Copy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}