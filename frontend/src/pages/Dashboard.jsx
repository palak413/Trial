import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getAllJobs, getHealth } from '../services/api'

const StatCard = ({ label, value, color, sub }) => (
  <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
    <div className={`text-3xl font-bold ${color}`}>{value}</div>
    <div className="text-gray-400 text-sm mt-1">{label}</div>
    {sub && <div className="text-gray-600 text-xs mt-1">{sub}</div>}
  </div>
)

export default function Dashboard() {
  const [jobs, setJobs] = useState([])
  const [health, setHealth] = useState(null)
  const [loading, setLoading] = useState(true)

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

  const totalSkills = jobs.reduce(
    (acc, j) => acc + j.requiredSkills.length + j.preferredSkills.length, 0
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">

      {/* Hero */}
      <div className="bg-linear-to-r from-purple-900 to-gray-900 border border-purple-800 rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          AI Resume Matcher
        </h1>
        <p className="text-gray-400 mb-6 max-w-lg">
          Upload resumes, post job descriptions, and let the AI-powered
          DSA engine rank candidates by skill match automatically.
        </p>
        <div className="flex gap-3">
          <Link to="/upload"
            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl transition-colors text-sm">
            Upload Resume
          </Link>
          <Link to="/jobs"
            className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-xl transition-colors text-sm">
            Post a Job
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Jobs Posted" value={jobs.length} color="text-purple-400" />
        <StatCard label="Total Skills Indexed" value={totalSkills} color="text-teal-400" />
        <StatCard label="Database" value={health?.mongodb === 'connected' ? 'Live' : 'Off'}
          color={health?.mongodb === 'connected' ? 'text-green-400' : 'text-red-400'}
          sub={health?.mongodb === 'connected' ? 'MongoDB Atlas' : 'Check connection'} />
        <StatCard label="AI Engine" value="Active" color="text-blue-400" sub="Gemini 2.0 Flash" />
      </div>

      {/* Recent Jobs */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-white">Recent Jobs</h2>
          <Link to="/jobs" className="text-sm text-purple-400 hover:text-purple-300">
            + Post new job
          </Link>
        </div>

        {jobs.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-10 text-center">
            <p className="text-gray-500 mb-4">No jobs posted yet.</p>
            <Link to="/jobs"
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-medium">
              Post your first job
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {jobs.slice(0, 5).map(job => (
              <div key={job._id}
                className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex justify-between items-start hover:border-gray-700 transition-colors">
                <div>
                  <h3 className="font-semibold text-white">{job.title}</h3>
                  <p className="text-gray-500 text-sm">{job.company} · {job.experienceLevel}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {job.requiredSkills.slice(0, 4).map((s, i) => (
                      <span key={i} className="px-2 py-0.5 bg-teal-900 text-teal-300 rounded-full text-xs">{s}</span>
                    ))}
                    {job.requiredSkills.length > 4 && (
                      <span className="px-2 py-0.5 bg-gray-800 text-gray-500 rounded-full text-xs">
                        +{job.requiredSkills.length - 4} more
                      </span>
                    )}
                  </div>
                </div>
                <Link to="/match"
                  className="text-xs px-3 py-1.5 bg-purple-900 text-purple-300 rounded-lg hover:bg-purple-800 transition-colors whitespace-nowrap ml-4">
                  Match →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* How it works */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">How it works</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { step: '01', title: 'Upload Resume', desc: 'PDF parsed, text extracted with pdf-parse', color: 'text-purple-400' },
            { step: '02', title: 'AI Extracts Skills', desc: 'Gemini 2.0 identifies all technical skills', color: 'text-blue-400' },
            { step: '03', title: 'Post a Job', desc: 'AI analyzes required vs preferred skills', color: 'text-teal-400' },
            { step: '04', title: 'DSA Ranking', desc: 'HashMap + HashSet engine ranks all candidates', color: 'text-green-400' },
          ].map(({ step, title, desc, color }) => (
            <div key={step} className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <div className={`text-2xl font-bold mb-2 ${color}`}>{step}</div>
              <div className="font-medium text-white text-sm mb-1">{title}</div>
              <div className="text-gray-500 text-xs">{desc}</div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}