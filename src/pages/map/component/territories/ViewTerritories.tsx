"use client"
import { useState } from "react"
import OverviewTab from "./tabs/overview-tab"
import ProfessionalsTab from "./tabs/professionals-tab"
import ProjectsTab from "./tabs/projects-tab"
import OpportunitiesTab from "./tabs/opportunities-tab"
import TrendingsTab from "./tabs/trendings-tab"
import GovernanceTab from "./tabs/governance-tab"
import EventsTab from "./tabs/events-tab"
import { Building2, Users, Home, Lightbulb, TrendingUp, Shield, Calendar } from "lucide-react"
import { Territory } from "@/apis/apiService"

const tabs = [
  { id: "overview", label: "Overview", icon: Building2 },
   { id: "projects", label: "Projects", icon: Home },
  { id: "professionals", label: "Professionals", icon: Users },
  { id: "opportunities", label: "Opportunities", icon: Lightbulb },
  { id: "trendings", label: "Trendings", icon: TrendingUp },
  { id: "governance", label: "Governance", icon: Shield },
  { id: "events", label: "Events", icon: Calendar },
]

export function ViewTerritories({territory}:any) {
  
  const [activeTab, setActiveTab] = useState("overview")

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return <OverviewTab territory={territory} />
      case "professionals":
        return <ProfessionalsTab territory={territory} />
      case "projects":
        return <ProjectsTab territory={territory} />
      case "opportunities":
        return <OpportunitiesTab />
      case "trendings":
        return <TrendingsTab />
      case "governance":
        return <GovernanceTab />
      case "events":
        return <EventsTab />
      default:
        return <OverviewTab />
    }
  }

  return (
    <div className=" bg-card border-r border-border flex flex-col h-screen shadow-lg">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-accent p-6 text-primary-foreground">
        <h2 className="text-2xl font-bold">Territory Info</h2>
        <p className="text-sm opacity-90 mt-1">Real Estate Intelligence Hub</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex overflow-x-auto border-b border-border bg-card">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1 px-3 py-3 text-xs font-medium whitespace-nowrap border-b-2 transition-all ${
                isActive
                  ? "border-primary text-primary bg-secondary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon size={16} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">{renderContent()}</div>
      </div>
    </div>
  )
}
