"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, Send } from "lucide-react";
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

// EDIT YOUR PERSONAL HANDWRITTEN WISH MESSAGE HERE
const WISH_TEXT = `My Dearest Ammadiii, ❤️

I wish that every single sunset brings you closer to your dreams, and that this new year of your life is filled with infinite laughter, peace, and the magic you bring always.

I promise to keep making you smile, to stand by you in every storm, and to cherish this beautiful bond we share forever. You are truly my happiness.

Only 5 more sunsets until your special day... 🏮✨

With all my love,
Your Special Person ❤️`;

interface BirthdayFiveRevealProps {
  onClose: () => void;
}

type Phase =
  | "dark"
  | "ambient_fade"
  | "gathering"
  | "breathing"
  | "envelope_reveal";

interface Lantern {
  id: number;
  startXPercent: number;
  startYPercent: number; // spawn below the screen
  x: number;
  y: number;
  size: number;
  pulseSpeed: number;
  pulsePhase: number;
  flickerOffset: number;
  speedY: number; // upward drift speed
  windSpeed: number;
  windPhase: number;
  isGatherer: boolean;
  targetXPercent: number;
  targetYPercent: number;
  baseOffsetDistance: number;
  offsetDirection: number;
  trail: { x: number; y: number; opacity: number }[];
}

interface Firefly {
  id: number;
  x: number;
  y: number;
  size: number;
  angle: number;
  angleSpeed: number;
  speed: number;
  pulsePhase: number;
  pulseSpeed: number;
}

interface GlowParticle {
  id: number;
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  fadeSpeed: number;
}

interface MistCloud {
  x: number;
  y: number;
  radiusX: number;
  radiusY: number;
  speedX: number;
  opacity: number;
}

