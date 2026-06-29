"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, Sparkles, RefreshCw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Playfair_Display, Caveat } from "next/font/google";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
});

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["400", "700"],
});

// Editable custom message stored in a separate variable as requested
const SECRET_MESSAGE = `My Dearest Mammoty, ❤️

Every single wave that touches this shore whispers your name, reminding me of the beautiful moments we share. 

Just like the ocean, my love for you is vast, deep, and endless. These 4 days feel like a lifetime, but I'm counting down every second until your special day.

Thank you for being my anchor, my joy, and my absolute favorite person. You deserve all the magic in the universe. ✨

Only 4 more days... 🌊❤️

Forever and always,
Your Special Person ❤️`;

interface BirthdayFourRevealProps {
  onClose: () => void;
}

type Phase =
  | "dark"
  | "ambient_fade"
  | "sand_five"
  | "wave_erase_five"
  | "sand_four_draw"
  | "sand_four_stay"
  | "wave_transform_heart"
  | "reveal_ui";

// Canvas Particle Interfaces
interface Bird {
  x: number;
  y: number;
  scale: number;
  speed: number;
  wingPhase: number;
  wingSpeed: number;
}

interface Petal {
  x: number;
  y: number;
  size: number;
  rotation: number;
  rotationSpeed: number;
  speedX: number;
  speedY: number;
}

interface Firefly {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  alpha: number;
  pulseSpeed: number;
  phase: number;
}

interface SeaBreeze {
  x: number;
  y: number;
  length: number;
  speed: number;
  alpha: number;
}

interface SandSparkle {
  x: number;
  y: number;
  size: number;
  alpha: number;
  pulseSpeed: number;
}

interface PearlParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
}

interface DrawPoint {
  x: number;
  y: number;
  visible: boolean;
  erased: boolean;
  foamAlpha: number;
  foamSize: number;
}

