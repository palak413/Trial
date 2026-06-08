import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import resumeRoutes from './routes/resumeRoutes.js'
import jobRoutes from './routes/jobRoutes.js'
import matchRoutes from './routes/matchRoutes.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())
app.use('/api/match', matchRoutes)

// Connect to MongoDB
import { MongoMemoryServer } from 'mongodb-memory-server'

const mongod = await MongoMemoryServer.create()
const uri = mongod.getUri()

mongoose.connect(uri)
  .then(() => console.log('MongoDB connected (in-memory)'))
  .catch((err) => console.error('MongoDB error:', err))

// Routes
app.use('/api/resume', resumeRoutes)
app.use('/api/job', jobRoutes)

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Resume Matcher API is running',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  })
})
app.use((err, req, res, next) => {
  console.error('Global error:', err.message)
  res.status(500).json({ error: err.message || 'Internal server error' })
})
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})