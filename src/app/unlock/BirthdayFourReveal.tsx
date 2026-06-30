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

// Custom secret message
const SECRET_MESSAGE = `My Dearest Mammoty, ❤️

Every single wave that touches this shore whispers your name, reminding me of the beautiful moments we share. 

Just like the ocean, my love for you is vast, deep, and endless. These 4 days feel like a lifetime, but I'm counting down every second until your special day.

Thank you for being my anchor, my joy, and my absolute favorite person. You deserve all the magic in the universe. ✨

Only 4 more days... 🌊❤️

Forever and always,
Your Special Person ❤️`;

// Cinematic Web Audio Synth for romantic piano chord background loop
class CinematicSynth {
  private ctx: AudioContext | null = null;
  private activeNodes: AudioNode[] = [];
  private isMuted: boolean = false;
  private timer: NodeJS.Timeout | null = null;

  init() {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    this.ctx = new AudioContextClass();
    this.startChordsLoop();
  }

  setMute(mute: boolean) {
    this.isMuted = mute;
    if (mute) {
      this.stopActiveNotes();
    } else {
      if (this.ctx?.state === "suspended") {
        this.ctx.resume();
      }
      this.startChordsLoop();
    }
  }

  private stopActiveNotes() {
    this.activeNodes.forEach(node => {
      try {
        (node as any).stop?.();
      } catch (e) {}
    });
    this.activeNodes = [];
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  private playTone(freq: number, startTime: number, duration: number, gainValue: number) {
    if (!this.ctx || this.isMuted) return;

    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = "sine";
    osc.frequency.value = freq;

    filter.type = "lowpass";
    filter.frequency.value = 350; // Warm soft cutoff filter
    filter.Q.value = 1.0;

    gainNode.gain.setValueAtTime(0, startTime);
    // Soft attack
    gainNode.gain.linearRampToValueAtTime(gainValue * 0.12, startTime + 2.0);
    // Soft release
    gainNode.gain.setValueAtTime(gainValue * 0.12, startTime + duration - 2.5);
    gainNode.gain.linearRampToValueAtTime(0, startTime + duration);

    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration);

    this.activeNodes.push(osc);
  }

  private startChordsLoop() {
    if (!this.ctx || this.isMuted) return;
    
    // Ambient progression: Cmaj9, Fmaj7, Am9, Gsus4
    const progressions = [
      [130.81, 196.00, 261.63, 329.63, 392.00, 493.88], // Cmaj9 (C3, G3, C4, E4, G4, B4)
      [174.61, 261.63, 349.23, 440.00, 523.25, 659.25], // Fmaj7 (F3, C4, F4, A4, C5, E5)
      [110.00, 220.00, 293.66, 349.23, 440.00, 587.33], // Am9 (A2, A3, D4, F4, A4, D5)
      [146.83, 220.00, 293.66, 392.00, 440.00, 587.33]  // Gsus4 (D3, A3, D4, G4, A4, D5)
    ];

    let chordIdx = 0;
    const playNext = () => {
      if (this.isMuted || !this.ctx) return;
      const notes = progressions[chordIdx];
      const now = this.ctx.currentTime;
      const chordDuration = 8.5;

      notes.forEach((freq, i) => {
        const delay = i * 0.3; // Stagger note starts for arpeggio piano feel
        const volume = i === 0 ? 0.35 : 0.22;
        this.playTone(freq, now + delay, chordDuration - delay, volume);
      });

      chordIdx = (chordIdx + 1) % progressions.length;
      this.timer = setTimeout(playNext, 8000);
    };

    playNext();
  }

  destroy() {
    this.stopActiveNotes();
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
  }
}

interface BirthdayFourRevealProps {
  onClose: () => void;
}

type Phase =
  | "dark"
  | "intro_text"
  | "sand_five"
  | "wave_erase_five"
  | "sand_empty"
  | "sand_four_draw"
  | "sand_four_stay"
  | "wave_transform_heart"
  | "reveal_ui";

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

