"use client"

import { MapPin, Users, TrendingUp, Zap } from "lucide-react"

export default function OverviewTab({territory}:any) {
  const stats = [
    { label: "Active Projects", value: "24", icon: TrendingUp, color: "from-blue-500 to-blue-600" },
    { label: "Professionals", value: "156", icon: Users, color: "from-green-500 to-green-600" },
    { label: "Hot Leads", value: "42", icon: Zap, color: "from-orange-500 to-orange-600" },
    { label: "Local Pulses", value: "89", icon: TrendingUp, color: "from-purple-500 to-purple-600" },
  ]

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-accent/10 to-primary/10 rounded-lg p-4 border border-accent/20">
        <div className="flex items-start gap-3">
             <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-accent to-primary flex items-center justify-center text-white shadow">
        <MapPin size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{territory?.name}</h3>
            <p className="text-xs text-muted-foreground mt-1">Pin Code: {territory?.pinCode}</p>
            <p className="text-xs text-muted-foreground">Coordinates: {territory?.coordinates}</p>
            <p className="text-xs text-muted-foreground mt-2">Population: {territory?.population}</p>
            <p className="text-xs text-muted-foreground">Area: {territory?.area}</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="font-semibold text-sm text-foreground">Quick Statistics</h4>
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat, idx) => {
            const Icon = stat.icon
            return (
              <div
                key={idx}
                className="bg-secondary rounded-lg p-3 border border-border hover:border-primary/50 transition-colors"
              >
                <div
                  className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center mb-2`}
                >
                  <Icon size={16} className="text-white" />
                </div>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="text-lg font-bold text-foreground">{stat.value}</p>
              </div>
            )
          })}
        </div>
      </div>

      <div className="bg-secondary rounded-lg p-3 border border-border">
        <h4 className="text-xs font-semibold text-foreground mb-2">Market Snapshot</h4>
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground">Avg Price</span>
            <span className="font-semibold text-foreground">₹8,500/sq.ft</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground">Growth Rate</span>
            <span className="font-semibold text-green-600">+8.2% YoY</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground">Inventory</span>
            <span className="font-semibold text-foreground">2,340 units</span>
          </div>
        </div>
      </div>
    </div>
  )
}
