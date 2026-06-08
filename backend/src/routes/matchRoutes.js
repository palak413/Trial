import express from 'express'
import {
  matchCandidatesToJob,
  getGapAndRoadmap,
  getLeaderboard
} from '../controllers/matchController.js'

const router = express.Router()

router.get('/leaderboard', getLeaderboard)
router.get('/:jobId', matchCandidatesToJob)
router.get('/:jobId/:candidateId', getGapAndRoadmap)

export default router