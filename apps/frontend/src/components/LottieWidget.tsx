import React, { useEffect, useRef } from "react";

export type LottieTheme =
  | "ai-pulse"
  | "city-radar"
  | "success-check"
  | "analytics-chart"
  | "empty-box"
  | "loading-spinner";

export interface LottieWidgetProps {
  /** Pre-built high-performance animated vector theme */
  theme?: LottieTheme;
  className?: string;
  width?: number | string;
  height?: number | string;
}

/**
 * Lightweight Canvas-based micro-animation widget for CivicVision AI.
 *
 * This previously also supported `lottie-react` and `@lottiefiles/dotlottie-react`
 * for rendering external Lottie files via `src`/`animationData` props — but
 * nothing in the codebase ever passed those props (confirmed by grepping
 * every usage), so those two libraries were pure dead weight: imported
 * unconditionally, never exercised, and one of them (lottie-web, underneath
 * lottie-react) was the source of a build-time eval() security warning.
 * Removed entirely rather than kept "just in case."
 */
export const LottieWidget: React.FC<LottieWidgetProps> = ({
  theme = "ai-pulse",
  className = "",
  width = "100%",
  height = "100%",
}) => {
  return <BuiltInThemeAnimation theme={theme} className={className} width={width} height={height} />;
};

interface BuiltInProps {
  theme: LottieTheme;
  className?: string;
  width?: number | string;
  height?: number | string;
}

const BuiltInThemeAnimation: React.FC<BuiltInProps> = ({ theme, className, width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const render = () => {
      time += 0.03;
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;

      ctx.clearRect(0, 0, w, h);

      if (theme === "ai-pulse") {
        // Futuristic AI Neural Pulse
        for (let i = 0; i < 3; i++) {
          const radius = ((time * 15 + i * 25) % 60) + 10;
          const alpha = Math.max(0, 1 - radius / 70);
          ctx.beginPath();
          ctx.arc(cx, cy, radius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(14, 165, 233, ${alpha})`;
          ctx.lineWidth = 2.5;
          ctx.stroke();
        }

        // Inner glowing AI core
        const coreGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 25);
        coreGlow.addColorStop(0, "rgba(56, 189, 248, 0.9)");
        coreGlow.addColorStop(0.5, "rgba(14, 165, 233, 0.4)");
        coreGlow.addColorStop(1, "rgba(14, 165, 233, 0)");
        ctx.fillStyle = coreGlow;
        ctx.beginPath();
        ctx.arc(cx, cy, 25, 0, Math.PI * 2);
        ctx.fill();

        // Center neural node
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(cx, cy, 5 + Math.sin(time * 3) * 1.5, 0, Math.PI * 2);
        ctx.fill();
      } else if (theme === "city-radar") {
        // Rotating City Infrastructure Radar
        ctx.strokeStyle = "rgba(16, 185, 129, 0.2)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy, 35, 0, Math.PI * 2);
        ctx.arc(cx, cy, 55, 0, Math.PI * 2);
        ctx.stroke();

        // Radar sweep
        const angle = time * 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, 55, angle, angle + 0.6);
        ctx.closePath();
        ctx.fillStyle = "rgba(16, 185, 129, 0.15)";
        ctx.fill();

        // Active issue blips
        const blips = [
          { x: cx + 25 * Math.cos(time * 0.5), y: cy + 25 * Math.sin(time * 0.5), color: "#f59e0b" },
          { x: cx - 35 * Math.cos(time * 0.3), y: cy + 20 * Math.sin(time * 0.3), color: "#ef4444" },
          { x: cx + 15 * Math.cos(-time * 0.7), y: cy - 40 * Math.sin(-time * 0.7), color: "#10b981" },
        ];
        blips.forEach((b) => {
          ctx.fillStyle = b.color;
          ctx.beginPath();
          ctx.arc(b.x, b.y, 3, 0, Math.PI * 2);
          ctx.fill();
        });
      } else if (theme === "analytics-chart") {
        // Animated equalizer / metric bars
        const bars = 5;
        const barWidth = 10;
        const spacing = 6;
        const totalW = bars * (barWidth + spacing) - spacing;
        const startX = cx - totalW / 2;

        for (let i = 0; i < bars; i++) {
          const barH = 20 + Math.abs(Math.sin(time * 2 + i * 0.8)) * 40;
          const x = startX + i * (barWidth + spacing);
          const y = cy + 30 - barH;

          const grad = ctx.createLinearGradient(x, y, x, cy + 30);
          grad.addColorStop(0, "#38bdf8");
          grad.addColorStop(1, "#3b82f6");

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, barH, 3);
          ctx.fill();
        }
      } else if (theme === "success-check") {
        // Pulsing green checkmark circle
        ctx.strokeStyle = "#10b981";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(cx, cy, 30 + Math.sin(time * 2) * 2, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = "#059669";
        ctx.lineWidth = 4;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        ctx.moveTo(cx - 12, cy);
        ctx.lineTo(cx - 3, cy + 9);
        ctx.lineTo(cx + 14, cy - 8);
        ctx.stroke();
      } else if (theme === "empty-box") {
        // Floating empty state box with gentle bob
        const offsetY = Math.sin(time * 1.5) * 5;
        ctx.strokeStyle = "#94a3b8";
        ctx.lineWidth = 2;
        ctx.strokeRect(cx - 25, cy - 20 + offsetY, 50, 40);
        ctx.beginPath();
        ctx.moveTo(cx - 25, cy - 5 + offsetY);
        ctx.lineTo(cx - 10, cy + 5 + offsetY);
        ctx.lineTo(cx + 10, cy + 5 + offsetY);
        ctx.lineTo(cx + 25, cy - 5 + offsetY);
        ctx.stroke();
      } else {
        // Loading Spinner
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(cx, cy, 25, time * 3, time * 3 + Math.PI * 1.2);
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme]);

  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      style={{ width, height }}
    >
      <canvas
        ref={canvasRef}
        width={160}
        height={160}
        className="w-full h-full object-contain"
      />
    </div>
  );
};
