"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Heart, X } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { Caveat } from "next/font/google";

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["400", "700"],
});

interface BirthdayCountdownRevealProps {
  onClose: () => void;
}

interface SparkleParticle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  angle: number;
  distance: number;
  duration: number;
  delay: number;
}

// Glow colors for hover matching gradients
const GLOW_COLORS: Record<string, string> = {
  "url(#butterfly-pink)": "rgba(244, 63, 94, 0.95)",
  "url(#butterfly-lavender)": "rgba(168, 85, 247, 0.95)",
  "url(#butterfly-white)": "rgba(244, 180, 254, 0.95)",
};

function getRandomGradient() {
  const gradients = [
    "url(#butterfly-pink)",
    "url(#butterfly-lavender)",
    "url(#butterfly-white)",
  ];
  return gradients[Math.floor(Math.random() * gradients.length)];
}

// Butterfly wing path variant 1: Swallowtail style
const ButterflyPath1 = ({ color }: { color: string }) => (
  <g>
    {/* Left wings */}
    <path
      d="M 50,45 C 38,12 2,8 5,42 C 7,62 28,64 48,54 C 38,76 15,90 26,96 C 37,102 48,82 50,55"
      fill={color}
      className="wing-left"
    />
    {/* Right wings */}
    <path
      d="M 50,45 C 62,12 98,8 95,42 C 93,62 72,64 52,54 C 62,76 85,90 74,96 C 63,102 52,82 50,55"
      fill={color}
      className="wing-right"
    />
    {/* Wing veins / details */}
    <path
      d="M 50,45 C 40,22 15,16 18,36 C 20,46 32,48 46,47 M 50,45 C 44,56 30,68 32,78"
      stroke="#ffffff"
      strokeWidth="1.3"
      strokeLinecap="round"
      fill="none"
      opacity="0.45"
      className="wing-left"
    />
    <path
      d="M 50,45 C 60,22 85,16 82,36 C 80,46 68,48 54,47 M 50,45 C 56,56 70,68 68,78"
      stroke="#ffffff"
      strokeWidth="1.3"
      strokeLinecap="round"
      fill="none"
      opacity="0.45"
      className="wing-right"
    />
  </g>
);

// Butterfly wing path variant 2: Broad monarch-like style
const ButterflyPath2 = ({ color }: { color: string }) => (
  <g>
    {/* Left wings */}
    <path
      d="M 50,48 C 32,20 6,15 8,45 C 9,62 30,62 48,56 C 38,78 18,88 28,94 C 38,100 48,82 50,58"
      fill={color}
      className="wing-left"
    />
    {/* Right wings */}
    <path
      d="M 50,48 C 68,20 94,15 92,45 C 91,62 70,62 52,56 C 62,78 82,88 72,94 C 62,100 52,82 50,58"
      fill={color}
      className="wing-right"
    />
    {/* Veins */}
    <path
      d="M 50,48 C 38,28 20,24 22,38 C 24,46 35,48 46,49 M 48,56 C 40,68 28,74 34,82"
      stroke="#ffffff"
      strokeWidth="1.1"
      strokeLinecap="round"
      fill="none"
      opacity="0.45"
      className="wing-left"
    />
    <path
      d="M 50,48 C 62,28 80,24 78,38 C 76,46 65,48 54,49 M 52,56 C 60,68 72,74 66,82"
      stroke="#ffffff"
      strokeWidth="1.1"
      strokeLinecap="round"
      fill="none"
      opacity="0.45"
      className="wing-right"
    />
  </g>
);

// Butterfly wing path variant 3: Delicate round fairy style
const ButterflyPath3 = ({ color }: { color: string }) => (
  <g>
    {/* Left wings */}
    <path
      d="M 50,50 C 32,12 12,18 15,48 C 17,62 36,62 49,56 C 44,76 28,92 38,96 C 47,99 50,78 50,58"
      fill={color}
      className="wing-left"
    />
    {/* Right wings */}
    <path
      d="M 50,50 C 68,12 88,18 85,48 C 83,62 64,62 51,56 C 56,76 72,92 62,96 C 53,99 50,78 50,58"
      fill={color}
      className="wing-right"
    />
    {/* Soft sparkles on wings */}
    <circle cx="28" cy="36" r="3" fill="#ffffff" opacity="0.65" className="wing-left" />
    <circle cx="72" cy="36" r="3" fill="#ffffff" opacity="0.65" className="wing-right" />
    <circle cx="34" cy="48" r="1.8" fill="#ffffff" opacity="0.55" className="wing-left" />
    <circle cx="66" cy="48" r="1.8" fill="#ffffff" opacity="0.55" className="wing-right" />
  </g>
);

