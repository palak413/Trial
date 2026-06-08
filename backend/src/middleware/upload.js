import multer from 'multer'
import path from 'path'
import fs from 'fs'

// Create uploads folder if it doesn't exist
const uploadDir = 'uploads'
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir)
}

// Tell Multer WHERE to save files and WHAT to name them
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    // resume-1719123456789.pdf  ← unique name using timestamp
    const uniqueName = `resume-${Date.now()}${path.extname(file.originalname)}`
    cb(null, uniqueName)
  }
})

// Only allow PDF files
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true)   // accept
  } else {
    cb(new Error('Only PDF files are allowed'), false)  // reject
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }  // 5MB max
})

export default upload