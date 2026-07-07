import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Play, Pause, ShieldAlert, Sparkles, TrendingUp, Zap, Target } from "lucide-react";
import { Button } from "@civicvision/shared-ui";
import { LottieWidget } from "@/components/LottieWidget";

interface Building {
  x: number;
  z: number;
  w: number;
  h: number;
  d: number;
  color: string;
}

interface TrafficParticle {
  x: number;
  z: number;
  speed: number;
  color: string;
  roadIndex: number;
  direction: number;
}

interface CivicIssue {
  id: string;
  x: number;
  z: number;
  type: string;
  confidence: number;
  status: "PENDING" | "IN_PROGRESS" | "RESOLVED";
  color: string;
}

const mockIssues: CivicIssue[] = [
  { id: "1", x: -80, z: 60, type: "POTHOLE", confidence: 97.4, status: "PENDING", color: "#38bdf8" },
  { id: "2", x: 60, z: -40, type: "GARBAGE", confidence: 92.8, status: "IN_PROGRESS", color: "#a855f7" },
  { id: "3", x: -20, z: -80, type: "STREETLIGHT", confidence: 98.9, status: "RESOLVED", color: "#eab308" },
  { id: "4", x: 90, z: 90, type: "WATER_LEAKAGE", confidence: 94.5, status: "PENDING", color: "#10b981" },
];

