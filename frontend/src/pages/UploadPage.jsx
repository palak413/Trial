import { useState } from 'react'
import SkillBadge from '../components/SkillBadge'
import { uploadResume } from '../services/api'

export default function UploadPage() {
  const [file, setFile] = useState(null)
  const [status, setStatus] = useState('idle')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const handleUpload = async () => {
    if (!file) return
    setStatus('uploading')
    setError('')
    try {
      const data = await uploadResume(file)
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
        <h1 className="text-2xl font-bold text-white">Upload Resume</h1>
        <p className="text-gray-500 text-sm mt-1">
          Upload a PDF resume — AI will extract all technical skills automatically
        </p>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
        <label className="flex flex-col items-center justify-center w-full h-44 border-2 border-dashed border-gray-700 rounded-xl cursor-pointer hover:border-purple-500 transition-colors group">
          <div className="w-12 h-12 bg-gray-800 group-hover:bg-purple-900 rounded-xl flex items-center justify-center mb-3 transition-colors">
            <svg className="w-6 h-6 text-gray-500 group-hover:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <span className="text-gray-400 text-sm font-medium">
            {file ? file.name : 'Click to upload PDF'}
          </span>
          <span className="text-gray-600 text-xs mt-1">
            {file ? `${(file.size / 1024).toFixed(1)} KB` : 'PDF files only · max 5MB'}
          </span>
          <input type="file" accept=".pdf" className="hidden"
            onChange={e => { setFile(e.target.files[0]); setStatus('idle'); setResult(null) }} />
        </label>

        <button onClick={handleUpload}
          disabled={!file || status === 'uploading'}
          className="mt-5 w-full py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors">
          {status === 'uploading' ? '🤖 AI is analyzing your resume...' : 'Upload & Extract Skills'}
        </button>

        {status === 'error' && (
          <div className="mt-4 p-3 bg-red-950 border border-red-800 rounded-xl">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}
      </div>

      {status === 'success' && result && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Skills Found', value: result.skills.length, color: 'text-purple-400' },
              { label: 'Level', value: result.experienceLevel, color: 'text-blue-400' },
              { label: 'Years Exp.', value: result.totalExperienceYears, color: 'text-green-400' },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
                <div className={`text-2xl font-bold capitalize ${color}`}>{value}</div>
                <div className="text-xs text-gray-500 mt-1">{label}</div>
              </div>
            ))}
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-white">Extracted Skills</h2>
              <span className="text-xs text-green-400 bg-green-950 px-2 py-1 rounded-lg">
                ✓ Saved to MongoDB
              </span>
            </div>
            <div className="flex flex-wrap gap-2 mb-5">
              {result.skills.map((s, i) => <SkillBadge key={i} skill={s} variant="purple" />)}
            </div>
            <div className="border-t border-gray-800 pt-4">
              <p className="text-xs text-gray-500 mb-1">Candidate ID — copy this for matching:</p>
              <div className="flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-2">
                <code className="text-xs text-purple-300 flex-1 break-all">{result.candidateId}</code>
                <button
                  onClick={() => navigator.clipboard.writeText(result.candidateId)}
                  className="text-xs text-gray-500 hover:text-white transition-colors shrink-0">
                  Copy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}