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

// EDIT YOUR PERSONAL LETTER MESSAGE HERE
const LETTER_MESSAGE = `My Dearest Cutieeee, ❤️

You're the most special person in my life raaa...No matter what the efforts I keep I just do it only for your happiness.....

There are a few things I want to tell you today... or rather, a few promises I want to make to you.

🤍 I will never ignore you, no matter what the situation is.

🤍 I'll always give my best to make you happy.

🤍 I'll always be there for you, no matter what life throws at youu. I'll always stand beside you.

🤍 I'll reassure you always and remind you that you're capable of achieving anything 

🤍 I will never leave you, and I'll never give up on this beautiful bond we share. Please don't ever think that this guy will leave you or replace you... that's impossible. You're truly irreplaceable in my life, raa. ❤️

The nights have been counting with me, and now there are only 6 nights left.

Every single day makes me realize how incredibly lucky I am to have you in my life. I count the nights, the hours, and every little moment until I get to see your beautiful smile again.

You deserve all the magic, all the happiness, and all the love in the universe.

Only 6 more nights until my Mammoty's birthday... ❤️

Until then, I'll keep counting every night with a smile, waiting for your special day. 🌹`;

interface BirthdaySixRevealProps {
  onClose: () => void;
}

type Phase =
  | "dark"
  | "ambient_fade"
  | "gathering"
  | "breathing"
  | "envelope_reveal";

type EnvelopeState =
  | "closed"
  | "breaking_seal"
  | "opening_flap"
  | "sliding_letter"
  | "unfolding_letter";

interface Petal {
  id: number;
  startXPercent: number;
  startYPercent: number;
  x: number;
  y: number;
  size: number;
  rotation: number;
  rotationSpeed: number;
  rotationX: number;
  rotationYSpeed: number;
  speedY: number;
  windSpeed: number;
  windPhase: number;
  color1: string;
  color2: string;
  isGatherer: boolean;
  targetXPercent: number;
  targetYPercent: number;
  baseOffsetDistance: number;
  offsetDirection: number;
  trail: { x: number; y: number; opacity: number }[];
}

interface Sparkle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  maxLife: number;
  color: string;
}

