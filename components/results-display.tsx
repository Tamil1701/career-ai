"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SemiCircleProgress } from "./semi-circle-progress"
import type { AnalysisResult } from "../types/form"
import {
  BookOpen,
  Brain,
  FileText,
  GraduationCap,
  Lightbulb,
  Target,
  Share2,
  Briefcase,
  ChevronRight,
  MapPin,
  Building,
  DollarSign,
  Percent,
} from "lucide-react"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"

interface ResultsDisplayProps {
  results: AnalysisResult
}

export function ResultsDisplay({ results }: ResultsDisplayProps) {
  const [isExporting, setIsExporting] = useState(false)

  // Function to export the page as PDF
  const exportToPDF = async () => {
    setIsExporting(true)
    try {
      const element = document.getElementById("report-content")
      if (!element) return

      const canvas = await html2canvas(element)
      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF("p", "mm", "a4")
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = canvas.width
      const imgHeight = canvas.height
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight)
      const imgX = (pdfWidth - imgWidth * ratio) / 2
      const imgY = 30

      // Add title
      pdf.setFontSize(20)
      pdf.text("Career Analysis Report", pdfWidth / 2, 20, { align: "center" })

      pdf.addImage(imgData, "PNG", imgX, imgY, imgWidth * ratio, imgHeight * ratio)
      pdf.save("career-analysis-report.pdf")
    } catch (error) {
      console.error("Error generating PDF:", error)
    }
    setIsExporting(false)
  }

  // Parse resume feedback into bullet points
  const resumeFeedbackPoints = results.resumeFeedback.split(". ").filter((point) => point.trim())

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-end mb-6">
        <Button onClick={exportToPDF} disabled={isExporting} className="flex items-center gap-2">
          <Share2 className="h-4 w-4" />
          {isExporting ? "Generating PDF..." : "Export as PDF"}
        </Button>
      </div>

      <div id="report-content" className="space-y-8">
        {/* Grid layout for main sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Score Section */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="text-xl text-center">Profile Match Score</CardTitle>
            </CardHeader>
            <CardContent>
              <SemiCircleProgress percentage={results.score} />
            </CardContent>
          </Card>

          {/* Career Advice Section */}
          <Card className="md:col-span-1 border-blue-100 bg-blue-50/30">
            <CardHeader className="flex flex-row items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg text-blue-800">Career Advice</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-blue-900">{results.advice}</p>
            </CardContent>
          </Card>
        </div>

        {/* Resume Feedback Section */}
        <Card className="border-blue-100 bg-blue-50/30">
          <CardHeader className="flex flex-row items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg text-blue-800">Resume Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-2">
              {resumeFeedbackPoints.map((point, index) => (
                <li key={index} className="text-blue-900">
                  {point}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Learning Path Section */}
        <Card className="border-blue-100 bg-blue-50/30">
          <CardHeader className="flex flex-row items-center gap-2">
            <GraduationCap className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg text-blue-800">Recommended Learning Path</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {results.learningPath.map((path, index) => (
                <Card key={index} className="border-blue-100 bg-blue-50/30">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Brain className="h-5 w-5 text-blue-600" />
                      <CardTitle className="text-base text-blue-800">{path.skill}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex gap-2">
                        <Lightbulb className="h-5 w-5 text-blue-600 shrink-0 mt-1" />
                        <p className="text-sm text-blue-900">{path.description}</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-800">Learning Resources</span>
                        </div>
                        <div className="ml-6 space-y-1">
                          {path.resources.map((resource, idx) => {
                            // Ensure we have valid URLs for common learning platforms
                            let url = resource.url
                            if (!url.startsWith("http")) {
                              const platform = resource.name.toLowerCase()
                              if (platform.includes("coursera")) {
                                url = `https://www.coursera.org/search?query=${encodeURIComponent(path.skill)}`
                              } else if (platform.includes("udemy")) {
                                url = `https://www.udemy.com/courses/search/?q=${encodeURIComponent(path.skill)}`
                              } else if (platform.includes("edx")) {
                                url = `https://www.edx.org/search?q=${encodeURIComponent(path.skill)}`
                              } else {
                                url = `https://www.google.com/search?q=${encodeURIComponent(resource.name + " " + path.skill + " course")}`
                              }
                            }
                            return (
                              <a
                                key={idx}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block text-sm text-blue-600 hover:text-blue-800 hover:underline"
                              >
                                {resource.name}
                              </a>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI Job Recommendations Section */}
        <Card className="border-green-100 bg-green-50/30">
          <CardHeader className="flex flex-row items-center gap-2">
            <Briefcase className="h-5 w-5 text-green-600" />
            <CardTitle className="text-lg text-green-800">AI Job Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {results.jobRecommendations.map((job, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-lg mb-2">{job.title}</h4>
                        <div className="space-y-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4" />
                            <span>{job.company}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>{job.location}</span>
                          </div>
                          {job.salary && (
                            <div className="flex items-center gap-2 text-green-600 font-medium">
                              <DollarSign className="h-4 w-4" />
                              <span>{job.salary}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-blue-600">
                            <Percent className="h-4 w-4" />
                            <span>{job.matchScore}% Match</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">{job.description}</p>
                      <Button
                        variant="outline"
                        className="w-full mt-2 text-green-600 hover:text-green-700 hover:bg-green-50"
                        onClick={() =>
                          window.open(
                            `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(job.title)}&location=${encodeURIComponent(job.location)}`,
                            "_blank",
                          )
                        }
                      >
                        Apply Now
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

