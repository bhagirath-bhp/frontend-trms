"use client"

import { Home, DollarSign, Download } from "lucide-react"

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
}

export default function ProjectsTab() {
  return (
    <div className="space-y-3">
      {projectsData.map((project) => (
        <div
          key={project.id}
          className="bg-secondary rounded-lg p-3 border border-border hover:border-primary/50 transition-all"
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Home size={16} className="text-accent flex-shrink-0" />
                <h4 className="font-semibold text-sm text-foreground">{project.name}</h4>
              </div>
              <p className="text-xs text-muted-foreground ml-6">{project.developer}</p>
            </div>
            <span
              className={`text-xs font-semibold px-2 py-1 rounded border ${statusColors[project.status as keyof typeof statusColors]}`}
            >
              {project.status}
            </span>
          </div>

          <div className="ml-6 space-y-1 mb-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <DollarSign size={14} />
              <span>{project.price}</span>
            </div>
            <div className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Config:</span> {project.config}
            </div>
          </div>

          <button className="w-full flex items-center justify-center gap-2 bg-accent/10 text-accent rounded px-2 py-1 text-xs font-medium hover:bg-accent/20 transition-colors border border-accent/30">
            <Download size={12} />
            Get Brochure
          </button>
        </div>
      ))}
    </div>
  )
}
