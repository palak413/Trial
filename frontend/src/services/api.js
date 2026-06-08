const BASE_URL = 'http://localhost:3000/api'

export const uploadResume = async (file) => {
  const formData = new FormData()
  formData.append('resume', file)

  const res = await fetch(`${BASE_URL}/resume/upload`, {
    method: 'POST',
    body: formData
  })

  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Upload failed')
  return data
}

export const createJob = async (jobForm) => {
  const res = await fetch(`${BASE_URL}/job`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(jobForm)
  })

  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Failed to create job')
  return data
}

export const getAllJobs = async () => {
  const res = await fetch(`${BASE_URL}/job`)
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Failed to fetch jobs')
  return data
}

export const matchCandidates = async (jobId) => {
  const res = await fetch(`${BASE_URL}/match/${jobId}`)
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Matching failed')
  return data
}

export const getHealth = async () => {
  const res = await fetch(`${BASE_URL.replace('/api', '')}/api/health`)
  const data = await res.json()
  return data
}
export const getGapAndRoadmap = async (jobId, candidateId) => {
  const res = await fetch(`${BASE_URL}/match/${jobId}/${candidateId}`)
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Failed to get roadmap')
  return data
}

export const getLeaderboard = async () => {
  const res = await fetch(`${BASE_URL}/match/leaderboard`)
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Failed to get leaderboard')
  return data
}