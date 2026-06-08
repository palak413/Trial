import { useState, useEffect } from 'react'
import { getLeaderboard } from '../services/api'

const medalColor = (rank) => {
  if (rank === 1) return 'bg-yellow-500 text-yellow-950'
  if (rank === 2) return 'bg-gray-400 text-gray-900'
  if (rank === 3) return 'bg-amber-700 text-amber-100'
  return 'bg-gray-800 text-gray-400'
}

const scoreColor = (s) =>
  s >= 70 ? 'text-green-400' : s >= 40 ? 'text-yellow-400' : 'text-red-400'

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getLeaderboard()
      .then(data => setLeaderboard(data.leaderboard || []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Leaderboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          Top candidates ranked by average match score across all jobs
        </p>
      </div>

      {loading && (
        <div className="text-center py-20 text-gray-500">
          Calculating rankings...
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-950 border border-red-800 rounded-xl">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {!loading && leaderboard.length === 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-16 text-center">
          <p className="text-gray-500 text-lg mb-2">No data yet</p>
          <p className="text-gray-600 text-sm">
            Upload resumes and post jobs to see the leaderboard
          </p>
        </div>
      )}

      {leaderboard.map((candidate) => (
        <div key={candidate.candidateId}
          className="bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-2xl p-6 transition-colors">

          <div className="flex items-center gap-4">
            {/* Rank badge */}
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold shrink-0 ${medalColor(candidate.rank)}`}>
              #{candidate.rank}
            </div>

            {/* Candidate info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white truncate">{candidate.name}</h3>
              <p className="text-gray-500 text-xs capitalize mt-0.5">
                {candidate.experienceLevel} · {candidate.totalExperienceYears} yr{candidate.totalExperienceYears !== 1 ? 's' : ''}
              </p>
              <p className="text-gray-600 text-xs mt-1 truncate">
                Best: {candidate.bestJob}
              </p>
            </div>

            {/* Scores */}
            <div className="text-right shrink-0">
              <div className={`text-3xl font-bold ${scoreColor(candidate.averageScore)}`}>
                {candidate.averageScore}%
              </div>
              <div className="text-xs text-gray-500">avg score</div>
              <div className="text-xs text-gray-600 mt-1">
                {candidate.jobCount} job{candidate.jobCount !== 1 ? 's' : ''} evaluated
              </div>
            </div>
          </div>

          {/* Score bar */}
          <div className="mt-4 w-full bg-gray-800 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${candidate.averageScore >= 70 ? 'bg-green-500' : candidate.averageScore >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
              style={{ width: `${candidate.averageScore}%` }}
            />
          </div>

          {/* Best score callout */}
          <div className="mt-3 flex justify-between text-xs text-gray-600">
            <span>Best match: <span className="text-gray-400">{candidate.bestScore}%</span></span>
            <span>Evaluated against <span className="text-gray-400">{candidate.jobCount}</span> job{candidate.jobCount !== 1 ? 's' : ''}</span>
          </div>
        </div>
      ))}
    </div>
  )
}