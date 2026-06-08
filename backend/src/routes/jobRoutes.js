import express from 'express'
import { createJob, getAllJobs } from '../controllers/jobController.js'

const router = express.Router()

router.post('/', createJob)        // POST /api/job
router.get('/', getAllJobs)         // GET  /api/job

export default router