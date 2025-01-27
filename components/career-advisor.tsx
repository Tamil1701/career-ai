"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ResultsDisplay } from "./results-display"
import { analyzeProfile } from "@/app/actions/analyze"
import type { UserDetails, AnalysisResult } from "@/types/form"

export default function CareerAdvisor() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<AnalysisResult | null>(null)
  const [formData, setFormData] = useState<Partial<UserDetails>>({
    skills: [],
    location: {
      city: "",
      country: "",
    },
  })

  const handleSubmit = async () => {
    // Validate required fields
    const requiredFields = {
      name: "Please enter your name",
      dateOfBirth: "Please enter your date of birth",
      education: "Please select your education level",
      degree: "Please enter your degree",
      about: "Please tell us about yourself",
      dreamJob: "Please enter your dream job",
      resumeText: "Please paste your resume content",
      "location.city": "Please enter your city",
      "location.country": "Please enter your country",
    } as const

    for (const [field, message] of Object.entries(requiredFields)) {
      if (field.includes(".")) {
        const [parent, child] = field.split(".")
        if (!formData[parent as keyof UserDetails]?.[child]?.toString().trim()) {
          setError(message)
          return
        }
      } else if (!formData[field as keyof typeof requiredFields]?.toString().trim()) {
        setError(message)
        return
      }
    }

    if (!formData.skills?.length) {
      setError("Please add at least one skill")
      return
    }

    // Validate skills
    for (const skill of formData.skills) {
      if (!skill.name.trim()) {
        setError("Please enter a name for all skills")
        return
      }
    }

    setError(null)
    setLoading(true)

    try {
      const results = await analyzeProfile(formData as UserDetails)

      // Validate results
      if (!results || typeof results !== "object") {
        throw new Error("Invalid response received")
      }

      setResults(results)
      setStep(4)
    } catch (error) {
      console.error("Analysis error:", error)
      setError(error instanceof Error ? error.message : "An unexpected error occurred. Please try again.")
      // Stay on the current step when there's an error
    } finally {
      setLoading(false)
    }
  }

  const updateFormData = (updates: Partial<UserDetails>) => {
    setFormData((prev) => ({ ...prev, ...updates }))
  }

  const updateLocation = (field: keyof UserDetails["location"], value: string) => {
    setFormData((prev) => ({
      ...prev,
      location: {
        ...prev.location,
        [field]: value,
      },
    }))
  }

  const addSkill = () => {
    setFormData((prev) => ({
      ...prev,
      skills: [...(prev.skills || []), { name: "", experience: 1 }],
    }))
  }

  const updateSkill = (index: number, updates: Partial<UserDetails["skills"][0]>) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills?.map((skill, i) => (i === index ? { ...skill, ...updates } : skill)),
    }))
  }

  const removeSkill = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills?.filter((_, i) => i !== index),
    }))
  }

  if (step === 4 && results) {
    return <ResultsDisplay results={results} />
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Career Advisor AI</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mb-4">{error}</div>}
          {step === 1 && (
            <>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Full Name</label>
                  <Input
                    placeholder="Enter your full name"
                    value={formData.name || ""}
                    onChange={(e) => updateFormData({ name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date of Birth</label>
                  <Input
                    type="date"
                    value={formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString().split("T")[0] : ""}
                    onChange={(e) => updateFormData({ dateOfBirth: new Date(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Location</label>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      placeholder="City"
                      value={formData.location?.city || ""}
                      onChange={(e) => updateLocation("city", e.target.value)}
                    />
                    <Input
                      placeholder="Country"
                      value={formData.location?.country || ""}
                      onChange={(e) => updateLocation("country", e.target.value)}
                    />
                  </div>
                </div>
                <Button onClick={() => setStep(2)}>Next</Button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Education Level</label>
                  <Select
                    value={formData.education}
                    onValueChange={(value: "UG" | "PG") => updateFormData({ education: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select education level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UG">Undergraduate</SelectItem>
                      <SelectItem value="PG">Postgraduate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Degree Name</label>
                  <Input
                    placeholder="e.g., Bachelor of Science in Computer Science"
                    value={formData.degree || ""}
                    onChange={(e) => updateFormData({ degree: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">About Me</label>
                  <Textarea
                    placeholder="Tell us about yourself..."
                    value={formData.about || ""}
                    onChange={(e) => updateFormData({ about: e.target.value })}
                  />
                </div>
                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep(1)}>
                    Back
                  </Button>
                  <Button onClick={() => setStep(3)}>Next</Button>
                </div>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Skills</label>
                  {formData.skills?.map((skill, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder="Skill name"
                        value={skill.name}
                        onChange={(e) => updateSkill(index, { name: e.target.value })}
                      />
                      <Select
                        value={skill.experience.toString()}
                        onValueChange={(value) =>
                          updateSkill(index, { experience: Number.parseInt(value) as 1 | 2 | 3 })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Years" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 year</SelectItem>
                          <SelectItem value="2">2 years</SelectItem>
                          <SelectItem value="3">3+ years</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="destructive" onClick={() => removeSkill(index)}>
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" onClick={addSkill}>
                    Add Skill
                  </Button>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Dream Job</label>
                  <Input
                    placeholder="What's your dream job?"
                    value={formData.dreamJob || ""}
                    onChange={(e) => updateFormData({ dreamJob: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Resume Content</label>
                  <Textarea
                    placeholder="Paste your resume content here..."
                    value={formData.resumeText || ""}
                    onChange={(e) => updateFormData({ resumeText: e.target.value })}
                    className="min-h-[200px]"
                  />
                </div>
                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep(2)}>
                    Back
                  </Button>
                  <Button onClick={handleSubmit} disabled={loading} className="relative">
                    {loading ? (
                      <>
                        <span className="opacity-0">Analyze Profile</span>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="h-5 w-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                        </div>
                      </>
                    ) : (
                      "Analyze Profile"
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

