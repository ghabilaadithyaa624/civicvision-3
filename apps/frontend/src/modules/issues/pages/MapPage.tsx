import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useIssuesQuery } from "../hooks/useIssues.hooks";
import { MapPin, Filter, Eye, AlertCircle, Compass, Sparkles, X } from "lucide-react";
import { Button } from "@civicvision/shared-ui";
import { LottieWidget } from "@/components/LottieWidget";
import type { IssueReport, IssueCategory, IssueStatus } from "@civicvision/shared-types";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const CATEGORY_LABELS: Record<string, string> = {
  POTHOLE: "Pothole",
  GARBAGE: "Garbage",
  STREETLIGHT: "Streetlight",
  WATER_LEAKAGE: "Water Leakage",
  DAMAGED_SIGNAGE: "Damaged Signage",
  OTHER: "Other",
};

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  PENDING: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/30", dot: "#f59e0b" },
  IN_PROGRESS: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/30", dot: "#3b82f6" },
  RESOLVED: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/30", dot: "#10b981" },
  REJECTED: { bg: "bg-rose-500/10", text: "text-rose-400", border: "border-rose-500/30", dot: "#ef4444" },
};

export function MapPage() {
  const [selectedCategory, setSelectedCategory] = useState<IssueCategory | "">("");
  const [selectedStatus, setSelectedStatus] = useState<IssueStatus | "">("");
  const [selectedIssue, setSelectedIssue] = useState<IssueReport | null>(null);

  const filters = {
    ...(selectedCategory ? { category: selectedCategory } : {}),
    ...(selectedStatus ? { status: selectedStatus } : {}),
  };

  const { data: issues, isLoading, isError } = useIssuesQuery(filters);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapRef.current) {
      // Default centering on Hosur, India
      const defaultCenter: [number, number] = [12.7409, 77.8253];

      const map = L.map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: 13,
        zoomControl: false,
      });

      // CartoDB Dark Matter tile layer for an extremely clean low-contrast dark map without whiteness
      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        maxZoom: 20,
      }).addTo(map);

      L.control.zoom({ position: "bottomright" }).addTo(map);

      mapRef.current = map;
      markersGroupRef.current = L.layerGroup().addTo(map);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update Markers
  useEffect(() => {
    const map = mapRef.current;
    const markersGroup = markersGroupRef.current;
    if (!map || !markersGroup || !issues) return;

    markersGroup.clearLayers();

    if (issues.length === 0) return;

    const bounds = L.latLngBounds([]);

    issues.forEach((issue) => {
      const isSelected = selectedIssue?.id === issue.id;
      const statusInfo = STATUS_COLORS[issue.status] || STATUS_COLORS.PENDING;
      const color = statusInfo.dot;

      const markerHtml = `
        <div class="relative flex items-center justify-center">
          <div class="absolute w-8 h-8 rounded-full animate-ping opacity-25" style="background-color: ${color};"></div>
          <div class="w-4 h-4 rounded-full border-2 border-slate-900 shadow-lg relative flex items-center justify-center ${isSelected ? 'scale-125' : ''}" style="background-color: ${color}; transition: transform 0.2s;">
            <div class="w-1.5 h-1.5 rounded-full bg-white"></div>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: markerHtml,
        className: "custom-leaflet-marker",
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([issue.latitude, issue.longitude], { icon: customIcon });

      marker.on("click", () => {
        setSelectedIssue(issue);
        map.setView([issue.latitude, issue.longitude], Math.max(map.getZoom(), 15), { animate: true });
      });

      marker.addTo(markersGroup);
      bounds.extend([issue.latitude, issue.longitude]);
    });

    // If selectedIssue changes, zoom/fly to it
    if (selectedIssue) {
      map.setView([selectedIssue.latitude, selectedIssue.longitude], Math.max(map.getZoom(), 15), { animate: true });
    } else if (issues.length > 0) {
      // Auto-fit to bounds when issues list changes
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [issues, selectedIssue]);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-[#090d16] text-slate-100 overflow-hidden">
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 border-b border-slate-800/80 bg-[#0f172a]/90 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center">
            <Compass className="h-5 w-5 text-brand-400 animate-spin-slow" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-white flex items-center gap-2">
              Tactical City Infrastructure Map
              <span className="text-[10px] font-mono bg-brand-500/20 text-brand-300 px-2 py-0.5 rounded-full border border-brand-500/30">
                LIVE GIS
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Real-time AI detection telemetry across civic zones.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400 mr-1" />
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as IssueStatus | "")}
            className="bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 outline-none focus:border-brand-500"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as IssueCategory | "")}
            className="bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 outline-none focus:border-brand-500"
          >
            <option value="">All Categories</option>
            <option value="POTHOLE">Potholes</option>
            <option value="GARBAGE">Garbage</option>
            <option value="STREETLIGHT">Streetlights</option>
            <option value="WATER_LEAKAGE">Water Leakages</option>
          </select>

          {(selectedStatus || selectedCategory) && (
            <button
              onClick={() => {
                setSelectedStatus("");
                setSelectedCategory("");
              }}
              className="text-xs text-slate-400 hover:text-white font-semibold ml-2"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Main Map View & Sidebar Panel */}
      <div className="flex-1 relative flex overflow-hidden">
        {/* Tactical Leaflet Map */}
        <div className="flex-1 relative bg-[#090d16] z-0">
          <div
            ref={mapContainerRef}
            className="w-full h-full"
            style={{ minHeight: "100%", background: "#090d16" }}
          />

          {/* Lottie Radar Overlay Badge */}
          <div className="absolute top-4 left-4 bg-[#0f172a]/95 border border-slate-800 rounded-2xl p-3 backdrop-blur-md shadow-2xl flex items-center gap-3 z-[1000]">
            <div className="w-10 h-10">
              <LottieWidget theme="city-radar" width={40} height={40} />
            </div>
            <div>
              <p className="text-xs font-bold text-white">AI Scanner Active</p>
              <p className="text-[10px] text-brand-400 font-mono">
                {isLoading ? "Scanning zones..." : `${issues?.length || 0} issues geolocated`}
              </p>
            </div>
          </div>

          {/* Selected Issue Popup Card */}
          {selectedIssue && (
            <div className="absolute bottom-6 left-6 right-6 sm:right-auto sm:w-96 bg-[#0f172a]/95 border border-slate-700/80 rounded-2xl p-5 shadow-2xl backdrop-blur-xl z-[1000] animate-in fade-in slide-in-from-bottom-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-400 font-mono">
                    {CATEGORY_LABELS[selectedIssue.category]}
                  </span>
                  <h3 className="text-sm font-bold text-white mt-0.5 line-clamp-1">
                    {selectedIssue.title}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedIssue(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <p className="text-xs text-slate-300 line-clamp-2 mb-4">
                {selectedIssue.description || "No description provided."}
              </p>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    STATUS_COLORS[selectedIssue.status]?.bg
                  } ${STATUS_COLORS[selectedIssue.status]?.text} ${
                    STATUS_COLORS[selectedIssue.status]?.border
                  }`}
                >
                  {selectedIssue.status.replace("_", " ")}
                </span>
                <Link to={`/issues/${selectedIssue.id}`}>
                  <Button className="text-xs py-1 px-3 bg-brand-500 hover:bg-brand-600 text-white border-none flex items-center gap-1">
                    <Eye className="h-3 w-3" /> View Details
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Issue Feed */}
        <div className="w-80 border-l border-slate-800/80 bg-[#0f172a]/95 flex flex-col hidden md:flex z-10">
          <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-brand-400" />
              Geo-Tagged Reports ({issues?.length || 0})
            </span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60">
            {isLoading ? (
              <div className="p-8 text-center text-xs text-slate-500">Loading map data...</div>
            ) : isError ? (
              <div className="p-8 text-center text-xs text-rose-400 flex flex-col items-center gap-2">
                <AlertCircle className="h-6 w-6" />
                Failed to load map points.
              </div>
            ) : !issues || issues.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No civic issues found matching current GIS filters.
              </div>
            ) : (
              issues.map((issue) => {
                const isSelected = selectedIssue?.id === issue.id;
                const statusInfo = STATUS_COLORS[issue.status] || STATUS_COLORS.PENDING;
                return (
                  <div
                    key={issue.id}
                    onClick={() => setSelectedIssue(issue)}
                    className={`p-4 cursor-pointer transition-colors ${
                      isSelected ? "bg-brand-500/10 border-l-4 border-brand-500" : "hover:bg-slate-800/40"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">
                        {CATEGORY_LABELS[issue.category]}
                      </span>
                      <span className={`text-[9px] font-bold ${statusInfo.text}`}>
                        {issue.status.replace("_", " ")}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-200 line-clamp-1">{issue.title}</p>
                    <div className="flex items-center justify-between mt-2 text-[10px] text-slate-500 font-mono">
                      <span>
                        {issue.latitude.toFixed(3)}, {issue.longitude.toFixed(3)}
                      </span>
                      {issue.aiConfidence !== null && issue.aiConfidence > 0 && (
                        <span className="text-brand-400 flex items-center gap-0.5">
                          <Sparkles className="h-2.5 w-2.5" />
                          {Math.round(issue.aiConfidence * 100)}%
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
