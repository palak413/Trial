import fs from 'fs'
import { createRequire } from 'module'
import { extractSkillsFromResume } from '../services/geminiService.js'
import Candidate from '../models/Candidate.js'

const require = createRequire(import.meta.url)

export const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' })
    }

    // Step 1: Extract text from PDF
    const fileBuffer = fs.readFileSync(req.file.path)
    const pdfParse = require('pdf-parse')
    const pdfData = await pdfParse(fileBuffer)
    const extractedText = pdfData.text

    if (!extractedText || extractedText.trim().length === 0) {
      return res.status(422).json({
        error: 'Could not extract text. Is it a scanned image PDF?'
      })
    }

    fs.unlinkSync(req.file.path)

    // Step 2: AI skill extraction
    const aiResult = await extractSkillsFromResume(extractedText)

    // Step 3: Save candidate to MongoDB
    const candidate = new Candidate({
      filename: req.file.originalname,
      rawText: extractedText,
      skills: aiResult.skills,
      experienceLevel: aiResult.experienceLevel,
      totalExperienceYears: aiResult.totalExperienceYears
    })

    await candidate.save()

    res.status(201).json({
      success: true,
      candidateId: candidate._id,
      filename: candidate.filename,
      skills: candidate.skills,
      experienceLevel: candidate.experienceLevel,
      totalExperienceYears: candidate.totalExperienceYears
    })

  } catch (error) {
    console.error('Resume upload error:', error.message)
    res.status(500).json({ error: error.message || 'Failed to process resume' })
  }
}