export default function BirthdaySixReveal({ onClose }: BirthdaySixRevealProps) {
  const [phase, setPhase] = useState<Phase>("dark");
  const [envelopeState, setEnvelopeState] = useState<EnvelopeState>("closed");
  const [hoveredEnvelope, setHoveredEnvelope] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Animation states in refs for smooth animation loops without state resets
  const phaseRef = useRef<Phase>("dark");
  const gatherProgressRef = useRef<number>(0);
  const glowProgressRef = useRef<number>(0);
  const petalsRef = useRef<Petal[]>([]);
  const sparklesRef = useRef<Sparkle[]>([]);
  const animationFrameIdRef = useRef<number | null>(null);
  const timersRef = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  const easeInOutCubic = (x: number) => {
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  };

  // Pre-calculate target coordinates representing a beautiful cursive "6" in normalized center-offset space
  const targetNormalizedPoints = useMemo(() => {
    const points: { x: number; y: number }[] = [];

    // 1. Bottom circle loop: centered at (0.0, 0.15) with radius 0.26 - 80 points
    for (let i = 0; i < 80; i++) {
      const angle = (i / 80) * Math.PI * 2 - Math.PI / 2;
      const cx_loop = 0.0;
      const cy_loop = 0.14;
      const r = 0.25;
      points.push({
        x: cx_loop + r * Math.cos(angle),
        y: cy_loop + r * Math.sin(angle),
      });
    }

    // 2. Cursive upper stem: Bezier curve from start (0.13, -0.45) with control point (-0.25, -0.28) to loop attach (-0.25, 0.14) - 50 points
    const start = { x: 0.13, y: -0.45 };
    const cp = { x: -0.25, y: -0.25 };
    const end = { x: -0.25, y: 0.14 };
    for (let i = 0; i < 50; i++) {
      const t = i / 49;
      // Quadratic Bezier interpolation
      const x = (1 - t) * (1 - t) * start.x + 2 * (1 - t) * t * cp.x + t * t * end.x;
      const y = (1 - t) * (1 - t) * start.y + 2 * (1 - t) * t * cp.y + t * t * end.y;
      points.push({ x, y });
    }

    return points;
  }, []);

  // Initialize petals once
  useEffect(() => {
    const petals: Petal[] = [];
    const petalColors = [
      { c1: "#f43f5e", c2: "#be123c" }, // Rose pink to crimson
      { c1: "#e11d48", c2: "#9f1239" }, // Bright red to dark burgundy
      { c1: "#fda4af", c2: "#e11d48" }, // Soft rose to bright red
      { c1: "#f43f5e", c2: "#9f1239" }, // Rose to burgundy
      { c1: "#be123c", c2: "#4c0519" }, // Crimson to deep black-rose
    ];

    for (let i = 0; i < 300; i++) {
      const isGatherer = i < targetNormalizedPoints.length;
      const color = petalColors[Math.floor(Math.random() * petalColors.length)];

      petals.push({
        id: i,
        startXPercent: Math.random(),
        startYPercent: -0.1 - Math.random() * 0.4, // Spawn above screen
        x: 0,
        y: 0,
        size: Math.random() * 10 + 10, // petal size
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.05,
        rotationX: Math.random() * Math.PI,
        rotationYSpeed: 0.01 + Math.random() * 0.03,
        speedY: 1.0 + Math.random() * 1.5,
        windSpeed: 0.2 + Math.random() * 0.5,
        windPhase: Math.random() * Math.PI * 2,
        color1: color.c1,
        color2: color.c2,
        isGatherer,
        targetXPercent: isGatherer ? targetNormalizedPoints[i].x : 0,
        targetYPercent: isGatherer ? targetNormalizedPoints[i].y : 0,
        baseOffsetDistance: 80 + Math.random() * 240,
        offsetDirection: Math.random() < 0.5 ? -1 : 1,
        trail: [],
      });
    }

    petalsRef.current = petals;
  }, [targetNormalizedPoints]);

  const startTimers = () => {
    // Clear existing
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];

    // Reset loop dynamics
    gatherProgressRef.current = 0;
    glowProgressRef.current = 0;
    sparklesRef.current = [];
    setEnvelopeState("closed");

    const addTimer = (fn: () => void, ms: number) => {
      timersRef.current.push(setTimeout(fn, ms));
    };

    setPhase("dark");

    addTimer(() => setPhase("ambient_fade"), 1500);
    addTimer(() => setPhase("gathering"), 4500);
    addTimer(() => setPhase("breathing"), 9200);
    addTimer(() => setPhase("envelope_reveal"), 11200);
  };

  useEffect(() => {
    startTimers();
    return () => timersRef.current.forEach((t) => clearTimeout(t));
  }, []);

  // Main Canvas Rendering Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const updateSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    updateSize();
    window.addEventListener("resize", updateSize);

    const drawPetal = (
      c: CanvasRenderingContext2D,
      x: number,
      y: number,
      size: number,
      rot: number,
      rotX: number,
      c1: string,
      c2: string
    ) => {
      c.save();
      c.translate(x, y);
      c.rotate(rot);
      c.scale(1, Math.sin(rotX)); // 3D tumbling illusion

      // Beautiful organic rose petal path
      c.beginPath();
      c.moveTo(0, -size);
      c.quadraticCurveTo(size * 0.75, -size, size * 0.9, 0);
      c.quadraticCurveTo(size * 0.8, size * 0.9, 0, size);
      c.quadraticCurveTo(-size * 0.8, size * 0.9, -size * 0.9, 0);
      c.quadraticCurveTo(-size * 0.75, -size, 0, -size);
      c.closePath();

      const grad = c.createLinearGradient(0, -size, 0, size);
      grad.addColorStop(0, c1);
      grad.addColorStop(1, c2);
      c.fillStyle = grad;
      c.fill();

      // Shadow overlay inside petal for organic depth
      c.beginPath();
      c.moveTo(0, size);
      c.quadraticCurveTo(-size * 0.4, size * 0.3, 0, -size * 0.4);
      c.quadraticCurveTo(size * 0.4, size * 0.3, 0, size);
      c.closePath();
      c.fillStyle = "rgba(0, 0, 0, 0.15)";
      c.fill();

      c.restore();
    };

    const animate = () => {
      if (!ctx || !canvas) return;

      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const now = Date.now();
      const currentPhase = phaseRef.current;

      // Handle sequence timeline transitions
      if (currentPhase === "gathering") {
        if (gatherProgressRef.current < 1.0) {
          gatherProgressRef.current += 1.0 / (60 * 4.2); // 4.2s smooth gather speed
          if (gatherProgressRef.current > 1.0) gatherProgressRef.current = 1.0;
        }
      } else if (
        currentPhase === "breathing" ||
        currentPhase === "envelope_reveal"
      ) {
        gatherProgressRef.current = 1.0;

        if (glowProgressRef.current < 1.0) {
          glowProgressRef.current += 1.0 / (60 * 1.5);
          if (glowProgressRef.current > 1.0) glowProgressRef.current = 1.0;
        }
      }

      const t = gatherProgressRef.current;
      const easedT = easeInOutCubic(t);

      // Centered layout boundaries
      const cx = w / 2;
      const cy = h / 2 - 20; // slightly shifted up to accommodate envelope

      // Size of number "6" scaled to viewport size
      const sixWidth = Math.max(140, Math.min(240, w * 0.42));
      const sixHeight = Math.max(220, Math.min(360, h * 0.38));

      // Draw Petals
      const petals = petalsRef.current;
      petals.forEach((petal) => {
        // Compute active positions
        let posX = 0;
        let posY = 0;

        if (petal.isGatherer && t > 0) {
          const startX = petal.startXPercent * w;
          const startY = petal.startYPercent * h;

          const targetX = cx + petal.targetXPercent * sixWidth;
          const targetY = cy + petal.targetYPercent * sixHeight;

          const dx = targetX - startX;
          const dy = targetY - startY;

          const lx = startX + dx * easedT;
          const ly = startY + dy * easedT;

          // Swirling Bezier curved gravitational pull
          const length = Math.sqrt(dx * dx + dy * dy) || 1;
          const px = -dy / length;
          const py = dx / length;

          const curveFactor = Math.sin(easedT * Math.PI) * (1 - easedT);
          const offsetDistance = petal.baseOffsetDistance * Math.min(w / 1000, 1.0);
          const offset = offsetDistance * petal.offsetDirection * curveFactor;

          posX = lx + px * offset;
          posY = ly + py * offset;

          // Animate rotation tumbling into place
          petal.rotation += petal.rotationSpeed * (1 - easedT * 0.95);
          petal.rotationX += petal.rotationYSpeed * (1 - easedT * 0.95);

          // Add sparkle trails lagging behind gatherers
          if (t < 1.0) {
            petal.trail.push({ x: posX, y: posY, opacity: 1.0 });
            if (petal.trail.length > 8) petal.trail.shift();
          } else {
            if (petal.trail.length > 0) petal.trail.shift();
          }
        } else {
          // Drifting background fall cycle
          petal.startYPercent += petal.speedY / h;
          if (petal.startYPercent > 1.1) {
            petal.startYPercent = -0.1;
            petal.startXPercent = Math.random();
          }

          posX =
            petal.startXPercent * w +
            Math.sin(now * 0.001 * petal.windSpeed + petal.windPhase) * 20;
          posY = petal.startYPercent * h;

          petal.rotation += petal.rotationSpeed;
          petal.rotationX += petal.rotationYSpeed;
        }

        // Draw Trails
        petal.trail.forEach((point, idx) => {
          point.opacity -= 0.08;
          ctx.beginPath();
          ctx.arc(point.x, point.y, 2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(253, 244, 245, ${Math.max(0, point.opacity * 0.28 * (idx / petal.trail.length))})`;
          ctx.fill();
        });

        // Draw the Petal
        const sizeScale = Math.max(0.6, Math.min(w / 1200, 1.25));
        const currentSize = petal.size * sizeScale;

        // Fades petals in during Phase 1
        const petalFadeOpacity =
          currentPhase === "dark"
            ? 0
            : currentPhase === "ambient_fade"
            ? Math.min(1.0, (now % 10000) / 2500)
            : 1.0;

        ctx.globalAlpha = petalFadeOpacity;
        drawPetal(
          ctx,
          posX,
          posY,
          currentSize,
          petal.rotation,
          petal.rotationX,
          petal.color1,
          petal.color2
        );
        ctx.globalAlpha = 1.0;
      });

      // 3. Draw outline glowing aura around assembled "6" (Phase 3+)
      if (glowProgressRef.current > 0 && petals.length >= 130) {
        ctx.lineWidth = 1.5 * Math.max(0.8, Math.min(w / 1200, 1.2));
        const breathingFactor = Math.sin(now * 0.002) * 0.15 + 0.85; // breathing pulse
        ctx.strokeStyle = `rgba(251, 113, 133, ${glowProgressRef.current * 0.28 * breathingFactor})`;
        ctx.shadowBlur = 15 * breathingFactor * Math.max(0.8, Math.min(w / 1200, 1.2));
        ctx.shadowColor = "rgba(244, 63, 94, 0.9)";

        // Draw cursive outline of the gathered "6"
        ctx.beginPath();
        ctx.moveTo(starsPosition(0).x, starsPosition(0).y);
        for (let i = 1; i < 80; i++) {
          ctx.lineTo(starsPosition(i).x, starsPosition(i).y);
        }
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(starsPosition(80).x, starsPosition(80).y);
        for (let i = 81; i < 130; i++) {
          ctx.lineTo(starsPosition(i).x, starsPosition(i).y);
        }
        ctx.stroke();

        ctx.shadowBlur = 0; // reset shadow
      }

      // Helper function to fetch screen coordinates of gathered stars
      function starsPosition(idx: number) {
        const star = petals[idx];
        const targetX = cx + star.targetXPercent * sixWidth;
        const targetY = cy + star.targetYPercent * sixHeight;
        return { x: targetX, y: targetY };
      }

      // 4. Update and Draw floating sparkles (Phase 3+)
      if (glowProgressRef.current > 0) {
        if (Math.random() < 0.25) {
          const randomGatherer = petals[Math.floor(Math.random() * targetNormalizedPoints.length)];
          const targetX = cx + randomGatherer.targetXPercent * sixWidth;
          const targetY = cy + randomGatherer.targetYPercent * sixHeight;

          sparklesRef.current.push({
            x: targetX + (Math.random() - 0.5) * 15,
            y: targetY + (Math.random() - 0.5) * 15,
            vx: (Math.random() - 0.5) * 0.5,
            vy: -0.2 - Math.random() * 0.5,
            size: Math.random() * 2.0 + 0.6,
            life: 0,
            maxLife: 40 + Math.floor(Math.random() * 40),
            color: Math.random() < 0.5 ? "#fecdd3" : "#ffffff",
          });
        }

        sparklesRef.current.forEach((sp) => {
          sp.x += sp.vx;
          sp.y += sp.vy;
          sp.life++;

          const alpha = 1.0 - sp.life / sp.maxLife;
          ctx.beginPath();
          ctx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
          ctx.fillStyle = sp.color;
          ctx.globalAlpha = alpha * 0.7;
          ctx.shadowBlur = 3;
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
      window.removeEventListener("resize", updateSize);
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [targetNormalizedPoints]);

  const handleSealClick = () => {
    if (envelopeState !== "closed") return;

    setEnvelopeState("breaking_seal");

    // Timeline triggers for opening envelope
    const t1 = setTimeout(() => setEnvelopeState("opening_flap"), 650);
    const t2 = setTimeout(() => setEnvelopeState("sliding_letter"), 1450);
    const t3 = setTimeout(() => setEnvelopeState("unfolding_letter"), 2250);

    timersRef.current.push(t1, t2, t3);
  };

  const skipIntro = () => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];

    gatherProgressRef.current = 1.0;
    glowProgressRef.current = 1.0;

    setPhase("envelope_reveal");
  };

  const replayMagic = () => {
    startTimers();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-start overflow-y-auto bg-stone-950 scrollbar-none"
    >
      {/* 1. Deep Burgundy background system */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#31000e] via-[#1c0006] to-[#0a0002]" />

      {/* 2. Candle Flame Ambient Glow Overlays (Phase 1+) */}
      <AnimatePresence>
        {phase !== "dark" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.28 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 3.5 }}
            className="pointer-events-none absolute inset-0 z-10 mix-blend-screen"
            style={{
              background:
                "radial-gradient(circle at 10% 90%, rgba(253, 186, 116, 0.4) 0%, rgba(0,0,0,0) 50%), radial-gradient(circle at 90% 90%, rgba(253, 186, 116, 0.4) 0%, rgba(0,0,0,0) 50%)",
            }}
          />
        )}
      </AnimatePresence>

      {/* 3. Canvas Petals and Number 6 rendering */}
      <canvas ref={canvasRef} className="absolute inset-0 z-20 pointer-events-none" />

      {/* 4. Hanging Fairy Lights (Top Area - Phase 1+) */}
      {phase !== "dark" && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 0.9, y: 0 }}
          transition={{ duration: 2.0, delay: 0.5 }}
          className="absolute inset-x-0 top-0 z-25 pointer-events-none"
        >
          <svg className="w-full h-12 text-yellow-100/35" preserveAspectRatio="none" viewBox="0 0 100 20">
            {/* Fairy Light Swag String */}
            <path d="M 0,2 Q 12.5,12 25,2 Q 37.5,12 50,2 Q 62.5,12 75,2 Q 87.5,12 100,2" fill="none" stroke="currentColor" strokeWidth="0.3" />
            
            {/* Glowing Fairy Bulbs */}
            <circle cx="6" cy="4" r="0.6" className="animate-pulse-light-1 fill-yellow-200" />
            <circle cx="19" cy="6" r="0.6" className="animate-pulse-light-2 fill-yellow-200" />
            <circle cx="31" cy="6" r="0.6" className="animate-pulse-light-3 fill-yellow-200" />
            <circle cx="44" cy="4" r="0.6" className="animate-pulse-light-1 fill-yellow-200" />
            <circle cx="56" cy="4" r="0.6" className="animate-pulse-light-2 fill-yellow-200" />
            <circle cx="69" cy="6" r="0.6" className="animate-pulse-light-3 fill-yellow-200" />
            <circle cx="81" cy="6" r="0.6" className="animate-pulse-light-1 fill-yellow-200" />
            <circle cx="94" cy="4" r="0.6" className="animate-pulse-light-2 fill-yellow-200" />
          </svg>

          {/* Glowing Bulb Animation Styles */}
          <style>{`
            @keyframes pulseLight {
              0%, 100% { opacity: 0.4; filter: drop-shadow(0 0 1px #fef08a); }
              50% { opacity: 1.0; filter: drop-shadow(0 0 6px #fef08a) drop-shadow(0 0 12px #facc15); }
            }
            .animate-pulse-light-1 { animation: pulseLight 3.0s infinite ease-in-out; }
            .animate-pulse-light-2 { animation: pulseLight 3.6s infinite ease-in-out; animation-delay: 0.6s; }
            .animate-pulse-light-3 { animation: pulseLight 4.2s infinite ease-in-out; animation-delay: 1.2s; }
          `}</style>
        </motion.div>
      )}

      {/* 5. Flickering SVG Candles (Bottom Corners - Phase 1+) */}
      {phase !== "dark" && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 2.5, ease: "easeOut" }}
          className="absolute inset-x-0 bottom-0 z-25 flex justify-between px-6 sm:px-12 pointer-events-none pb-4"
        >
          {/* Left Candle Stack */}
          <div className="relative flex items-end gap-3 h-32 w-28">
            <svg viewBox="0 0 40 80" className="w-10 h-20 opacity-85">
              {/* Pillar Body */}
              <rect x="12" y="25" width="16" height="55" rx="2" fill="#faf5ff" className="drop-shadow-md" />
              <ellipse cx="20" cy="25" rx="8" ry="2.2" fill="#e9d5ff" />
              {/* Wick */}
              <line x1="20" y1="25" x2="20" y2="18" stroke="#1f2937" strokeWidth="1.2" />
              {/* Flame */}
              <path d="M 20,18 C 17,14 17,6 20,0 C 23,6 23,14 20,18 Z" fill="#ffedd5" className="animate-flicker origin-bottom" style={{ filter: "drop-shadow(0 0 5px #fb923c) drop-shadow(0 0 10px #f97316)" }} />
            </svg>

            <svg viewBox="0 0 40 80" className="w-8 h-16 opacity-75 pb-1">
              <rect x="14" y="35" width="12" height="45" rx="1.5" fill="#faf5ff" />
              <ellipse cx="20" cy="35" rx="6" ry="1.8" fill="#e9d5ff" />
              <line x1="20" y1="35" x2="20" y2="29" stroke="#1f2937" strokeWidth="1.0" />
              <path d="M 20,29 C 17.5,25 17.5,18 20,12 C 22.5,18 22.5,25 20,29 Z" fill="#ffedd5" className="animate-flicker origin-bottom" style={{ animationDelay: "0.4s", filter: "drop-shadow(0 0 4px #fb923c) drop-shadow(0 0 8px #f97316)" }} />
            </svg>
          </div>

          {/* Right Candle Stack */}
          <div className="relative flex items-end justify-end gap-3 h-32 w-28">
            <svg viewBox="0 0 40 80" className="w-8 h-16 opacity-80 pb-2">
              <rect x="14" y="30" width="12" height="50" rx="1.5" fill="#faf5ff" />
              <ellipse cx="20" cy="30" rx="6" ry="1.8" fill="#e9d5ff" />
              <line x1="20" y1="30" x2="20" y2="24" stroke="#1f2937" strokeWidth="1.0" />
              <path d="M 20,24 C 17.5,20 17.5,13 20,7 C 22.5,13 22.5,20 20,24 Z" fill="#ffedd5" className="animate-flicker origin-bottom" style={{ animationDelay: "0.2s", filter: "drop-shadow(0 0 4px #fb923c) drop-shadow(0 0 8px #f97316)" }} />
            </svg>

            <svg viewBox="0 0 40 80" className="w-10 h-24 opacity-85">
              <rect x="12" y="15" width="16" height="65" rx="2" fill="#faf5ff" className="drop-shadow-md" />
              <ellipse cx="20" cy="15" rx="8" ry="2.2" fill="#e9d5ff" />
              <line x1="20" y1="15" x2="20" y2="8" stroke="#1f2937" strokeWidth="1.2" />
              <path d="M 20,8 C 17,4 17,0 20,-6 C 23,0 23,4 20,8 Z" fill="#ffedd5" className="animate-flicker origin-bottom" style={{ animationDelay: "0.6s", filter: "drop-shadow(0 0 5px #fb923c) drop-shadow(0 0 10px #f97316)" }} />
            </svg>
          </div>

          <style>{`
            @keyframes flicker {
              0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.95; }
              20% { transform: scale(0.96, 1.04) rotate(0.8deg); opacity: 0.92; }
              40% { transform: scale(1.04, 0.96) rotate(-0.8deg); opacity: 1.0; }
              60% { transform: scale(0.98, 1.02) rotate(0.4deg); opacity: 0.94; }
              80% { transform: scale(1.02, 0.98) rotate(-0.4deg); opacity: 0.97; }
            }
            .animate-flicker {
              animation: flicker 1.8s infinite ease-in-out;
              transform-origin: bottom center;
            }
          `}</style>
        </motion.div>
      )}

      {/* Control Actions & Close */}
      <div className="absolute right-4 top-4 z-55 flex items-center gap-3">
        <button
          onClick={onClose}
          className="rounded-full border border-rose-950 bg-rose-950/60 p-2.5 text-rose-300 shadow-md backdrop-blur-md transition-all duration-300 hover:bg-rose-900/80 hover:text-white hover:scale-105 active:scale-95 cursor-pointer pointer-events-auto"
          aria-label="Close reveal"
        >
          <X size={18} />
        </button>
      </div>

      <div className="absolute left-4 top-4 z-50">
        <AnimatePresence>
          {phase !== "envelope_reveal" && phase !== "dark" && (
            <motion.button
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 0.75, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              whileHover={{ opacity: 1, scale: 1.05 }}
              onClick={skipIntro}
              className="rounded-full border border-rose-950 bg-rose-950/40 px-3.5 py-1.5 text-3xs sm:text-xs font-bold uppercase tracking-wider text-rose-200 shadow-inner backdrop-blur-sm transition-all duration-300 active:scale-95 cursor-pointer pointer-events-auto"
            >
              Skip Intro ⚡
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Main Layout Flow Container */}
      <div className="relative z-30 flex min-h-screen w-full flex-col items-center justify-between py-10 px-4 sm:px-6 pointer-events-none">
        
        {/* Top Header */}
        <div className="h-10 text-center mt-2 pointer-events-auto">
          <AnimatePresence>
            {phase === "envelope_reveal" && (
              <motion.h2
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 0.75, y: 0 }}
                className={`${caveat.className} text-xl sm:text-2xl font-semibold text-rose-200 drop-shadow-sm`}
              >
                Today's Secret Magic... 🌹
              </motion.h2>
            )}
          </AnimatePresence>
        </div>

        {/* Center: Empty Spacer Aligning with number "6" Canvas */}
        <div className="flex-1 w-full flex items-center justify-center">
          <div className="h-[36vh] max-h-[360px] aspect-[4/5]" />
        </div>

        {/* Bottom Area: Countdown Header + Envelope */}
        <div className="w-full text-center flex flex-col items-center gap-4 sm:gap-6 pointer-events-auto z-45 mb-2">
          <AnimatePresence mode="wait">
            {phase === "envelope_reveal" && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.0 }}
                className="flex flex-col items-center gap-6 max-w-2xl px-2 w-full"
              >
                {/* Title */}
                <div>
                  <h1
                    className={`${playfair.className} text-3xl sm:text-5xl md:text-6.5xl font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-rose-100 via-rose-200 to-red-400 drop-shadow-[0_2px_15px_rgba(244,63,94,0.3)] uppercase`}
                  >
                    ❤️ 6 DAYS TO GO ❤️
                  </h1>
                </div>

                {/* Envelope Subtitle Prompt */}
                <motion.p
                  animate={envelopeState === "closed" ? { opacity: [0.6, 1.0, 0.6] } : { opacity: 0 }}
                  transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
                  className={`${caveat.className} text-lg sm:text-2xl text-rose-200 font-bold`}
                >
                  {envelopeState === "closed" ? "There's a small letter inside..Open this when you're ready❤️." : " "}
                </motion.p>

                {/* Interactive Envelope Bounding Container */}
                <div className="relative flex items-center justify-center w-full min-h-[340px] pt-4 select-none">
                  
                  {/* Envelope Body */}
                  <motion.div
                    onHoverStart={() => setHoveredEnvelope(true)}
                    onHoverEnd={() => setHoveredEnvelope(false)}
                    animate={
                      hoveredEnvelope && envelopeState === "closed" ? { y: -8, scale: 1.02 } : { y: 0 }
                    }
                    className="relative w-72 h-44 sm:w-85 sm:h-48 rounded-lg bg-amber-50 shadow-2xl border border-amber-100/50 flex items-center justify-center overflow-visible"
                  >
                    {/* ENVELOPE SHADOW AND FOLD SHAPES */}
                    <div className="absolute inset-0 rounded-lg overflow-hidden z-25 pointer-events-none">
                      {/* Left flap */}
                      <div className="absolute inset-0 bg-amber-100/80 border-r border-amber-200/50" style={{ clipPath: "polygon(0% 0%, 50% 50%, 0% 100%)" }} />
                      {/* Right flap */}
                      <div className="absolute inset-0 bg-amber-100/80 border-l border-amber-200/50" style={{ clipPath: "polygon(100% 0%, 50% 50%, 100% 100%)" }} />
                      {/* Bottom flap */}
                      <div className="absolute inset-0 bg-amber-50 border-t border-amber-200/40" style={{ clipPath: "polygon(0% 100%, 50% 48%, 100% 100%)" }} />
                    </div>

                    {/* Envelope top flap (flips open vertically) */}
                    <motion.div
                      className="absolute inset-x-0 top-0 h-1/2 bg-amber-100 origin-top shadow-md z-30"
                      style={{ clipPath: "polygon(0% 0%, 100% 0%, 50% 100%)" }}
                      animate={
                        envelopeState === "opening_flap" ||
                        envelopeState === "sliding_letter" ||
                        envelopeState === "unfolding_letter"
                          ? { rotateX: 180, zIndex: 10 }
                          : { rotateX: 0, zIndex: 30 }
                      }
                      transition={{ duration: 0.8, ease: "easeInOut" }}
                    />

                    {/* Wax Seal split (Day 6 Red Stamp) */}
                    <AnimatePresence>
                      {envelopeState === "closed" || envelopeState === "breaking_seal" ? (
                        <motion.div
                          onClick={handleSealClick}
                          className="absolute z-40 cursor-pointer h-12 w-12 rounded-full bg-gradient-to-tr from-rose-800 to-red-600 border border-rose-400 shadow-lg flex items-center justify-center text-rose-100 text-lg hover:scale-110 active:scale-95 transition-transform duration-200"
                          exit={
                            envelopeState === "breaking_seal"
                              ? {
                                  opacity: 0,
                                  scale: 0.8,
                                  rotate: [0, -10, 10],
                                }
                              : {}
                          }
                          transition={{ duration: 0.5 }}
                        >
                          🌹
                        </motion.div>
                      ) : null}
                    </AnimatePresence>

                    {/* Inside: The Letter Card */}
                    <motion.div
                      className="absolute bg-[#faf6f0] border border-amber-900/10 shadow-2xl rounded-md px-6 py-5 text-left text-amber-950 flex flex-col justify-start overflow-y-auto cursor-text select-text"
                      style={{
                        width: "90%",
                        left: "5%",
                        transformOrigin: "center bottom",
                      }}
                      initial={{ y: 0, height: "80%", zIndex: 20, scale: 0.95 }}
                      animate={
                        envelopeState === "sliding_letter"
                          ? { y: -100, height: "80%", zIndex: 35, scale: 1.0 }
                          : envelopeState === "unfolding_letter"
                          ? { y: -200, height: "300px", zIndex: 45, scale: 1.02 }
                          : { y: 0, height: "80%", zIndex: 20, scale: 0.95 }
                      }
                      transition={{
                        y: { duration: 0.75, ease: "easeOut" },
                        height: { duration: 0.85, ease: "easeOut" },
                        scale: { duration: 0.75 },
                      }}
                    >
                      {/* Letter message body details */}
                      <AnimatePresence>
                        {(envelopeState === "sliding_letter" ||
                          envelopeState === "unfolding_letter") && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                            className="flex flex-col flex-1"
                          >
                            {/* Decorative Letter Stamp */}
                            <div className="flex justify-between items-center border-b border-amber-950/15 pb-2 mb-3">
                              <span className={`${playfair.className} text-xs font-bold tracking-widest text-amber-900/60 uppercase`}>
                                Countdown Day 6
                              </span>
                              <span className="text-sm opacity-60">💌</span>
                            </div>
                            
                            {/* Scrollable Letter Message Text */}
                            <p className={`${playfair.className} text-sm sm:text-base leading-relaxed text-amber-950/90 whitespace-pre-line italic flex-1`}>
                              {LETTER_MESSAGE}
                            </p>

                            {/* Letter bottom close trigger */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEnvelopeState("closed");
                              }}
                              className="mt-3 text-2xs font-bold uppercase tracking-widest text-red-800 hover:text-red-600 transition self-end cursor-pointer"
                            >
                              Close Letter
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>

                  </motion.div>
                </div>

                {/* Return trigger buttons */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.6, duration: 0.8 }}
                  className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mt-2 w-full sm:w-auto z-45"
                >
                  <button
                    onClick={replayMagic}
                    className="w-full sm:w-auto rounded-full border border-rose-900/40 bg-rose-950/15 hover:bg-rose-900/25 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-rose-200 shadow-md backdrop-blur-sm transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-2 cursor-pointer group"
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
