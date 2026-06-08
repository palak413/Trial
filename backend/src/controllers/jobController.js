import { analyzeJobDescription } from '../services/geminiService.js'
import Job from '../models/Job.js'

export const createJob = async (req, res) => {
  try {
    const { title, company, description } = req.body

    if (!title || !description) {
      return res.status(400).json({
        error: 'Job title and description are required'
      })
    }

    // Step 1: AI analysis of job description
    const aiResult = await analyzeJobDescription(description)

    // Step 2: Save job to MongoDB
    const job = new Job({
      title,
      company: company || 'Unknown Company',
      description,
      requiredSkills: aiResult.requiredSkills,
      preferredSkills: aiResult.preferredSkills,
      experienceLevel: aiResult.experienceLevel,
      minExperienceYears: aiResult.minExperienceYears
    })

    await job.save()

    res.status(201).json({
      success: true,
      jobId: job._id,
      title: job.title,
      company: job.company,
      requiredSkills: job.requiredSkills,
      preferredSkills: job.preferredSkills,
      experienceLevel: job.experienceLevel,
      minExperienceYears: job.minExperienceYears
    })

  } catch (error) {
    console.error('Job creation error:', error.message)
    res.status(500).json({ error: error.message || 'Failed to create job' })
  }
}

export const getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 })
    res.status(200).json({ success: true, jobs })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch jobs' })
  }
}