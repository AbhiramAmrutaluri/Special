"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Wand2 } from "lucide-react";
import { useEffect, useRef, useState, useMemo } from "react";
import { Playfair_Display, Caveat } from "next/font/google";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
});

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["400", "700"],
});

interface BirthdaySevenRevealProps {
  onClose: () => void;
}

type Phase =
  | "dark"
  | "sky_fade"
  | "moon_rise"
  | "look_at_moon"
  | "gathering"
  | "connecting"
  | "reveal_countdown";

interface Star {
  id: number;
  startXPercent: number;
  startYPercent: number;
  x: number;
  y: number;
  size: number;
  baseTwinkleSpeed: number;
  twinklePhase: number;
  color: string;
  isGatherer: boolean;
  targetXPercent: number;
  targetYPercent: number;
  baseOffsetDistance: number;
  offsetDirection: number;
  trail: { x: number; y: number; opacity: number }[];
}

interface ShootingStar {
  x: number;
  y: number;
  length: number;
  speed: number;
  angle: number;
  opacity: number;
  active: boolean;
}

interface SparkleParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  maxLife: number;
  color: string;
}

export default function BirthdaySevenReveal({ onClose }: BirthdaySevenRevealProps) {
  const [phase, setPhase] = useState<Phase>("dark");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // References for the canvas animation loop to avoid dependency updates interrupting the loop
  const phaseRef = useRef<Phase>("dark");
  const gatherProgressRef = useRef<number>(0);
  const connectProgressRef = useRef<number>(0);
  const starsRef = useRef<Star[]>([]);
  const shootingStarsRef = useRef<ShootingStar[]>([]);
  const sparklesRef = useRef<SparkleParticle[]>([]);
  const animationFrameIdRef = useRef<number | null>(null);
  const timersRef = useRef<NodeJS.Timeout[]>([]);

  // Capture current phase in ref
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  // Easing function for smooth gravitational arrival
  const easeInOutCubic = (x: number) => {
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  };

  // Pre-calculate target coordinates in normalized [-0.5, 0.5] space relative to center
  const targetNormalizedPoints = useMemo(() => {
    const points: { x: number; y: number }[] = [];

    // 1. Left serif: x = -0.5, y from -0.35 to -0.5 - 15 points
    for (let i = 0; i < 15; i++) {
      const t = i / 14;
      points.push({ x: -0.5, y: -0.35 - t * 0.15 });
    }

    // 2. Top bar: y = -0.5, x from -0.5 to 0.5 - 40 points
    for (let i = 0; i < 40; i++) {
      const t = i / 39;
      points.push({ x: -0.5 + t * 1.0, y: -0.5 });
    }

    // 3. Diagonal leg: from (0.5, -0.5) to (-0.15, 0.5) - 60 points
    for (let i = 0; i < 60; i++) {
      const t = i / 59;
      points.push({ x: 0.5 - t * 0.65, y: -0.5 + t * 1.0 });
    }

    // 4. Middle crossbar: from (-0.02, 0.02) to (0.33, 0.02) - 15 points
    // Crosses diagonal leg centered nicely
    for (let i = 0; i < 15; i++) {
      const t = i / 14;
      points.push({ x: -0.02 + t * 0.35, y: 0.02 });
    }

    return points;
  }, []);

  // Initialize stars once
  useEffect(() => {
    const stars: Star[] = [];
    const colors = ["#ffffff", "#fef3c7", "#fde68a", "#fed7e7", "#e0f2fe"];

    // Generate 320 stars
    for (let i = 0; i < 320; i++) {
      const isGatherer = i < targetNormalizedPoints.length;

      stars.push({
        id: i,
        startXPercent: Math.random(),
        startYPercent: Math.random(),
        x: 0,
        y: 0,
        size: Math.random() * 2.0 + 0.6,
        baseTwinkleSpeed: 0.015 + Math.random() * 0.025,
        twinklePhase: Math.random() * Math.PI * 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        isGatherer,
        targetXPercent: isGatherer ? targetNormalizedPoints[i].x : 0,
        targetYPercent: isGatherer ? targetNormalizedPoints[i].y : 0,
        baseOffsetDistance: 60 + Math.random() * 180,
        offsetDirection: Math.random() < 0.5 ? -1 : 1,
        trail: [],
      });
    }

    starsRef.current = stars;
  }, [targetNormalizedPoints]);

  // Master timeline phase transitions
  const startTimers = () => {
    // Clear any existing
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];

    // Reset progress refs
    gatherProgressRef.current = 0;
    connectProgressRef.current = 0;
    shootingStarsRef.current = [];
    sparklesRef.current = [];

    const addTimer = (fn: () => void, ms: number) => {
      timersRef.current.push(setTimeout(fn, ms));
    };

    setPhase("dark");

    addTimer(() => setPhase("sky_fade"), 1500);
    addTimer(() => setPhase("moon_rise"), 4500);
    addTimer(() => setPhase("look_at_moon"), 7500);
    addTimer(() => setPhase("gathering"), 11800);
    addTimer(() => setPhase("connecting"), 15800);
    addTimer(() => setPhase("reveal_countdown"), 17800);
  };

  useEffect(() => {
    startTimers();
    return () => timersRef.current.forEach((t) => clearTimeout(t));
  }, []);

  // Main canvas animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const updateCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);

    const animate = () => {
      if (!ctx || !canvas) return;

      const w = canvas.width;
      const h = canvas.height;

      // Clear screen
      ctx.clearRect(0, 0, w, h);

      const now = Date.now();
      const currentPhase = phaseRef.current;

      // 1. Handle increments for phase-driven animation processes
      if (currentPhase === "gathering") {
        if (gatherProgressRef.current < 1.0) {
          gatherProgressRef.current += 1.0 / (60 * 3.8); // Smooth 3.8s gather speed
          if (gatherProgressRef.current > 1.0) gatherProgressRef.current = 1.0;
        }
      } else if (
        currentPhase === "connecting" ||
        currentPhase === "reveal_countdown"
      ) {
        gatherProgressRef.current = 1.0;

        if (connectProgressRef.current < 1.0) {
          connectProgressRef.current += 1.0 / (60 * 1.8); // 1.8s constellation lines fade
          if (connectProgressRef.current > 1.0) connectProgressRef.current = 1.0;
        }
      }

      const t = gatherProgressRef.current;
      const easedT = easeInOutCubic(t);

      // Centered layout boundaries
      const cx = w / 2;
      const cy = h / 2;

      // Scale height and width of 7 based on screen size dynamically
      const sevenWidth = Math.max(140, Math.min(240, w * 0.45));
      const sevenHeight = Math.max(220, Math.min(360, h * 0.42));

      // 2. Update and Draw Stars
      const stars = starsRef.current;
      stars.forEach((star) => {
        const startX = star.startXPercent * w;
        const startY = star.startYPercent * h;

        if (star.isGatherer && t > 0) {
          const targetX = cx + star.targetXPercent * sevenWidth;
          const targetY = cy + star.targetYPercent * sevenHeight;

          const dx = targetX - startX;
          const dy = targetY - startY;

          const lx = startX + dx * easedT;
          const ly = startY + dy * easedT;

          // Swirling curved perpendicular drift
          const length = Math.sqrt(dx * dx + dy * dy) || 1;
          const px = -dy / length;
          const py = dx / length;

          const curveFactor = Math.sin(easedT * Math.PI) * (1 - easedT);
          const offsetDistance = star.baseOffsetDistance * Math.min(w / 1000, 1.0);
          const offset = offsetDistance * star.offsetDirection * curveFactor;

          star.x = lx + px * offset;
          star.y = ly + py * offset;

          // Maintain historical trail positions
          if (t < 1.0) {
            star.trail.push({ x: star.x, y: star.y, opacity: 1.0 });
            if (star.trail.length > 8) star.trail.shift();
          } else {
            if (star.trail.length > 0) star.trail.shift();
          }
        } else {
          star.x = startX;
          star.y = startY;
        }

        // Draw Trails
        star.trail.forEach((point, idx) => {
          point.opacity -= 0.08;
          ctx.beginPath();
          ctx.arc(point.x, point.y, star.size * Math.max(0.6, Math.min(w / 1200, 1.0)) * 0.75, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(254, 240, 138, ${Math.max(0, point.opacity * 0.35 * (idx / star.trail.length))})`;
          ctx.fill();
        });

        // Compute twinkling glow intensity
        const twinkle = Math.sin(now * star.baseTwinkleSpeed + star.twinklePhase) * 0.38 + 0.62;
        const speedFactor = currentPhase === "gathering" && !star.isGatherer ? 1.3 : 1.0;

        ctx.beginPath();
        const currentSize = star.size * Math.max(0.75, Math.min(w / 1200, 1.25));
        ctx.arc(star.x, star.y, currentSize * (star.isGatherer && t === 1.0 ? 1.25 : 1.0), 0, Math.PI * 2);

        const skyFadeOpacity =
          currentPhase === "dark"
            ? 0
            : currentPhase === "sky_fade"
            ? Math.min(1.0, (now % 10000) / 3000)
            : 1.0;

        ctx.fillStyle = star.color;
        ctx.globalAlpha = Math.min(1.0, Math.max(0.12, twinkle * skyFadeOpacity * speedFactor));
        ctx.fill();
        ctx.globalAlpha = 1.0;
      });

      // 3. Draw Constellation lines (Phase 5 & 6)
      // Drawn as 4 separate explicit path closures to avoid accidental cross-connections
      if (connectProgressRef.current > 0 && stars.length >= 130) {
        ctx.lineWidth = 1.2 * Math.max(0.8, Math.min(w / 1200, 1.2));
        ctx.strokeStyle = `rgba(254, 243, 199, ${connectProgressRef.current * 0.65})`;
        ctx.shadowBlur = 8 * Math.max(0.8, Math.min(w / 1200, 1.2));
        ctx.shadowColor = "rgba(253, 230, 138, 0.8)";

        // 3.1 Draw Left Serif (stars 0 to 14)
        ctx.beginPath();
        ctx.moveTo(stars[0].x, stars[0].y);
        for (let i = 1; i <= 14; i++) {
          ctx.lineTo(stars[i].x, stars[i].y);
        }
        ctx.lineTo(stars[15].x, stars[15].y);
        ctx.stroke();

        // 3.2 Draw Top Bar (stars 15 to 54)
        ctx.beginPath();
        ctx.moveTo(stars[15].x, stars[15].y);
        for (let i = 16; i <= 54; i++) {
          ctx.lineTo(stars[i].x, stars[i].y);
        }
        ctx.lineTo(stars[55].x, stars[55].y);
        ctx.stroke();

        // 3.3 Draw Diagonal Leg (stars 55 to 114)
        ctx.beginPath();
        ctx.moveTo(stars[55].x, stars[55].y);
        for (let i = 56; i <= 114; i++) {
          ctx.lineTo(stars[i].x, stars[i].y);
        }
        ctx.stroke();

        // 3.4 Draw Crossbar (stars 115 to 129)
        ctx.beginPath();
        ctx.moveTo(stars[115].x, stars[115].y);
        for (let i = 116; i <= 129; i++) {
          ctx.lineTo(stars[i].x, stars[i].y);
        }
        ctx.stroke();

        ctx.shadowBlur = 0; // reset shadow
      }

      // 4. Update and Draw Shooting Stars (Phase 4, 5, 6)
      if (currentPhase !== "dark" && currentPhase !== "sky_fade" && currentPhase !== "moon_rise") {
        if (Math.random() < 0.015 && shootingStarsRef.current.length < 2) {
          shootingStarsRef.current.push({
            x: Math.random() * w * 0.75,
            y: Math.random() * h * 0.35,
            length: 70 + Math.random() * 80,
            speed: 14 + Math.random() * 10,
            angle: Math.PI / 6 + Math.random() * (Math.PI / 12),
            opacity: 0,
            active: true,
          });
        }

        shootingStarsRef.current.forEach((ss) => {
          const dx = Math.cos(ss.angle) * ss.speed;
          const dy = Math.sin(ss.angle) * ss.speed;
          ss.x += dx;
          ss.y += dy;

          if (ss.opacity < 1.0) ss.opacity += 0.12;

          const grad = ctx.createLinearGradient(
            ss.x,
            ss.y,
            ss.x - Math.cos(ss.angle) * ss.length,
            ss.y - Math.sin(ss.angle) * ss.length
          );
          grad.addColorStop(0, `rgba(255, 255, 255, ${ss.opacity})`);
          grad.addColorStop(0.4, `rgba(253, 230, 138, ${ss.opacity * 0.45})`);
          grad.addColorStop(1, "rgba(255, 255, 255, 0)");

          ctx.beginPath();
          ctx.strokeStyle = grad;
          ctx.lineWidth = 1.3 * Math.max(0.8, Math.min(w / 1200, 1.2));
          ctx.moveTo(ss.x, ss.y);
          ctx.lineTo(
            ss.x - Math.cos(ss.angle) * ss.length,
            ss.y - Math.sin(ss.angle) * ss.length
          );
          ctx.stroke();

          if (ss.x > w || ss.y > h) {
            ss.active = false;
          }
        });

        shootingStarsRef.current = shootingStarsRef.current.filter((ss) => ss.active);
      }

      // 5. Update and Draw Sparkle particles
      if (connectProgressRef.current > 0) {
        if (Math.random() < 0.38) {
          const randomGatherer = stars[Math.floor(Math.random() * targetNormalizedPoints.length)];
          sparklesRef.current.push({
            x: randomGatherer.x + (Math.random() - 0.5) * 12,
            y: randomGatherer.y + (Math.random() - 0.5) * 12,
            vx: (Math.random() - 0.5) * 0.6,
            vy: -0.3 - Math.random() * 0.5,
            size: Math.random() * 2.0 + 0.8,
            life: 0,
            maxLife: 50 + Math.floor(Math.random() * 40),
            color: Math.random() < 0.5 ? "#fde047" : "#ffffff",
          });
        }

        sparklesRef.current.forEach((sp) => {
          sp.x += sp.vx;
          sp.y += sp.vy;
          sp.life++;

          const alpha = 1.0 - sp.life / sp.maxLife;
          ctx.beginPath();
          ctx.arc(sp.x, sp.y, sp.size * Math.max(0.8, Math.min(w / 1200, 1.2)), 0, Math.PI * 2);
          ctx.fillStyle = sp.color;
          ctx.globalAlpha = alpha * 0.75;
          ctx.shadowBlur = 4;
          ctx.shadowColor = sp.color;
          ctx.fill();
          ctx.globalAlpha = 1.0;
          ctx.shadowBlur = 0;
        });

        sparklesRef.current = sparklesRef.current.filter((sp) => sp.life < sp.maxLife);
      }

      animationFrameIdRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", updateCanvasSize);
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [targetNormalizedPoints]);

  const skipIntro = () => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];

    gatherProgressRef.current = 1.0;
    connectProgressRef.current = 1.0;

    setPhase("reveal_countdown");
  };

  const replayMagic = () => {
    startTimers();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-start overflow-y-auto bg-slate-950"
    >
      {/* 1. Deep Disney night sky background layer */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#020617] via-[#0f172a] to-[#1e1b4b]" />

      {/* 2. Moonlight Ambient Glow Overlay (Phase 2+) */}
      <AnimatePresence>
        {phase !== "dark" && phase !== "sky_fade" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 3.5 }}
            className="pointer-events-none absolute inset-0 mix-blend-screen"
            style={{
              background:
                "radial-gradient(circle at 75% 20%, rgba(254, 243, 199, 0.16) 0%, rgba(15, 23, 42, 0) 70%)",
            }}
          />
        )}
      </AnimatePresence>

      {/* 3. Constellation Ambient Aura (Phase 5+) */}
      <AnimatePresence>
        {connectProgressRef.current > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.85 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2.5 }}
            className="pointer-events-none absolute inset-0 z-10 mix-blend-screen"
          >
            <div
              className="absolute left-1/2 top-1/2 w-[240px] h-[340px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-400/10 blur-[60px] animate-pulse"
              style={{ animationDuration: "5s" }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. Canvas Stars and Constellations rendering */}
      <canvas ref={canvasRef} className="absolute inset-0 z-20 pointer-events-none" />

      {/* 5. Realistic Disney-style Moon Rise (Phase 2+) */}
      {phase !== "dark" && phase !== "sky_fade" && (
        <motion.div
          className="absolute z-25 flex items-center justify-center rounded-full"
          style={{ right: "12%", top: "10%" }}
          initial={{ y: "100vh", scale: 0.75, opacity: 0 }}
          animate={{ y: 0, scale: 1.0, opacity: 1 }}
          transition={{
            y: { duration: 4.5, ease: [0.16, 1, 0.3, 1] },
            opacity: { duration: 3.0 },
            scale: { duration: 4.5 },
          }}
        >
          {/* Main Moon Sphere (Responsive sizing) */}
          <div
            className="relative h-20 w-20 md:h-28 md:w-28 rounded-full bg-gradient-to-br from-amber-50 via-amber-100 to-amber-200"
            style={{
              boxShadow:
                "0 0 25px rgba(254, 243, 199, 0.75), 0 0 50px rgba(254, 243, 199, 0.4), 0 0 100px rgba(253, 230, 138, 0.2)",
            }}
          >
            {/* Soft moon surface craters */}
            <div className="absolute top-2 left-4 h-4 w-6 rounded-full bg-amber-200/40 blur-[1px] mix-blend-multiply" />
            <div className="absolute top-8 left-8 h-5 w-7 rounded-full bg-amber-200/35 blur-[1.5px] mix-blend-multiply" />
            <div className="absolute top-12 left-3 h-3 w-4 rounded-full bg-amber-200/40 blur-[1px] mix-blend-multiply" />
            <div className="absolute top-4 left-12 h-5 w-5 rounded-full bg-amber-200/30 blur-[2px] mix-blend-multiply" />
          </div>
        </motion.div>
      )}

      {/* 6. Atmospheric Floating Clouds Parallax */}
      {/* Cloud 1 (Behind the Moon) */}
      {phase !== "dark" && (
        <motion.div
          className="pointer-events-none absolute z-23 select-none opacity-20"
          style={{ top: "12%", width: "min(220px, 50vw)", height: "auto" }}
          initial={{ x: "-30vw" }}
          animate={{ x: "120vw" }}
          transition={{ duration: 115, repeat: Infinity, ease: "linear" }}
        >
          <svg viewBox="0 0 200 80" fill="#f8fafc">
            <path d="M 30,50 A 25,25 0 0,1 70,30 A 30,30 0 0,1 130,25 A 25,25 0 0,1 170,45 A 20,20 0 0,1 190,60 A 15,15 0 0,1 180,75 L 20,75 Z" />
          </svg>
        </motion.div>
      )}

      {/* Cloud 2 (In front of the moon - lower) */}
      {phase !== "dark" && (
        <motion.div
          className="pointer-events-none absolute z-26 select-none opacity-30 blur-[0.5px]"
          style={{ top: "18%", width: "min(360px, 70vw)", height: "auto" }}
          initial={{ x: "-40vw" }}
          animate={{ x: "120vw" }}
          transition={{ duration: 85, repeat: Infinity, ease: "linear", delay: 15 }}
        >
          <svg viewBox="0 0 240 100" fill="#cbd5e1">
            <path d="M 40,70 A 30,30 0 0,1 90,40 A 35,35 0 0,1 170,35 A 30,30 0 0,1 215,60 A 25,25 0 0,1 235,80 A 15,15 0 0,1 220,95 L 20,95 Z" />
          </svg>
        </motion.div>
      )}

      {/* Cloud 3 (Mid Screen Drift) */}
      {phase !== "dark" && (
        <motion.div
          className="pointer-events-none absolute z-26 select-none opacity-20 blur-[1px]"
          style={{ top: "52%", width: "min(420px, 80vw)", height: "auto" }}
          initial={{ x: "-50vw" }}
          animate={{ x: "120vw" }}
          transition={{ duration: 140, repeat: Infinity, ease: "linear" }}
        >
          <svg viewBox="0 0 240 100" fill="#94a3b8">
            <path d="M 40,70 A 30,30 0 0,1 90,40 A 35,35 0 0,1 170,35 A 30,30 0 0,1 215,60 A 25,25 0 0,1 235,80 A 15,15 0 0,1 220,95 L 20,95 Z" />
          </svg>
        </motion.div>
      )}

      {/* Close Button */}
      <div className="absolute right-4 top-4 z-55 flex items-center gap-3">
        <button
          onClick={onClose}
          className="rounded-full border border-slate-700 bg-slate-900/60 p-2.5 text-slate-300 shadow-md backdrop-blur-md transition-all duration-300 hover:bg-slate-800/80 hover:text-white hover:scale-105 active:scale-95 cursor-pointer pointer-events-auto"
          aria-label="Close reveal"
        >
          <X size={18} />
        </button>
      </div>

      {/* Skip Button */}
      <div className="absolute left-4 top-4 z-50">
        <AnimatePresence>
          {phase !== "reveal_countdown" && phase !== "dark" && (
            <motion.button
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 0.8, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              whileHover={{ opacity: 1, scale: 1.05 }}
              onClick={skipIntro}
              className="rounded-full border border-slate-700 bg-slate-900/40 px-3.5 py-1.5 text-3xs sm:text-xs font-bold uppercase tracking-wider text-slate-300 shadow-inner backdrop-blur-sm transition-all duration-300 active:scale-95 cursor-pointer pointer-events-auto"
            >
              Skip Intro ⚡
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Top spacing */}
      <div className="h-16" />

      {/* 8. Main Content Layout Container (Non-overlapping Flex Layout) */}
      <div className="relative z-30 flex min-h-screen w-full flex-col items-center justify-between py-8 px-4 sm:px-6 pointer-events-none">
        
        {/* Top: Header Title */}
        <div className="h-12 text-center pointer-events-auto mt-2">
          <AnimatePresence>
            {phase === "reveal_countdown" && (
              <motion.h2
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 0.85, y: 0 }}
                className={`${caveat.className} text-xl sm:text-2xl md:text-3.5xl font-bold text-amber-200 drop-shadow-sm`}
              >
                Today's Secret Magic... ✨
              </motion.h2>
            )}
          </AnimatePresence>
        </div>

        {/* Center Space: Spacer representing the constellation bounding box */}
        <div className="flex-1 w-full flex items-center justify-center">
          <div className="h-[38vh] max-h-[360px] aspect-[4/5]" />
        </div>

        {/* Bottom Area: Countdown text and buttons */}
        <div className="w-full text-center flex flex-col items-center gap-4 sm:gap-6 pointer-events-auto z-45 mb-2">
          <AnimatePresence mode="wait">
            {/* Phase 3: Look at the Moon Text */}
            {phase === "look_at_moon" && (
              <motion.div
                key="look_moon_text"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 1.6, ease: "easeInOut" }}
                className="text-center px-4 my-auto"
              >
                <h2
                  className={`${playfair.className} text-2xl sm:text-3.5xl md:text-5.5xl text-amber-100 font-bold tracking-wide italic leading-relaxed drop-shadow-[0_2px_15px_rgba(254,243,199,0.35)]`}
                >
                  Look at the moon tonight... 🌙
                </h2>
              </motion.div>
            )}

            {/* Phase 6: Final Constellation Completed Reveals */}
            {phase === "reveal_countdown" && (
              <motion.div
                key="final_reveal"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2 }}
                className="flex flex-col items-center justify-center text-center gap-4 sm:gap-6 max-w-2xl px-2 sm:px-6 w-full"
              >
                {/* Title Header */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1.0, delay: 0.3 }}
                  className="flex flex-col items-center"
                >
                  <h1
                    className={`${playfair.className} text-3xl sm:text-5.5xl md:text-7xl font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-amber-50 via-amber-100 to-amber-300 drop-shadow-[0_4px_25px_rgba(253,230,138,0.45)] uppercase`}
                  >
                    🌙 7 DAYS TO GO 🌙
                  </h1>
                </motion.div>

                {/* Romantic Quote Card Box */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1.2, delay: 0.8 }}
                  className="relative rounded-3xl border border-amber-500/20 bg-slate-950/70 px-6 sm:px-8 py-4 sm:py-5 shadow-[0_15px_40px_rgba(0,0,0,0.55)] backdrop-blur-md max-w-xl mx-auto flex items-center justify-center gap-2"
                >
                  <span
                    className={`${caveat.className} absolute left-3 top-1 text-4.5xl sm:text-5.5xl text-amber-500/15 select-none`}
                  >
                    “
                  </span>
                  <span
                    className={`${caveat.className} absolute right-3 bottom-[-12px] text-4.5xl sm:text-5.5xl text-amber-500/15 select-none`}
                  >
                    ”
                  </span>
                  <p
                    className={`${playfair.className} text-sm sm:text-lg md:text-2xl font-medium tracking-wide leading-relaxed text-amber-100/90 italic`}
                  >
                    "The stars have been counting with me...
                    <br />
                    Only 7 more nights until my Mammoty's birthday. ❤️"
                  </p>
                </motion.div>

                {/* Action buttons footer */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.4, duration: 0.8 }}
                  className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mt-1 w-full sm:w-auto"
                >
                  <button
                    onClick={replayMagic}
                    className="w-full sm:w-auto rounded-full border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/25 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-amber-200 shadow-md backdrop-blur-sm transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-2 cursor-pointer group"
                  >
                    <Wand2 size={14} className="group-hover:rotate-12 transition-transform duration-300" />
                    Replay Magic
                  </button>

                  <button
                    onClick={onClose}
                    className="w-full sm:w-auto rounded-full border border-slate-700 bg-slate-900/60 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-white transition-all duration-300 hover:bg-slate-800/80 active:scale-95 cursor-pointer flex items-center justify-center"
                  >
                    Back to Surprises
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 9. Dark Ambient overlay for cinematic introduction */}
      <AnimatePresence>
        {phase === "dark" && (
          <motion.div
            key="dark_screen_overlay"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute inset-0 z-50 bg-black pointer-events-none"
          />
        )}
      </AnimatePresence>

      <div className="h-12" />
    </motion.div>
  );
}