export default function BirthdayFiveReveal({ onClose }: BirthdayFiveRevealProps) {
  const [phase, setPhase] = useState<Phase>("dark");
  const [showWishModal, setShowWishModal] = useState(false);
  const [wishOpened, setWishOpened] = useState(false);
  const [wishReleased, setWishReleased] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // References for the animation loops to prevent re-renders interrupting calculations
  const phaseRef = useRef<Phase>("dark");
  const gatherProgressRef = useRef<number>(0);
  const glowProgressRef = useRef<number>(0);

  const lanternsRef = useRef<Lantern[]>([]);
  const firefliesRef = useRef<Firefly[]>([]);
  const glowParticlesRef = useRef<GlowParticle[]>([]);
  const mistCloudsRef = useRef<MistCloud[]>([]);

  const animationFrameIdRef = useRef<number | null>(null);
  const timersRef = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  const easeInOutCubic = (x: number) => {
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  };

  // Pre-calculate target coordinates representing a beautiful glowing number "5"
  const targetNormalizedPoints = useMemo(() => {
    const points: { x: number; y: number }[] = [];

    // Let's create a beautiful, well-proportioned "5" in normalized space
    // Coordinate boundaries: x = [-0.25, 0.25], y = [-0.42, 0.42]

    // 1. Top horizontal bar: from x = 0.20 to x = -0.16 at y = -0.42 (60 points)
    for (let i = 0; i < 60; i++) {
      const t = i / 59;
      points.push({
        x: 0.20 - t * 0.36,
        y: -0.42,
      });
    }

    // 2. Vertical stem: from y = -0.42 to y = -0.12 at x = -0.16 (50 points)
    for (let i = 0; i < 50; i++) {
      const t = i / 49;
      points.push({
        x: -0.16,
        y: -0.42 + t * 0.30,
      });
    }

    // 3. Bottom curved loop: center at cx = 0.0, cy = 0.12, radius r = 0.24
    // Start angle: -Math.PI * 0.70 (joins stem at x = -0.16, y = -0.12)
    // End angle: Math.PI * 0.75 (bottom-left curls up slightly)
    // We populate with 140 points for a dense loop
    const cx_loop = 0.01;
    const cy_loop = 0.11;
    const r = 0.24;
    const startAngle = -Math.PI * 0.72;
    const endAngle = Math.PI * 0.76;
    for (let i = 0; i < 140; i++) {
      const t = i / 139;
      const angle = startAngle + t * (endAngle - startAngle);
      points.push({
        x: cx_loop + r * Math.cos(angle),
        y: cy_loop + r * Math.sin(angle),
      });
    }

    return points;
  }, []);

  // Initialize canvas elements once
  useEffect(() => {
    // Spawns lanterns
    const lanterns: Lantern[] = [];
    const numGatherers = targetNormalizedPoints.length; // 250 gatherers
    const numBackground = 70; // 70 background lanterns

    // Initialize all lanterns
    for (let i = 0; i < numGatherers + numBackground; i++) {
      const isGatherer = i < numGatherers;
      lanterns.push({
        id: i,
        startXPercent: 0.05 + Math.random() * 0.9,
        startYPercent: 1.1 + Math.random() * 0.6, // Spawn below the viewport
        x: 0,
        y: 0,
        size: isGatherer ? 12 + Math.random() * 6 : 8 + Math.random() * 6,
        pulseSpeed: 1 + Math.random() * 1.5,
        pulsePhase: Math.random() * Math.PI * 2,
        flickerOffset: Math.random() * Math.PI * 2,
        speedY: 0.6 + Math.random() * 0.9, // Upward float speed
        windSpeed: 0.15 + Math.random() * 0.35,
        windPhase: Math.random() * Math.PI * 2,
        isGatherer,
        targetXPercent: isGatherer ? targetNormalizedPoints[i].x : 0,
        targetYPercent: isGatherer ? targetNormalizedPoints[i].y : 0,
        baseOffsetDistance: 60 + Math.random() * 200,
        offsetDirection: Math.random() < 0.5 ? -1 : 1,
        trail: [],
      });
    }
    lanternsRef.current = lanterns;

    // Spawns fireflies
    const fireflies: Firefly[] = [];
    for (let i = 0; i < 30; i++) {
      fireflies.push({
        id: i,
        x: Math.random() * 500, // initialized properly in resize handler
        y: 400 + Math.random() * 300,
        size: 1.2 + Math.random() * 1.5,
        angle: Math.random() * Math.PI * 2,
        angleSpeed: (Math.random() - 0.5) * 0.05,
        speed: 0.3 + Math.random() * 0.5,
        pulsePhase: Math.random() * Math.PI * 2,
        pulseSpeed: 1.5 + Math.random() * 2.0,
      });
    }
    firefliesRef.current = fireflies;

    // Spawns glow particles
    const glowParticles: GlowParticle[] = [];
    for (let i = 0; i < 40; i++) {
      glowParticles.push({
        id: i,
        x: Math.random() * 500,
        y: Math.random() * 500,
        size: 0.6 + Math.random() * 1.2,
        speedX: (Math.random() - 0.5) * 0.2,
        speedY: -0.1 - Math.random() * 0.3,
        opacity: Math.random(),
        fadeSpeed: 0.002 + Math.random() * 0.003,
      });
    }
    glowParticlesRef.current = glowParticles;

    // Spawns mist clouds
    const mistClouds: MistCloud[] = [];
    for (let i = 0; i < 4; i++) {
      mistClouds.push({
        x: Math.random() * 1000,
        y: 0, // set in resize
        radiusX: 200 + Math.random() * 180,
        radiusY: 40 + Math.random() * 35,
        speedX: 0.12 + Math.random() * 0.15,
        opacity: 0.08 + Math.random() * 0.06,
      });
    }
    mistCloudsRef.current = mistClouds;
  }, [targetNormalizedPoints]);

  const startTimers = () => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];

    // Reset progress refs
    gatherProgressRef.current = 0;
    glowProgressRef.current = 0;
    setWishReleased(false);
    setWishOpened(false);
    setShowWishModal(false);

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
    return () => {
      timersRef.current.forEach((t) => clearTimeout(t));
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, []);

  // Main Canvas Rendering Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const updateSize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Re-align elements to viewport
      const w = window.innerWidth;
      const h = window.innerHeight;
      const lakeTop = h * 0.72;

      firefliesRef.current.forEach((ff) => {
        ff.x = Math.random() * w;
        ff.y = lakeTop + Math.random() * (h - lakeTop);
      });

      glowParticlesRef.current.forEach((gp) => {
        gp.x = Math.random() * w;
        gp.y = Math.random() * h;
      });

      mistCloudsRef.current.forEach((cloud, index) => {
        cloud.x = Math.random() * w;
        cloud.y = lakeTop - 10 + index * 8;
      });
    };

    updateSize();
    window.addEventListener("resize", updateSize);

    // Canvas sky lantern draw routine
    const drawSkyLantern = (
      c: CanvasRenderingContext2D,
      x: number,
      y: number,
      size: number,
      pulse: number,
      flicker: number
    ) => {
      c.save();
      c.translate(x, y);

      const scale = 1 + flicker * 0.05;
      c.scale(scale, scale);

      // Outer golden aura glow
      const glowSize = size * (2.2 + pulse * 0.35);
      const glowGrad = c.createRadialGradient(0, 0, size * 0.2, 0, 0, glowSize);
      glowGrad.addColorStop(0, "rgba(254, 215, 170, 0.7)"); // orange-200
      glowGrad.addColorStop(0.35, "rgba(249, 115, 22, 0.28)"); // orange-500
      glowGrad.addColorStop(1.0, "rgba(249, 115, 22, 0)");
      c.beginPath();
      c.arc(0, 0, glowSize, 0, Math.PI * 2);
      c.fillStyle = glowGrad;
      c.fill();

      // Lantern body path (tapered dome)
      const w = size;
      const h = size * 1.25;

      c.beginPath();
      c.moveTo(-w * 0.38, h * 0.5);
      c.quadraticCurveTo(0, h * 0.56, w * 0.38, h * 0.5); // bottom curve
      c.lineTo(w * 0.48, -h * 0.2); // right edge
      c.bezierCurveTo(w * 0.48, -h * 0.62, -w * 0.48, -h * 0.62, -w * 0.48, -h * 0.2); // rounded top
      c.lineTo(-w * 0.38, h * 0.5); // left edge
      c.closePath();

      // Core lantern body fill
      const bodyGrad = c.createLinearGradient(0, -h * 0.5, 0, h * 0.5);
      bodyGrad.addColorStop(0, "#fef08a"); // yellow-200 (bright translucent top)
      bodyGrad.addColorStop(0.45, "#fdba74"); // orange-300
      bodyGrad.addColorStop(1.0, "#ea580c"); // orange-600 (warm glowing base)
      c.fillStyle = bodyGrad;
      c.fill();

      // Organic trim stroke
      c.lineWidth = 1.0;
      c.strokeStyle = "rgba(254, 240, 138, 0.45)";
      c.stroke();

      // Dark base support rim
      c.beginPath();
      c.moveTo(-w * 0.42, h * 0.5);
      c.quadraticCurveTo(0, h * 0.58, w * 0.42, h * 0.5);
      c.lineWidth = size * 0.08;
      c.strokeStyle = "#431407"; // warm deep brown-red
      c.stroke();

      // Bright flicker flame core
      const flameRadius = size * (0.25 + flicker * 0.06);
      const flameGrad = c.createRadialGradient(0, h * 0.4, 0, 0, h * 0.4, flameRadius * 2.0);
      flameGrad.addColorStop(0, "#ffffff"); // hot white flame core
      flameGrad.addColorStop(0.3, "#fef08a"); // intense yellow
      flameGrad.addColorStop(1.0, "rgba(239, 68, 68, 0)"); // red corona fade
      c.beginPath();
      c.arc(0, h * 0.4, flameRadius * 1.6, 0, Math.PI * 2);
      c.fillStyle = flameGrad;
      c.fill();

      c.restore();
    };

    const animate = () => {
      if (!ctx || !canvas) return;

      const w = window.innerWidth;
      const h = window.innerHeight;
      const now = Date.now();
      const currentPhase = phaseRef.current;

      ctx.clearRect(0, 0, w, h);

      const lakeHeight = h * 0.28;
      const lakeTop = h - lakeHeight;

      // Draw background night sky gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
      skyGrad.addColorStop(0, "#030712"); // deep navy/black
      skyGrad.addColorStop(0.4, "#0f172a"); // blue hour slate
      skyGrad.addColorStop(0.72, "#1e1b4b"); // indigo horizon glow
      skyGrad.addColorStop(1.0, "#2c1a3b"); // deep violet dusk
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h);

      // Phase-based progression handling
      if (currentPhase === "gathering") {
        if (gatherProgressRef.current < 1.0) {
          gatherProgressRef.current += 1.0 / (60 * 4.4); // 4.4s gathering duration
          if (gatherProgressRef.current > 1.0) gatherProgressRef.current = 1.0;
        }
      } else if (currentPhase === "breathing" || currentPhase === "envelope_reveal") {
        gatherProgressRef.current = 1.0;
        if (glowProgressRef.current < 1.0) {
          glowProgressRef.current += 1.0 / (60 * 1.5);
          if (glowProgressRef.current > 1.0) glowProgressRef.current = 1.0;
        }
      }

      const t = gatherProgressRef.current;
      const easedT = easeInOutCubic(t);

      // Sizing constraints for the centered number "5"
      const cx = w / 2;
      const cy = h / 2 - 25; // slightly offset upwards
      const fiveWidth = Math.max(140, Math.min(230, w * 0.40));
      const fiveHeight = Math.max(220, Math.min(350, h * 0.36));

      // Draw soft particles fading in
      if (currentPhase !== "dark") {
        const globalOpacity = currentPhase === "ambient_fade"
          ? Math.min(1.0, (now % 10000) / 2500)
          : 1.0;

        ctx.save();
        glowParticlesRef.current.forEach((gp) => {
          gp.y += gp.speedY;
          gp.x += gp.speedX;

          if (gp.y < -10) {
            gp.y = h + Math.random() * 20;
            gp.x = Math.random() * w;
          }

          ctx.beginPath();
          ctx.arc(gp.x, gp.y, gp.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(253, 224, 71, ${gp.opacity * 0.22 * globalOpacity})`;
          ctx.fill();
        });
        ctx.restore();
      }

      // Draw Lake Reflection Background (underlying horizon mirroring)
      const lakeGrad = ctx.createLinearGradient(0, lakeTop, 0, h);
      lakeGrad.addColorStop(0, "#080614"); // dark reflective boundary
      lakeGrad.addColorStop(0.35, "#030206"); // velvet night reflection
      lakeGrad.addColorStop(1.0, "#000000"); // pitch bottom
      ctx.fillStyle = lakeGrad;
      ctx.fillRect(0, lakeTop, w, lakeHeight);

      // Render sky lanterns + mirror reflections
      const lanterns = lanternsRef.current;
      const pulsePhaseNow = now * 0.0025;

      lanterns.forEach((lantern) => {
        let posX = 0;
        let posY = 0;

        // Pulse and Flicker values
        const pulse = Math.sin(pulsePhaseNow * lantern.pulseSpeed + lantern.pulsePhase);
        const flicker = Math.sin(now * 0.02 + lantern.flickerOffset);

        if (lantern.isGatherer && t > 0) {
          const startX = lantern.startXPercent * w;
          const startY = lantern.startYPercent * h;

          const targetX = cx + lantern.targetXPercent * fiveWidth;
          const targetY = cy + lantern.targetYPercent * fiveHeight;

          const dx = targetX - startX;
          const dy = targetY - startY;

          // Base linear interpolation
          const lx = startX + dx * easedT;
          const ly = startY + dy * easedT;

          // Add curved gravitational vortex effect
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const px = -dy / dist;
          const py = dx / dist;

          const curveStrength = Math.sin(easedT * Math.PI) * (1 - easedT);
          const responsiveOffset = lantern.baseOffsetDistance * Math.min(w / 1100, 1.0);
          const currentOffset = responsiveOffset * lantern.offsetDirection * curveStrength;

          posX = lx + px * currentOffset;
          posY = ly + py * currentOffset;

          // Organic sway when fully gathered
          if (t >= 1.0) {
            const idleFrequency = now * 0.001 * lantern.windSpeed + lantern.windPhase;
            posX += Math.sin(idleFrequency) * 4.5;
            posY += Math.cos(idleFrequency * 0.8) * 3.5;
          }

          // Generate trail during migration
          if (t < 1.0 && Math.random() < 0.28) {
            lantern.trail.push({ x: posX, y: posY, opacity: 1.0 });
          }
          if (lantern.trail.length > 7) lantern.trail.shift();
        } else {
          // Drifting background lanterns float upwards indefinitely
          lantern.startYPercent -= (lantern.speedY * 0.8) / h;
          if (lantern.startYPercent < -0.1) {
            lantern.startYPercent = 1.1; // reset to bottom
            lantern.startXPercent = Math.random();
          }

          posX =
            lantern.startXPercent * w +
            Math.sin(now * 0.0006 * lantern.windSpeed + lantern.windPhase) * 30;
          posY = lantern.startYPercent * h;
        }

        // Draw Trails
        ctx.save();
        lantern.trail.forEach((point, idx) => {
          point.opacity -= 0.06;
          ctx.beginPath();
          ctx.arc(point.x, point.y, 1.8, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(254, 240, 138, ${Math.max(0, point.opacity * 0.32 * (idx / lantern.trail.length))})`;
          ctx.fill();
        });
        ctx.restore();

        // 1. Draw Lake Reflection (Draw reflections first so main lanterns overlay nicely)
        if (posY < lakeTop) {
          const distToLake = lakeTop - posY;
          const reflectedY = lakeTop + distToLake * 0.82; // compressed vertical distance

          if (reflectedY < h) {
            const rippleOpacity = 0.28 * (1.0 - Math.min(1.0, distToLake / (h * 0.7))); // fade as it rises
            if (rippleOpacity > 0.01) {
              const waveOffset = Math.sin(now * 0.0016 + posY * 0.05) * 5.0;
              ctx.save();
              ctx.translate(posX + waveOffset, reflectedY);

              // Reflections are squashed vertically and stretched horizontally
              ctx.scale(1.45, 0.4);

              // Blurred reflection glow
              const refGlowSize = lantern.size * (1.6 + pulse * 0.3);
              const refGlowGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, refGlowSize);
              refGlowGrad.addColorStop(0, `rgba(253, 186, 116, ${rippleOpacity * 0.8})`);
              refGlowGrad.addColorStop(0.5, `rgba(249, 115, 22, ${rippleOpacity * 0.25})`);
              refGlowGrad.addColorStop(1.0, "rgba(249, 115, 22, 0)");
              ctx.beginPath();
              ctx.arc(0, 0, refGlowSize, 0, Math.PI * 2);
              ctx.fillStyle = refGlowGrad;
              ctx.fill();

              // Mirror body outline
              const bodyRefGrad = ctx.createLinearGradient(0, -lantern.size * 0.5, 0, lantern.size * 0.5);
              bodyRefGrad.addColorStop(0, `rgba(254, 240, 138, ${rippleOpacity * 0.75})`);
              bodyRefGrad.addColorStop(1.0, `rgba(234, 88, 12, ${rippleOpacity * 0.15})`);
              ctx.beginPath();
              ctx.ellipse(0, 0, lantern.size * 0.55, lantern.size * 0.75, 0, 0, Math.PI * 2);
              ctx.fillStyle = bodyRefGrad;
              ctx.fill();

              ctx.restore();
            }
          }
        }

        // 2. Draw Sky Lantern
        const sizeScale = Math.max(0.6, Math.min(w / 1100, 1.2));
        const currentSize = lantern.size * sizeScale;

        const fadeOpacity = currentPhase === "dark"
          ? 0
          : currentPhase === "ambient_fade"
            ? Math.min(1.0, (now % 10000) / 2000)
            : 1.0;

        if (fadeOpacity > 0) {
          ctx.save();
          ctx.globalAlpha = fadeOpacity;
          drawSkyLantern(ctx, posX, posY, currentSize, pulse, flicker);
          ctx.restore();
        }
      });

      // Draw Mist layers on the lake horizon
      if (currentPhase !== "dark") {
        ctx.save();
        ctx.globalCompositeOperation = "screen";
        mistCloudsRef.current.forEach((cloud) => {
          cloud.x += cloud.speedX;
          if (cloud.x - cloud.radiusX > w) {
            cloud.x = -cloud.radiusX;
          }

          const grad = ctx.createRadialGradient(
            cloud.x, cloud.y, 0,
            cloud.x, cloud.y, cloud.radiusX
          );
          grad.addColorStop(0, `rgba(99, 102, 241, ${cloud.opacity * 0.8})`); // soft indigo
          grad.addColorStop(0.5, `rgba(168, 85, 247, ${cloud.opacity * 0.3})`); // purple
          grad.addColorStop(1.0, "rgba(0, 0, 0, 0)");

          ctx.beginPath();
          ctx.ellipse(cloud.x, cloud.y, cloud.radiusX, cloud.radiusY, 0, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();
        });
        ctx.restore();
      }

      // Draw wandering fireflies
      if (currentPhase !== "dark") {
        ctx.save();
        firefliesRef.current.forEach((ff) => {
          ff.angle += ff.angleSpeed;
          ff.x += Math.cos(ff.angle) * ff.speed;
          ff.y += Math.sin(ff.angle) * ff.speed + Math.sin(now * 0.001 + ff.pulsePhase) * 0.08;

          // Out-of-bounds looping resets
          if (ff.x < -10) ff.x = w + 10;
          if (ff.x > w + 10) ff.x = -10;
          if (ff.y < lakeTop - 80) ff.y = h;
          if (ff.y > h + 10) ff.y = lakeTop - 80;

          const pulseVal = Math.sin(now * 0.0016 * ff.pulseSpeed + ff.pulsePhase);
          const opacity = 0.35 + (pulseVal + 1) * 0.28;

          // Firefly reflection in lake
          if (ff.y < lakeTop) {
            const dist = lakeTop - ff.y;
            const refY = lakeTop + dist * 0.85;
            if (refY < h) {
              const rOpacity = opacity * 0.22 * (1.0 - dist / (h * 0.3));
              ctx.beginPath();
              ctx.arc(ff.x, refY, ff.size * 0.9, 0, Math.PI * 2);
              ctx.fillStyle = `rgba(234, 179, 8, ${rOpacity})`;
              ctx.fill();
            }
          }

          // Actual firefly
          const glowRad = ff.size * 5;
          const ffGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, glowRad);
          ffGrad.addColorStop(0, `rgba(234, 179, 8, ${opacity})`);
          ffGrad.addColorStop(0.35, `rgba(234, 179, 8, ${opacity * 0.35})`);
          ffGrad.addColorStop(1.0, "rgba(234, 179, 8, 0)");

          ctx.save();
          ctx.translate(ff.x, ff.y);
          ctx.beginPath();
          ctx.arc(0, 0, glowRad, 0, Math.PI * 2);
          ctx.fillStyle = ffGrad;
          ctx.fill();

          ctx.beginPath();
          ctx.arc(0, 0, ff.size * 0.8, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(254, 240, 138, ${opacity})`;
          ctx.fill();
          ctx.restore();
        });
        ctx.restore();
      }

      // If breathing is active, draw a subtle warm glow behind the number "5"
      if (currentPhase === "breathing" || currentPhase === "envelope_reveal") {
        const auraAlpha = 0.16 * glowProgressRef.current * (0.85 + Math.sin(now * 0.0018) * 0.15);
        ctx.save();
        const auraGrad = ctx.createRadialGradient(cx, cy, 50, cx, cy, Math.max(160, w * 0.3));
        auraGrad.addColorStop(0, `rgba(253, 186, 116, ${auraAlpha})`);
        auraGrad.addColorStop(0.4, `rgba(249, 115, 22, ${auraAlpha * 0.35})`);
        auraGrad.addColorStop(1.0, "rgba(0, 0, 0, 0)");
        ctx.beginPath();
        ctx.arc(cx, cy, Math.max(160, w * 0.3), 0, Math.PI * 2);
        ctx.fillStyle = auraGrad;
        ctx.fill();
        ctx.restore();
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
  }, []);

  const skipIntro = () => {
    // Speed up sequence directly to envelope reveal
    timersRef.current.forEach((t) => clearTimeout(t));
    gatherProgressRef.current = 1.0;
    glowProgressRef.current = 1.0;
    setPhase("envelope_reveal");
  };

  // Triggers release animation of wish lantern
  const releaseWishToSky = () => {
    setWishReleased(true);

    // Spawn a custom floating lantern in canvas at center horizontal
    const w = window.innerWidth;
    const h = window.innerHeight;

    setTimeout(() => {
      // Add the lantern to canvas
      lanternsRef.current.push({
        id: Date.now(),
        startXPercent: 0.5,
        startYPercent: 0.9,
        x: w / 2,
        y: h * 0.9,
        size: 26, // custom large size
        pulseSpeed: 1.8,
        pulsePhase: 0,
        flickerOffset: Math.random() * 5,
        speedY: 1.6, // extra fast float speed
        windSpeed: 0.3,
        windPhase: Math.random() * Math.PI,
        isGatherer: false,
        targetXPercent: 0,
        targetYPercent: 0,
        baseOffsetDistance: 0,
        offsetDirection: 1,
        trail: [],
      });

      // Close the modal fully after transition
      setShowWishModal(false);
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 h-screen w-screen overflow-hidden bg-black select-none font-sans text-rose-100">

      {/* Cinematic Main Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full pointer-events-none z-10" />

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

      {/* Skip Intro button */}
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

      {/* Ambient Sound / Narrative prompt */}
      <div className="absolute inset-x-0 top-16 z-30 pointer-events-none text-center">
        <AnimatePresence>
          {phase === "ambient_fade" && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 0.6, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 1.5 }}
              className={`${caveat.className} text-xl sm:text-2xl text-orange-200 tracking-wide`}
            >
              Watch the evening sky wake up... ✨
            </motion.p>
          )}
          {phase === "gathering" && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.7, 0.7, 0], y: [10, 0, 0, -10] }}
              transition={{ times: [0, 0.2, 0.8, 1], duration: 4 }}
              className={`${caveat.className} text-xl sm:text-2xl text-orange-200 tracking-wide`}
            >
              The warm lights gather to tell a secret... 🏮
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Cinematic Content Reveal */}
      <div className="relative z-30 flex min-h-screen w-full flex-col items-center justify-between py-10 px-4 sm:px-6 pointer-events-none">

        {/* Top spacer */}
        <div className="h-10" />

        {/* Center: spacing alignment matching canvas */}
        <div className="flex-grow flex items-center justify-center">
          <div className="h-[36vh] max-h-[350px] aspect-[4/5] pointer-events-none" />
        </div>

        {/* Bottom Area: Text and Wish Lantern Button */}
        <div className="w-full text-center flex flex-col items-center gap-4 sm:gap-6 pointer-events-auto z-45 mb-4">
          <AnimatePresence>
            {phase === "envelope_reveal" && (
              <motion.div
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col items-center gap-5 max-w-xl px-2 w-full"
              >
                {/* 5 Days Countdown Header */}
                <div className="flex flex-col gap-1.5">
                  <h1
                    className={`${playfair.className} text-3.5xl sm:text-5.5xl md:text-6xl font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-orange-200 to-amber-500 drop-shadow-[0_4px_18px_rgba(249,115,22,0.45)] uppercase`}
                  >
                    🏮❤️ 5 DAYS TO GO ❤️🏮
                  </h1>
                  <p className={`${caveat.className} text-xl sm:text-2.5xl text-orange-200 font-medium tracking-wide mt-2`}>
                    Only 5 more sunsets until my Ammadii's birthday. ❤️
                  </p>
                </div>

                {/* Send a Wish Floating Lantern trigger */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 2.0, duration: 1.0 }}
                  className="mt-2 flex flex-col items-center"
                >
                  <button
                    onClick={() => setShowWishModal(true)}
                    className="group relative flex items-center gap-3 overflow-hidden rounded-full border border-orange-500/40 bg-gradient-to-r from-amber-950/80 to-orange-950/80 px-8 py-3.5 shadow-[0_8px_30px_rgba(249,115,22,0.22)] backdrop-blur-md transition-all duration-300 hover:scale-105 hover:bg-orange-900/60 active:scale-95 text-orange-200 font-semibold cursor-pointer"
                  >
                    {/* Pulsing glow background */}
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-orange-500/10 animate-pulse pointer-events-none" />

                    <span className="text-xl animate-bounce">✨</span>
                    <span className="text-base sm:text-lg tracking-wider font-medium">Send a Wish</span>
                    <span className="text-xl">🏮</span>
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Sending a Wish Full Screen Overlay Letter Modal */}
      <AnimatePresence>
        {showWishModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-55 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 pointer-events-auto"
          >
            {/* Modal Container */}
            <motion.div
              initial={{ scale: 0.9, y: 30 }}
              animate={
                wishReleased
                  ? { y: -window.innerHeight, scale: 0.4, opacity: 0 }
                  : { scale: 1, y: 0 }
              }
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ duration: wishReleased ? 1.8 : 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-lg aspect-[3/4] sm:aspect-[4/5] rounded-3xl overflow-hidden bg-[radial-gradient(ellipse_at_top,_#faf5ef_0%,_#f2e7db_100%)] border border-amber-200/50 shadow-[0_25px_80px_rgba(249,115,22,0.3)] flex flex-col justify-between p-6 sm:p-8 md:p-10"
            >
              {/* Close Button */}
              {!wishReleased && (
                <button
                  onClick={() => setShowWishModal(false)}
                  className="absolute right-4 top-4 rounded-full bg-amber-950/10 p-1.5 text-amber-950 transition-colors hover:bg-amber-950/20 active:scale-95 cursor-pointer"
                >
                  <X size={18} />
                </button>
              )}

              {/* Lantern Opening & Letter Sliding Sequence */}
              <div className="flex-grow flex flex-col justify-center">
                <AnimatePresence mode="wait">
                  {!wishOpened ? (
                    // 1. Sealed Lantern Cover
                    <motion.div
                      key="closed-lantern"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="flex flex-col items-center gap-6 text-center py-6"
                    >
                      <motion.div
                        animate={{
                          y: [0, -10, 0],
                          rotate: [-1, 1, -1]
                        }}
                        transition={{ repeat: Infinity, duration: 4.0, ease: "easeInOut" }}
                        className="relative w-36 h-48 flex items-center justify-center cursor-pointer select-none"
                        onClick={() => setWishOpened(true)}
                      >
                        {/* Outer Glow */}
                        <div className="absolute inset-0 rounded-full bg-orange-400/20 blur-xl animate-pulse" />
                        {/* Paper Lantern shape */}
                        <div className="absolute inset-0 bg-gradient-to-b from-yellow-100 to-orange-400 border border-orange-200 shadow-2xl rounded-2xl flex flex-col justify-between p-3 select-none">
                          <div className="border-t-2 border-orange-800/20 w-full h-1" />
                          <div className="flex flex-col items-center">
                            <Heart className="w-8 h-8 text-rose-500 fill-current animate-pulse mb-1" />
                            <span className={`${caveat.className} text-amber-950 text-xl font-bold`}>My Wish For You</span>
                          </div>
                          <div className="border-b-2 border-orange-800/20 w-full h-1" />
                        </div>
                      </motion.div>
                      <h2 className={`${playfair.className} text-2xl font-bold text-amber-950`}>
                        ✨ A magical wish lantern
                      </h2>
                      <p className={`${caveat.className} text-xl text-amber-900 max-w-xs font-bold leading-snug`}>
                        Click the lantern to open it and read the wish written inside... ❤️
                      </p>
                    </motion.div>
                  ) : (
                    // 2. Opened Letter
                    <motion.div
                      key="open-letter"
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="flex flex-col h-full justify-between"
                    >
                      {/* Handwritten Content */}
                      <div className="flex-grow overflow-y-auto pr-1">
                        <div className="text-left py-2 font-semibold">
                          <p className={`${caveat.className} text-xl sm:text-2.5xl leading-relaxed text-amber-950 whitespace-pre-line tracking-wide`}>
                            {WISH_TEXT}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      {!wishReleased && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 }}
                          className="mt-6 border-t border-amber-900/10 pt-4 flex justify-center"
                        >
                          <button
                            onClick={releaseWishToSky}
                            className="group relative flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-orange-600 to-amber-500 px-8 py-3 shadow-[0_5px_15px_rgba(234,88,12,0.3)] hover:scale-105 transition duration-300 text-white font-bold cursor-pointer"
                          >
                            <span>Release to the Stars</span>
                            <Send size={15} className="group-hover:translate-x-1 group-hover:-translate-y-0.5 transition duration-300" />
                          </button>
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Lantern floating animations */}
              {wishReleased && (
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-orange-400/15 pointer-events-none animate-pulse" />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