export function HomePage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [cinematicMode, setCinematicMode] = useState(false);
  const [activeIssue, setActiveIssue] = useState<CivicIssue | null>(null);
  const [scannerLog, setScannerLog] = useState<string[]>([
    "Initializing computer-vision neural network...",
    "YOLOv11 backend online. Precision: mAP@0.5:0.95 = 0.89",
    "Loaded GIS base grid mapping...",
    "System listening for citizen reporting telemetry..."
  ]);

  // 3D Camera State
  const camPos = useRef({ x: 0, y: 150, z: 280 });
  const camRot = useRef({ yaw: 0.2, pitch: -0.45 });
  const targetCamPos = useRef({ x: 0, y: 150, z: 280 });
  const targetCamRot = useRef({ yaw: 0.2, pitch: -0.45 });
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const dragStartRot = useRef({ yaw: 0, pitch: 0 });

  // Generate buildings and traffic
  const buildings = useRef<Building[]>([]);
  const traffic = useRef<TrafficParticle[]>([]);
  const animationFrameId = useRef<number | null>(null);

  useEffect(() => {
    // Generate stylized procedural grid buildings
    const list: Building[] = [];
    const colors = ["#1e293b", "#334155", "#0f172a", "#1e1b4b", "#311042"];
    
    // Create rows and columns of buildings (city block style)
    for (let x = -150; x <= 150; x += 50) {
      for (let z = -150; z <= 150; z += 50) {
        // Leave gaps for roads
        if (Math.abs(x) < 20 || Math.abs(z) < 20) continue;
        
        // Randomize height and width slightly
        if (Math.random() > 0.3) {
          const w = 25 + Math.random() * 15;
          const d = 25 + Math.random() * 15;
          const h = 40 + Math.random() * 110;
          const color = colors[Math.floor(Math.random() * colors.length)];
          list.push({ x, z, w, h, d, color });
        }
      }
    }
    buildings.current = list;

    // Generate traffic particles flowing on roads
    const particles: TrafficParticle[] = [];
    for (let i = 0; i < 40; i++) {
      const roadIndex = Math.random() > 0.5 ? 1 : 0;
      particles.push({
        x: roadIndex === 0 ? 0 : (Math.random() * 400 - 200),
        z: roadIndex === 1 ? 0 : (Math.random() * 400 - 200),
        speed: 1.5 + Math.random() * 2,
        color: Math.random() > 0.5 ? "#22d3ee" : "#f43f5e",
        roadIndex,
        direction: Math.random() > 0.5 ? 1 : -1,
      });
    }
    traffic.current = particles;

    // Periodically update logs for UI flavor
    const logInterval = setInterval(() => {
      const msgs = [
        `Telemetry scan node [${Math.floor(Math.random() * 100)}]: active`,
        `Analyzing frames: no defects detected`,
        `YOLOv11: detected confidence threshold match: ${Math.floor(Math.random() * 10 + 90)}%`,
        `Redis geospatial cluster check: OK`,
        `Active feedback loop training queue: processed 1 correction`,
      ];
      setScannerLog(prev => [...prev.slice(1), msgs[Math.floor(Math.random() * msgs.length)]]);
    }, 4500);

    return () => clearInterval(logInterval);
  }, []);

  // Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = canvas.clientWidth;
    let height = canvas.clientHeight;
    canvas.width = width;
    canvas.height = height;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width;
      canvas.height = height;
    };
    window.addEventListener("resize", handleResize);

    const render = () => {
      if (!ctx || !canvas) return;

      // Dark futuristic space background
      ctx.fillStyle = "#020617";
      ctx.fillRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      // Smooth camera interpolation
      if (cinematicMode) {
        // Rotate camera automatically in cinematic mode
        const time = Date.now() * 0.0003;
        // Sweep camera through focus coordinates
        const issue = mockIssues[Math.floor((Date.now() / 4000) % mockIssues.length)];
        setActiveIssue(issue);
        
        targetCamPos.current = {
          x: issue.x + Math.sin(time) * 120,
          y: 90 + Math.cos(time * 0.5) * 40,
          z: issue.z + Math.cos(time) * 120,
        };

        // Aim at the issue
        const dx = issue.x - targetCamPos.current.x;
        const dz = issue.z - targetCamPos.current.z;
        targetCamRot.current.yaw = Math.atan2(dx, dz);
        targetCamRot.current.pitch = -0.3;
      } else if (!isDragging.current) {
        // Slow auto rotation in normal mode
        targetCamRot.current.yaw += 0.001;
      }

      // Interpolate cam positions
      camPos.current.x += (targetCamPos.current.x - camPos.current.x) * 0.05;
      camPos.current.y += (targetCamPos.current.y - camPos.current.y) * 0.05;
      camPos.current.z += (targetCamPos.current.z - camPos.current.z) * 0.05;

      camRot.current.yaw += (targetCamRot.current.yaw - camRot.current.yaw) * 0.05;
      camRot.current.pitch += (targetCamRot.current.pitch - camRot.current.pitch) * 0.05;

      // Projection Math
      const project = (x: number, y: number, z: number) => {
        const dx = x - camPos.current.x;
        const dy = y - camPos.current.y;
        const dz = z - camPos.current.z;

        const cosYaw = Math.cos(camRot.current.yaw);
        const sinYaw = Math.sin(camRot.current.yaw);
        const cosPitch = Math.cos(camRot.current.pitch);
        const sinPitch = Math.sin(camRot.current.pitch);

        const rx = dx * cosYaw - dz * sinYaw;
        const rz = dx * sinYaw + dz * cosYaw;

        const ry = dy * cosPitch - rz * sinPitch;
        const rzFinal = dy * sinPitch + rz * cosPitch;

        if (rzFinal <= 5) return null;

        const fov = 380;
        const scale = fov / rzFinal;
        return {
          x: centerX + rx * scale,
          y: centerY - ry * scale,
          scale,
          depth: rzFinal,
        };
      };

      // Draw Grid / Ground Roads
      ctx.strokeStyle = "rgba(30, 41, 59, 0.4)";
      ctx.lineWidth = 1;
      for (let i = -200; i <= 200; i += 20) {
        // Draw grid lines
        const p1 = project(i, 0, -200);
        const p2 = project(i, 0, 200);
        if (p1 && p2) {
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }

        const p3 = project(-200, 0, i);
        const p4 = project(200, 0, i);
        if (p3 && p4) {
          ctx.beginPath();
          ctx.moveTo(p3.x, p3.y);
          ctx.lineTo(p4.x, p4.y);
          ctx.stroke();
        }
      }

      // Draw Main Roads (Glow effect)
      ctx.strokeStyle = "rgba(99, 102, 241, 0.15)";
      ctx.lineWidth = 4;
      const roadN1 = project(0, 0, -200);
      const roadN2 = project(0, 0, 200);
      if (roadN1 && roadN2) {
        ctx.beginPath();
        ctx.moveTo(roadN1.x, roadN1.y);
        ctx.lineTo(roadN2.x, roadN2.y);
        ctx.stroke();
      }

      const roadE1 = project(-200, 0, 0);
      const roadE2 = project(200, 0, 0);
      if (roadE1 && roadE2) {
        ctx.beginPath();
        ctx.moveTo(roadE1.x, roadE1.y);
        ctx.lineTo(roadE2.x, roadE2.y);
        ctx.stroke();
      }

      // Draw Traffic Particles
      traffic.current.forEach(p => {
        // Move particle
        if (p.roadIndex === 0) {
          p.z += p.speed * p.direction;
          if (p.z > 200) p.z = -200;
          if (p.z < -200) p.z = 200;
        } else {
          p.x += p.speed * p.direction;
          if (p.x > 200) p.x = -200;
          if (p.x < -200) p.x = 200;
        }

        const screenPos = project(p.x, 0, p.z);
        if (screenPos) {
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(screenPos.x, screenPos.y, Math.max(1, screenPos.scale * 1.5), 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Sort buildings by distance (back to front depth buffer)
      const projectedBuildings = buildings.current
        .map(b => {
          const proj = project(b.x, 0, b.z);
          return { b, proj };
        })
        .filter(item => item.proj !== null)
        .sort((a, b) => b.proj!.depth - a.proj!.depth);

      // Render Buildings
      projectedBuildings.forEach(({ b }) => {
        // Projected corners of the building
        const halfW = b.w / 2;
        const halfD = b.d / 2;

        const corners = [
          project(b.x - halfW, 0, b.z - halfD), // bottom back-left
          project(b.x + halfW, 0, b.z - halfD), // bottom back-right
          project(b.x + halfW, 0, b.z + halfD), // bottom front-right
          project(b.x - halfW, 0, b.z + halfD), // bottom front-left
          project(b.x - halfW, b.h, b.z - halfD), // top back-left
          project(b.x + halfW, b.h, b.z - halfD), // top back-right
          project(b.x + halfW, b.h, b.z + halfD), // top front-right
          project(b.x - halfW, b.h, b.z + halfD), // top front-left
        ];

        // Draw solid structure
        if (corners.every(c => c !== null)) {
          // Base filling
          ctx.fillStyle = "rgba(15, 23, 42, 0.8)";
          ctx.beginPath();
          ctx.moveTo(corners[0]!.x, corners[0]!.y);
          ctx.lineTo(corners[1]!.x, corners[1]!.y);
          ctx.lineTo(corners[2]!.x, corners[2]!.y);
          ctx.lineTo(corners[3]!.x, corners[3]!.y);
          ctx.closePath();
          ctx.fill();

          // Draw building faces
          // Front face (2, 3, 7, 6)
          ctx.fillStyle = b.color;
          ctx.beginPath();
          ctx.moveTo(corners[3]!.x, corners[3]!.y);
          ctx.lineTo(corners[2]!.x, corners[2]!.y);
          ctx.lineTo(corners[6]!.x, corners[6]!.y);
          ctx.lineTo(corners[7]!.x, corners[7]!.y);
          ctx.closePath();
          ctx.fill();

          // Side face (1, 2, 6, 5)
          ctx.fillStyle = "rgba(30, 41, 59, 0.95)";
          ctx.beginPath();
          ctx.moveTo(corners[2]!.x, corners[2]!.y);
          ctx.lineTo(corners[1]!.x, corners[1]!.y);
          ctx.lineTo(corners[5]!.x, corners[5]!.y);
          ctx.lineTo(corners[6]!.x, corners[6]!.y);
          ctx.closePath();
          ctx.fill();

          // Top face (4, 5, 6, 7)
          ctx.fillStyle = "rgba(51, 65, 85, 0.9)";
          ctx.beginPath();
          ctx.moveTo(corners[7]!.x, corners[7]!.y);
          ctx.lineTo(corners[6]!.x, corners[6]!.y);
          ctx.lineTo(corners[5]!.x, corners[5]!.y);
          ctx.lineTo(corners[4]!.x, corners[4]!.y);
          ctx.closePath();
          ctx.fill();

          // Glowing wireframe outlines
          ctx.strokeStyle = "rgba(99, 102, 241, 0.25)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(corners[4]!.x, corners[4]!.y);
          ctx.lineTo(corners[5]!.x, corners[5]!.y);
          ctx.lineTo(corners[6]!.x, corners[6]!.y);
          ctx.lineTo(corners[7]!.x, corners[7]!.y);
          ctx.closePath();
          ctx.stroke();

          // Draw vertical support lines
          ctx.beginPath();
          ctx.moveTo(corners[3]!.x, corners[3]!.y);
          ctx.lineTo(corners[7]!.x, corners[7]!.y);
          ctx.moveTo(corners[2]!.x, corners[2]!.y);
          ctx.lineTo(corners[6]!.x, corners[6]!.y);
          ctx.moveTo(corners[1]!.x, corners[1]!.y);
          ctx.lineTo(corners[5]!.x, corners[5]!.y);
          ctx.stroke();
        }
      });

      // Render Glowing Issue Beacons
      mockIssues.forEach(issue => {
        const base = project(issue.x, 0, issue.z);
        if (!base) return;

        const pulse = 1 + Math.abs(Math.sin(Date.now() * 0.003)) * 0.8;
        const ringSize = base.scale * 12 * pulse;

        // Draw pulsing base rings
        ctx.strokeStyle = issue.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(base.x, base.y, ringSize, ringSize * 0.45, 0, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = `${issue.color}33`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(base.x, base.y, ringSize * 1.8, ringSize * 0.81, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Glowing Core Tower / Light Beam
        const top = project(issue.x, 60, issue.z);
        if (top) {
          const grad = ctx.createLinearGradient(base.x, base.y, top.x, top.y);
          grad.addColorStop(0, `${issue.color}bb`);
          grad.addColorStop(1, `${issue.color}00`);
          
          ctx.strokeStyle = grad;
          ctx.lineWidth = base.scale * 4;
          ctx.beginPath();
          ctx.moveTo(base.x, base.y);
          ctx.lineTo(top.x, top.y);
          ctx.stroke();
        }

        // Active issue tooltip anchor
        if (activeIssue?.id === issue.id) {
          ctx.fillStyle = issue.color;
          ctx.beginPath();
          ctx.arc(base.x, base.y, 4, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      animationFrameId.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [cinematicMode, activeIssue]);

  // Mouse Interaction Handlers for rotating city twin
  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY };
    dragStartRot.current = { yaw: camRot.current.yaw, pitch: camRot.current.pitch };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    setCinematicMode(false); // Stop cinema flight path on interaction
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;

    targetCamRot.current.yaw = dragStartRot.current.yaw - dx * 0.005;
    targetCamRot.current.pitch = Math.max(-1.4, Math.min(-0.1, dragStartRot.current.pitch - dy * 0.005));
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const triggerCinematic = () => {
    setCinematicMode(prev => !prev);
  };

  return (
    <div className="min-h-screen bg-[#070913] text-slate-100 font-sans selection:bg-brand-500 selection:text-white overflow-x-hidden relative">
      {/* Premium Ambient Background Grid & Glowing Meshes */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0d1127_1px,transparent_1px),linear-gradient(to_bottom,#0d1127_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-35 pointer-events-none z-0" />
      
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[60%] h-[50%] rounded-full bg-brand-900/10 blur-[130px] animate-pulse-glowing" style={{ animationDuration: "6s" }} />
        <div className="absolute top-[30%] -right-[10%] w-[70%] h-[60%] rounded-full bg-cyan-900/10 blur-[150px] animate-pulse-glowing" style={{ animationDuration: "8s" }} />
        <div className="absolute bottom-[10%] left-[20%] w-[50%] h-[40%] rounded-full bg-indigo-900/10 blur-[120px] animate-pulse-glowing" style={{ animationDuration: "10s" }} />
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-20 relative z-10 grid lg:grid-cols-12 gap-12 items-center min-h-[calc(100vh-80px)]">
        {/* Left Column: UI & Text Copy */}
        <div className="lg:col-span-6 flex flex-col justify-center space-y-8">
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-brand-500/20 bg-brand-950/40 text-brand-300 text-xs font-semibold tracking-wider uppercase w-fit shadow-[0_0_15px_rgba(59,130,246,0.1)] backdrop-blur-md animate-floating">
            <LottieWidget theme="ai-pulse" width={18} height={18} className="shrink-0" />
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              AI Powered Civic Infrastructure Reporting
            </span>
          </div>

          <div className="space-y-4">
            <h1 className="text-5xl font-extrabold tracking-tight text-white lg:text-6xl leading-[1.15] drop-shadow-lg">
              Automated City<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-brand-400 to-indigo-400">
                Triage
              </span>
            </h1>
            
            <div className="text-2xl font-extrabold text-white space-y-2 tracking-tight">
              <div className="text-slate-300 font-bold">Detect. <span className="text-cyan-400">Report.</span></div>
              <div className="text-slate-300 font-bold">Track. <span className="text-emerald-400">Resolve.</span></div>
            </div>
          </div>

          {/* Slogan Keywords with custom animations */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "Detect.", desc: "Computer vision", color: "text-cyan-300", icon: Target, border: "border-cyan-500/40 hover:bg-cyan-500/10" },
              { label: "Report.", desc: "Instant upload", color: "text-brand-300", icon: Sparkles, border: "border-brand-500/40 hover:bg-brand-500/10" },
              { label: "Track.", desc: "Live GIS Map", color: "text-indigo-300", icon: TrendingUp, border: "border-indigo-500/40 hover:bg-indigo-500/10" },
              { label: "Resolve.", desc: "Auto SLA", color: "text-emerald-300", icon: Zap, border: "border-emerald-500/40 hover:bg-emerald-500/10" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className={`flex flex-col p-4 rounded-xl border border-slate-700 bg-[#0c1022]/80 backdrop-blur-md ${item.border} hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(99,102,241,0.15)] transition-all duration-300 cursor-default group`}
                >
                  <Icon className={`h-5 w-5 ${item.color} mb-2 group-hover:scale-110 transition-transform`} />
                  <span className={`text-xs font-bold ${item.color}`}>{item.label}</span>
                  <span className="text-[9px] text-slate-400 mt-1 font-medium">{item.desc}</span>
                </div>
              );
            })}
          </div>

          <p className="text-base text-slate-300 leading-relaxed max-w-xl font-medium">
            Report road damage, garbage, water leakages, streetlight failures and more using AI-powered visual analysis and real-time GIS mapping.
          </p>

          <div className="flex flex-wrap gap-4 items-center pt-4">
            <Link to="/issues/report">
              <Button className="!bg-gradient-to-r !from-cyan-500 !to-brand-500 hover:!from-cyan-600 hover:!to-brand-600 text-white font-extrabold px-7 py-3 rounded-xl transition-all duration-300 shadow-[0_6px_24px_rgba(34,211,238,0.35)] hover:scale-105 active:scale-95 flex items-center gap-2 border-none text-sm uppercase tracking-wide">
                <Sparkles className="h-5 w-5" />
                Report Issue
              </Button>
            </Link>
            <Link to="/map">
              <Button className="!bg-slate-900 !border-slate-700 hover:!bg-slate-800 hover:!border-slate-600 text-slate-100 font-bold px-7 py-3 rounded-xl transition-all duration-300 border hover:scale-105 active:scale-95 text-sm">
                Explore Map
              </Button>
            </Link>

            {/* Cinematic animated mode button */}
            <button
              onClick={triggerCinematic}
              className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 flex items-center gap-2 border cursor-pointer hover:scale-105 active:scale-95 text-sm uppercase tracking-wide ${
                cinematicMode
                  ? "bg-brand-950/70 border-brand-400 text-brand-200 shadow-[0_0_20px_rgba(59,130,246,0.25)]"
                  : "bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800 hover:border-slate-600"
              }`}
            >
              {cinematicMode ? (
                <>
                  <Pause className="h-5 w-5 text-brand-400 animate-pulse" />
                  <span>Flight On</span>
                </>
              ) : (
                <>
                  <Play className="h-5 w-5 text-slate-400" />
                  <span>Cinematic</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: 3D Twin Viewport */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          <div className="h-[500px] w-full relative rounded-2xl border border-slate-700 bg-[#05070e] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.8)] group">
            {/* Sci-fi corner brackets */}
            <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-cyan-500/70 z-10 pointer-events-none" />
            <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-cyan-500/70 z-10 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-cyan-500/70 z-10 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-cyan-500/70 z-10 pointer-events-none" />

            {/* Canvas */}
            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className="w-full h-full cursor-grab active:cursor-grabbing relative z-0"
            />

            {/* Interactive UI Overlays */}
            <div className="absolute top-4 left-4 pointer-events-none z-10 flex flex-col gap-2">
              <div className="px-4 py-2 rounded-lg bg-[#070913]/95 border border-cyan-500/40 text-[11px] text-cyan-300 font-mono font-bold flex items-center gap-2 backdrop-blur-md shadow-lg tracking-widest uppercase">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                3D DIGITAL TWIN SCANNER
              </div>
            </div>

            <div className="absolute top-4 right-4 pointer-events-auto z-10 flex gap-2 flex-wrap justify-end">
              {mockIssues.map(issue => (
                <button
                  key={issue.id}
                  onClick={() => {
                    setCinematicMode(false);
                    setActiveIssue(issue);
                    // Snap camera to focus on selected issue
                    targetCamPos.current = { x: issue.x, y: 70, z: issue.z + 110 };
                    targetCamRot.current.yaw = 0;
                    targetCamRot.current.pitch = -0.45;
                  }}
                  className={`p-2.5 rounded-lg border text-[11px] font-bold font-mono transition-all duration-300 cursor-pointer backdrop-blur-md hover:scale-110 active:scale-95 uppercase tracking-wide ${
                    activeIssue?.id === issue.id
                      ? "bg-slate-900/90 border-cyan-400 text-cyan-300 shadow-[0_0_16px_rgba(34,211,238,0.3)]"
                      : "bg-[#070913]/80 border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600"
                  }`}
                >
                  {issue.type.slice(0, 3)}
                </button>
              ))}
            </div>

            {/* Floating Glassmorphic HUD Detections Details */}
            {activeIssue && (
              <div className="absolute bottom-4 left-4 right-4 p-5 rounded-xl border border-slate-700/80 bg-[#070913]/95 backdrop-blur-lg z-10 flex flex-col transition-all duration-300 shadow-2xl space-y-3 hover:bg-[#0a0e1a]/95">
                <div className="flex items-center justify-between border-b border-slate-700/50 pb-3">
                  <span className="text-xs font-bold text-slate-200 flex items-center gap-2 uppercase tracking-wide">
                    <ShieldAlert className="h-5 w-5 shrink-0" style={{ color: activeIssue.color }} />
                    {activeIssue.type}
                  </span>
                  <span className="text-xs px-3 py-1 rounded-full font-extrabold font-mono bg-slate-800 text-slate-200" style={{ borderColor: activeIssue.color, borderWidth: "1px" }}>
                    {activeIssue.confidence}% CONF
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3 text-xs font-mono text-slate-300">
                  <div>
                    <span className="block text-slate-500 text-[10px] font-bold uppercase mb-1">Node ID</span>
                    <span className="font-semibold">GIS_{(10 + parseInt(activeIssue.id)) * 3}</span>
                  </div>
                  <div>
                    <span className="block text-slate-500 text-[10px] font-bold uppercase mb-1">Status</span>
                    <span className={`font-bold ${activeIssue.status === "RESOLVED" ? "text-emerald-400" : activeIssue.status === "IN_PROGRESS" ? "text-cyan-400" : "text-amber-400"}`}>
                      {activeIssue.status}
                    </span>
                  </div>
                  <div>
                    <span className="block text-slate-500 text-[10px] font-bold uppercase mb-1">Coords</span>
                    <span className="font-semibold">{activeIssue.x.toFixed(1)}m, {activeIssue.z.toFixed(1)}m</span>
                  </div>
                </div>
              </div>
            )}

            {/* Console logger output on the side for visual flavor */}
            <div className="absolute bottom-4 right-4 max-w-[220px] pointer-events-none select-none z-10 hidden sm:flex flex-col gap-1.5 p-3 rounded-lg border border-slate-800 bg-[#070913]/85 backdrop-blur-sm">
              {scannerLog.map((log, index) => (
                <span key={index} className="text-[9px] font-mono text-slate-500 line-clamp-1 leading-relaxed">
                  {index === scannerLog.length - 1 ? <span className="text-cyan-400">→</span> : <span className="text-slate-700">•</span>} {log}
                </span>
              ))}
            </div>
          </div>

          {/* Premium Operations Telemetry Stats Ticker */}
          <div className="grid grid-cols-4 gap-3 p-4 bg-gradient-to-r from-slate-900/60 to-slate-950/60 border border-slate-700/80 rounded-xl backdrop-blur-md shadow-lg">
            {[
              { label: "Scanners", value: "42", unit: "ACTIVE", color: "text-cyan-400", icon: "📡" },
              { label: "Avg Latency", value: "890", unit: "ms", color: "text-brand-400", icon: "⚡" },
              { label: "Precision", value: "98.4", unit: "%", color: "text-emerald-400", icon: "✓" },
              { label: "SLA Target", value: "92.1", unit: "%", color: "text-indigo-400", icon: "🎯" },
            ].map((stat) => (
              <div key={stat.label} className="text-center space-y-1.5">
                <div className="text-2xl">{stat.icon}</div>
                <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">{stat.label}</div>
                <div className={`text-lg font-extrabold ${stat.color} font-mono`}>
                  {stat.value} <span className="text-xs text-slate-400 font-semibold">{stat.unit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer / App Details */}
      <div className="border-t border-slate-900 bg-[#070913]/60 py-8 relative z-10 text-center text-xs text-slate-500">
        <p>© 2026 CivicVision AI Platform. Certified computer-vision detection systems. Geospatial infrastructure telemetry.</p>
      </div>
    </div>
  );
}
