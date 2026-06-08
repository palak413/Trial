import Candidate from '../models/Candidate.js'
import Job from '../models/Job.js'
import { rankCandidates, getSkillGapAnalysis } from '../services/matchingEngine.js'
import { generateLearningRoadmap } from '../services/geminiService.js'

export const matchCandidatesToJob = async (req, res) => {
  try {
    const { jobId } = req.params
    const job = await Job.findById(jobId)
    if (!job) return res.status(404).json({ error: 'Job not found' })

    const candidates = await Candidate.find()
    if (candidates.length === 0) {
      return res.status(200).json({
        success: true, job, rankedCandidates: [],
        message: 'No candidates uploaded yet'
      })
    }

    const rankedCandidates = rankCandidates(candidates, job)

    res.status(200).json({
      success: true,
      job: {
        id: job._id, title: job.title, company: job.company,
        requiredSkills: job.requiredSkills, preferredSkills: job.preferredSkills
      },
      totalCandidates: candidates.length,
      rankedCandidates
    })
  } catch (error) {
    console.error('Match error:', error.message)
    res.status(500).json({ error: 'Matching failed: ' + error.message })
  }
}

// NEW: Skill gap + AI roadmap for one candidate vs one job
export const getGapAndRoadmap = async (req, res) => {
  try {
    const { jobId, candidateId } = req.params

    const [job, candidate] = await Promise.all([
      Job.findById(jobId),
      Candidate.findById(candidateId)
    ])

    if (!job) return res.status(404).json({ error: 'Job not found' })
    if (!candidate) return res.status(404).json({ error: 'Candidate not found' })

    // Run DSA gap analysis
    const { criticalGaps, niceToHaveGaps } = getSkillGapAnalysis(
      candidate.skills, job
    )

    const allGaps = [...criticalGaps, ...niceToHaveGaps]

    // Generate AI roadmap only if there are gaps
    let roadmapData = null
    if (allGaps.length > 0) {
      roadmapData = await generateLearningRoadmap(allGaps, job.title)
    }

    res.status(200).json({
      success: true,
      candidate: {
        id: candidate._id,
        name: candidate.name || candidate.filename,
        skills: candidate.skills,
        experienceLevel: candidate.experienceLevel
      },
      job: { id: job._id, title: job.title, company: job.company },
      skillGap: { criticalGaps, niceToHaveGaps },
      roadmap: roadmapData
    })

  } catch (error) {
    console.error('Gap analysis error:', error.message)
    res.status(500).json({ error: error.message })
  }
}

// NEW: Leaderboard — top candidates across ALL jobs
export const getLeaderboard = async (req, res) => {
  try {
    const jobs = await Job.find()
    const candidates = await Candidate.find()

    if (jobs.length === 0 || candidates.length === 0) {
      return res.status(200).json({ success: true, leaderboard: [] })
    }

    // Score every candidate against every job
    // Data structure: Map<candidateId, { totalScore, jobCount, bestScore, bestJob }>
    const candidateScores = new Map()

    jobs.forEach(job => {
      const ranked = rankCandidates(candidates, job)
      ranked.forEach(({ candidateId, name, score, experienceLevel, totalExperienceYears }) => {
        const key = candidateId.toString()
        if (!candidateScores.has(key)) {
          candidateScores.set(key, {
            candidateId, name, experienceLevel, totalExperienceYears,
            totalScore: 0, jobCount: 0, bestScore: 0, bestJob: ''
          })
        }
        const entry = candidateScores.get(key)
        entry.totalScore += score
        entry.jobCount += 1
        if (score > entry.bestScore) {
          entry.bestScore = score
          entry.bestJob = `${job.title} @ ${job.company}`
        }
      })
    })

    // Calculate average score and sort — O(n log n)
    const leaderboard = Array.from(candidateScores.values())
      .map(entry => ({
        ...entry,
        averageScore: Math.round(entry.totalScore / entry.jobCount)
      }))
      .sort((a, b) => b.averageScore - a.averageScore)
      .map((entry, index) => ({ ...entry, rank: index + 1 }))

    res.status(200).json({ success: true, leaderboard })

  } catch (error) {
    console.error('Leaderboard error:', error.message)
    res.status(500).json({ error: error.message })
  }
}