"use client"

import { Badge } from "@/components/ui/badge"
import { Home, DollarSign, Download, MapPin, Search } from "lucide-react"
import { useState } from "react"

const projectsData = [
  {
    id: 1,
    name: "Prestige Pinnacle",
    developer: "Prestige Group",
    status: "Ready",
    price: "₹2.5Cr - 4Cr",
    config: "3BHK, 4BHK",
  },
  {
    id: 2,
    name: "DLF Amica",
    developer: "DLF",
    status: "Under Construction",
    price: "₹1.8Cr - 3.5Cr",
    config: "2BHK, 3BHK",
  },
  {
    id: 3,
    name: "Godrej Aria",
    developer: "Godrej",
    status: "Possession Soon",
    price: "₹2.2Cr - 3.8Cr",
    config: "3BHK, Penthouses",
  },
  {
    id: 4,
    name: "Oberoi Realty",
    developer: "Oberoi",
    status: "Ready",
    price: "₹3Cr - 5Cr",
    config: "4BHK, Luxury Apt",
  },
]

const statusColors = {
  Ready: "bg-green-500/20 text-green-700 border-green-200",
  "Under Construction": "bg-blue-500/20 text-blue-700 border-blue-200",
  "Possession Soon": "bg-orange-500/20 text-orange-700 border-orange-200",
  New: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  Active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  Inactive: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
}

export default function ProjectsTab({ territory }: any) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [projects, setProjects] = useState(territory.projects)
  const [selectedProject, setSelectedProject] = useState<any>(null)
  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.state.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = selectedStatus === "all" || project.status === selectedStatus

    return matchesSearch && matchesStatus
  })
  return (
    <div className="space-y-3">
      <div className="border-b border-border p-4">
        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search projects..."
            className="w-full rounded-md border border-border bg-background py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {/* Status Filter */}
        <div className="flex gap-2">
          {["all", "New", "Active", "Inactive","Ongoing"].map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${selectedStatus === status
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
        
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredProjects.length > 0 ? (
          <div className="flex flex-col gap-2 p-3">
            {filteredProjects.map((project) => (
              <button
                key={project._id}
                onClick={() => setSelectedProject(project)}
                className={`rounded-lg p-3 text-left transition-all "
                                    }`}
              >
                {/* Project Image */}
                <div className="mb-2 aspect-video overflow-hidden rounded-md bg-muted">
                  <img
                    src={project.image || "/placeholder.svg?height=120&width=200&query=project"}
                    alt={project.name}
                    width={200}
                    height={120}
                    className="h-full w-full object-cover"
                  />
                </div>

                {/* Project Info */}
                <h3 className="mb-1 font-semibold text-sidebar-foreground line-clamp-2">{project.name}</h3>
                <p className="mb-2 text-xs text-muted-foreground">{project.mid}</p>

                {/* Location */}
                <div className="mb-2 flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span className="line-clamp-1">
                    {project.district}, {project.state}
                  </span>
                </div>

                {/* Status Badge and Units */}
                <div className="flex items-center justify-between gap-2">
                  <Badge
                    className={`text-xs ${statusColors[project.status as keyof typeof statusColors] || statusColors.Inactive}`}
                  >
                    {project.status}
                  </Badge>
                  <span className="text-xs font-medium text-sidebar-foreground">{project.totalUnits} units</span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex h-full items-center justify-center p-4 text-center">
            <p className="text-sm text-muted-foreground">No projects found</p>
          </div>
        )}
      </div>
 <div className="border-t border-border bg-sidebar p-3 text-center text-xs text-muted-foreground">
                        {filteredProjects.length} of {projects.length} projects
                    </div>
    </div>
  )
}
