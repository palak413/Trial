import mongoose from 'mongoose'

const candidateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: 'Unknown'
    },
    filename: {
      type: String,
      required: true
    },
    rawText: {
      type: String,
      required: true
    },
    skills: {
      type: [String],   // Array of strings
      default: []
    },
    experienceLevel: {
      type: String,
      enum: ['fresher', 'junior', 'mid', 'senior', 'unknown'],
      default: 'unknown'
    },
    totalExperienceYears: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true    // adds createdAt and updatedAt automatically
  }
)

const Candidate = mongoose.model('Candidate', candidateSchema)
export default Candidate