export default function BirthdayFourReveal({ onClose }: BirthdayFourRevealProps) {
  const [phase, setPhase] = useState<Phase>("dark");
  const [shellOpen, setShellOpen] = useState(false);
  const [letterOpen, setLetterOpen] = useState(false);
  const [pearlDissolved, setPearlDissolved] = useState(false);
  const [triggerReplay, setTriggerReplay] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const shellRef = useRef<HTMLDivElement | null>(null);

  // Keep phase in a ref for the canvas animation loop to avoid stale closure issues
  const phaseRef = useRef<Phase>("dark");
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  // Canvas particle lists
  const birdsRef = useRef<Bird[]>([]);
  const petalsRef = useRef<Petal[]>([]);
  const firefliesRef = useRef<Firefly[]>([]);
  const seaBreezesRef = useRef<SeaBreeze[]>([]);
  const sparklesRef = useRef<SandSparkle[]>([]);
  const pearlParticlesRef = useRef<PearlParticle[]>([]);

  // Sand Drawing Points
  const pointsFiveRef = useRef<DrawPoint[]>([]);
  const pointsFourRef = useRef<DrawPoint[]>([]);
  const pointsHeartRef = useRef<DrawPoint[]>([]);

  // Waves control variables
  const waveSurgeRef = useRef(0); // 0 = normal, 1 = maximum surge
  const waveCycleRef = useRef(0);

  // Keep track of active animation frames & timers
  const animationFrameIdRef = useRef<number | null>(null);
  const timersRef = useRef<NodeJS.Timeout[]>([]);

  // Pre-calculate drawings points in normalized coordinates (0 to 1 relative to viewport width/height)
  // These will scale dynamically in the render loop.
  const initDrawPoints = () => {
    // Number 5 Points (top horizontal, down, loop)
    const points5: DrawPoint[] = [];
    // Top bar: x from 0.58 down to 0.42, y = 0.71
    for (let i = 0; i <= 25; i++) {
      points5.push({
        x: 0.58 - (i / 25) * 0.16,
        y: 0.71,
        visible: false,
        erased: false,
        foamAlpha: 0.8 + Math.random() * 0.2,
        foamSize: 6 + Math.random() * 4,
      });
    }
    // Vertical stem: x = 0.42, y from 0.71 to 0.78
    for (let i = 1; i <= 15; i++) {
      points5.push({
        x: 0.42,
        y: 0.71 + (i / 15) * 0.07,
        visible: false,
        erased: false,
        foamAlpha: 0.8 + Math.random() * 0.2,
        foamSize: 6 + Math.random() * 4,
      });
    }
    // Curved loop: center at (0.49, 0.825), radius 0.08, from -1.1*PI to 0.65*PI
    const startAngle = -1.1 * Math.PI;
    const endAngle = 0.65 * Math.PI;
    for (let i = 0; i <= 50; i++) {
      const angle = startAngle + (i / 50) * (endAngle - startAngle);
      points5.push({
        x: 0.49 + 0.075 * Math.cos(angle),
        y: 0.825 + 0.065 * Math.sin(angle),
        visible: false,
        erased: false,
        foamAlpha: 0.8 + Math.random() * 0.2,
        foamSize: 6 + Math.random() * 4,
      });
    }
    pointsFiveRef.current = points5;

    // Number 4 Points (diagonal, horizontal, main vertical)
    const points4: DrawPoint[] = [];
    // Diagonal: (0.54, 0.70) to (0.42, 0.82)
    for (let i = 0; i <= 30; i++) {
      const t = i / 30;
      points4.push({
        x: 0.54 - t * 0.12,
        y: 0.70 + t * 0.12,
        visible: false,
        erased: false,
        foamAlpha: 0.8 + Math.random() * 0.2,
        foamSize: 6 + Math.random() * 4,
      });
    }
    // Horizontal cross: (0.40, 0.82) to (0.60, 0.82)
    for (let i = 0; i <= 35; i++) {
      points4.push({
        x: 0.40 + (i / 35) * 0.20,
        y: 0.82,
        visible: false,
        erased: false,
        foamAlpha: 0.8 + Math.random() * 0.2,
        foamSize: 6 + Math.random() * 4,
      });
    }
    // Vertical stem: (0.52, 0.70) to (0.52, 0.89)
    for (let i = 0; i <= 35; i++) {
      points4.push({
        x: 0.52,
        y: 0.70 + (i / 35) * 0.19,
        visible: false,
        erased: false,
        foamAlpha: 0.8 + Math.random() * 0.2,
        foamSize: 6 + Math.random() * 4,
      });
    }
    pointsFourRef.current = points4;

    // Heart Points (parametric curve centered at 0.5, 0.78)
    const pointsH: DrawPoint[] = [];
    // t goes from 0 to 2*PI
    const steps = 90;
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * Math.PI * 2 - Math.PI; // center at top crack
      const xVal = 16 * Math.pow(Math.sin(t), 3);
      const yVal = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
      
      // Map to screen normalized space
      pointsH.push({
        x: 0.5 + (xVal * 0.0075),
        y: 0.79 - (yVal * 0.0075), // invert y to keep heart upright
        visible: false,
        erased: false,
        foamAlpha: 0.8 + Math.random() * 0.2,
        foamSize: 6 + Math.random() * 4,
      });
    }
    pointsHeartRef.current = pointsH;
  };

  // Setup timers for animation sequence
  const startSequence = () => {
    // Clear previous timers
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];

    // Reset components states
    setShellOpen(false);
    setLetterOpen(false);
    setPearlDissolved(false);
    initDrawPoints();
    
    // Set to dark / black intro first
    setPhase("dark");

    const addTimer = (fn: () => void, ms: number) => {
      timersRef.current.push(setTimeout(fn, ms));
    };

    // Timeline phases matching specifications
    addTimer(() => setPhase("ambient_fade"), 500);
    
    // Draw 5 - visible for 3s
    addTimer(() => {
      setPhase("sand_five");
      // Gradually make 5 visible
      let drawIndex = 0;
      const interval = setInterval(() => {
        if (drawIndex < pointsFiveRef.current.length) {
          pointsFiveRef.current[drawIndex].visible = true;
          drawIndex++;
        } else {
          clearInterval(interval);
        }
      }, 30);
    }, 2000);

    // Wave approaches and erases 5
    addTimer(() => {
      setPhase("wave_erase_five");
    }, 6000); // 2s ambient + 4s draw/stay

    // Retreating wave draws 4 (takes 4-5s)
    addTimer(() => {
      setPhase("sand_four_draw");
    }, 8500);

    // 4 stays, seashells/starfish appear
    addTimer(() => {
      setPhase("sand_four_stay");
      // fully show 4 if it wasn't
      pointsFourRef.current.forEach(p => p.visible = true);
    }, 13500);

    // Wave approaches and transforms 4 into heart
    addTimer(() => {
      setPhase("wave_transform_heart");
    }, 17500);

    // Final UI Reveal
    addTimer(() => {
      setPhase("reveal_ui");
      // Ensure heart is fully drawn
      pointsHeartRef.current.forEach(p => p.visible = true);
    }, 21000);
  };

  useEffect(() => {
    startSequence();
    return () => {
      timersRef.current.forEach((t) => clearTimeout(t));
      if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
    };
  }, [triggerReplay]);

  // Setup canvas background elements on load
  useEffect(() => {
    // Generate birds
    const birds: Bird[] = [];
    for (let i = 0; i < 4; i++) {
      birds.push({
        x: -50 - i * 150,
        y: 80 + Math.random() * 120,
        scale: 0.4 + Math.random() * 0.4,
        speed: 0.8 + Math.random() * 0.5,
        wingPhase: Math.random() * Math.PI * 2,
        wingSpeed: 0.08 + Math.random() * 0.04,
      });
    }
    birdsRef.current = birds;

    // Generate falling petals
    const petals: Petal[] = [];
    for (let i = 0; i < 25; i++) {
      petals.push({
        x: Math.random() * 1200,
        y: -50 - Math.random() * 300,
        size: 8 + Math.random() * 8,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.03,
        speedX: 0.5 + Math.random() * 1.2,
        speedY: 1.0 + Math.random() * 1.5,
      });
    }
    petalsRef.current = petals;

    // Generate fireflies
    const fireflies: Firefly[] = [];
    for (let i = 0; i < 35; i++) {
      fireflies.push({
        x: Math.random() * 1200,
        y: 400 + Math.random() * 400,
        size: 1.5 + Math.random() * 2.5,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.4 - 0.1,
        alpha: Math.random(),
        pulseSpeed: 0.02 + Math.random() * 0.03,
        phase: Math.random() * Math.PI * 2,
      });
    }
    firefliesRef.current = fireflies;

    // Sea breeze lines
    const seaBreezes: SeaBreeze[] = [];
    for (let i = 0; i < 8; i++) {
      seaBreezes.push({
        x: Math.random() * 1200,
        y: 100 + Math.random() * 300,
        length: 80 + Math.random() * 150,
        speed: 2.5 + Math.random() * 2.0,
        alpha: 0.1 + Math.random() * 0.25,
      });
    }
    seaBreezesRef.current = seaBreezes;

    // Sand sparkles
    const sparkles: SandSparkle[] = [];
    for (let i = 0; i < 60; i++) {
      sparkles.push({
        x: Math.random() * 1200,
        y: 600 + Math.random() * 300,
        size: 0.8 + Math.random() * 1.5,
        alpha: 0.1 + Math.random() * 0.7,
        pulseSpeed: 0.03 + Math.random() * 0.05,
      });
    }
    sparklesRef.current = sparkles;
  }, [triggerReplay]);

  // Canvas loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const handleResize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    const animate = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      if (w === 0 || h === 0) {
        animationFrameIdRef.current = requestAnimationFrame(animate);
        return;
      }

      ctx.clearRect(0, 0, w, h);
      waveCycleRef.current += 0.015;

      // 1. Draw Breathtaking Sunset Sky Gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.5);
      skyGrad.addColorStop(0, "#1f1235"); // Deep twilight purple
      skyGrad.addColorStop(0.35, "#3b1e54"); // Mystic plum
      skyGrad.addColorStop(0.65, "#892b64"); // Rich magenta pink
      skyGrad.addColorStop(0.85, "#df5e5e"); // Sunset orange-red
      skyGrad.addColorStop(1, "#fca34d"); // Warm glowing gold
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h * 0.5);

      // 2. Draw Sun and Warm Lens Flare
      const sunX = w * 0.5;
      const sunY = h * 0.49;
      const sunGrad = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 150);
      sunGrad.addColorStop(0, "rgba(255, 252, 235, 1)");
      sunGrad.addColorStop(0.1, "rgba(255, 238, 160, 0.9)");
      sunGrad.addColorStop(0.3, "rgba(255, 178, 107, 0.5)");
      sunGrad.addColorStop(0.6, "rgba(235, 94, 85, 0.15)");
      sunGrad.addColorStop(1, "rgba(235, 94, 85, 0)");
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(sunX, sunY, 150, 0, Math.PI * 2);
      ctx.fill();

      // Golden horizon glow flare
      const glowGrad = ctx.createLinearGradient(0, sunY - 4, 0, sunY + 4);
      glowGrad.addColorStop(0, "rgba(255, 220, 150, 0)");
      glowGrad.addColorStop(0.5, "rgba(255, 220, 150, 0.45)");
      glowGrad.addColorStop(1, "rgba(255, 220, 150, 0)");
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, sunY - 4, w, 8);

      // 3. Draw Birds Flying Slowly
      ctx.fillStyle = "rgba(45, 15, 30, 0.35)";
      birdsRef.current.forEach((bird) => {
        bird.x += bird.speed;
        bird.wingPhase += bird.wingSpeed;
        if (bird.x > w + 100) {
          bird.x = -100;
          bird.y = 80 + Math.random() * 120;
        }

        // Draw bird silhouette using path
        const flap = Math.sin(bird.wingPhase) * 12 * bird.scale;
        ctx.beginPath();
        ctx.moveTo(bird.x, bird.y);
        ctx.quadraticCurveTo(bird.x - 15 * bird.scale, bird.y - 12 * bird.scale + flap, bird.x - 30 * bird.scale, bird.y - 5 * bird.scale);
        ctx.quadraticCurveTo(bird.x - 15 * bird.scale, bird.y - 4 * bird.scale + flap * 0.4, bird.x, bird.y + 4 * bird.scale);
        ctx.quadraticCurveTo(bird.x + 15 * bird.scale, bird.y - 4 * bird.scale + flap * 0.4, bird.x + 30 * bird.scale, bird.y - 5 * bird.scale);
        ctx.quadraticCurveTo(bird.x + 15 * bird.scale, bird.y - 12 * bird.scale + flap, bird.x, bird.y);
        ctx.fill();
      });

      // 4. Sea Breeze Particles
      ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
      ctx.lineWidth = 1.5;
      seaBreezesRef.current.forEach((breeze) => {
        breeze.x += breeze.speed;
        if (breeze.x > w + breeze.length) {
          breeze.x = -breeze.length;
          breeze.y = 100 + Math.random() * 250;
        }
        ctx.beginPath();
        ctx.moveTo(breeze.x, breeze.y);
        ctx.lineTo(breeze.x + breeze.length, breeze.y);
        ctx.stroke();
      });

      // 5. Ocean Water with Glistening Sunset reflections
      // Wave physics baseline heights
      const horizonY = h * 0.5;
      const baselineShorelineY = h * 0.69;

      // Adjust wave surge based on active animation phase
      let targetSurge = 0;
      if (phaseRef.current === "wave_erase_five" || phaseRef.current === "wave_transform_heart") {
        targetSurge = 1; // full sweep
      }
      waveSurgeRef.current += (targetSurge - waveSurgeRef.current) * 0.04;

      // Calculate dynamic wave shoreline position
      // Sine wave oscillation + surge offset
      const normalWaveAmplitude = h * 0.025;
      const waveOscillation = Math.sin(waveCycleRef.current) * normalWaveAmplitude;
      const surgeOffset = waveSurgeRef.current * (h * 0.18);
      const waveFrontY = baselineShorelineY + waveOscillation + surgeOffset;

      // Draw ocean water body (between horizon and the shoreline wave front)
      const waterGrad = ctx.createLinearGradient(0, horizonY, 0, waveFrontY);
      waterGrad.addColorStop(0, "#19424c"); // Deep sea teal near horizon
      waterGrad.addColorStop(0.35, "#15636b"); // Sunset turquoise
      waterGrad.addColorStop(0.7, "#148e8f"); // Glistening clear aquamarine
      waterGrad.addColorStop(0.95, "#2dd4bf"); // Bright turquoise foam edge
      waterGrad.addColorStop(1, "#99f6e4"); // Pale seafoam green
      ctx.fillStyle = waterGrad;

      // Draw the water shape with wavy boundary
      ctx.beginPath();
      ctx.moveTo(0, horizonY);
      ctx.lineTo(w, horizonY);
      
      // Wave front curve
      ctx.lineTo(w, waveFrontY);
      for (let x = w; x >= 0; x -= 40) {
        const offset = Math.sin((x / w) * Math.PI * 6 + waveCycleRef.current * 2) * 8;
        ctx.lineTo(x, waveFrontY + offset);
      }
      ctx.closePath();
      ctx.fill();

      // Glistening sunset reflections on ocean water (radial paths of ellipses)
      ctx.save();
      ctx.globalCompositeOperation = "source-atop";
      for (let i = 0; i < 40; i++) {
        const percentY = i / 40;
        const ry = horizonY + percentY * (waveFrontY - horizonY);
        const rx = w * 0.5 + (Math.sin(percentY * Math.PI * 4 + waveCycleRef.current * 3) * (w * 0.05 * percentY));
        const width = 80 * percentY * (1.2 + Math.sin(i * 1.5 + waveCycleRef.current * 4) * 0.4);
        
        ctx.fillStyle = `rgba(254, 215, 170, ${0.45 * (1 - percentY)})`;
        ctx.beginPath();
        ctx.ellipse(rx, ry, width, 2 + 1.5 * percentY, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // 6. Draw Sand Body (from shoreline wave boundary down to screen bottom)
      const sandGrad = ctx.createLinearGradient(0, horizonY, 0, h);
      sandGrad.addColorStop(0, "#a07855"); // Wet dark sand near shoreline
      sandGrad.addColorStop(0.4, "#bf9770"); // Glistening wet sand
      sandGrad.addColorStop(0.8, "#dcb285"); // Warm soft tan dry sand
      sandGrad.addColorStop(1, "#ebbfa0"); // Sunset lit shore at the bottom
      ctx.fillStyle = sandGrad;
      
      // We only fill behind the shoreline boundary
      ctx.beginPath();
      // Wave front contour
      ctx.moveTo(0, waveFrontY);
      for (let x = 0; x <= w; x += 40) {
        const offset = Math.sin((x / w) * Math.PI * 6 + waveCycleRef.current * 2) * 8;
        ctx.lineTo(x, waveFrontY + offset);
      }
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.closePath();
      ctx.fill();

      // Glistening mirror layer on the wet sand just under the wave front
      const wetSandReflectionY = waveFrontY + 4;
      const refGrad = ctx.createLinearGradient(0, wetSandReflectionY, 0, wetSandReflectionY + 120);
      refGrad.addColorStop(0, "rgba(255, 178, 107, 0.25)");
      refGrad.addColorStop(0.4, "rgba(223, 94, 85, 0.1)");
      refGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = refGrad;
      ctx.fillRect(0, wetSandReflectionY, w, 150);

      // Draw beach sand sparkles
      sparklesRef.current.forEach((sparkle) => {
        sparkle.alpha += sparkle.pulseSpeed;
        if (sparkle.alpha > 0.95) {
          sparkle.alpha = 0.95;
          sparkle.pulseSpeed = -Math.abs(sparkle.pulseSpeed);
        } else if (sparkle.alpha < 0.1) {
          sparkle.alpha = 0.1;
          sparkle.pulseSpeed = Math.abs(sparkle.pulseSpeed);
        }
        ctx.fillStyle = `rgba(255, 255, 255, ${sparkle.alpha})`;
        ctx.beginPath();
        ctx.arc(sparkle.x, sparkle.y, sparkle.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // 7. Render Sand Drawings & Wave Erase / Transform Logic
      const renderDrawing = (pointsList: DrawPoint[], scaleX = w, scaleY = h) => {
        pointsList.forEach((pt) => {
          // Dynamic coordinates based on responsiveness
          const px = pt.x * scaleX;
          const py = pt.y * scaleY;

          // Wave collision logic: If wave surges over the point, erase it
          const localWaveOffset = Math.sin((px / w) * Math.PI * 6 + waveCycleRef.current * 2) * 8;
          const currentWaveYAtX = waveFrontY + localWaveOffset;

          // Wave washes over point if wave reaches below the point
          if (py < currentWaveYAtX + 15) {
            if (phaseRef.current === "wave_erase_five" || phaseRef.current === "wave_transform_heart") {
              pt.erased = true;
            }
          }

          if (pt.visible && !pt.erased) {
            // Draw the sand indentation (darker sand groove)
            ctx.shadowBlur = 0;
            ctx.fillStyle = "rgba(75, 45, 20, 0.28)"; // shadow
            ctx.beginPath();
            ctx.arc(px, py + 2, 8, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = "rgba(90, 55, 30, 0.45)"; // deep groove
            ctx.beginPath();
            ctx.arc(px, py, 6, 0, Math.PI * 2);
            ctx.fill();

            // Draw glowing sea foam drawing on top
            const glowGrad = ctx.createRadialGradient(px, py, 0, px, py, pt.foamSize * 1.5);
            glowGrad.addColorStop(0, "rgba(255, 255, 255, 0.95)");
            glowGrad.addColorStop(0.3, "rgba(153, 246, 228, 0.75)"); // light cyan
            glowGrad.addColorStop(0.7, "rgba(45, 212, 191, 0.25)"); // teal
            glowGrad.addColorStop(1, "rgba(45, 212, 191, 0)");
            ctx.fillStyle = glowGrad;
            ctx.beginPath();
            ctx.arc(px, py, pt.foamSize * 1.5, 0, Math.PI * 2);
            ctx.fill();

            // Tiny foam sparkles
            ctx.fillStyle = `rgba(255, 255, 255, ${pt.foamAlpha})`;
            ctx.beginPath();
            ctx.arc(px + (Math.random() - 0.5) * 6, py + (Math.random() - 0.5) * 6, 1.5, 0, Math.PI * 2);
            ctx.fill();
          }
        });
      };

      // Draw number 5
      if (phaseRef.current === "sand_five" || phaseRef.current === "wave_erase_five") {
        renderDrawing(pointsFiveRef.current);
      }

      // Draw number 4
      if (phaseRef.current === "sand_four_draw") {
        // Nature draws 4 slowly over 4-5 seconds
        // Calculate drawing speed based on wave retreat progress
        // During sand_four_draw, waveSurgeRef goes back to 0. 
        // We draw the points matching the wave retreat level (points lower down are uncovered first)
        const uncoverageY = waveFrontY - 20;
        pointsFourRef.current.forEach((pt) => {
          const py = pt.y * h;
          if (py > uncoverageY) {
            pt.visible = true;
          }
        });
        renderDrawing(pointsFourRef.current);
      }

      if (phaseRef.current === "sand_four_stay" || phaseRef.current === "wave_transform_heart") {
        renderDrawing(pointsFourRef.current);
      }

      // Draw Heart
      if (phaseRef.current === "wave_transform_heart") {
        // Heart is drawn as the wave retreats
        const uncoverageY = waveFrontY - 15;
        pointsHeartRef.current.forEach((pt) => {
          const py = pt.y * h;
          if (py > uncoverageY) {
            pt.visible = true;
          }
        });
        renderDrawing(pointsHeartRef.current);
      }

      if (phaseRef.current === "reveal_ui") {
        renderDrawing(pointsHeartRef.current);
      }

      // 8. Render Seashells & Starfish on Sand (Day 4 stay and onwards)
      if (phaseRef.current === "sand_four_stay" || phaseRef.current === "wave_transform_heart" || phaseRef.current === "reveal_ui") {
        // Drawing a small cute starfish near the bottom-right of the drawing
        const starX = w * 0.62;
        const starY = h * 0.84;
        
        ctx.save();
        ctx.translate(starX, starY);
        ctx.rotate(0.2);
        ctx.fillStyle = "rgba(224, 100, 78, 0.85)"; // coral starfish
        ctx.shadowColor = "rgba(60, 30, 15, 0.35)";
        ctx.shadowBlur = 4;
        ctx.shadowOffsetY = 2;
        
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          ctx.lineTo(0, -10);
          ctx.lineTo(3, -3);
          ctx.rotate((Math.PI * 2) / 5);
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        // Draw a tiny cream seashell
        const shellX = w * 0.38;
        const shellY = h * 0.86;
        ctx.save();
        ctx.translate(shellX, shellY);
        ctx.rotate(-0.4);
        ctx.fillStyle = "rgba(245, 230, 215, 0.9)";
        ctx.strokeStyle = "rgba(180, 160, 140, 0.5)";
        ctx.lineWidth = 1;
        ctx.shadowColor = "rgba(60, 30, 15, 0.25)";
        ctx.shadowBlur = 3;
        ctx.shadowOffsetY = 1;

        ctx.beginPath();
        ctx.arc(0, 0, 8, Math.PI, 0, false);
        ctx.lineTo(0, 4);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Lines on shell
        ctx.beginPath();
        ctx.moveTo(-6, -2); ctx.quadraticCurveTo(-3, 1, 0, 4);
        ctx.moveTo(-3, -4); ctx.quadraticCurveTo(-1.5, 0, 0, 4);
        ctx.moveTo(0, -5); ctx.lineTo(0, 4);
        ctx.moveTo(3, -4); ctx.quadraticCurveTo(1.5, 0, 0, 4);
        ctx.moveTo(6, -2); ctx.quadraticCurveTo(3, 1, 0, 4);
        ctx.stroke();
        ctx.restore();
      }

      // 9. Floating Flower Petals (drifting in breeze)
      petalsRef.current.forEach((petal) => {
        petal.y += petal.speedY;
        petal.x += petal.speedX + Math.sin(waveCycleRef.current + petal.y * 0.01) * 0.4;
        petal.rotation += petal.rotationSpeed;

        if (petal.y > h + 20 || petal.x > w + 20) {
          petal.y = -30;
          petal.x = Math.random() * w * 0.7;
        }

        ctx.save();
        ctx.translate(petal.x, petal.y);
        ctx.rotate(petal.rotation);
        
        // Petal shape
        const grad = ctx.createLinearGradient(-petal.size, 0, petal.size, 0);
        grad.addColorStop(0, "#fb7185"); // rose-400
        grad.addColorStop(1, "#fda4af"); // rose-300
        ctx.fillStyle = grad;
        
        ctx.beginPath();
        ctx.ellipse(0, 0, petal.size, petal.size * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Midline
        ctx.strokeStyle = "rgba(225, 29, 72, 0.2)";
        ctx.beginPath();
        ctx.moveTo(-petal.size, 0);
        ctx.lineTo(petal.size, 0);
        ctx.stroke();
        ctx.restore();
      });

      // 10. Warm Golden Fireflies Near Beach
      firefliesRef.current.forEach((fly) => {
        fly.phase += fly.pulseSpeed;
        fly.x += fly.speedX + Math.sin(fly.phase) * 0.2;
        fly.y += fly.speedY;

        if (fly.y < horizonY || fly.x < 0 || fly.x > w) {
          fly.y = h - Math.random() * 250;
          fly.x = Math.random() * w;
        }

        const alpha = Math.abs(Math.sin(fly.phase)) * 0.75 + 0.2;
        const fireflyGlow = ctx.createRadialGradient(fly.x, fly.y, 0, fly.x, fly.y, fly.size * 4);
        fireflyGlow.addColorStop(0, `rgba(253, 224, 71, ${alpha})`); // yellow-300
        fireflyGlow.addColorStop(0.4, `rgba(234, 179, 8, ${alpha * 0.4})`); // yellow-500
        fireflyGlow.addColorStop(1, "rgba(234, 179, 8, 0)");

        ctx.fillStyle = fireflyGlow;
        ctx.beginPath();
        ctx.arc(fly.x, fly.y, fly.size * 4, 0, Math.PI * 2);
        ctx.fill();
      });

      // 11. Render Pearl Dissolve Particles (Drifting from Shell up to Sunset)
      pearlParticlesRef.current.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy -= 0.015; // float acceleration upwards
        p.alpha -= 0.005; // slowly dissolve

        if (p.alpha > 0) {
          const particleGlow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
          particleGlow.addColorStop(0, `rgba(255, 255, 255, ${p.alpha})`);
          particleGlow.addColorStop(0.3, `${p.color}88`); // tinted translucent
          particleGlow.addColorStop(1, "rgba(255, 255, 255, 0)");
          
          ctx.fillStyle = particleGlow;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha * 0.9})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 0.8, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Remove dead particle
          pearlParticlesRef.current.splice(idx, 1);
        }
      });

      // 12. Wave foam lines (drawn at the leading front edge of waves)
      ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
      for (let i = 0; i < w; i += 18) {
        const offset = Math.sin((i / w) * Math.PI * 6 + waveCycleRef.current * 2) * 8;
        const fy = waveFrontY + offset;
        ctx.beginPath();
        ctx.arc(i, fy + 2, 8 + Math.sin(waveCycleRef.current * 3 + i) * 3, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
      for (let i = 0; i < w; i += 24) {
        const offset = Math.sin((i / w) * Math.PI * 6 + waveCycleRef.current * 2) * 8;
        const fy = waveFrontY + offset;
        ctx.beginPath();
        ctx.arc(i, fy - 1, 5 + Math.sin(waveCycleRef.current * 2.5 + i) * 2, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameIdRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
    };
  }, [triggerReplay]);

  // Handler to dissolve pearl into particles floating to sunset
  const dissolvePearl = () => {
    if (!shellRef.current) return;
    
    // Find absolute coordinates of the pearl inside shell
    const shellRect = shellRef.current.getBoundingClientRect();
    const pearlX = shellRect.left + shellRect.width / 2;
    const pearlY = shellRect.top + shellRect.height / 2;

    const colors = ["#ffedf1", "#ffd1df", "#ffffff", "#fed7e7", "#fae8ff"];
    const particles: PearlParticle[] = [];

    // Spawn 80 particles
    for (let i = 0; i < 80; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.5 + Math.random() * 2.2;
      particles.push({
        x: pearlX,
        y: pearlY,
        vx: Math.cos(angle) * speed + (0.5 + Math.random() * 0.8), // slight right drift
        vy: Math.sin(angle) * speed - (1.0 + Math.random() * 1.5), // float up
        size: 1.5 + Math.random() * 2.5,
        alpha: 0.8 + Math.random() * 0.2,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    pearlParticlesRef.current = [...pearlParticlesRef.current, ...particles];
    setPearlDissolved(true);
  };

  const replayMagic = () => {
    setTriggerReplay(prev => prev + 1);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="relative min-h-screen w-full overflow-hidden flex flex-col justify-between items-center text-slate-100 font-sans select-none"
    >
      {/* Canvas rendering beach sunset and waves */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover z-0"
      />

      {/* Subtle vignettes */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/35 pointer-events-none z-10" />

      {/* Close button in top-right */}
      <button
        onClick={onClose}
        className="absolute right-6 top-6 z-40 rounded-full border border-white/30 bg-black/30 p-2.5 hover:bg-black/50 text-white/80 hover:text-white shadow-lg backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
      >
        <X size={20} />
      </button>

      {/* Golden hour lens flare overlay */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-bl from-orange-400/10 via-rose-500/5 to-transparent rounded-full blur-3xl pointer-events-none z-10" />

      {/* Main Content Layout */}
      <div className="relative z-20 flex-1 flex flex-col items-center justify-center px-4 py-16 w-full max-w-xl text-center">
        
        {/* Cinematic Title & Custom Letter Reveal Stage */}
        <AnimatePresence>
          {phase === "reveal_ui" && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.0, ease: "easeOut" }}
              className="flex flex-col items-center gap-6 w-full"
            >
              {/* Glassmorphic header banner */}
              <div className="relative overflow-hidden rounded-[2.5rem] border border-white/30 bg-white/10 px-8 py-6 shadow-[0_25px_60px_rgba(31,18,53,0.3)] backdrop-blur-2xl max-w-sm w-full flex flex-col items-center gap-3">
                <div className="flex items-center gap-1.5 text-rose-300/90 text-sm tracking-wider uppercase font-semibold">
                  <Sparkles size={14} className="animate-pulse" />
                  <span>Countdown Active</span>
                  <Sparkles size={14} className="animate-pulse" />
                </div>
                <h1 className="text-3.5xl sm:text-4.5xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-orange-200 via-rose-100 to-teal-200 font-sans drop-shadow-[0_2px_15px_rgba(255,255,255,0.2)]">
                  4 DAYS TO GO
                </h1>
                <div className="h-[1px] w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                <p className={`${caveat.className} text-xl sm:text-2xl text-rose-100/90 leading-relaxed font-bold`}>
                  "Every wave brings me one day closer...<br/>
                  Only 4 more days until my Mammoty's birthday. ❤️"
                </p>
              </div>

              {/* Seashell surprise section */}
              <div className="flex flex-col items-center mt-3 z-30 w-full">
                
                {/* Instruction above shell */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="mb-4 text-rose-200/90 text-sm font-semibold tracking-wide flex items-center gap-1.5 drop-shadow-md"
                >
                  <span>🐚 Open My Little Secret</span>
                </motion.div>

                {/* Interactive Shell Container */}
                <div 
                  ref={shellRef}
                  onClick={() => {
                    if (!shellOpen) {
                      setShellOpen(true);
                      // Letter rises and unfolds shortly after shell opens
                      setTimeout(() => setLetterOpen(true), 900);
                    }
                  }}
                  className="relative cursor-pointer group flex items-center justify-center w-28 h-28"
                >
                  {/* Glowing Pearl inside Shell */}
                  {shellOpen && !pearlDissolved && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.7, duration: 0.5 }}
                      className="absolute w-6 h-6 rounded-full bg-radial-gradient from-white via-pink-100 to-rose-200 z-20 shadow-[0_0_20px_#fff,0_0_30px_#fda4af] animate-pulse"
                      style={{ bottom: "24px" }}
                    />
                  )}

                  {/* SVG Shell top half (opening wing) */}
                  <motion.svg
                    viewBox="0 0 100 100"
                    className="absolute w-24 h-24 z-30 select-none drop-shadow-[0_4px_10px_rgba(0,0,0,0.3)] origin-bottom animate-wave-sway"
                    animate={shellOpen ? { rotateX: -105, y: -22, opacity: 0.95 } : { rotateX: 0 }}
                    transition={{ type: "spring", stiffness: 45, damping: 10 }}
                  >
                    <path
                      d="M50 85 C15 75 10 35 30 15 C40 5 45 5 50 15 C55 5 60 5 70 15 C90 35 85 75 50 85 Z"
                      fill="url(#shell-gradient)"
                      stroke="#fecdd3"
                      strokeWidth="1.5"
                    />
                    <path d="M50 15 L50 85 M40 18 C30 40 30 70 47 84 M60 18 C70 40 70 70 53 84 M30 25 Q20 50 44 83 M70 25 Q80 50 56 83" stroke="#fda4af" strokeWidth="1" fill="none" opacity="0.6"/>
                  </motion.svg>

                  {/* SVG Shell bottom half (staying flat) */}
                  <svg
                    viewBox="0 0 100 100"
                    className="absolute w-24 h-24 z-10 select-none drop-shadow-[0_6px_12px_rgba(0,0,0,0.4)]"
                  >
                    <defs>
                      <linearGradient id="shell-gradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#fff1f2" />
                        <stop offset="60%" stopColor="#ffe4e6" />
                        <stop offset="100%" stopColor="#fecdd3" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M50 85 C15 75 12 40 30 25 C40 18 45 18 50 25 C55 18 60 18 70 25 C90 40 85 75 50 85 Z"
                      fill="url(#shell-gradient)"
                      stroke="#fba5b4"
                      strokeWidth="1.5"
                    />
                    <path d="M50 25 L50 85 M40 28 C30 46 30 72 47 84 M60 28 C70 46 70 72 53 84" stroke="#fba5b4" strokeWidth="1" fill="none" opacity="0.65"/>
                  </svg>
                </div>

                {/* Handfolded Letter Modal (Unfolding effect) */}
                <AnimatePresence>
                  {letterOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/40 backdrop-blur-md">
                      <motion.div
                        initial={{ scale: 0.3, y: 150, rotateX: 65, opacity: 0 }}
                        animate={{ scale: 1, y: 0, rotateX: 0, opacity: 1 }}
                        exit={{ scale: 0.3, y: 150, rotateX: 65, opacity: 0 }}
                        transition={{ type: "spring", damping: 20, stiffness: 100 }}
                        className="relative w-full max-w-lg rounded-3xl border-2 border-amber-900/10 bg-[radial-gradient(circle_at_top,_#fffbeb_0%,_#fef3c7_70%,_#fde68a_100%)] p-6 md:p-8 shadow-[0_30px_70px_rgba(20,10,5,0.4)] text-left flex flex-col justify-between max-h-[90vh] overflow-hidden"
                      >
                        {/* Fold shadow overlay */}
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-900/5 to-transparent pointer-events-none" />

                        {/* Top decorative header inside letter */}
                        <div className="flex justify-between items-center border-b border-amber-900/15 pb-3 mb-4 z-10">
                          <span className={`${playfair.className} text-xs font-black tracking-widest text-amber-900/60 uppercase`}>
                            My Little Secret 🐚
                          </span>
                          <span className="text-xl">💌</span>
                        </div>

                        {/* Scrollable Letter Body */}
                        <div className="flex-1 overflow-y-auto pr-1 z-10 custom-scrollbar max-h-[60vh]">
                          <p className={`${caveat.className} text-xl sm:text-2xl leading-relaxed text-amber-950 font-semibold whitespace-pre-line`}>
                            {SECRET_MESSAGE}
                          </p>
                        </div>

                        {/* Close button for letter */}
                        <div className="mt-5 pt-3 border-t border-amber-900/15 flex justify-end z-10">
                          <button
                            onClick={() => {
                              setLetterOpen(false);
                              // Pearl dissolves into stars when closed
                              setTimeout(() => dissolvePearl(), 300);
                            }}
                            className="rounded-xl border border-amber-900/20 bg-amber-900/10 hover:bg-amber-900/20 px-5 py-2 text-xs font-bold uppercase tracking-wider text-amber-950 transition active:scale-95 cursor-pointer"
                          >
                            Close Secret
                          </button>
                        </div>
                      </motion.div>
                    </div>
                  )}
                </AnimatePresence>

              </div>

              {/* Bottom replay / navigate buttons */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.0, duration: 0.8 }}
                className="flex items-center gap-4 mt-6 z-30"
              >
                <button
                  onClick={replayMagic}
                  className="rounded-full border border-white/20 bg-white/10 hover:bg-white/25 px-5 py-2 text-xs font-bold uppercase tracking-widest text-white shadow-md backdrop-blur-sm transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw size={13} className="animate-spin-slow" />
                  <span>Replay Magic</span>
                </button>
                
                <button
                  onClick={onClose}
                  className="rounded-full border border-slate-700 bg-slate-900/50 hover:bg-slate-900/80 px-5 py-2 text-xs font-bold uppercase tracking-widest text-slate-300 hover:text-white shadow-md backdrop-blur-sm transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
                >
                  Back to Surprises
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* Cinematic dark entry overlay */}
      <AnimatePresence>
        {phase === "dark" && (
          <motion.div
            key="cinematic_intro_fade"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="absolute inset-0 z-50 bg-black pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Empty bottom spacer for layout */}
      <div className="h-6" />

      {/* Custom Styles */}
      <style jsx global>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(120, 60, 20, 0.05);
          border-radius: 9px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(120, 60, 20, 0.25);
          border-radius: 9px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(120, 60, 20, 0.4);
        }
      `}</style>
    </motion.div>
  );
}
