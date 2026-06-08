import mongoose from 'mongoose'

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    company: {
      type: String,
      default: 'Unknown Company'
    },
    description: {
      type: String,
      required: true
    },
    requiredSkills: {
      type: [String],
      default: []
    },
    preferredSkills: {
      type: [String],
      default: []
    },
    experienceLevel: {
      type: String,
      enum: ['fresher', 'junior', 'mid', 'senior', 'any', 'unknown'],
      default: 'unknown'
    },
    minExperienceYears: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
)

const Job = mongoose.model('Job', jobSchema)
export default Job