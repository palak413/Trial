import express from 'express'
import upload from '../middleware/upload.js'
import { uploadResume } from '../controllers/resumeController.js'

const router = express.Router()

// POST /api/resume/upload
// upload.single('resume') → Multer processes one file from the field named 'resume'
router.post('/upload', upload.single('resume'), uploadResume)

export default router