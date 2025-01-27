"use server"

import { GoogleGenerativeAI } from "@google/generative-ai"
import type { UserDetails, AnalysisResult } from "../types/form"

export async function analyzeProfile(data: UserDetails): Promise<AnalysisResult> {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!)
  const model = genAI.getGenerativeModel({ model: "gemini-pro" })

  const prompt = `
    Analyze this person's profile and resume for their dream job:
    
    Personal Information:
    - Name: ${data.name}
    - Education: ${data.education} - ${data.degree}
    - Skills: ${data.skills.map((s) => `${s.name} (${s.experience} years)`).join(", ")}
    - About: ${data.about}
    - Dream Job: ${data.dreamJob}
    
    Resume Content:
    ${data.resumeText}

    Provide a detailed analysis in JSON format with:
    1. A score out of 100 based on how well their current profile matches their dream job
    2. Specific advice based on their current skills, experience, and the gap to their dream job
    3. Detailed resume feedback including:
       - Structure and formatting suggestions
       - Content improvements
       - Missing key information
       - Alignment with dream job
    4. A learning path with 4 crucial skills they need, including:
       - Why each skill matters for their dream job
       - Resources from reputable platforms (Coursera, edX, etc.). in the url of the resource instead of giving direct ink to the course parse the coursename in the sourse website like ( https://www.coursera.org/search?query=techniclasupport )
    
    Format the response exactly like this example:
    {
      "score": 75,
      "advice": " Dear [Name] Your profile shows promise for your dream job as a [role]. Here's what you should focus on...",
      "resumeFeedback": "Your resume effectively highlights [strengths], but could be improved by...",
      "learningPath": [
        {
          "skill": "Skill Name",
          "description": "This skill is crucial because...",
          "resources": [
            {
              "name": "Course/Resource Name",
              "url": "Search for this resource on platforms like Coursera, edX, or Udacity."
            }
          ]
        }
      ]
    }
  `

  try {
    const result = await model.generateContent(prompt)
    const response = result.response
    const text = response.text()
    return JSON.parse(text) as AnalysisResult
  } catch (error) {
    console.error("Error analyzing profile:", error)
    throw new Error("Failed to analyze profile")
  }
}

