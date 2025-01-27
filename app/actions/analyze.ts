"use server"

import { GoogleGenerativeAI } from "@google/generative-ai"
import type { UserDetails, AnalysisResult } from "@/types/form"

export async function analyzeProfile(data: UserDetails): Promise<AnalysisResult> {
  if (!process.env.GOOGLE_API_KEY) {
    throw new Error("Google API key is not configured")
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY)
    const model = genAI.getGenerativeModel({ model: "gemini-pro" })

    const prompt = `
      Analyze this person's profile and resume for their dream job.
      Return ONLY a JSON object with no markdown formatting or code blocks.
      
      Profile Information:
      - Name: ${data.name}
      - Location: ${data.location.city}, ${data.location.country}
      - Education: ${data.education} - ${data.degree}
      - Skills: ${data.skills.map((s) => `${s.name} (${s.experience} years)`).join(", ")}
      - About: ${data.about}
      - Dream Job: ${data.dreamJob}
      
      Resume Content:
      ${data.resumeText}

      Based on their profile, location, and dream job, suggest 3 specific job positions they could apply for.
      Consider local job market trends and opportunities in ${data.location.city}, ${data.location.country}.

      Return a JSON object with these exact keys and types:
      {
        "score": number (0-100),
        "advice": string (career advancement advice),
        "resumeFeedback": string (bullet-point style feedback),
        "jobRecommendations": array of exactly 3 objects, each containing:
          {
            "title": string (job title),
            "company": string (company name),
            "location": string (work location - remote/hybrid/onsite),
            "description": string (job description),
            "matchScore": number (0-100),
            "salary": string (estimated salary range)
          },
        "learningPath": array of exactly 4 objects, each containing:
          {
            "skill": string,
            "description": string,
            "resources": array of objects with:
              {
                "name": string,
                "url": string
              }
          }
      }

      The response must be a valid JSON object with no markdown, no code blocks, and no extra formatting.
      Ensure job recommendations are realistic and aligned with the local job market in their location.
    `

    const result = await model.generateContent(prompt)
    if (!result?.response) {
      throw new Error("No response received from AI")
    }

    const text = result.response.text()
    if (!text) {
      throw new Error("Empty response from AI")
    }

    // Clean the response text
    const cleanedText = text
      .replace(/```json\s*/g, "") // Remove ```json
      .replace(/```\s*/g, "") // Remove ```
      .trim() // Remove whitespace

    try {
      const parsedResult = JSON.parse(cleanedText)

      // Validate the response structure
      if (typeof parsedResult.score !== "number" || parsedResult.score < 0 || parsedResult.score > 100) {
        throw new Error("Invalid score in AI response")
      }

      if (!parsedResult.advice || typeof parsedResult.advice !== "string") {
        throw new Error("Missing or invalid advice in AI response")
      }

      if (!parsedResult.resumeFeedback || typeof parsedResult.resumeFeedback !== "string") {
        throw new Error("Missing or invalid resume feedback in AI response")
      }

      if (!Array.isArray(parsedResult.jobRecommendations) || parsedResult.jobRecommendations.length !== 3) {
        throw new Error("Invalid job recommendations in AI response")
      }

      // Validate job recommendations
      parsedResult.jobRecommendations.forEach((job, index) => {
        if (!job.title || !job.company || !job.location || !job.description || typeof job.matchScore !== "number") {
          throw new Error(`Invalid job recommendation at index ${index}`)
        }
      })

      if (!Array.isArray(parsedResult.learningPath) || parsedResult.learningPath.length !== 4) {
        throw new Error("Invalid learning path in AI response")
      }

      // Validate each learning path item
      parsedResult.learningPath.forEach((path, index) => {
        if (!path.skill || !path.description || !Array.isArray(path.resources)) {
          throw new Error(`Invalid learning path item at index ${index}`)
        }
        path.resources.forEach((resource, rIndex) => {
          if (!resource.name || !resource.url) {
            throw new Error(`Invalid resource at index ${index}.${rIndex}`)
          }
        })
      })

      // Convert any markdown bullet points in resumeFeedback to plain text
      parsedResult.resumeFeedback = parsedResult.resumeFeedback
        .replace(/\*\*/g, "") // Remove bold markdown
        .replace(/- /g, "• ") // Convert markdown bullets to bullet points

      return parsedResult as AnalysisResult
    } catch (parseError) {
      console.error("Raw AI response:", text)
      console.error("Parse error:", parseError)
      throw new Error(
        parseError instanceof Error
          ? `Failed to parse AI response: ${parseError.message}`
          : "Failed to parse AI response",
      )
    }
  } catch (error) {
    console.error("Error in analyzeProfile:", error)

    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes("Failed to parse")) {
        throw new Error("The AI response was not in the correct format. Please try again.")
      }
      if (error.message.includes("No response received")) {
        throw new Error("The AI service did not provide a response. Please try again.")
      }
      throw new Error(`Analysis failed: ${error.message}`)
    }

    throw new Error("An unexpected error occurred during analysis. Please try again.")
  }
}

