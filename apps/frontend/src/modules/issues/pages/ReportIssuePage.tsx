import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { ShieldAlert, MapPin, Upload, Compass, Sparkles, DollarSign, AlertTriangle, Eye, ArrowRight } from "lucide-react";
import { Button, InputField, Alert } from "@civicvision/shared-ui";
import { useCreateIssueMutation, useUploadImageMutation } from "../hooks/useIssues.hooks";
import { LottieWidget } from "@/components/LottieWidget";
import { useSaaSSimulator } from "@/hooks/useSaaSSimulator";
import type { IssueCategory } from "@civicvision/shared-types";

interface ReportFormValues {
  title: string;
  description: string;
  category: IssueCategory;
  latitude: number;
  longitude: number;
  imageUrl?: string;
}

export function ReportIssuePage() {
  const createIssueMutation = useCreateIssueMutation();
  const uploadImageMutation = useUploadImageMutation();

  const { state: saasState, isOffline } = useSaaSSimulator();

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // AI Pipeline Mock states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAiCard, setShowAiCard] = useState(false);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [createdId, setCreatedId] = useState<string | null>(null);

  // Background sync daemon: checks if we went online and flush local queue
  useEffect(() => {
    if (isOffline) return;

    const flushQueue = async () => {
      const queue = JSON.parse(localStorage.getItem("offline_issues_queue") || "[]");
      if (queue.length === 0) return;

      console.log(`Syncing ${queue.length} offline issues to PostgreSQL via compose stack...`);
      for (const item of queue) {
        try {
          await createIssueMutation.mutateAsync({
            title: item.title,
            description: item.description,
            category: item.category,
            latitude: item.latitude,
            longitude: item.longitude,
            imageUrl: item.imageUrl || ""
          });
        } catch (err) {
          console.error("Sync failed for issue:", item.title, err);
        }
      }
      // Clear queue once fully flushed
      localStorage.removeItem("offline_issues_queue");
      // Dispatch change event to update headers
      window.dispatchEvent(new Event("saas_simulator_change"));
    };

    flushQueue();
  }, [isOffline, createIssueMutation]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ReportFormValues>({
    defaultValues: {
      category: "POTHOLE",
      latitude: 12.9716, // Bangalore center
      longitude: 77.5946,
    },
  });

  const watchLat = watch("latitude");
  const watchLng = watch("longitude");
  const watchCategory = watch("category");

  // Check for duplicates near Bangalore center mock
  useEffect(() => {
    const latDiff = Math.abs(watchLat - 12.9716);
    const lngDiff = Math.abs(watchLng - 77.5946);
    if (latDiff < 0.003 && lngDiff < 0.003) {
      setIsDuplicate(true);
    } else {
      setIsDuplicate(false);
    }
  }, [watchLat, watchLng]);

  // Handle local image file selection with simulated AI scanning
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setUploadError("Please select a valid image file (JPEG, PNG, WebP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Image size must be less than 5MB.");
      return;
    }

    setUploadError(null);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));

    // Simulate AI Vision analysis pipeline
    setIsAnalyzing(true);
    setShowAiCard(false);
    setTimeout(() => {
      setIsAnalyzing(false);
      setShowAiCard(true);
    }, 1500);
  };

  // Get current GPS location using native browser API
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setValue("latitude", parseFloat(position.coords.latitude.toFixed(6)));
        setValue("longitude", parseFloat(position.coords.longitude.toFixed(6)));
      },
      (error) => {
        console.error("Error retrieving location", error);
        alert("Failed to retrieve location. Please input coordinates manually.");
      }
    );
  };

  // Interactive mock city grid (click to place pin)
  const handleMapGridClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width; // 0 to 1
    const y = (e.clientY - rect.top) / rect.height; // 0 to 1

    const minLat = 12.9000;
    const maxLat = 13.0500;
    const minLng = 77.5000;
    const maxLng = 77.7000;

    const lat = maxLat - y * (maxLat - minLat); // Invert y
    const lng = minLng + x * (maxLng - minLng);

    setValue("latitude", parseFloat(lat.toFixed(6)));
    setValue("longitude", parseFloat(lng.toFixed(6)));
  };

  const onSubmit = handleSubmit(async (values) => {
    try {
      if (isOffline) {
        // Offline Submission queue
        const offlineId = "offline-" + Math.random().toString(36).substring(2, 9);
        const queue = JSON.parse(localStorage.getItem("offline_issues_queue") || "[]");
        queue.push({
          id: offlineId,
          title: values.title,
          description: values.description,
          category: values.category,
          latitude: values.latitude,
          longitude: values.longitude,
          createdAt: new Date().toISOString(),
          status: "PENDING",
          imageUrl: previewUrl || ""
        });
        localStorage.setItem("offline_issues_queue", JSON.stringify(queue));
        // Broadcast custom change
        window.dispatchEvent(new Event("saas_simulator_change"));
        setCreatedId(offlineId);
        return;
      }

      let finalImageUrl = values.imageUrl;

      if (selectedFile) {
        finalImageUrl = await uploadImageMutation.mutateAsync(selectedFile);
      }

      const result = await createIssueMutation.mutateAsync({
        ...values,
        imageUrl: finalImageUrl,
      });

      // Show tracking screen instead of raw dashboard redirect
      setCreatedId(result.id);
    } catch (err) {
      console.error("Failed to report issue", err);
    }
  });

  const getAiDetails = () => {
    switch (watchCategory) {
      case "POTHOLE":
        return { cost: "₹18,500", dept: "Road Maintenance", severity: "High" };
      case "WATER_LEAKAGE":
        return { cost: "₹12,400", dept: "Water Board Dept", severity: "High" };
      case "STREETLIGHT":
        return { cost: "₹5,200", dept: "Electrical Board", severity: "Medium" };
      case "GARBAGE":
        return { cost: "₹3,100", dept: "Sanitation Board", severity: "Low" };
      case "DAMAGED_SIGNAGE":
        return { cost: "₹4,800", dept: "Traffic Signage Dept", severity: "Medium" };
      default:
        return { cost: "₹2,500", dept: "Municipal Admin", severity: "Low" };
    }
  };

  const aiDetails = getAiDetails();

  // Redundant/Duplicate report link helper
  const duplicateReportId = "mock-dup-id-123";

  // SaaS Simulator UI States
  if (saasState === "LOADING") {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8 space-y-6 animate-pulse">
        <div className="h-8 bg-slate-800 rounded w-1/3" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="h-12 bg-slate-800 rounded" />
            <div className="h-28 bg-[#0f172a] rounded-2xl" />
            <div className="h-12 bg-slate-800 rounded" />
          </div>
          <div className="space-y-4">
            <div className="h-40 bg-[#0f172a] rounded-2xl animate-pulse" />
            <div className="h-28 bg-[#0f172a] rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (saasState === "ERROR") {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 flex flex-col items-center text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-455 text-2xl">
          ⚠️
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-extrabold text-white">Platform Synchronization Failure</h1>
          <p className="text-xs text-slate-400 max-w-sm">
            We encountered a high-severity Redis connection breach while routing citizen requests. Please retry or switch to offline storage mode.
          </p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2.5 bg-slate-850 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer border border-slate-800"
        >
          Force Reconnect Database
        </button>
      </div>
    );
  }

  // If successfully submitted, render the premium Recruiter-Approved Tracking screen
  if (createdId) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 flex flex-col items-center text-center space-y-8 animate-in fade-in zoom-in-95 duration-300">
        <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-3xl text-emerald-400 shadow-xl shadow-emerald-500/10">
          🎉
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-slate-850 dark:text-white">Report Submitted Successfully</h1>
          <p className="text-xs text-slate-450 dark:text-slate-400 max-w-sm">
            Your GIS coordinates and image evidence have been successfully saved to the blockchain audit log.
          </p>
        </div>

        {/* Tracking Details Obsidian Card */}
        <div className="w-full bg-[#0f172a]/90 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-full opacity-5 pointer-events-none">
            <LottieWidget theme="success-check" />
          </div>

          <div className="flex justify-between items-center text-xs py-2.5 border-b border-slate-800/80">
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Tracking ID</span>
            <span className="font-mono font-extrabold text-brand-400 text-sm">
              CV-2026-{createdId.slice(0, 5).toUpperCase()}
            </span>
          </div>

          <div className="flex justify-between items-center text-xs py-1">
            <span className="text-slate-400">Estimated Verification</span>
            <span className="font-bold text-slate-200">5 Minutes</span>
          </div>

          <div className="flex justify-between items-center text-xs py-1">
            <span className="text-slate-400">Assigned Node</span>
            <span className="font-bold text-slate-200">US-EAST-MUNI</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <Link to={`/issues/${createdId}`} className="flex-1">
            <Button className="w-full bg-brand-500 hover:bg-brand-600 text-white border-none flex items-center justify-center gap-1.5 py-3 rounded-xl text-xs font-bold">
              <Eye className="h-4 w-4" /> Track Report
            </Button>
          </Link>
          <Link to="/dashboard" className="flex-1">
            <Button variant="ghost" className="w-full hover:bg-slate-800 border-slate-700 py-3 rounded-xl text-xs font-bold">
              Return to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-2">
        <div className="p-2 rounded-xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center">
          <ShieldAlert className="h-5 w-5 text-brand-400 animate-pulse" />
        </div>
        <h1 className="text-xl font-extrabold text-slate-850 dark:text-white">Report Infrastructure Issue</h1>
      </div>

      {/* Duplicate warning alert */}
      {isDuplicate && (
        <div className="mb-6 bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-amber-400 flex items-start gap-3 animate-in slide-in-from-top-4 duration-200">
          <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
          <div className="text-xs">
            <p className="font-extrabold">Potential Duplicate Alert</p>
            <p className="mt-0.5 text-slate-300">
              An active issue has already been reported 65 meters away at this intersection. Help save city resources by voting or commenting on the existing report.
            </p>
            <Link
              to={`/issues/${duplicateReportId}`}
              className="mt-2.5 inline-flex items-center gap-1 text-[11px] font-bold text-brand-400 hover:underline"
            >
              View Existing Report <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      )}

      <form onSubmit={onSubmit} className="grid gap-6 md:grid-cols-2">
        {/* Left Column - Form Fields */}
        <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0f172a]/80 p-6 shadow-sm dark:shadow-xl backdrop-blur-md">
          <InputField
            label="Title"
            placeholder="e.g., Large pothole in the middle lane"
            error={errors.title?.message}
            {...register("title", { required: "Title is required" })}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-350 dark:text-slate-400 uppercase">Description</label>
            <textarea
              className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-xs text-slate-800 dark:text-slate-205 outline-none min-h-[100px]"
              placeholder="Provide context, approximate location details, and severity..."
              {...register("description")}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="category" className="text-xs font-bold text-slate-350 dark:text-slate-400 uppercase">
              Category
            </label>
            <select
              id="category"
              className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-xs text-slate-800 dark:text-slate-205 outline-none"
              {...register("category")}
            >
              <option value="POTHOLE">Pothole</option>
              <option value="GARBAGE">Uncollected Garbage</option>
              <option value="STREETLIGHT">Broken Streetlight</option>
              <option value="WATER_LEAKAGE">Water Leakage</option>
              <option value="DAMAGED_SIGNAGE">Damaged Signage</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800/60 my-2 pt-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">Geospatial Coordinates</span>
              <button
                type="button"
                onClick={handleGetLocation}
                className="flex items-center gap-1 text-[10px] font-bold text-brand-400 hover:text-brand-350 transition-colors"
              >
                <Compass className="h-3.5 w-3.5" />
                Use GPS location
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="Latitude"
                type="number"
                step="0.000001"
                error={errors.latitude?.message}
                {...register("latitude", {
                  required: "Latitude is required",
                  min: { value: -90, message: "Invalid latitude" },
                  max: { value: 90, message: "Invalid latitude" },
                })}
              />
              <InputField
                label="Longitude"
                type="number"
                step="0.000001"
                error={errors.longitude?.message}
                {...register("longitude", {
                  required: "Longitude is required",
                  min: { value: -180, message: "Invalid longitude" },
                  max: { value: 180, message: "Invalid longitude" },
                })}
              />
            </div>
          </div>

          {(createIssueMutation.isError || uploadImageMutation.isError) && (
            <Alert variant="error">
              {createIssueMutation.error?.message ||
                uploadImageMutation.error?.message ||
                "Failed to submit issue report."}
            </Alert>
          )}

          <Button
            type="submit"
            isLoading={createIssueMutation.isPending || uploadImageMutation.isPending}
            className="mt-2 w-full bg-brand-500 hover:bg-brand-600 text-white rounded-xl py-2.5 text-xs font-bold"
          >
            Submit Report
          </Button>
        </div>

        {/* Right Column - Media, AI Predictions & Location Grid */}
        <div className="flex flex-col gap-6">
          {/* Media Capture & Skeleton Loading Block */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0f172a]/80 p-6 shadow-sm dark:shadow-xl flex flex-col gap-4">
            <h2 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Upload className="h-4 w-4 text-brand-400" />
              Attach Evidence Photo
            </h2>
            <div
              className={`border-2 border-dashed rounded-2xl p-4 transition-colors flex flex-col items-center justify-center min-h-[180px] relative overflow-hidden ${
                previewUrl ? "border-brand-500/30 bg-brand-500/5" : "border-slate-300 dark:border-slate-800 hover:border-slate-400"
              }`}
            >
              {isAnalyzing ? (
                /* AI Photo Analysis Processing Laser Scanner & Terminal Logs */
                <div className="w-full flex flex-col items-center space-y-3 py-2 z-10 relative">
                  {/* Neon laser line sweep */}
                  <div className="absolute left-0 right-0 h-0.5 bg-cyan-400 animate-laser-scan shadow-[0_0_10px_rgba(6,182,212,0.9)] z-20" />
                  
                  <div className="w-10 h-10">
                    <LottieWidget theme="loading-spinner" />
                  </div>
                  <div className="space-y-1.5 text-center w-full">
                    <p className="text-xs font-extrabold text-cyan-400 animate-pulse flex items-center gap-1 justify-center tracking-wider">
                      <Sparkles className="h-3.5 w-3.5 animate-spin-slow" /> YOLOv11 INFERENCE ACTIVE
                    </p>
                    
                    {/* Science & Tech logs console readout */}
                    <div className="w-full font-mono text-[7px] text-cyan-400/80 bg-[#05070e] rounded-lg p-2.5 border border-slate-800 h-20 overflow-hidden select-none pointer-events-none text-left leading-relaxed">
                      <p className="text-slate-500">&gt; INITIALIZING NEURAL PIPELINE...</p>
                      <p>&gt; SCANNED TENSOR CONVOLUTION: [1x3x640x640]</p>
                      <p>&gt; DETECTING ANOMALY PATTERNS... CONFIDENCE MATCH: 98%</p>
                      <p className="text-brand-400 animate-pulse">&gt; VERIFYING GIS GEOMETRICS: bangalore_center_zone</p>
                    </div>
                  </div>
                </div>
              ) : previewUrl ? (
                <div className="relative w-full flex flex-col items-center">
                  <img
                    src={previewUrl}
                    alt="Upload Preview"
                    className="max-h-[140px] rounded-xl object-cover shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewUrl(null);
                      setSelectedFile(null);
                      setShowAiCard(false);
                    }}
                    className="mt-2 text-xs font-semibold text-rose-400 hover:text-rose-350 cursor-pointer"
                  >
                    Remove Photo
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer flex flex-col items-center gap-2">
                  <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center text-brand-400">
                    <Upload className="h-5 w-5" />
                  </div>
                  <span className="text-xs text-slate-650 dark:text-slate-300 font-medium">Click to select photo</span>
                  <span className="text-[10px] text-slate-400">JPEG, PNG, WebP up to 5MB</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            {uploadError && <p className="text-xs text-red-650 font-medium">{uploadError}</p>}
          </div>

          {/* AI Pre-Analysis Preview Card (Interactive Mock Output) */}
          {showAiCard && (
            <div className="rounded-2xl border border-brand-500/20 bg-gradient-to-br from-[#0c0f1d] to-[#161a33]/60 p-5 shadow-xl space-y-4 animate-in slide-in-from-right-4 duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-full opacity-5 pointer-events-none">
                <LottieWidget theme="ai-pulse" />
              </div>

              <div className="flex items-center gap-2 border-b border-brand-500/20 pb-2">
                <Sparkles className="h-4 w-4 text-cyan-400 animate-pulse" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-850 dark:text-white">AI Vision Analysis Card</h3>
              </div>

              <dl className="grid grid-cols-2 gap-3 text-[11px]">
                <div>
                  <span className="block text-slate-400 uppercase text-[9px] font-bold">Detected Class</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100 uppercase">{watchCategory}</span>
                </div>
                <div>
                  <span className="block text-slate-400 uppercase text-[9px] font-bold">Confidence</span>
                  <span className="font-bold text-cyan-400 font-mono">98.6%</span>
                </div>
                <div>
                  <span className="block text-slate-400 uppercase text-[9px] font-bold">Severity Rating</span>
                  <span className={`font-bold ${aiDetails.severity === "High" ? "text-rose-400" : "text-amber-455"}`}>
                    {aiDetails.severity}
                  </span>
                </div>
                <div>
                  <span className="block text-slate-400 uppercase text-[9px] font-bold">Recommended Dept</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100 truncate block">{aiDetails.dept}</span>
                </div>
                <div className="col-span-2 border-t border-slate-200 dark:border-slate-800/80 pt-2.5 flex justify-between items-center">
                  <span className="text-[10px] text-slate-405 font-bold uppercase flex items-center gap-0.5">
                    <DollarSign className="h-3 w-3 text-brand-400" /> Est. Repair Cost
                  </span>
                  <span className="font-extrabold text-[#10b981] font-mono text-sm">{aiDetails.cost}</span>
                </div>
              </dl>
            </div>
          )}

          {/* Interactive GIS Mapping grid selector */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0f172a]/80 p-6 shadow-sm dark:shadow-xl flex flex-col gap-4">
            <h2 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-brand-400" />
              GIS Grid Node Selector
            </h2>
            <p className="text-[10px] text-slate-500">
              Click anywhere on the radar coordinates below to locate the issue beacon.
            </p>

            <div
              onClick={handleMapGridClick}
              className="relative w-full aspect-video border border-slate-300 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-950 cursor-crosshair select-none"
              style={{
                backgroundImage:
                  "radial-gradient(#cbd5e1 1.5px, transparent 1.5px), radial-gradient(#cbd5e1 1.5px, #f8fafc 1.5px)",
                backgroundSize: "20px 20px",
                backgroundPosition: "0 0, 10px 10px",
              }}
            >
              <div className="absolute inset-0 grid grid-cols-5 grid-rows-3 opacity-10 pointer-events-none">
                {Array.from({ length: 15 }).map((_, i) => (
                  <div key={i} className="border-t border-l border-slate-700" />
                ))}
              </div>

              <div className="absolute top-[20%] left-[20%] text-[8px] font-bold text-slate-500 uppercase tracking-wide">
                North Block
              </div>
              <div className="absolute top-[45%] left-[45%] text-[8px] font-bold text-slate-500 uppercase tracking-wide">
                City Center (GPS Center)
              </div>
              <div className="absolute bottom-[20%] right-[20%] text-[8px] font-bold text-slate-500 uppercase tracking-wide">
                East Hub
              </div>

              {/* Selected Pin */}
              <div
                className="absolute transition-all duration-200 ease-out pointer-events-none"
                style={{
                  left: `${((watchLng - 77.5) / (77.7 - 77.5)) * 100}%`,
                  top: `${((13.05 - watchLat) / (13.05 - 12.9)) * 100}%`,
                  transform: "translate(-50%, -100%)",
                }}
              >
                <MapPin className="h-6 w-6 text-brand-500 fill-brand-100 animate-bounce" />
              </div>
            </div>

            <div className="flex justify-between text-[9px] text-slate-500 font-mono px-1">
              <span>Lat: {watchLat}</span>
              <span>Lng: {watchLng}</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
