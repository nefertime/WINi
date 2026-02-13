"use client";

import { useEffect, useRef, useCallback } from "react";

type Connection = {
  fromId: string;
  toId: string;
  score: number;
  color?: string;
};

type ConnectionLinesProps = {
  connections: Connection[];
  containerRef: React.RefObject<HTMLDivElement | null>;
  intensity?: number;
};

type Particle = {
  t: number;
  speed: number;
  opacity: number;
  size: number;
};

type Point = { x: number; y: number; w: number; h: number };

type LineData = {
  from: Point;
  to: Point;
  color: string;
  particles: Particle[];
};

function bezier(
  x0: number, y0: number,
  cx1: number, cy1: number,
  cx2: number, cy2: number,
  x3: number, y3: number,
  t: number
): [number, number] {
  const u = 1 - t;
  return [
    u * u * u * x0 + 3 * u * u * t * cx1 + 3 * u * t * t * cx2 + t * t * t * x3,
    u * u * u * y0 + 3 * u * u * t * cy1 + 3 * u * t * t * cy2 + t * t * t * y3,
  ];
}

function isFiniteNum(n: number): boolean {
  return Number.isFinite(n);
}

export default function ConnectionLines({
  connections,
  containerRef,
  intensity = 0.5,
}: ConnectionLinesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const linesRef = useRef<Map<string, LineData>>(new Map());
  const animRef = useRef<number>(0);

  const getLines = useCallback((): LineData[] => {
    const container = containerRef.current;
    if (!container) return [];

    const cr = container.getBoundingClientRect();
    const result: LineData[] = [];

    for (const conn of connections) {
      const fromEl = document.getElementById(conn.fromId);
      const toEl = document.getElementById(conn.toId);
      if (!fromEl || !toEl) continue;

      const fr = fromEl.getBoundingClientRect();
      const tr = toEl.getBoundingClientRect();

      const from: Point = {
        x: fr.left - cr.left,
        y: fr.top - cr.top,
        w: fr.width,
        h: fr.height,
      };
      const to: Point = {
        x: tr.left - cr.left,
        y: tr.top - cr.top,
        w: tr.width,
        h: tr.height,
      };

      // Skip if any coordinate is non-finite
      if (!isFiniteNum(from.x) || !isFiniteNum(from.y) || !isFiniteNum(to.x) || !isFiniteNum(to.y)) continue;

      const key = `${conn.fromId}-${conn.toId}`;
      const existing = linesRef.current.get(key);

      const particleCount = Math.floor(4 + intensity * 8);
      const particles: Particle[] = existing?.particles ?? Array.from({ length: particleCount }, () => ({
        t: Math.random(),
        speed: 0.002 + Math.random() * 0.004 * (1 + intensity * 0.3),
        opacity: 0.3 + Math.random() * 0.5,
        size: 1.5 + Math.random() * 2,
      }));

      const lineData: LineData = {
        from,
        to,
        color: conn.color || "#9B2335",
        particles,
      };

      linesRef.current.set(key, lineData);
      result.push(lineData);
    }

    return result;
  }, [connections, containerRef, intensity]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);

    const animate = () => {
      const rect = container.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);

      const lines = getLines();

      for (const line of lines) {
        // Always connect inner edges: whichever element is more left uses its right edge, the other uses its left edge
        const fromIsLeft = line.from.x < line.to.x;
        const fx = fromIsLeft ? line.from.x + line.from.w : line.from.x;
        const fy = line.from.y + line.from.h / 2;
        const tx = fromIsLeft ? line.to.x : line.to.x + line.to.w;
        const ty = line.to.y + line.to.h / 2;

        if (!isFiniteNum(fx) || !isFiniteNum(fy) || !isFiniteNum(tx) || !isFiniteNum(ty)) continue;

        const dx = tx - fx;
        const now = Date.now();
        const cx1 = fx + dx * 0.35;
        const cy1 = fy - 8 + Math.sin(now * 0.0008) * 3;
        const cx2 = tx - dx * 0.35;
        const cy2 = ty + 8 + Math.cos(now * 0.0008) * 3;

        // Outer glow line
        ctx.beginPath();
        ctx.moveTo(fx, fy);
        ctx.bezierCurveTo(cx1, cy1, cx2, cy2, tx, ty);
        ctx.strokeStyle = `${line.color}30`;
        ctx.lineWidth = 6;
        ctx.stroke();

        // Core line
        ctx.beginPath();
        ctx.moveTo(fx, fy);
        ctx.bezierCurveTo(cx1, cy1, cx2, cy2, tx, ty);
        ctx.strokeStyle = `${line.color}90`;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Particles
        for (const p of line.particles) {
          p.t += p.speed;
          if (p.t > 1) {
            p.t = 0;
            p.opacity = 0.3 + Math.random() * 0.5;
          }

          const [px, py] = bezier(fx, fy, cx1, cy1, cx2, cy2, tx, ty, p.t);
          if (!isFiniteNum(px) || !isFiniteNum(py)) continue;

          const glowRadius = p.size * 3;
          if (glowRadius <= 0) continue;

          // Glow
          const gradient = ctx.createRadialGradient(px, py, 0, px, py, glowRadius);
          const alpha = Math.floor(p.opacity * 180);
          gradient.addColorStop(0, `${line.color}${alpha.toString(16).padStart(2, "0")}`);
          gradient.addColorStop(1, `${line.color}00`);
          ctx.beginPath();
          ctx.arc(px, py, glowRadius, 0, Math.PI * 2);
          ctx.fillStyle = gradient;
          ctx.fill();

          // Core dot
          ctx.beginPath();
          ctx.arc(px, py, p.size, 0, Math.PI * 2);
          const coreAlpha = Math.floor(p.opacity * 255);
          ctx.fillStyle = `${line.color}${coreAlpha.toString(16).padStart(2, "0")}`;
          ctx.fill();
        }
      }

      animRef.current = requestAnimationFrame(animate);
    };

    // Small delay to ensure DOM is ready
    const startTimer = setTimeout(() => animate(), 50);

    return () => {
      clearTimeout(startTimer);
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [connections, containerRef, intensity, getLines]);

  // Clear stale line data when connections change
  useEffect(() => {
    const validKeys = new Set(connections.map((c) => `${c.fromId}-${c.toId}`));
    for (const key of linesRef.current.keys()) {
      if (!validKeys.has(key)) linesRef.current.delete(key);
    }
  }, [connections]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-30"
    />
  );
}