interface LetterParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
  isStar: boolean;
  starTwinklePhase: number;
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
  const [triggerReplay, setTriggerReplay] = useState(0);
  const [musicEnabled, setMusicEnabled] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const shellRef = useRef<HTMLDivElement | null>(null);
  const synthRef = useRef<CinematicSynth | null>(null);

  const phaseRef = useRef<Phase>("dark");
  const phaseStartTimeRef = useRef(Date.now());

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  // Canvas particle lists
  const birdsRef = useRef<Bird[]>([]);
  const petalsRef = useRef<Petal[]>([]);
  const firefliesRef = useRef<Firefly[]>([]);
  const seaBreezesRef = useRef<SeaBreeze[]>([]);
  const sparklesRef = useRef<SandSparkle[]>([]);
  const letterParticlesRef = useRef<LetterParticle[]>([]);

  // Sand Drawing Points
  const pointsFiveRef = useRef<DrawPoint[]>([]);
  const pointsFourRef = useRef<DrawPoint[]>([]);
  const pointsHeartRef = useRef<DrawPoint[]>([]);

  // Waves control variables
  const waveSurgeRef = useRef(0);
  const waveCycleRef = useRef(0);

  // Timers and Animation loops
  const animationFrameIdRef = useRef<number | null>(null);
  const timersRef = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    synthRef.current = new CinematicSynth();
    return () => {
      synthRef.current?.destroy();
    };
  }, []);

  const toggleMusic = () => {
    if (!synthRef.current) return;
    if (!musicEnabled) {
      synthRef.current.init();
      synthRef.current.setMute(false);
      setMusicEnabled(true);
    } else {
      synthRef.current.setMute(true);
      setMusicEnabled(false);
    }
  };

  // Pre-calculate drawings points in normalized coordinates (0 to 1 relative to viewport width/height)
  const initDrawPoints = () => {
    // Number 5 Points (top horizontal, down, loop)
    const points5: DrawPoint[] = [];
    // Top bar: x from 0.56 down to 0.44, y = 0.72
    for (let i = 0; i <= 25; i++) {
      points5.push({
        x: 0.56 - (i / 25) * 0.12,
        y: 0.72,
        visible: false,
        erased: false,
        foamAlpha: 0.85 + Math.random() * 0.15,
        foamSize: 5.5 + Math.random() * 3.5,
      });
    }
    // Vertical stem: x = 0.44, y from 0.72 to 0.785
    for (let i = 1; i <= 15; i++) {
      points5.push({
        x: 0.44,
        y: 0.72 + (i / 15) * 0.065,
        visible: false,
        erased: false,
        foamAlpha: 0.85 + Math.random() * 0.15,
        foamSize: 5.5 + Math.random() * 3.5,
      });
    }
    // Curved loop: center at (0.495, 0.825), radius 0.07, from -1.1*PI to 0.65*PI
    const startAngle = -1.1 * Math.PI;
    const endAngle = 0.65 * Math.PI;
    for (let i = 0; i <= 50; i++) {
      const angle = startAngle + (i / 50) * (endAngle - startAngle);
      points5.push({
        x: 0.495 + 0.065 * Math.cos(angle),
        y: 0.825 + 0.06 * Math.sin(angle),
        visible: false,
        erased: false,
        foamAlpha: 0.85 + Math.random() * 0.15,
        foamSize: 5.5 + Math.random() * 3.5,
      });
    }
    pointsFiveRef.current = points5;

    // Number 4 Points
    const points4: DrawPoint[] = [];
    // Diagonal: (0.54, 0.70) to (0.43, 0.81)
    for (let i = 0; i <= 30; i++) {
      const t = i / 30;
      points4.push({
        x: 0.54 - t * 0.11,
        y: 0.70 + t * 0.11,
        visible: false,
        erased: false,
        foamAlpha: 0.85 + Math.random() * 0.15,
        foamSize: 5.5 + Math.random() * 3.5,
      });
    }
    // Horizontal cross: (0.41, 0.81) to (0.58, 0.81)
    for (let i = 0; i <= 35; i++) {
      points4.push({
        x: 0.41 + (i / 35) * 0.17,
        y: 0.81,
        visible: false,
        erased: false,
        foamAlpha: 0.85 + Math.random() * 0.15,
        foamSize: 5.5 + Math.random() * 3.5,
      });
    }
    // Vertical stem: (0.52, 0.70) to (0.52, 0.88)
    for (let i = 0; i <= 35; i++) {
      points4.push({
        x: 0.52,
        y: 0.70 + (i / 35) * 0.18,
        visible: false,
        erased: false,
        foamAlpha: 0.85 + Math.random() * 0.15,
        foamSize: 5.5 + Math.random() * 3.5,
      });
    }
    pointsFourRef.current = points4;

    // Heart Points (parametric curve centered at 0.5, 0.78)
    const pointsH: DrawPoint[] = [];
    const steps = 90;
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * Math.PI * 2 - Math.PI; // center at top
      const xVal = 16 * Math.pow(Math.sin(t), 3);
      const yVal = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
      
      pointsH.push({
        x: 0.5 + (xVal * 0.0068),
        y: 0.785 - (yVal * 0.0068), // upright heart
        visible: false,
        erased: false,
        foamAlpha: 0.85 + Math.random() * 0.15,
        foamSize: 5.5 + Math.random() * 3.5,
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
    initDrawPoints();
    
    // Set to dark / black intro first
    setPhase("dark");
    phaseStartTimeRef.current = Date.now();

    const addTimer = (newPhase: Phase, ms: number, onStart?: () => void) => {
      timersRef.current.push(
        setTimeout(() => {
          setPhase(newPhase);
          phaseStartTimeRef.current = Date.now();
          if (onStart) onStart();
        }, ms)
      );
    };

    // 0.5s: intro_text ("The ocean has been counting with me...") for 4 seconds
    addTimer("intro_text", 500);

    // 4.5s: sand_five (Number 5 exists, stays for 4 seconds)
    addTimer("sand_five", 4500, () => {
      // Pre-fill all points of 5 to be immediately visible
      pointsFiveRef.current.forEach(p => p.visible = true);
    });

    // 8.5s: wave_erase_five (Wave surges down and erases 5, takes 3 seconds)
    addTimer("wave_erase_five", 8500);

    // 11.5s: sand_empty (Wave has retreated, sand is empty, pause for 2s)
    addTimer("sand_empty", 11500);

    // 13.5s: sand_four_draw (Nature draws 4 stroke-by-stroke over 6 seconds)
    addTimer("sand_four_draw", 13500);

    // 19.5s: sand_four_stay (4 stays, sunset brighter, starfish emerge, stays for 4s)
    addTimer("sand_four_stay", 19500, () => {
      // Ensure all points of 4 are fully visible
      pointsFourRef.current.forEach(p => p.visible = true);
    });

    // 23.5s: wave_transform_heart (Wave surges, erases 4, retreats leaving a heart. Stays for 5s)
    addTimer("wave_transform_heart", 23500);

    // 28.5s: reveal_ui (Fade to final UI)
    addTimer("reveal_ui", 28500, () => {
      // Ensure heart points are fully visible
      pointsHeartRef.current.forEach(p => p.visible = true);
    });
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
    for (let i = 0; i < 5; i++) {
      birds.push({
        x: -50 - i * 150,
        y: 60 + Math.random() * 100,
        scale: 0.35 + Math.random() * 0.35,
        speed: 0.6 + Math.random() * 0.4,
        wingPhase: Math.random() * Math.PI * 2,
        wingSpeed: 0.06 + Math.random() * 0.04,
      });
    }
    birdsRef.current = birds;

    // Generate falling petals
    const petals: Petal[] = [];
    for (let i = 0; i < 30; i++) {
      petals.push({
        x: Math.random() * 1200,
        y: -50 - Math.random() * 300,
        size: 6 + Math.random() * 7,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
        speedX: 0.4 + Math.random() * 0.8,
        speedY: 0.8 + Math.random() * 1.2,
      });
    }
    petalsRef.current = petals;

    // Generate fireflies
    const fireflies: Firefly[] = [];
    for (let i = 0; i < 40; i++) {
      fireflies.push({
        x: Math.random() * 1200,
        y: 400 + Math.random() * 400,
        size: 1.2 + Math.random() * 2.2,
        speedX: (Math.random() - 0.5) * 0.4,
        speedY: (Math.random() - 0.5) * 0.3 - 0.1,
        alpha: Math.random(),
        pulseSpeed: 0.02 + Math.random() * 0.025,
        phase: Math.random() * Math.PI * 2,
      });
    }
    firefliesRef.current = fireflies;

    // Sea breeze lines
    const seaBreezes: SeaBreeze[] = [];
    for (let i = 0; i < 7; i++) {
      seaBreezes.push({
        x: Math.random() * 1200,
        y: 80 + Math.random() * 220,
        length: 70 + Math.random() * 120,
        speed: 2.0 + Math.random() * 1.5,
        alpha: 0.08 + Math.random() * 0.2,
      });
    }
    seaBreezesRef.current = seaBreezes;

    // Sand sparkles
    const sparkles: SandSparkle[] = [];
    for (let i = 0; i < 50; i++) {
      sparkles.push({
        x: Math.random() * 1200,
        y: 580 + Math.random() * 280,
        size: 0.7 + Math.random() * 1.3,
        alpha: 0.1 + Math.random() * 0.6,
        pulseSpeed: 0.02 + Math.random() * 0.04,
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

      // 1. Draw Sunset Sky Gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.5);
      skyGrad.addColorStop(0, "#1c0d29"); // twilight purple
      skyGrad.addColorStop(0.3, "#341a4a"); // rich violet
      skyGrad.addColorStop(0.6, "#7c225b"); // magenta pink
      skyGrad.addColorStop(0.82, "#cc5252"); // sunset orange
      skyGrad.addColorStop(1, "#fca84d"); // golden twilight glow
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h * 0.5);

      // 2. Draw Sun and Lens Flare (with dynamic intensity)
      let sunsetIntensity = 1.0;
      if (phaseRef.current === "sand_four_stay" || phaseRef.current === "wave_transform_heart" || phaseRef.current === "reveal_ui") {
        const elapsed = Date.now() - phaseStartTimeRef.current;
        const duration = 2000;
        const progress = phaseRef.current === "sand_four_stay" 
          ? Math.min(1, elapsed / duration) 
          : 1.0;
        sunsetIntensity = 1.0 + progress * 0.25;
      }

      const sunX = w * 0.5;
      const sunY = h * 0.49;
      const sunGrad = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 150 * sunsetIntensity);
      sunGrad.addColorStop(0, `rgba(255, 252, 235, ${Math.min(1.0, 0.95 * sunsetIntensity)})`);
      sunGrad.addColorStop(0.12, `rgba(255, 238, 160, ${0.9 * sunsetIntensity})`);
      sunGrad.addColorStop(0.35, `rgba(255, 178, 107, ${0.5 * sunsetIntensity})`);
      sunGrad.addColorStop(0.65, `rgba(235, 94, 85, ${0.12 * sunsetIntensity})`);
      sunGrad.addColorStop(1, "rgba(235, 94, 85, 0)");
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(sunX, sunY, 150 * sunsetIntensity, 0, Math.PI * 2);
      ctx.fill();

      // Golden horizon line glow
      const glowGrad = ctx.createLinearGradient(0, sunY - 4, 0, sunY + 4);
      glowGrad.addColorStop(0, "rgba(255, 215, 130, 0)");
      glowGrad.addColorStop(0.5, `rgba(255, 215, 130, ${0.45 * sunsetIntensity})`);
      glowGrad.addColorStop(1, "rgba(255, 215, 130, 0)");
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, sunY - 4, w, 8);

      // Draw golden rays radiating from the sun
      if (phaseRef.current === "sand_four_stay" || phaseRef.current === "wave_transform_heart" || phaseRef.current === "reveal_ui") {
        const numRays = 8;
        const rayAngleOffset = waveCycleRef.current * 0.05;
        ctx.save();
        ctx.globalCompositeOperation = "screen";
        for (let i = 0; i < numRays; i++) {
          const angle = (i / numRays) * Math.PI + rayAngleOffset;
          const rayWidth = 0.12;
          const rayOpacity = 0.08 * Math.min(1, (Date.now() - phaseStartTimeRef.current) / 2000) * sunsetIntensity;
          ctx.fillStyle = `rgba(255, 230, 150, ${rayOpacity})`;
          ctx.beginPath();
          ctx.moveTo(sunX, sunY);
          ctx.arc(sunX, sunY, Math.max(w, h), angle - rayWidth, angle + rayWidth);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      }

      // 3. Draw Birds Flying Slowly
      ctx.fillStyle = "rgba(40, 15, 28, 0.35)";
      birdsRef.current.forEach((bird) => {
        bird.x += bird.speed;
        bird.wingPhase += bird.wingSpeed;
        if (bird.x > w + 100) {
          bird.x = -100;
          bird.y = 50 + Math.random() * 100;
        }

        const flap = Math.sin(bird.wingPhase) * 11 * bird.scale;
        ctx.beginPath();
        ctx.moveTo(bird.x, bird.y);
        ctx.quadraticCurveTo(bird.x - 15 * bird.scale, bird.y - 12 * bird.scale + flap, bird.x - 30 * bird.scale, bird.y - 5 * bird.scale);
        ctx.quadraticCurveTo(bird.x - 15 * bird.scale, bird.y - 4 * bird.scale + flap * 0.4, bird.x, bird.y + 4 * bird.scale);
        ctx.quadraticCurveTo(bird.x + 15 * bird.scale, bird.y - 4 * bird.scale + flap * 0.4, bird.x + 30 * bird.scale, bird.y - 5 * bird.scale);
        ctx.quadraticCurveTo(bird.x + 15 * bird.scale, bird.y - 12 * bird.scale + flap, bird.x, bird.y);
        ctx.fill();
      });

      // 4. Sea Breeze Particles
      ctx.strokeStyle = "rgba(255, 255, 255, 0.07)";
      ctx.lineWidth = 1.2;
      seaBreezesRef.current.forEach((breeze) => {
        breeze.x += breeze.speed;
        if (breeze.x > w + breeze.length) {
          breeze.x = -breeze.length;
          breeze.y = 80 + Math.random() * 240;
        }
        ctx.beginPath();
        ctx.moveTo(breeze.x, breeze.y);
        ctx.lineTo(breeze.x + breeze.length, breeze.y);
        ctx.stroke();
      });

      // 5. Ocean Water & Reflections (with fade-out on final UI reveal)
      const horizonY = h * 0.5;
      const baselineShorelineY = h * 0.69;

      let targetSurge = 0;
      if (phaseRef.current === "wave_erase_five") {
        const elapsed = Date.now() - phaseStartTimeRef.current;
        targetSurge = elapsed < 1500 ? 1 : 0;
      } else if (phaseRef.current === "wave_transform_heart") {
        const elapsed = Date.now() - phaseStartTimeRef.current;
        targetSurge = elapsed < 2000 ? 1 : 0;
      }
      waveSurgeRef.current += (targetSurge - waveSurgeRef.current) * 0.055;

      const normalWaveAmplitude = h * 0.024;
      const waveOscillation = Math.sin(waveCycleRef.current) * normalWaveAmplitude;
      const surgeOffset = waveSurgeRef.current * (h * 0.18);
      const waveFrontY = baselineShorelineY + waveOscillation + surgeOffset;

      let sandOceanAlpha = 1.0;
      if (phaseRef.current === "reveal_ui") {
        const elapsed = Date.now() - phaseStartTimeRef.current;
        sandOceanAlpha = Math.max(0.18, 1.0 - elapsed / 2200); // fade to 0.18 over 2.2s
      }

      ctx.save();
      ctx.globalAlpha = sandOceanAlpha;

      // Draw ocean water body
      const waterGrad = ctx.createLinearGradient(0, horizonY, 0, waveFrontY);
      waterGrad.addColorStop(0, "#143a42");
      waterGrad.addColorStop(0.35, "#105a63");
      waterGrad.addColorStop(0.7, "#0f8385");
      waterGrad.addColorStop(0.95, "#25c2ad");
      waterGrad.addColorStop(1, "#8ef2de");
      ctx.fillStyle = waterGrad;

      ctx.beginPath();
      ctx.moveTo(0, horizonY);
      ctx.lineTo(w, horizonY);
      ctx.lineTo(w, waveFrontY);
      for (let x = w; x >= 0; x -= 40) {
        const offset = Math.sin((x / w) * Math.PI * 6 + waveCycleRef.current * 2) * 8;
        ctx.lineTo(x, waveFrontY + offset);
      }
      ctx.closePath();
      ctx.fill();

      // Sunset reflection on water
      ctx.save();
      ctx.globalCompositeOperation = "source-atop";
      for (let i = 0; i < 40; i++) {
        const percentY = i / 40;
        const ry = horizonY + percentY * (waveFrontY - horizonY);
        const rx = w * 0.5 + (Math.sin(percentY * Math.PI * 4 + waveCycleRef.current * 3) * (w * 0.05 * percentY));
        const width = 80 * percentY * (1.2 + Math.sin(i * 1.5 + waveCycleRef.current * 4) * 0.4);
        
        ctx.fillStyle = `rgba(254, 215, 170, ${0.45 * (1 - percentY) * sunsetIntensity})`;
        ctx.beginPath();
        ctx.ellipse(rx, ry, width, 1.8 + 1.2 * percentY, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      ctx.restore(); // restore globalAlpha for sky/sea boundary

      // 6. Draw Sand Body (incorporating reveal fade-out)
      ctx.save();
      ctx.globalAlpha = sandOceanAlpha;

      const sandGrad = ctx.createLinearGradient(0, horizonY, 0, h);
      sandGrad.addColorStop(0, "#98704c"); // Wet sand
      sandGrad.addColorStop(0.4, "#b58d67"); 
      sandGrad.addColorStop(0.8, "#d2aa7e"); // Dry sand
      sandGrad.addColorStop(1, "#dfb696"); 
      ctx.fillStyle = sandGrad;
      
      ctx.beginPath();
      ctx.moveTo(0, waveFrontY);
      for (let x = 0; x <= w; x += 40) {
        const offset = Math.sin((x / w) * Math.PI * 6 + waveCycleRef.current * 2) * 8;
        ctx.lineTo(x, waveFrontY + offset);
      }
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.closePath();
      ctx.fill();

      // Mirror reflection layer
      const wetSandReflectionY = waveFrontY + 4;
      const refGrad = ctx.createLinearGradient(0, wetSandReflectionY, 0, wetSandReflectionY + 120);
      refGrad.addColorStop(0, `rgba(255, 178, 107, ${0.25 * sunsetIntensity})`);
      refGrad.addColorStop(0.4, `rgba(223, 94, 85, ${0.1 * sunsetIntensity})`);
      refGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = refGrad;
      ctx.fillRect(0, wetSandReflectionY, w, 150);

      // Sand sparkles
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

      // 7. Render Sand Drawings & Collision Logic
      const sizeRef = Math.min(w, h);
      const renderDrawing = (pointsList: DrawPoint[]) => {
        pointsList.forEach((pt) => {
          // Adjust scaling to keep proportions and centering on phone screens
          const px = w * 0.5 + (pt.x - 0.5) * sizeRef * 1.15;
          const py = h * 0.785 + (pt.y - 0.785) * sizeRef * 1.15;

          // Wave collision logic
          const localWaveOffset = Math.sin((px / w) * Math.PI * 6 + waveCycleRef.current * 2) * 8;
          const currentWaveYAtX = waveFrontY + localWaveOffset;

          // Erase points if wave covers them
          if (py < currentWaveYAtX + 15 && pt.visible) {
            if (phaseRef.current === "wave_erase_five" && pointsList === pointsFiveRef.current) {
              pt.erased = true;
            }
            if (phaseRef.current === "wave_transform_heart" && pointsList === pointsFourRef.current) {
              pt.erased = true;
            }
          }

          if (pt.visible && !pt.erased) {
            // Draw sand indentations
            ctx.fillStyle = "rgba(70, 42, 18, 0.28)"; // shadow
            ctx.beginPath();
            ctx.arc(px, py + 1.8, 7.5, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = "rgba(85, 52, 28, 0.45)"; // groove
            ctx.beginPath();
            ctx.arc(px, py, 5.5, 0, Math.PI * 2);
            ctx.fill();

            // Glowing sea foam drawing
            const glowGrad = ctx.createRadialGradient(px, py, 0, px, py, pt.foamSize * 1.4);
            glowGrad.addColorStop(0, "rgba(255, 255, 255, 0.95)");
            glowGrad.addColorStop(0.3, "rgba(153, 246, 228, 0.75)"); // light cyan
            glowGrad.addColorStop(0.75, "rgba(45, 212, 191, 0.25)"); // teal glow
            glowGrad.addColorStop(1, "rgba(45, 212, 191, 0)");
            ctx.fillStyle = glowGrad;
            ctx.beginPath();
            ctx.arc(px, py, pt.foamSize * 1.4, 0, Math.PI * 2);
            ctx.fill();

            // Foam sparkle particles
            ctx.fillStyle = `rgba(255, 255, 255, ${pt.foamAlpha})`;
            ctx.beginPath();
            ctx.arc(px + (Math.random() - 0.5) * 5, py + (Math.random() - 0.5) * 5, 1.2, 0, Math.PI * 2);
            ctx.fill();
          }
        });
      };

      // Draw 5
      if (phaseRef.current === "sand_five" || phaseRef.current === "wave_erase_five") {
        renderDrawing(pointsFiveRef.current);
      }

      // Draw 4 stroke-by-stroke over 6 seconds
      if (phaseRef.current === "sand_four_draw") {
        const elapsed = Date.now() - phaseStartTimeRef.current;
        const progress = Math.min(1, elapsed / 6000);
        const drawCount = Math.floor(progress * pointsFourRef.current.length);
        for (let i = 0; i < drawCount; i++) {
          pointsFourRef.current[i].visible = true;
        }
        renderDrawing(pointsFourRef.current);
      }

      if (phaseRef.current === "sand_four_stay") {
        renderDrawing(pointsFourRef.current);
      }

      // Draw Heart stroke-by-stroke as wave retreats
      if (phaseRef.current === "wave_transform_heart") {
        const elapsed = Date.now() - phaseStartTimeRef.current;
        if (elapsed > 2000) {
          const progress = Math.min(1, (elapsed - 2000) / 3000);
          const drawCount = Math.floor(progress * pointsHeartRef.current.length);
          for (let i = 0; i < drawCount; i++) {
            pointsHeartRef.current[i].visible = true;
          }
        }
        renderDrawing(pointsHeartRef.current);
      }

      if (phaseRef.current === "reveal_ui") {
        renderDrawing(pointsHeartRef.current);
      }

      // 8. Render Seashells & Starfish (Fading in smoothly)
      if (phaseRef.current === "sand_four_stay" || phaseRef.current === "wave_transform_heart" || phaseRef.current === "reveal_ui") {
        const elapsed = Date.now() - phaseStartTimeRef.current;
        const itemProgress = phaseRef.current === "sand_four_stay" 
          ? Math.min(1, elapsed / 2000) 
          : 1.0;

        ctx.save();
        ctx.globalAlpha = itemProgress * sandOceanAlpha;

        // Draw Starfish
        const starX = w * 0.5 + 0.11 * sizeRef * 1.15;
        const starY = h * 0.785 + 0.05 * sizeRef * 1.15;
        ctx.save();
        ctx.translate(starX, starY);
        ctx.rotate(0.25);
        ctx.fillStyle = "rgba(224, 100, 78, 0.85)"; // Coral
        ctx.shadowColor = "rgba(50, 25, 10, 0.35)";
        ctx.shadowBlur = 4;
        ctx.shadowOffsetY = 2;
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          ctx.lineTo(0, -9);
          ctx.lineTo(3.2, -2.8);
          ctx.rotate((Math.PI * 2) / 5);
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        // Draw Seashell
        const shellX = w * 0.5 - 0.11 * sizeRef * 1.15;
        const shellY = h * 0.785 + 0.065 * sizeRef * 1.15;
        ctx.save();
        ctx.translate(shellX, shellY);
        ctx.rotate(-0.35);
        ctx.fillStyle = "rgba(244, 230, 218, 0.92)";
        ctx.strokeStyle = "rgba(175, 155, 135, 0.55)";
        ctx.lineWidth = 1;
        ctx.shadowColor = "rgba(50, 25, 10, 0.25)";
        ctx.shadowBlur = 3;
        ctx.shadowOffsetY = 1.5;

        ctx.beginPath();
        ctx.arc(0, 0, 7.5, Math.PI, 0, false);
        ctx.lineTo(0, 3.5);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Lines on shell
        ctx.beginPath();
        ctx.moveTo(-5.5, -1.8); ctx.quadraticCurveTo(-2.8, 0.9, 0, 3.5);
        ctx.moveTo(-2.8, -3.8); ctx.quadraticCurveTo(-1.4, 0, 0, 3.5);
        ctx.moveTo(0, -4.8); ctx.lineTo(0, 3.5);
        ctx.moveTo(2.8, -3.8); ctx.quadraticCurveTo(1.4, 0, 0, 3.5);
        ctx.moveTo(5.5, -1.8); ctx.quadraticCurveTo(2.8, 0.9, 0, 3.5);
        ctx.stroke();
        ctx.restore();

        ctx.restore();
      }
      ctx.restore(); // restore globalAlpha from sandOceanAlpha

      // 9. Floating Flower Petals
      petalsRef.current.forEach((petal) => {
        petal.y += petal.speedY;
        petal.x += petal.speedX + Math.sin(waveCycleRef.current + petal.y * 0.01) * 0.35;
        petal.rotation += petal.rotationSpeed;

        if (petal.y > h + 20 || petal.x > w + 20) {
          petal.y = -30;
          petal.x = Math.random() * w * 0.7;
        }

        ctx.save();
        ctx.translate(petal.x, petal.y);
        ctx.rotate(petal.rotation);
        
        const grad = ctx.createLinearGradient(-petal.size, 0, petal.size, 0);
        grad.addColorStop(0, "#fb7185"); // rose-400
        grad.addColorStop(1, "#fda4af"); // rose-300
        ctx.fillStyle = grad;
        
        ctx.beginPath();
        ctx.ellipse(0, 0, petal.size, petal.size * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = "rgba(225, 29, 72, 0.18)";
        ctx.beginPath();
        ctx.moveTo(-petal.size, 0);
        ctx.lineTo(petal.size, 0);
        ctx.stroke();
        ctx.restore();
      });

      // 10. Fireflies Floating
      firefliesRef.current.forEach((fly) => {
        fly.phase += fly.pulseSpeed;
        fly.x += fly.speedX + Math.sin(fly.phase) * 0.18;
        fly.y += fly.speedY;

        if (fly.y < horizonY || fly.x < 0 || fly.x > w) {
          fly.y = h - Math.random() * 250;
          fly.x = Math.random() * w;
        }

        const alpha = Math.abs(Math.sin(fly.phase)) * 0.75 + 0.2;
        const fireflyGlow = ctx.createRadialGradient(fly.x, fly.y, 0, fly.x, fly.y, fly.size * 3.5);
        fireflyGlow.addColorStop(0, `rgba(253, 224, 71, ${alpha})`);
        fireflyGlow.addColorStop(0.4, `rgba(234, 179, 8, ${alpha * 0.35})`);
        fireflyGlow.addColorStop(1, "rgba(234, 179, 8, 0)");

        ctx.fillStyle = fireflyGlow;
        ctx.beginPath();
        ctx.arc(fly.x, fly.y, fly.size * 3.5, 0, Math.PI * 2);
        ctx.fill();
      });

      // 11. Render Letter Dissolve Particles (Morphing into stars)
      letterParticlesRef.current.forEach((p) => {
        if (!p.isStar) {
          p.x += p.vx;
          p.y += p.vy;
          p.vy -= 0.08; // float upwards acceleration
          p.vx += Math.sin(p.y * 0.05 + waveCycleRef.current) * 0.08; // breeze sway
          
          // Transition to stars above horizon
          if (p.y < horizonY - 15) {
            if (Math.random() < 0.24) { // convert fraction to stars
              p.isStar = true;
              p.vx = 0;
              p.vy = 0;
              p.alpha = 0.45 + Math.random() * 0.55;
            } else {
              p.alpha -= 0.018; // dissolve away
            }
          }
        } else {
          // Twinkling logic for sky stars
          p.starTwinklePhase += 0.035;
          p.alpha = 0.4 + Math.abs(Math.sin(p.starTwinklePhase)) * 0.6;
        }

        if (p.alpha > 0) {
          if (p.isStar) {
            // Star particle
            ctx.shadowBlur = 5;
            ctx.shadowColor = p.color;
            ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * 0.7, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
          } else {
            // Paper glow particle
            const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3.8);
            glow.addColorStop(0, `rgba(254, 243, 199, ${p.alpha})`);
            glow.addColorStop(0.5, `rgba(253, 230, 138, ${p.alpha * 0.4})`);
            glow.addColorStop(1, "rgba(253, 230, 138, 0)");
            ctx.fillStyle = glow;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * 3.8, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      });
      // Filter out dead particles
      letterParticlesRef.current = letterParticlesRef.current.filter((p) => p.alpha > 0);

      // 12. Wave Foam Lines (front leading edges)
      ctx.save();
      ctx.globalAlpha = sandOceanAlpha;
      ctx.fillStyle = "rgba(255, 255, 255, 0.38)";
      for (let i = 0; i < w; i += 18) {
        const offset = Math.sin((i / w) * Math.PI * 6 + waveCycleRef.current * 2) * 8;
        const fy = waveFrontY + offset;
        ctx.beginPath();
        ctx.arc(i, fy + 2.2, 7.5 + Math.sin(waveCycleRef.current * 3 + i) * 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
      for (let i = 0; i < w; i += 24) {
        const offset = Math.sin((i / w) * Math.PI * 6 + waveCycleRef.current * 2) * 8;
        const fy = waveFrontY + offset;
        ctx.beginPath();
        ctx.arc(i, fy - 1, 4.5 + Math.sin(waveCycleRef.current * 2.5 + i) * 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      animationFrameIdRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
    };
  }, [triggerReplay]);

  // Handler to dissolve letter modal into stars
  const dissolveLetter = () => {
    const particles: LetterParticle[] = [];
    const w = window.innerWidth;
    const h = window.innerHeight;
    
    // Spawn 150 particles around center of screen
    for (let i = 0; i < 150; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.5 + Math.random() * 3.5;
      
      particles.push({
        x: w * 0.5 + (Math.random() - 0.5) * w * 0.3,
        y: h * 0.45 + (Math.random() - 0.5) * h * 0.2,
        vx: Math.cos(angle) * speed,
        vy: -0.5 - Math.random() * 2.0,
        size: 1.0 + Math.random() * 3.0,
        alpha: 1.0,
        color: i % 2 === 0 ? "rgba(254, 243, 199, 1.0)" : "rgba(253, 230, 138, 1.0)",
        isStar: false,
        starTwinklePhase: Math.random() * Math.PI * 2,
      });
    }
    letterParticlesRef.current = particles;
  };

  const handleCloseLetter = () => {
    setLetterOpen(false);
    dissolveLetter();
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
      className="relative min-h-[100dvh] w-full overflow-hidden flex flex-col justify-between items-center text-slate-100 font-sans select-none"
    >
      {/* Canvas rendering beach sunset and waves */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover z-0"
      />

      {/* Subtle vignettes */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-black/30 pointer-events-none z-10" />

      {/* Close button in top-right */}
      <button
        onClick={onClose}
        className="absolute right-6 top-6 z-40 rounded-full border border-white/20 bg-black/20 p-2.5 hover:bg-black/40 text-white/80 hover:text-white shadow-lg backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
      >
        <X size={20} />
      </button>

      {/* Ambient Music Control Button */}
      <button
        onClick={toggleMusic}
        className="absolute left-6 top-6 z-40 rounded-full border border-white/20 bg-black/20 px-4 py-2.5 hover:bg-black/40 text-white/80 hover:text-white shadow-lg backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-2 text-xs font-bold tracking-widest uppercase"
      >
        <span>{musicEnabled ? "🔊 Music On" : "🔇 Music Off"}</span>
      </button>

      {/* Golden hour lens flare overlay */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-bl from-orange-400/10 via-rose-500/5 to-transparent rounded-full blur-3xl pointer-events-none z-10" />

      {/* Cinematic Text Overlays */}
      <AnimatePresence mode="wait">
        {phase === "intro_text" && (
          <motion.div
            key="intro_text"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none px-6"
          >
            <p className={`${caveat.className} text-3xl sm:text-4.5xl text-rose-100 font-bold tracking-wide drop-shadow-[0_2px_15px_rgba(255,255,255,0.35)] text-center`}>
              The ocean has been counting with me...
            </p>
          </motion.div>
        )}

        {phase === "wave_transform_heart" && (
          <motion.div
            key="heart_text"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none px-6"
          >
            <div className="text-center flex flex-col gap-3">
              <p className={`${caveat.className} text-2xl sm:text-3.5xl text-rose-100/90 font-bold tracking-wide drop-shadow-[0_2px_10px_rgba(255,182,193,0.3)]`}>
                Some things change with time...
              </p>
              <p className={`${playfair.className} text-3xl sm:text-4.5xl text-white font-black tracking-wider drop-shadow-[0_2px_15px_rgba(255,255,255,0.4)]`}>
                Love never does.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Layout */}
      <div className="relative z-20 flex-1 flex flex-col items-center justify-center px-4 py-10 sm:py-16 w-full max-w-xl text-center">
        
        {/* Cinematic Title & Custom Letter Reveal Stage */}
        <AnimatePresence>
          {phase === "reveal_ui" && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="flex flex-col items-center gap-6 w-full"
            >
              {/* Glassmorphic header banner */}
              <div className="relative overflow-hidden rounded-[2.5rem] border border-white/20 bg-white/10 px-8 py-7 shadow-[0_25px_65px_rgba(31,18,53,0.3)] backdrop-blur-2xl max-w-sm w-full flex flex-col items-center gap-3">
                <div className="flex items-center gap-1.5 text-rose-300/90 text-sm tracking-widest uppercase font-bold">
                  <Sparkles size={14} className="animate-pulse" />
                  <span>🌊❤️ 4 DAYS TO GO ❤️🌊</span>
                  <Sparkles size={14} className="animate-pulse" />
                </div>
                <h1 className="text-3.5xl sm:text-4xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-orange-200 via-rose-100 to-teal-200 font-sans drop-shadow-[0_2px_15px_rgba(255,255,255,0.15)]">
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
                  className="mb-4 text-rose-200/95 text-sm font-bold tracking-widest uppercase flex items-center gap-1.5 drop-shadow-md"
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
                  {shellOpen && (
                    <motion.div
                      initial={{ scale: 0, y: 0, opacity: 0 }}
                      animate={{ scale: 1, y: -45, opacity: 1 }}
                      transition={{ delay: 0.6, duration: 1.0, ease: "easeOut" }}
                      className="absolute w-6 h-6 rounded-full bg-radial-gradient from-white via-pink-100 to-rose-200 z-20 shadow-[0_0_20px_rgba(255,255,255,0.9),0_0_30px_rgba(253,224,71,0.6)]"
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
                    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/45 backdrop-blur-md">
                      <motion.div
                        initial={{ scale: 0.1, y: 200, rotateX: 45, opacity: 0 }}
                        animate={{ scale: 1, y: 0, rotateX: 0, opacity: 1 }}
                        exit={{ scale: 0.05, y: -200, rotateX: -45, opacity: 0 }}
                        transition={{ type: "spring", damping: 20, stiffness: 80 }}
                        className="relative w-full max-w-lg rounded-3xl border border-amber-900/10 bg-[radial-gradient(circle_at_top,_#fffcf0_0%,_#faf3dd_100%)] p-6 md:p-8 shadow-[0_30px_80px_rgba(30,20,10,0.55)] text-left flex flex-col justify-between max-h-[85vh] overflow-hidden"
                      >
                        {/* Fold shadow overlay */}
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-900/5 to-transparent pointer-events-none" />

                        {/* Top decorative header */}
                        <div className="flex justify-between items-center border-b border-amber-900/15 pb-3 mb-4 z-10">
                          <span className={`${playfair.className} text-xs font-black tracking-widest text-amber-900/60 uppercase`}>
                            My Little Secret 🐚
                          </span>
                          <span className="text-xl">💌</span>
                        </div>

                        {/* Scrollable Letter Body */}
                        <div className="flex-1 overflow-y-auto pr-1 z-10 custom-scrollbar max-h-[55vh]">
                          <p className={`${caveat.className} text-xl sm:text-2xl leading-relaxed text-amber-950 font-bold whitespace-pre-line`}>
                            {SECRET_MESSAGE}
                          </p>
                        </div>

                        {/* Close button for letter */}
                        <div className="mt-5 pt-3 border-t border-amber-900/15 flex justify-end z-10">
                          <button
                            onClick={handleCloseLetter}
                            className="rounded-xl border border-amber-900/20 bg-amber-900/10 hover:bg-amber-900/20 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-amber-950 transition active:scale-95 cursor-pointer"
                          >
                            Close Secret
                          </button>
                        </div>
                      </motion.div>
                    </div>
                  )}
                </AnimatePresence>

              </div>

              {/* Bottom control buttons */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.0, duration: 0.8 }}
                className="flex items-center gap-4 mt-6 z-30"
              >
                <button
                  onClick={replayMagic}
                  className="rounded-full border border-white/20 bg-white/10 hover:bg-white/25 px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-white shadow-md backdrop-blur-sm transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw size={13} className="animate-spin-slow" />
                  <span>Replay Magic</span>
                </button>
                
                <button
                  onClick={onClose}
                  className="rounded-full border border-slate-700 bg-slate-900/50 hover:bg-slate-900/80 px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-slate-300 hover:text-white shadow-md backdrop-blur-sm transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
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
          background: rgba(120, 60, 20, 0.04);
          border-radius: 9px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(120, 60, 20, 0.2);
          border-radius: 9px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(120, 60, 20, 0.35);
        }
      `}</style>
    </motion.div>
  );
}