// Butterfly Body
const ButterflyBody = () => (
  <g>
    <path
      d="M 50,68 L 50,30"
      stroke="#27101c"
      strokeWidth="3.5"
      strokeLinecap="round"
    />
    <path
      d="M 50,30 Q 45,18 36,20"
      fill="none"
      stroke="#27101c"
      strokeWidth="2.2"
      strokeLinecap="round"
    />
    <path
      d="M 50,30 Q 55,18 64,20"
      fill="none"
      stroke="#27101c"
      strokeWidth="2.2"
      strokeLinecap="round"
    />
    <circle cx="50" cy="32" r="2.8" fill="#27101c" />
    <circle cx="50" cy="42" r="2.2" fill="#27101c" />
    <circle cx="50" cy="50" r="1.8" fill="#27101c" />
  </g>
);

const ButterflySVG = ({ variant, gradientId }: { variant: number; gradientId: string }) => {
  return (
    <svg
      viewBox="0 0 100 100"
      className="w-full h-full"
      style={{ perspective: "1000px" }}
    >
      {variant === 0 && <ButterflyPath1 color={gradientId} />}
      {variant === 1 && <ButterflyPath2 color={gradientId} />}
      {variant === 2 && <ButterflyPath3 color={gradientId} />}
      <ButterflyBody />
    </svg>
  );
};

