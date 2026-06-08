const cache = new Map()

// Set this to true when Gemini quota is exhausted
// Set back to false when quota resets
const USE_MOCK = true

const mockResult = {
  skills: ['React', 'Node.js', 'MongoDB', 'Express', 'JavaScript', 'HTML', 'CSS', 'Git', 'Python', 'SQL'],
  experienceLevel: 'junior',
  totalExperienceYears: 0
}

export const extractSkillsFromResume = async (resumeText) => {
  if (USE_MOCK) {
    console.log('MOCK MODE — returning fake skills (Gemini quota exhausted)')
    return mockResult
  }

  const cacheKey = resumeText.slice(0, 100)

  if (cache.has(cacheKey)) {
    console.log('Returning cached result — saving API quota')
    return cache.get(cacheKey)
  }

  const truncatedText = resumeText.slice(0, 8000)

  const prompt = `
You are an expert technical recruiter and resume parser.

Analyze the resume text below and extract ALL technical skills mentioned.

Return your response as ONLY a valid JSON object — no explanation, no markdown, no code fences. Just raw JSON.

The JSON must follow this exact structure:
{
  "skills": ["skill1", "skill2", "skill3"],
  "experience_level": "fresher | junior | mid | senior",
  "total_experience_years": 0
}

Rules:
- Include programming languages, frameworks, libraries, databases, tools, cloud platforms
- Normalize skill names (e.g. "ReactJS" → "React", "NodeJS" → "Node.js")
- Remove duplicates
- experience_level: fresher (0 yrs), junior (0-2), mid (2-5), senior (5+)
- If experience years cannot be determined, set total_experience_years to 0

Resume Text:
---
${truncatedText}
---
`

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    }
  )

  if (!response.ok) {
    const errData = await response.json()
    console.error('Gemini API error:', JSON.stringify(errData))

    if (response.status === 429) {
      throw new Error('AI service is busy. Please wait 30 seconds and try again.')
    }

    throw new Error(`Gemini API returned ${response.status}`)
  }

  const data = await response.json()
  const responseText = data.candidates[0].content.parts[0].text

  const cleaned = responseText
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim()

  const parsed = JSON.parse(cleaned)

  if (!parsed.skills || !Array.isArray(parsed.skills)) {
    throw new Error('Invalid response structure from Gemini')
  }

  const result = {
    skills: parsed.skills,
    experienceLevel: parsed.experience_level || 'unknown',
    totalExperienceYears: parsed.total_experience_years || 0
  }

  cache.set(cacheKey, result)
  return result
}

// job description analysis function (not used yet, but will be in future for job parsing)

export const analyzeJobDescription = async (jobDescription) => {
  // Mock for development
  if (USE_MOCK) {
    console.log('MOCK MODE — returning fake job analysis')
    return {
      requiredSkills: ['React', 'Node.js', 'MongoDB', 'Express', 'JavaScript'],
      preferredSkills: ['TypeScript', 'Docker', 'AWS'],
      experienceLevel: 'junior',
      minExperienceYears: 1
    }
  }

  const truncatedJD = jobDescription.slice(0, 6000)

  const prompt = `
You are an expert technical recruiter analyzing a job description.

Extract the skill requirements from the job description below.

Return ONLY a valid JSON object — no explanation, no markdown, no code fences.

Use this exact structure:
{
  "requiredSkills": ["skill1", "skill2"],
  "preferredSkills": ["skill3", "skill4"],
  "experienceLevel": "fresher | junior | mid | senior | any",
  "minExperienceYears": 0
}

Rules:
- requiredSkills: skills explicitly marked as required/must-have
- preferredSkills: skills marked as nice-to-have/bonus/preferred
- If all skills seem required, put them all in requiredSkills
- Normalize names: "ReactJS" → "React", "NodeJS" → "Node.js"
- Remove duplicates across both arrays

Job Description:
---
${truncatedJD}
---
`

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    }
  )

  if (!response.ok) {
    const errData = await response.json()
    console.error('Gemini JD error:', JSON.stringify(errData))
    if (response.status === 429) {
      throw new Error('AI service is busy. Please wait 30 seconds and try again.')
    }
    throw new Error(`Gemini API returned ${response.status}`)
  }

  const data = await response.json()
  const responseText = data.candidates[0].content.parts[0].text
  const cleaned = responseText.replace(/```json/gi, '').replace(/```/g, '').trim()
  const parsed = JSON.parse(cleaned)

  return {
    requiredSkills: parsed.requiredSkills || [],
    preferredSkills: parsed.preferredSkills || [],
    experienceLevel: parsed.experienceLevel || 'unknown',
    minExperienceYears: parsed.minExperienceYears || 0
  }
}
export const generateLearningRoadmap = async (missingSkills, jobTitle) => {
  if (USE_MOCK) {
    return {
      roadmap: [
        {
          skill: 'TypeScript',
          priority: 'high',
          estimatedWeeks: 3,
          resources: ['TypeScript Official Docs', 'Total TypeScript by Matt Pocock'],
          description: 'Start with basic types, interfaces, then generics'
        },
        {
          skill: 'Docker',
          priority: 'high',
          estimatedWeeks: 2,
          resources: ['Docker Official Docs', 'TechWorld with Nana on YouTube'],
          description: 'Learn containerization, Dockerfile, docker-compose'
        },
        {
          skill: 'AWS',
          priority: 'medium',
          estimatedWeeks: 6,
          resources: ['AWS Free Tier', 'A Cloud Guru', 'Stephane Maarek on Udemy'],
          description: 'Focus on EC2, S3, Lambda for a junior role'
        }
      ],
      totalWeeks: 11,
      summary: 'Focus on TypeScript first as it builds on your existing JavaScript knowledge'
    }
  }

  const prompt = `
You are a senior software engineer and career mentor.

A candidate is missing these skills for a "${jobTitle}" role: ${missingSkills.join(', ')}

Generate a personalized learning roadmap.

Return ONLY valid JSON — no markdown, no explanation:
{
  "roadmap": [
    {
      "skill": "skill name",
      "priority": "high | medium | low",
      "estimatedWeeks": 2,
      "resources": ["resource1", "resource2"],
      "description": "what to focus on"
    }
  ],
  "totalWeeks": 10,
  "summary": "one sentence overall advice"
}

Rules:
- Order by priority (high first)
- estimatedWeeks should be realistic for a beginner
- resources should be real, specific, free-first
- high priority = required skills, medium/low = preferred
`

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    }
  )

  if (!response.ok) {
    if (response.status === 429) throw new Error('AI quota exceeded. Try again later.')
    throw new Error(`Gemini API returned ${response.status}`)
  }

  const data = await response.json()
  const responseText = data.candidates[0].content.parts[0].text
  const cleaned = responseText.replace(/```json/gi, '').replace(/```/g, '').trim()
  const parsed = JSON.parse(cleaned)

  return parsed
}