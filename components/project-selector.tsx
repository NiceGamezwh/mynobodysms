"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { MessageSquare } from "lucide-react"

interface Project {
  id: string
  name: string
}

interface ProjectSelectorProps {
  projects: Project[]
  selectedProject: string | null
  onProjectChange: (projectId: string) => void
}

export function ProjectSelector({ projects, selectedProject, onProjectChange }: ProjectSelectorProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="project-select" className="flex items-center">
        <MessageSquare className="mr-2 h-4 w-4" /> 选择项目
      </Label>
      <Select onValueChange={onProjectChange} value={selectedProject || ""}>
        <SelectTrigger id="project-select" className="w-full">
          <SelectValue placeholder="选择一个项目" />
        </SelectTrigger>
        <SelectContent>
          {projects.map((project) => (
            <SelectItem key={project.id} value={project.id}>
              {project.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