export default function BirthdayCountdownReveal({ onClose }: BirthdayCountdownRevealProps) {
  const [step, setStep] = useState<"revealing" | "revealed">("revealing");
  const [showTomorrowMessage, setShowTomorrowMessage] = useState(false);

  // Switch to 'revealed' state after butterfly entry animation completes
  useEffect(() => {
    if (step === "revealing") {
      const timer = setTimeout(() => {
        setStep("revealed");
      }, 4200); // 4.2 seconds matches flight duration + delay
      return () => clearTimeout(timer);
    }
  }, [step]);

  // Generate background elements
  const floatingHearts = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: Math.random() * 15,
      duration: 10 + Math.random() * 12,
      size: 15 + Math.random() * 25,
      scale: 0.4 + Math.random() * 0.8,
    }));
  }, []);

  // Generate 185 butterflies forming a thick, beautiful shape of "8"
  const butterflies = useMemo(() => {
    const list = [];
    const N1 = 80;  // Top circle of 8
    const N2 = 105; // Bottom circle of 8

    // Top loop: center (50, 34), width rx=18, height ry=14
    for (let i = 0; i < N1; i++) {
      const angle = (i / N1) * Math.PI * 2;
      const cx = 50;
      const cy = 34;
      const rx = 18;
      const ry = 14;
      
      // Thick cluster spread (wider noise/jitter to create a lush, dense look instead of a thin line)
      const spreadX = (Math.random() - 0.5) * 5;
      const spreadY = (Math.random() - 0.5) * 5;
      const tx = cx + rx * Math.cos(angle) + spreadX;
      const ty = cy + ry * Math.sin(angle) + spreadY;

      // Start offscreen in random positions
      const angleStart = Math.random() * Math.PI * 2;
      const distStart = 160 + Math.random() * 100;
      const sx = 50 + distStart * Math.cos(angleStart);
      const sy = 50 + distStart * Math.sin(angleStart);

      // Curved Path Control Point (Bezier logic)
      const midX = (sx + tx) / 2;
      const midY = (sy + ty) / 2;
      const perpAngle = Math.atan2(ty - sy, tx - sx) + Math.PI / 2;
      const curveOffset = (Math.random() - 0.5) * 60; // perpendicular curve radius
      const cx_path = midX + curveOffset * Math.cos(perpAngle);
      const cy_path = midY + curveOffset * Math.sin(perpAngle);

      const grad = getRandomGradient();

      list.push({
        id: i,
        variant: i % 3,
        gradientId: grad,
        glowColor: GLOW_COLORS[grad],
        size: 14 + Math.random() * 16, // Random sizing
        sx,
        sy,
        cx_path,
        cy_path,
        tx,
        ty,
        delay: Math.random() * 0.7,
        duration: 3.2 + Math.random() * 0.8,
        hoverDuration: 3.5 + Math.random() * 3,
        hoverXRange: 1.5 + Math.random() * 2.5,
        hoverYRange: 1.5 + Math.random() * 2.5,
        initRotate: (Math.random() - 0.5) * 60,
      });
    }

    // Bottom loop: center (50, 66), width rx=24, height ry=18
    for (let i = 0; i < N2; i++) {
      const angle = (i / N2) * Math.PI * 2;
      const cx = 50;
      const cy = 66;
      const rx = 24;
      const ry = 18;
      
      const spreadX = (Math.random() - 0.5) * 6;
      const spreadY = (Math.random() - 0.5) * 6;
      const tx = cx + rx * Math.cos(angle) + spreadX;
      const ty = cy + ry * Math.sin(angle) + spreadY;

      // Start offscreen in random positions
      const angleStart = Math.random() * Math.PI * 2;
      const distStart = 160 + Math.random() * 100;
      const sx = 50 + distStart * Math.cos(angleStart);
      const sy = 50 + distStart * Math.sin(angleStart);

      // Curved Path Control Point
      const midX = (sx + tx) / 2;
      const midY = (sy + ty) / 2;
      const perpAngle = Math.atan2(ty - sy, tx - sx) + Math.PI / 2;
      const curveOffset = (Math.random() - 0.5) * 70;
      const cx_path = midX + curveOffset * Math.cos(perpAngle);
      const cy_path = midY + curveOffset * Math.sin(perpAngle);

      const grad = getRandomGradient();

      list.push({
        id: N1 + i,
        variant: i % 3,
        gradientId: grad,
        glowColor: GLOW_COLORS[grad],
        size: 14 + Math.random() * 16,
        sx,
        sy,
        cx_path,
        cy_path,
        tx,
        ty,
        delay: Math.random() * 0.7,
        duration: 3.2 + Math.random() * 0.8,
        hoverDuration: 3.5 + Math.random() * 3,
        hoverXRange: 1.5 + Math.random() * 2.5,
        hoverYRange: 1.5 + Math.random() * 2.5,
        initRotate: (Math.random() - 0.5) * 60,
      });
    }

    return list;
  }, []);

  // Generate sparkles for trail
  const trailSparkles = useMemo(() => {
    // Select about 90 paths to leave behind sparkle trails
    return butterflies.slice(0, 90).map((b, idx) => ({
      id: idx,
      sx: b.sx,
      sy: b.sy,
      cx_path: b.cx_path,
      cy_path: b.cy_path,
      tx: b.tx,
      ty: b.ty,
      duration: b.duration * 0.55, // fades out faster
      delay: b.delay + 0.15,        // lags slightly behind the butterfly
      size: 3 + Math.random() * 4,
    }));
  }, [butterflies]);

  // Generate 75 sparkles for the completion burst
  const sparkles = useMemo(() => {
    const list: SparkleParticle[] = [];
    const colors = ["#fbbf24", "#f472b6", "#ffffff", "#fbcfe8", "#d8b4fe"];
    
    for (let i = 0; i < 75; i++) {
      const isTop = i % 2 === 0;
      const cx = 50;
      const cy = isTop ? 34 : 66;
      const rx = isTop ? 18 : 24;
      const ry = isTop ? 14 : 18;
      const angle = Math.random() * Math.PI * 2;
      
      const x = cx + rx * Math.cos(angle);
      const y = cy + ry * Math.sin(angle);
      
      const burstAngle = Math.random() * 360;
      const distance = 40 + Math.random() * 120; 
      
      list.push({
        id: i,
        x,
        y,
        size: 3.5 + Math.random() * 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        angle: burstAngle,
        distance,
        duration: 1.1 + Math.random() * 0.8,
        delay: Math.random() * 0.2,
      });
    }
    return list;
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-start overflow-y-auto bg-gradient-to-tr from-[#ffe4e6] via-[#ffd5e8] to-[#fbcfe8]"
    >
      {/* Shared Gradient Definitions */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="butterfly-pink" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f472b6" />
            <stop offset="100%" stopColor="#be185d" />
          </linearGradient>
          <linearGradient id="butterfly-lavender" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c084fc" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
          <linearGradient id="butterfly-white" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#f5d0fe" />
          </linearGradient>
        </defs>
      </svg>

      {/* GPU Accelerated CSS Keyframes for zero-lag fly + hover animations */}
      <style>{`
        @keyframes fly-to-eight {
          0% {
            left: var(--start-x);
            top: var(--start-y);
            opacity: 0;
            transform: scale(0.1);
          }
          50% {
            left: var(--ctrl-x);
            top: var(--ctrl-y);
            opacity: 0.8;
            transform: scale(0.65);
          }
          100% {
            left: var(--target-x);
            top: var(--target-y);
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes fly-trail {
          0% {
            left: var(--start-x);
            top: var(--start-y);
            opacity: 0;
            transform: scale(0);
          }
          30% {
            opacity: 0.9;
            transform: scale(1.3);
          }
          60% {
            opacity: 0;
            transform: scale(0);
          }
          100% {
            left: var(--ctrl-x);
            top: var(--ctrl-y);
            opacity: 0;
            transform: scale(0);
          }
        }
        @keyframes gentle-hover-8 {
          0%, 100% {
            transform: translate(0, 0);
          }
          33% {
            transform: translate(var(--hover-x), var(--hover-y));
          }
          66% {
            transform: translate(calc(-1 * var(--hover-x)), calc(-1 * var(--hover-y)));
          }
        }
        @keyframes flutter-left {
          0%, 100% { transform: rotateY(0deg); }
          50% { transform: rotateY(74deg); }
        }
        @keyframes flutter-right {
          0%, 100% { transform: rotateY(0deg); }
          50% { transform: rotateY(-74deg); }
        }
        @keyframes float-container {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-16px);
          }
        }
        
        .wing-left {
          transform-origin: 50px 50px;
          animation: flutter-left 0.15s infinite ease-in-out;
        }
        .wing-right {
          transform-origin: 50px 50px;
          animation: flutter-right 0.15s infinite ease-in-out;
        }

        .butterfly-wrapper {
          position: absolute;
          pointer-events: none;
          transform: scale(0.1);
          opacity: 0;
          animation: 
            fly-to-eight var(--duration) var(--delay) cubic-bezier(0.25, 1, 0.5, 1) forwards,
            gentle-hover-8 var(--hover-duration) calc(var(--duration) + var(--delay)) infinite ease-in-out;
        }

        .butterfly-inner {
          pointer-events: auto;
          transform: rotate(var(--init-rotate)) scale(1);
          transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), filter 0.3s;
          cursor: pointer;
          width: 100%;
          height: 100%;
          filter: drop-shadow(0 2px 8px rgba(244, 63, 94, 0.25)) drop-shadow(0 0 10px rgba(255, 255, 255, 0.25));
        }

        .butterfly-inner:hover {
          transform: rotate(var(--init-rotate)) scale(1.6) !important;
          filter: drop-shadow(0 0 18px var(--glow-color)) drop-shadow(0 0 8px #ffffff) brightness(1.35) !important;
          z-index: 100 !important;
        }

        .float-enabled {
          animation: float-container 6.5s ease-in-out infinite;
        }

        .glow-aura {
          filter: drop-shadow(0 0 25px rgba(244, 63, 94, 0.45)) drop-shadow(0 0 50px rgba(251, 113, 133, 0.25));
        }
      `}</style>

      {/* Floating Hearts Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {floatingHearts.map((heart) => (
          <motion.div
            key={heart.id}
            className="absolute bottom-0 text-pink-300/40"
            style={{ left: heart.left }}
            initial={{ y: "110vh", scale: heart.scale, opacity: 0 }}
            animate={{
              y: "-10vh",
              opacity: [0, 0.7, 0.7, 0],
              rotate: [0, 45, -45, 0],
            }}
            transition={{
              duration: heart.duration,
              delay: heart.delay,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <Heart size={heart.size} fill="currentColor" />
          </motion.div>
        ))}
      </div>

      {/* Dimmed atmospheric overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.35 }}
        transition={{ duration: 1.5 }}
        className="absolute inset-0 bg-[#4c1d24]/30 z-10 pointer-events-none mix-blend-multiply"
      />

      {/* Ambient pink glowing aura in revealed state */}
      <AnimatePresence>
        {step === "revealed" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.75 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2.0 }}
            className="absolute inset-0 pointer-events-none z-10 animate-pulse"
            style={{ animationDuration: "6s" }}
          >
            <div className="absolute top-[34%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-52 h-52 rounded-full bg-pink-400/45 blur-[70px] mix-blend-screen shadow-[0_0_80px_rgba(244,63,94,0.3)]" />
            <div className="absolute top-[66%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-rose-400/45 blur-[80px] mix-blend-screen shadow-[0_0_90px_rgba(244,63,94,0.3)]" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute right-6 top-6 z-55 rounded-full border border-white/50 bg-white/20 p-3 text-rose-900 shadow-md backdrop-blur-md transition-all duration-300 hover:bg-white/40 hover:scale-110 active:scale-95 cursor-pointer"
        aria-label="Close surprise"
      >
        <X size={22} />
      </button>

      {/* Content wrapper */}
      <div className="relative z-20 flex min-h-screen w-full max-w-4xl flex-col items-center justify-between py-12 px-6">
        
        {/* Top Title */}
        <div className="h-10 text-center">
          {step === "revealed" && (
            <motion.h2
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className={`${caveat.className} text-2xl md:text-3.5xl font-bold text-pink-800 drop-shadow-sm`}
            >
              Today's Secret Magic... ✨
            </motion.h2>
          )}
        </div>

        {/* Center: Butterflies Number 8 Container */}
        <div className="relative flex flex-1 w-full items-center justify-center">
          <div 
            className={`relative w-full max-w-[460px] h-[55vh] max-h-[500px] aspect-[4/5] z-30 ${step === "revealed" ? "float-enabled" : ""}`}
          >
            
            {/* Sparkle trails left behind by flying butterflies */}
            {step === "revealing" && (
              <div className="absolute inset-0 pointer-events-none z-20">
                {trailSparkles.map((s) => (
                  <div
                    key={`trail-${s.id}`}
                    className="absolute rounded-full bg-white shadow-[0_0_8px_#ffffff,0_0_12px_#ffd5e8]"
                    style={{
                      "--start-x": `${s.sx}%`,
                      "--start-y": `${s.sy}%`,
                      "--ctrl-x": `${s.cx_path}%`,
                      "--ctrl-y": `${s.cy_path}%`,
                      "--target-x": `${s.tx}%`,
                      "--target-y": `${s.ty}%`,
                      "--duration": `${s.duration}s`,
                      "--delay": `${s.delay}s`,
                      width: `${s.size}px`,
                      height: `${s.size}px`,
                      animation: "fly-trail var(--duration) var(--delay) ease-out forwards",
                      transformOrigin: "center center",
                    } as React.CSSProperties}
                  />
                ))}
              </div>
            )}

            {/* Sparkle explosion on completion */}
            {step === "revealed" && (
              <div className="absolute inset-0 pointer-events-none z-40">
                {sparkles.map((p) => {
                  const rad = (p.angle * Math.PI) / 180;
                  const tx = Math.cos(rad) * p.distance;
                  const ty = Math.sin(rad) * p.distance;

                  return (
                    <motion.div
                      key={p.id}
                      className="absolute rounded-full"
                      style={{
                        left: `${p.x}%`,
                        top: `${p.y}%`,
                        width: p.size,
                        height: p.size,
                        backgroundColor: p.color,
                        boxShadow: `0 0 10px ${p.color}, 0 0 20px ${p.color}`,
                      }}
                      initial={{ opacity: 1, scale: 0 }}
                      animate={{
                        opacity: [1, 1, 0],
                        scale: [0, 1.4, 0.2],
                        x: tx,
                        y: ty,
                      }}
                      transition={{
                        duration: p.duration,
                        delay: p.delay,
                        ease: "easeOut",
                      }}
                    />
                  );
                })}
              </div>
            )}

            {/* GPU Composite Thread Butterflies rendering */}
            {butterflies.map((b) => {
              // Custom CSS Variables mapping
              const styles = {
                "--start-x": `${b.sx}%`,
                "--start-y": `${b.sy}%`,
                "--ctrl-x": `${b.cx_path}%`,
                "--ctrl-y": `${b.cy_path}%`,
                "--target-x": `${b.tx}%`,
                "--target-y": `${b.ty}%`,
                "--init-rotate": `${b.initRotate}deg`,
                "--duration": `${b.duration}s`,
                "--delay": `${b.delay}s`,
                "--hover-x": `${b.hoverXRange}%`,
                "--hover-y": `${b.hoverYRange}%`,
                "--hover-duration": `${b.hoverDuration}s`,
                "--glow-color": b.glowColor,
                width: `${b.size}px`,
                height: `${b.size}px`,
              } as React.CSSProperties;

              return (
                <div
                  key={b.id}
                  className="butterfly-wrapper"
                  style={styles}
                >
                  <div className="butterfly-inner">
                    <ButterflySVG variant={b.variant} gradientId={b.gradientId} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom: Countdown Text and Romantic Message */}
        <div className="w-full text-center flex flex-col items-center gap-3">
          <AnimatePresence>
            {step === "revealed" && (
              <>
                {/* 8 DAYS TO GO */}
                <motion.h1
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="text-4xl md:text-5xl font-extrabold tracking-widest text-rose-600 text-center drop-shadow-[0_2px_15px_rgba(255,255,255,0.9)]"
                >
                  ❤️ 8 DAYS TO GO ❤️
                </motion.h1>

                {/* Romantic Message Card */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.9, delay: 0.9 }}
                  className="relative max-w-xl mx-auto rounded-3xl border border-white/60 bg-white/30 px-8 py-5 shadow-[0_15px_45px_rgba(244,63,94,0.12)] backdrop-blur-md mt-2 flex items-center justify-center gap-2 text-rose-950"
                >
                  <span className={`${caveat.className} absolute left-4 top-2 text-5xl text-rose-400/40 select-none`}>“</span>
                  <span className={`${caveat.className} absolute right-4 bottom-0 text-5xl text-rose-400/40 select-none`}>”</span>
                  <p className={`${caveat.className} text-2xl md:text-3.5xl font-bold tracking-wide leading-relaxed text-rose-950/95`}>
                    🦋 "8 nights are left for my Pattampoochi's birthday ❤️"
                  </p>
                </motion.div>

                {/* Reveal tomorrow surprise button */}
                <motion.button
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 0.85, scale: 1 }}
                  transition={{ delay: 1.5 }}
                  onClick={() => window.location.href = "/unlock?day=7"}
                  className="mt-4 relative overflow-hidden rounded-full border border-white/50 bg-white/20 px-6 py-2.5 shadow-md backdrop-blur-md transition-all duration-300 hover:bg-white/30 hover:scale-105 active:scale-95 text-rose-950 font-bold text-sm flex items-center gap-2 cursor-pointer group z-35"
                >
                  ✨ Reveal tomorrow surprise ✨
                </motion.button>

                <AnimatePresence>
                  {showTomorrowMessage && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: -8, height: 0 }}
                      animate={{ opacity: 1, scale: 1, y: 0, height: "auto" }}
                      exit={{ opacity: 0, scale: 0.9, y: -8, height: 0 }}
                      transition={{ duration: 0.35, ease: "easeOut" }}
                      className="overflow-hidden mt-1 w-full max-w-xs"
                    >
                      <div className="rounded-2xl border border-rose-200/50 bg-rose-50/85 px-6 py-3.5 shadow-md flex items-center justify-center gap-2 text-rose-900 font-bold">
                        <span className={`${caveat.className} text-xl md:text-2xl flex items-center gap-2`}>
                          🔒 Wait till 27-06-26 12:00 am ❤️
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Return trigger option */}
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.6 }}
                  transition={{ delay: 2.2 }}
                  onClick={onClose}
                  className="mt-6 text-xs font-semibold uppercase tracking-widest text-rose-800 hover:text-rose-600 hover:opacity-100 transition duration-200 underline cursor-pointer"
                >
                  Back to Collage
                </motion.button>
              </>
            )}
          </AnimatePresence>
        </div>

      </div>
    </motion.div>
  );
}
