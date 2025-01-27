export interface UserDetails {
  name: string
  dateOfBirth: Date
  education: "UG" | "PG"
  degree: string
  about: string
  location: {
    city: string
    country: string
  }
  skills: {
    name: string
    experience: 1 | 2 | 3
  }[]
  dreamJob: string
  resumeText?: string
}

export interface AnalysisResult {
  score: number
  advice: string
  resumeFeedback: string
  jobRecommendations: {
    title: string
    company: string
    location: string
    description: string
    matchScore: number
    salary?: string
  }[]
  learningPath: {
    skill: string
    description: string
    resources: {
      name: string
      url: string
    }[]
  }[]
}

