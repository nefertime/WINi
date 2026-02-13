"use client";

import { useEffect, useRef } from "react";

type BubbleParticlesProps = {
  active: boolean;
  className?: string;
};

type Bubble = {
  x: number;
  y: number;
  r: number;
  speed: number;
  opacity: number;
  wobble: number;
  wobbleSpeed: number;
};

export default function BubbleParticles({ active, className = "" }: BubbleParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bubblesRef = useRef<Bubble[]>([]);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (rect) {
        canvas.width = rect.width * window.devicePixelRatio;
        canvas.height = rect.height * window.devicePixelRatio;
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      }
    };

    resize();
    window.addEventListener("resize", resize);

    const createBubble = (): Bubble => ({
      x: Math.random() * (canvas.width / window.devicePixelRatio),
      y: canvas.height / window.devicePixelRatio + 10,
      r: 1 + Math.random() * 3,
      speed: 0.3 + Math.random() * 0.8,
      opacity: 0.15 + Math.random() * 0.35,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: 0.02 + Math.random() * 0.03,
    });

    const animate = () => {
      if (!ctx || !canvas) return;
      const w = canvas.width / window.devicePixelRatio;
      const h = canvas.height / window.devicePixelRatio;

      ctx.clearRect(0, 0, w, h);

      if (active && bubblesRef.current.length < 20) {
        if (Math.random() < 0.15) {
          bubblesRef.current.push(createBubble());
        }
      }

      bubblesRef.current = bubblesRef.current.filter((b) => {
        b.y -= b.speed;
        b.wobble += b.wobbleSpeed;
        const xOff = Math.sin(b.wobble) * 1.5;

        if (b.y < -10) return false;

        ctx.beginPath();
        ctx.arc(b.x + xOff, b.y, b.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(240, 230, 140, ${b.opacity})`;
        ctx.fill();

        // Tiny highlight
        ctx.beginPath();
        ctx.arc(b.x + xOff - b.r * 0.3, b.y - b.r * 0.3, b.r * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${b.opacity * 0.5})`;
        ctx.fill();

        return true;
      });

      animRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [active]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none ${className}`}
    />
  );
}
