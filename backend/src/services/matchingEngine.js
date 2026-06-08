// ============================================================
// THE DSA MATCHING ENGINE
// Data Structures used:
//   - Set (HashSet)      → O(1) skill lookup
//   - Map (HashMap)      → O(1) weighted skill lookup
//   - Array + sort       → O(n log n) ranking (heap simulation)
// ============================================================

/**
 * Build a weighted skill map from job requirements.
 * Required skills get weight 1.0, preferred get 0.5
 *
 * Data Structure: Map (HashMap)
 * Key:   skill name (lowercase, trimmed)
 * Value: weight (number)
 *
 * Why Map over plain object?
 * Map preserves insertion order, has O(1) get/set,
 * and is safer for dynamic keys (no prototype pollution).
 */
const buildSkillWeightMap = (requiredSkills, preferredSkills) => {
  const skillMap = new Map()

  requiredSkills.forEach(skill => {
    skillMap.set(skill.toLowerCase().trim(), 1.0)
  })

  preferredSkills.forEach(skill => {
    // Don't overwrite if already in required
    if (!skillMap.has(skill.toLowerCase().trim())) {
      skillMap.set(skill.toLowerCase().trim(), 0.5)
    }
  })

  return skillMap
}

/**
 * Score a single candidate against a job's skill map.
 *
 * Data Structure: Set (HashSet)
 * We convert candidate skills to a Set for O(1) lookup.
 *
 * Algorithm:
 * 1. Convert candidate skills → Set
 * 2. For each job skill, check if candidate Set has it → O(1)
 * 3. If yes, add that skill's weight to matchedWeight
 * 4. score = matchedWeight / totalWeight × 100
 */
const scoreCandidate = (candidate, skillWeightMap) => {
  // Convert to Set for O(1) lookup — this is the key DSA choice
  const candidateSkillSet = new Set(
    candidate.skills.map(s => s.toLowerCase().trim())
  )

  let matchedWeight = 0
  let totalWeight = 0
  const matchedSkills = []
  const missingSkills = []

  // Iterate over job skills — O(j) where j = number of job skills
  skillWeightMap.forEach((weight, skill) => {
    totalWeight += weight

    if (candidateSkillSet.has(skill)) {
      // O(1) lookup — this is why we use Set not Array
      matchedWeight += weight
      matchedSkills.push(skill)
    } else {
      missingSkills.push(skill)
    }
  })

  // Avoid division by zero
  const score = totalWeight === 0
    ? 0
    : Math.round((matchedWeight / totalWeight) * 100)

  return {
    candidateId: candidate._id,
    name: candidate.name || candidate.filename,
    skills: candidate.skills,
    experienceLevel: candidate.experienceLevel,
    totalExperienceYears: candidate.totalExperienceYears,
    matchedSkills,
    missingSkills,
    score
  }
}

/**
 * Rank all candidates against a job.
 *
 * Data Structure: Array sorted descending (Max-Heap simulation)
 *
 * In a real system you'd use a true MinHeap to find top-k in O(n log k).
 * For interview purposes, explain both approaches:
 * - Array.sort(): O(n log n) — simpler, fine for < 10,000 candidates
 * - MinHeap of size k: O(n log k) — better for "top 10 of 1,000,000"
 *
 * JavaScript has no built-in heap, so we use sort() here and explain
 * the heap approach conceptually.
 */
export const rankCandidates = (candidates, job) => {
  if (!candidates || candidates.length === 0) {
    return []
  }

  // Step 1: Build weighted skill map — O(j)
  const skillWeightMap = buildSkillWeightMap(
    job.requiredSkills,
    job.preferredSkills
  )

  // Step 2: Score every candidate — O(n × c)
  const scoredCandidates = candidates.map(candidate =>
    scoreCandidate(candidate, skillWeightMap)
  )

  // Step 3: Sort descending by score — O(n log n)
  // This simulates extracting from a max-heap
  scoredCandidates.sort((a, b) => {
    // Primary sort: score descending
    if (b.score !== a.score) return b.score - a.score
    // Tiebreaker: more experience wins
    return b.totalExperienceYears - a.totalExperienceYears
  })

  // Step 4: Add rank position (1-indexed)
  return scoredCandidates.map((candidate, index) => ({
    ...candidate,
    rank: index + 1
  }))
}

/**
 * Generate skill gap analysis for a single candidate.
 * Used for the "improve your resume" feature in Phase 7.
 */
export const getSkillGapAnalysis = (candidateSkills, job) => {
  const skillWeightMap = buildSkillWeightMap(
    job.requiredSkills,
    job.preferredSkills
  )

  const candidateSkillSet = new Set(
    candidateSkills.map(s => s.toLowerCase().trim())
  )

  const criticalGaps = []    // missing required skills
  const niceToHaveGaps = []  // missing preferred skills

  skillWeightMap.forEach((weight, skill) => {
    if (!candidateSkillSet.has(skill)) {
      if (weight === 1.0) criticalGaps.push(skill)
      else niceToHaveGaps.push(skill)
    }
  })

  return { criticalGaps, niceToHaveGaps }
}