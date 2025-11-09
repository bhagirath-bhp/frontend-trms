"use client"

import { useEffect } from "react";
import AreaAnalytics from "./AreaAnalytics/AreaAnalytics"
import { BarChart2, Compass, Map, Pin, Ruler, Shapes } from "lucide-react"
import { getsocietiesData } from "@/apis/apiService";

export default function OverviewTab({ territory }: any) {
  
  
  const projects = territory.projects || []
  console.log(territory);

  useEffect(() => {
   if(territory){
    getsocietiesData(territory._id).then((data) => {
      console.log("Societies Data:", data);
    });
   }
  }, [territory]);
  
  const totalProjects = projects.length
  const types = countBy(projects, "type")
  const statuses = countBy(projects, "status")

  const projectTypesCount = Object.entries(types)
  const projectStatusCount = Object.entries(statuses)

  const polygon = territory.geometry?.coordinates?.[0] || []
  const polygonVertices = polygon.length

  const bbox = computeBBox(polygon)
  const perimeter = computePerimeter(polygon)
  const projectsPerKmSq = territory.area ? (totalProjects / territory.area).toFixed(2) : null

  type PeopleTypeCount = { _id: string; count: number }

  const peopleByType: PeopleTypeCount[] = Object.entries(
    (projects.people || []).reduce((acc: any, p: any) => {
      acc[p.type] = (acc[p.type] || 0) + 1;
      return acc;
    }, {})
  ).map(([type, count]) => ({ _id: type, count: count as number }));


  return (
    <div className="space-y-5">

      {/* ---- TOP SUMMARY ---- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          icon={BarChart2}
          label="Total Projects"
          value={totalProjects}
        />

        <StatCard
          icon={Ruler}
          label="Area"
          value={territory.area ? `${territory.area} km²` : "—"}
        />

        <StatCard
          icon={Pin}
          label="Population"
          value={territory.population ?? "—"}
        />

        <StatCard
          icon={Compass}
          label="Projects / km²"
          value={projectsPerKmSq ?? "—"}
        />
      </div>

      {/* ---- PROJECT TYPE BREAKDOWN ---- */}
      <Section title="Project Distribution by Type">
        <div className="grid grid-cols-1 gap-2">
          {projectTypesCount.map(([type, count]: any) => (
            <Row key={type} label={type} value={count} />
          ))}
        </div>
      </Section>

      <div className=" bg-gray-50 px-2">
       <div>
         <h1 className="text-lg font-bold text-gray-800 mt-2">Real Estate Analytics Dashboard</h1>
        <AreaAnalytics projects={projects} />
       </div>
        {/* <div>
         <h1 className="text-lg font-bold text-gray-800 mt-2">Real Estate Analytics Dashboard</h1>
        <AreaAnalytics projects={projects} />
       </div> */}
      </div>

      {/* 👥 PEOPLE BY TYPE CARD */}
      <div className="p-3 bg-secondary border border-border rounded-lg">
        <h4 className="text-xs font-semibold text-foreground mb-3">People by Type</h4>

        <div className="grid grid-cols-1 gap-2">
          {peopleByType.map((p: any) => (
            <div key={p._id} className="flex justify-between text-xs">
              <span className="text-muted-foreground">{p._id}</span>
              <span className="font-semibold">{p.count}</span>
            </div>
          ))}

          {/* Total Count */}
          <div className="flex justify-between text-xs mt-2 pt-2 border-t border-border">
            <span className="text-muted-foreground">Total</span>
            <span className="font-semibold">
              {peopleByType.reduce((sum, p) => sum + p.count, 0)}
            </span>
          </div>
        </div>
      </div>


      {/* ---- PROJECT STATUS BREAKDOWN ---- */}
      <Section title="Project Status">
        <div className="grid grid-cols-1 gap-2">
          {projectStatusCount.map(([status, count]: any) => (
            <Row key={status} label={status} value={count} />
          ))}
        </div>
      </Section>

      {/* ---- GEOMETRY INSIGHTS ---- */}
      <Section title="Geometry Insights">
        <div className="grid grid-cols-1 gap-2">
          <Row label="Polygon Vertices" value={polygonVertices} />
          <Row label="Bounding Box" value={`${bbox.width.toFixed(3)} km × ${bbox.height.toFixed(3)} km`} />
          <Row label="Perimeter" value={`${perimeter.toFixed(3)} km`} />
        </div>
      </Section>

      {/* ---- CENTER COORDINATES ---- */}
      <Section title="Center Coordinates">
        <div className="grid grid-cols-1 gap-2">
          <Row label="Longitude" value={territory.center?.coordinates?.[0]?.toFixed(6) ?? "—"} />
          <Row label="Latitude" value={territory.center?.coordinates?.[1]?.toFixed(6) ?? "—"} />
        </div>
      </Section>

    </div>
  )
}

/* ---------------- COMPONENTS ---------------- */

function StatCard({ icon: Icon, label, value }: any) {
  return (
    <div className="p-3 bg-secondary border border-border rounded-lg">
      <div className="flex items-center gap-2">
        <Icon size={18} className="text-primary" />
        <div className="text-xs text-muted-foreground">{label}</div>
      </div>
      <div className="text-lg font-bold mt-1">{value}</div>
    </div>
  )
}

function Section({ title, children }: any) {
  return (
    <div className="p-3 bg-secondary border border-border rounded-lg">
      <h4 className="text-xs font-semibold text-foreground mb-3">{title}</h4>
      {children}
    </div>
  )
}

function Row({ label, value }: any) {
  return (
    <div className="flex justify-between text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  )
}

/* ---------------- HELPERS ---------------- */

function countBy(arr: any[], key: string) {
  return arr.reduce((acc: any, obj: any) => {
    const k = obj[key] ?? "Unknown"
    acc[k] = (acc[k] || 0) + 1
    return acc
  }, {})
}

function computeBBox(coords: number[][]) {
  if (!coords.length) return { width: 0, height: 0 }
  const lons = coords.map(c => c[0])
  const lats = coords.map(c => c[1])

  const minLon = Math.min(...lons)
  const maxLon = Math.max(...lons)
  const minLat = Math.min(...lats)
  const maxLat = Math.max(...lats)

  const width = haversine(minLat, minLon, minLat, maxLon)
  const height = haversine(minLat, minLon, maxLat, minLon)

  return { width, height }
}

function computePerimeter(coords: number[][]) {
  let d = 0
  for (let i = 0; i < coords.length - 1; i++) {
    const [lon1, lat1] = coords[i]
    const [lon2, lat2] = coords[i + 1]
    d += haversine(lat1, lon1, lat2, lon2)
  }
  return d
}

// Haversine distance in km
function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}
