import { useState, useEffect } from 'react'
import { matchCandidates, getAllJobs, getGapAndRoadmap } from '../services/api'
import SkillBadge from '../components/SkillBadge'

const scoreColor = s => s >= 70 ? 'text-green-400' : s >= 40 ? 'text-yellow-400' : 'text-red-400'
const barColor   = s => s >= 70 ? 'bg-green-500'  : s >= 40 ? 'bg-yellow-500'  : 'bg-red-500'
const cardBorder = s => s >= 70 ? 'border-green-900' : s >= 40 ? 'border-yellow-900' : 'border-red-900'

const priorityColor = (p) => {
  if (p === 'high') return 'bg-red-900 text-red-300'
  if (p === 'medium') return 'bg-yellow-900 text-yellow-300'
  return 'bg-gray-800 text-gray-400'
}

export default function MatchPage() {
  const [jobs, setJobs] = useState([])
  const [selectedJobId, setSelectedJobId] = useState('')
  const [status, setStatus] = useState('idle')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [roadmapData, setRoadmapData] = useState({})
  const [loadingRoadmap, setLoadingRoadmap] = useState({})

  useEffect(() => {
    getAllJobs()
      .then(data => setJobs(data.jobs || []))
      .catch(console.error)
  }, [])

  const handleMatch = async () => {
    if (!selectedJobId) { setError('Please select a job'); return }
    setStatus('loading'); setError(''); setResult(null); setRoadmapData({})
    try {
      const data = await matchCandidates(selectedJobId)
      setResult(data)
      setStatus('success')
    } catch (err) {
      setError(err.message); setStatus('error')
    }
  }

  const handleGetRoadmap = async (candidateId) => {
    setLoadingRoadmap(prev => ({ ...prev, [candidateId]: true }))
    try {
      const data = await getGapAndRoadmap(selectedJobId, candidateId)
      setRoadmapData(prev => ({ ...prev, [candidateId]: data }))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoadingRoadmap(prev => ({ ...prev, [candidateId]: false }))
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Match & Rank</h1>
        <p className="text-gray-500 text-sm mt-1">
          Select a job — the DSA engine ranks all candidates by skill match
        </p>
      </div>

      {/* Job selector */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
        <div>
          <label className="text-sm text-gray-400 mb-1.5 block">Select Job</label>
          {jobs.length === 0 ? (
            <p className="text-gray-600 text-sm">No jobs found. Post a job first.</p>
          ) : (
            <select value={selectedJobId}
              onChange={e => { setSelectedJobId(e.target.value); setResult(null); setRoadmapData({}) }}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500">
              <option value="">-- Select a job --</option>
              {jobs.map(job => (
                <option key={job._id} value={job._id}>
                  {job.title} @ {job.company}
                </option>
              ))}
            </select>
          )}
        </div>

        <button onClick={handleMatch}
          disabled={!selectedJobId || status === 'loading'}
          className="w-full py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors">
          {status === 'loading' ? '⚙️ Running DSA Matching Engine...' : '🏆 Rank All Candidates'}
        </button>

        {error && (
          <div className="p-3 bg-red-950 border border-red-800 rounded-xl">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}
      </div>

      {/* Results */}
      {status === 'success' && result && (
        <div className="space-y-4">

          {/* Job summary */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="font-bold text-white text-lg">{result.job.title}</h2>
                <p className="text-gray-500 text-sm">{result.job.company}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-purple-400">{result.totalCandidates}</div>
                <div className="text-xs text-gray-500">candidates ranked</div>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-1">
              {result.job.requiredSkills.map((s, i) => (
                <SkillBadge key={i} skill={s} variant="teal" />
              ))}
            </div>
          </div>

          {result.rankedCandidates.length === 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-10 text-center">
              <p className="text-gray-500">No candidates yet. Upload some resumes first.</p>
            </div>
          )}

          {result.rankedCandidates.map(c => (
            <div key={c.candidateId}
              className={`bg-gray-900 border rounded-2xl p-6 space-y-4 ${cardBorder(c.score)}`}>

              {/* Header */}
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm
                    ${c.rank === 1 ? 'bg-yellow-500 text-yellow-950' :
                      c.rank === 2 ? 'bg-gray-400 text-gray-900' :
                      c.rank === 3 ? 'bg-amber-700 text-amber-100' :
                      'bg-gray-800 text-gray-400'}`}>
                    #{c.rank}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{c.name}</h3>
                    <p className="text-xs text-gray-500 capitalize">
                      {c.experienceLevel} · {c.totalExperienceYears} yr{c.totalExperienceYears !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-4xl font-bold ${scoreColor(c.score)}`}>{c.score}%</div>
                  <div className="text-xs text-gray-500">match</div>
                </div>
              </div>

              {/* Score bar */}
              <div className="w-full bg-gray-800 rounded-full h-2.5">
                <div className={`h-2.5 rounded-full ${barColor(c.score)}`}
                  style={{ width: `${c.score}%` }} />
              </div>

              {/* Skills grid */}
              <div className="grid grid-cols-2 gap-4">
                {c.matchedSkills.length > 0 && (
                  <div>
                    <p className="text-xs text-green-400 mb-2 font-medium">✓ Matched ({c.matchedSkills.length})</p>
                    <div className="flex flex-wrap gap-1">
                      {c.matchedSkills.map((s, i) => <SkillBadge key={i} skill={s} variant="green" />)}
                    </div>
                  </div>
                )}
                {c.missingSkills.length > 0 && (
                  <div>
                    <p className="text-xs text-red-400 mb-2 font-medium">✗ Missing ({c.missingSkills.length})</p>
                    <div className="flex flex-wrap gap-1">
                      {c.missingSkills.map((s, i) => <SkillBadge key={i} skill={s} variant="red" />)}
                    </div>
                  </div>
                )}
              </div>

              {/* Roadmap section */}
              {c.missingSkills.length > 0 && (
                <div className="border-t border-gray-800 pt-4">
                  {!roadmapData[c.candidateId] ? (
                    <button
                      onClick={() => handleGetRoadmap(c.candidateId)}
                      disabled={loadingRoadmap[c.candidateId]}
                      className="w-full py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-gray-300 text-sm font-medium rounded-xl transition-colors">
                      {loadingRoadmap[c.candidateId]
                        ? '🤖 Generating AI roadmap...'
                        : '📚 Generate Learning Roadmap'}
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <h4 className="text-sm font-semibold text-white">
                          Learning Roadmap
                        </h4>
                        <span className="text-xs text-gray-500">
                          ~{roadmapData[c.candidateId].roadmap?.totalWeeks ||
                            roadmapData[c.candidateId].totalWeeks} weeks total
                        </span>
                      </div>

                      {/* Summary */}
                      {(roadmapData[c.candidateId].roadmap?.summary ||
                        roadmapData[c.candidateId].summary) && (
                        <p className="text-xs text-gray-400 bg-gray-800 rounded-lg p-3">
                          💡 {roadmapData[c.candidateId].roadmap?.summary ||
                              roadmapData[c.candidateId].summary}
                        </p>
                      )}

                      {/* Roadmap items */}
                      {(roadmapData[c.candidateId].roadmap?.roadmap ||
                        roadmapData[c.candidateId].roadmap || []).map((item, i) => (
                        <div key={i} className="bg-gray-800 rounded-xl p-4 space-y-2">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColor(item.priority)}`}>
                                {item.priority}
                              </span>
                              <span className="font-medium text-white text-sm">{item.skill}</span>
                            </div>
                            <span className="text-xs text-gray-500">~{item.estimatedWeeks}w</span>
                          </div>
                          <p className="text-xs text-gray-400">{item.description}</p>
                          <div className="flex flex-wrap gap-1">
                            {item.resources?.map((r, j) => (
                              <span key={j} className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded">
                                {r}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}