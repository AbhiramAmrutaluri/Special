"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, Sparkles, Volume2, VolumeX, RefreshCw } from "lucide-react";
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

// Custom secret message
const SECRET_MESSAGE = `My Dearest Mammoty, ❤️

They say that when a whole village lights up, it's to guide a wanderer back home. But tonight, this entire village has secretly come together, lighting every candle, street lamp, and fireplace, just to celebrate you. 

No matter where we go or how many lights shine in the night sky, you will always be my brightest star, my anchor, and my absolute favorite person. You deserve all the warmth, love, and magic in the universe.

Only 3 more days until the world celebrates the day you were born... 🏰✨

Forever and always,
Your Special Person ❤️`;

// Web Audio API Sound Synthesizer
class MountainVillageSynth {
  private ctx: AudioContext | null = null;
  private activeNodes: AudioNode[] = [];
  private isMuted: boolean = false;
  private timer: NodeJS.Timeout | null = null;

  init() {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    this.ctx = new AudioContextClass();
    this.startAmbientProgression();
  }

  setMute(mute: boolean) {
    this.isMuted = mute;
    if (mute) {
      this.stopActiveNotes();
    } else {
      if (this.ctx?.state === "suspended") {
        this.ctx.resume();
      }
      this.startAmbientProgression();
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
    filter.frequency.value = 400; // Warm soft cinematic cutoff
    filter.Q.value = 1.0;

    gainNode.gain.setValueAtTime(0, startTime);
    // Smooth fade in
    gainNode.gain.linearRampToValueAtTime(gainValue * 0.15, startTime + 1.5);
    // Smooth fade out
    gainNode.gain.setValueAtTime(gainValue * 0.15, startTime + duration - 2.0);
    gainNode.gain.linearRampToValueAtTime(0, startTime + duration);

    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration);

    this.activeNodes.push(osc);
  }

  private startAmbientProgression() {
    if (!this.ctx || this.isMuted) return;

    // Cinematic chords progression: Cmaj9, Gsus4, Am9, Fmaj7
    const chords = [
      [130.81, 196.00, 261.63, 329.63, 392.00, 493.88], // Cmaj9 (C3, G3, C4, E4, G4, B4)
      [146.83, 220.00, 293.66, 392.00, 440.00, 587.33], // Gsus4 (D3, A3, D4, G4, A4, D5)
      [110.00, 220.00, 293.66, 349.23, 440.00, 587.33], // Am9 (A2, A3, D4, F4, A4, D5)
      [174.61, 261.63, 349.23, 440.00, 523.25, 659.25]  // Fmaj7 (F3, C4, F4, A4, C5, E5)
    ];

    let currentChord = 0;
    const playNext = () => {
      if (this.isMuted || !this.ctx) return;
      const notes = chords[currentChord];
      const now = this.ctx.currentTime;
      const chordDuration = 9.0;

      notes.forEach((freq, i) => {
        const delay = i * 0.25; // Staggered arpeggiation
        const volume = i === 0 ? 0.35 : 0.20;
        this.playTone(freq, now + delay, chordDuration - delay, volume);
      });

      currentChord = (currentChord + 1) % chords.length;
      this.timer = setTimeout(playNext, 8500);
    };

    playNext();
  }

  // Synthesize soft, resonant church bell tolls
  playChurchBells() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    
    // Play 3 bell chimes staggered by 2.2 seconds
    for (let toll = 0; toll < 3; toll++) {
      const startTime = now + toll * 2.2;
      const baseFreq = 164.81; // E3 note for deep spiritual resonance
      
      // Church bell harmonics
      const partials = [
        { ratio: 1.0, vol: 0.30 },
        { ratio: 2.0, vol: 0.15 },
        { ratio: 3.0, vol: 0.12 },
        { ratio: 4.2, vol: 0.08 },
        { ratio: 5.4, vol: 0.05 },
        { ratio: 6.8, vol: 0.03 }
      ];

      partials.forEach(partial => {
        const osc = this.ctx!.createOscillator();
        const gainNode = this.ctx!.createGain();
        
        osc.type = "sine";
        osc.frequency.value = baseFreq * partial.ratio;

        gainNode.gain.setValueAtTime(0, startTime);
        // Instant ring attack
        gainNode.gain.linearRampToValueAtTime(partial.vol * 0.3, startTime + 0.05);
        // Slow exponential ringing decay
        gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + 6.0);

        // Simple distortion to add warm metal character
        const shaper = this.ctx!.createWaveShaper();
        const makeDistortionCurve = (amount = 20) => {
          const k = typeof amount === "number" ? amount : 50;
          const n_samples = 44100;
          const curve = new Float32Array(n_samples);
          const deg = Math.PI / 180;
          for (let i = 0; i < n_samples; ++i) {
            const x = (i * 2) / n_samples - 1;
            curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
          }
          return curve;
        };
        shaper.curve = makeDistortionCurve(10);
        shaper.oversample = "4x";

        osc.connect(shaper);
        shaper.connect(gainNode);
        gainNode.connect(this.ctx!.destination);

        osc.start(startTime);
        osc.stop(startTime + 6.5);
        this.activeNodes.push(osc);
      });
    }
  }

  destroy() {
    this.stopActiveNotes();
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
  }
}

interface BirthdayThreeRevealProps {
  onClose: () => void;
}

type Phase =
  | "opening"
  | "scene1_breathing"
  | "scene2_blackout"
  | "scene3_number4"
  | "scene4_blackout"
  | "scene5_number3"
  | "scene6_celebration"
  | "final_reveal"
  | "emotional_ending"
  | "interactive_chest";

interface House {
  id: number;
  nx: number; // Normalized x coordinate (0.0 to 1.0)
  ny: number; // Normalized y coordinate (0.0 to 1.0)
  isPart4: boolean;
  isPart3: boolean;
  isBrightest: boolean;
  currentLight: number; // 0.0 to 1.0
  targetLight: number; // 0.0 to 1.0
  pulseOffset: number;
  type: "house" | "cottage" | "church" | "lamp";
  sizeMultiplier: number;
}

interface Star {
  x: number;
  y: number;
  size: number;
  alpha: number;
  twinkleSpeed: number;
  twinklePhase: number;
}

interface Firefly {
  x: number;
  y: number;
  size: number;
  vx: number;
  vy: number;
  alpha: number;
  pulsePhase: number;
  pulseSpeed: number;
}

interface Cloud {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  alpha: number;
}

interface FireworkParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
  fadeSpeed: number;
  gravity: number;
}

interface Firework {
  id: number;
  x: number;
  y: number;
  particles: FireworkParticle[];
}

interface FloatingSparkle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
  twinklePhase: number;
  twinkleSpeed: number;
}

export default function BirthdayThreeReveal({ onClose }: BirthdayThreeRevealProps) {
  const [phase, setPhase] = useState<Phase>("opening");
  const [musicEnabled, setMusicEnabled] = useState(false);
  const [chestOpened, setChestOpened] = useState(false);
  const [letterOpened, setLetterOpened] = useState(false);
  const [chestDissolved, setChestDissolved] = useState(false);
  const [triggerReplay, setTriggerReplay] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const synthRef = useRef<MountainVillageSynth | null>(null);
  const phaseRef = useRef<Phase>("opening");
  const phaseStartTimeRef = useRef(Date.now());
  
  // Custom camera properties
  const cameraRef = useRef({
    x: 0,
    y: 0,
    scale: 1.0,
    targetX: 0,
    targetY: 0,
    targetScale: 1.0,
  });

  // Floating background systems
  const starsRef = useRef<Star[]>([]);
  const cloudsRef = useRef<Cloud[]>([]);
  const firefliesRef = useRef<Firefly[]>([]);
  const sparklesRef = useRef<FloatingSparkle[]>([]);
  const fireworksRef = useRef<Firework[]>([]);
  const housesRef = useRef<House[]>([]);

  const animationFrameIdRef = useRef<number | null>(null);
  const timersRef = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    phaseRef.current = phase;
    phaseStartTimeRef.current = Date.now();
  }, [phase]);

  // Audio system cleanup and initial launch
  useEffect(() => {
    synthRef.current = new MountainVillageSynth();
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

  // Generate house array structure and star fields
  const initializeEntities = () => {
    // 1. Stars (Static sky grid with randomized noise)
    const stars: Star[] = [];
    for (let i = 0; i < 220; i++) {
      stars.push({
        x: Math.random(),
        y: Math.random() * 0.55, // Only in the sky region
        size: 0.6 + Math.random() * 1.6,
        alpha: 0.15 + Math.random() * 0.85,
        twinkleSpeed: 0.02 + Math.random() * 0.04,
        twinklePhase: Math.random() * Math.PI * 2,
      });
    }
    starsRef.current = stars;

    // 2. Translucent clouds
    const clouds: Cloud[] = [];
    for (let i = 0; i < 5; i++) {
      clouds.push({
        x: Math.random() * 1.5 - 0.25,
        y: 0.05 + Math.random() * 0.22,
        width: 0.25 + Math.random() * 0.2,
        height: 0.06 + Math.random() * 0.04,
        speed: 0.0003 + Math.random() * 0.0004,
        alpha: 0.10 + Math.random() * 0.12,
      });
    }
    cloudsRef.current = clouds;

    // 3. Fireflies
    const fireflies: Firefly[] = [];
    for (let i = 0; i < 40; i++) {
      fireflies.push({
        x: Math.random(),
        y: 0.5 + Math.random() * 0.45,
        size: 1.0 + Math.random() * 1.8,
        vx: (Math.random() - 0.5) * 0.001,
        vy: (Math.random() - 0.5) * 0.001,
        alpha: 0.2 + Math.random() * 0.8,
        pulsePhase: Math.random() * Math.PI * 2,
        pulseSpeed: 0.03 + Math.random() * 0.05,
      });
    }
    firefliesRef.current = fireflies;

    // 4. Sparkles
    const sparkles: FloatingSparkle[] = [];
    for (let i = 0; i < 60; i++) {
      sparkles.push({
        x: Math.random(),
        y: Math.random(),
        vx: (Math.random() - 0.5) * 0.0008,
        vy: -0.0005 - Math.random() * 0.001,
        size: 1.0 + Math.random() * 2.0,
        alpha: 0.1 + Math.random() * 0.7,
        color: "rgba(251, 191, 36, " + (0.3 + Math.random() * 0.5) + ")",
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.04 + Math.random() * 0.08,
      });
    }
    sparklesRef.current = sparkles;

    // 5. Generate Houses laying out "4", "3" and neutral valley elements.
    const houses: House[] = [];
    let houseIdCounter = 0;

    // Define shapes mathematically in normalized coordinate spaces centered at (0.52, 0.52)
    const points4: { nx: number; ny: number }[] = [];
    const points3: { nx: number; ny: number }[] = [];

    // Digit "4" layout coords
    // Vertical stem: nx = 0.58, ny = 0.28 to 0.76 (approx 20 houses)
    for (let y = 0.30; y <= 0.74; y += 0.024) {
      points4.push({ nx: 0.58, ny: y });
    }
    // Diagonal left: from (0.58, 0.30) to (0.38, 0.56) (approx 12 houses)
    for (let t = 0; t <= 1; t += 0.08) {
      points4.push({ nx: 0.58 - t * 0.20, ny: 0.30 + t * 0.26 });
    }
    // Horizontal cross: ny = 0.56, nx = 0.32 to 0.70 (approx 16 houses)
    for (let x = 0.34; x <= 0.70; x += 0.024) {
      points4.push({ nx: x, ny: 0.56 });
    }

    // Digit "3" layout coords
    // Top arc: center at (0.50, 0.40), radius 0.13, angle from -Math.PI*0.5 to Math.PI*0.5
    const cx3_top = 0.50;
    const cy3_top = 0.40;
    const r3_top = 0.13;
    for (let a = -Math.PI * 0.55; a <= Math.PI * 0.55; a += 0.09) {
      points3.push({ nx: cx3_top + r3_top * Math.cos(a), ny: cy3_top + r3_top * Math.sin(a) });
    }
    // Bottom arc: center at (0.50, 0.62), radius 0.16, angle from -Math.PI*0.5 to Math.PI*0.8
    const cx3_bot = 0.50;
    const cy3_bot = 0.62;
    const r3_bot = 0.16;
    for (let a = -Math.PI * 0.55; a <= Math.PI * 0.85; a += 0.08) {
      points3.push({ nx: cx3_bot + r3_bot * Math.cos(a), ny: cy3_bot + r3_bot * Math.sin(a) });
    }

    // Add points into houses pool, checking for overlaps to merge them
    const addPoints = (pointsList: { nx: number; ny: number }[], partName: "4" | "3") => {
      pointsList.forEach(pt => {
        // Check duplicate coordinates
        const duplicate = houses.find(
          h => Math.hypot(h.nx - pt.nx, h.ny - pt.ny) < 0.018
        );
        if (duplicate) {
          if (partName === "4") duplicate.isPart4 = true;
          if (partName === "3") duplicate.isPart3 = true;
        } else {
          // Determine type (streetlamps at random junctions, standard cottage, church, etc.)
          let type: "house" | "cottage" | "church" | "lamp" = "house";
          const roll = Math.random();
          if (roll < 0.10) type = "lamp";
          else if (roll < 0.25) type = "cottage";

          houses.push({
            id: houseIdCounter++,
            nx: pt.nx,
            ny: pt.ny,
            isPart4: partName === "4",
            isPart3: partName === "3",
            isBrightest: false,
            currentLight: 0.0,
            targetLight: 0.0,
            pulseOffset: Math.random() * Math.PI * 2,
            type,
            sizeMultiplier: 0.85 + Math.random() * 0.3,
          });
        }
      });
    };

    addPoints(points4, "4");
    addPoints(points3, "3");

    // Define the special "Mammoty brightest" house
    // Center it beautifully, making it part of the digits overlapping junction
    const brightestHouse = houses.find(
      h => h.isPart4 && h.isPart3 && Math.hypot(h.nx - 0.58, h.ny - 0.56) < 0.05
    ) || houses[Math.floor(houses.length / 2)];
    
    if (brightestHouse) {
      brightestHouse.isBrightest = true;
      brightestHouse.sizeMultiplier = 1.6; // Render noticeably larger and warmer
      brightestHouse.type = "cottage";
    }

    // Add a scenic church in the village
    const churchHouse = houses.find(
      h => !h.isBrightest && h.ny > 0.45 && h.ny < 0.65 && (h.isPart4 || h.isPart3)
    );
    if (churchHouse) {
      churchHouse.type = "church";
      churchHouse.sizeMultiplier = 1.8;
    }

    // 6. Fill with ~130 neutral background houses to create a lush, living valley
    for (let count = 0; count < 130; count++) {
      let valid = false;
      let rx = 0, ry = 0;
      let tries = 0;

      while (!valid && tries < 80) {
        rx = 0.15 + Math.random() * 0.70;
        ry = 0.35 + Math.random() * 0.52; // Valley slopes
        tries++;

        // Ensure it doesn't overlap digit outlines too closely
        const distToDigit = houses.reduce((min, h) => {
          return Math.min(min, Math.hypot(h.nx - rx, h.ny - ry));
        }, 1.0);

        if (distToDigit > 0.038) {
          valid = true;
        }
      }

      if (valid) {
        let type: "house" | "cottage" | "church" | "lamp" = "house";
        const roll = Math.random();
        if (roll < 0.12) type = "lamp";
        else if (roll < 0.28) type = "cottage";
        else if (roll < 0.30) type = "church"; // Rare cathedral in the landscape

        houses.push({
          id: houseIdCounter++,
          nx: rx,
          ny: ry,
          isPart4: false,
          isPart3: false,
          isBrightest: false,
          currentLight: 0.0,
          targetLight: 0.0,
          pulseOffset: Math.random() * Math.PI * 2,
          type,
          sizeMultiplier: type === "church" ? 1.6 : 0.85 + Math.random() * 0.3,
        });
      }
    }

    housesRef.current = houses;
  };

  // Timeline manager sequences
  const runSequenceTimers = () => {
    // Reset state & variables
    timersRef.current.forEach(t => clearTimeout(t));
    timersRef.current = [];
    setChestOpened(false);
    setLetterOpened(false);
    setChestDissolved(false);
    fireworksRef.current = [];

    const delay = (fn: () => void, ms: number) => {
      timersRef.current.push(setTimeout(fn, ms));
    };

    // Begin sequence flow
    setPhase("opening");

    // Scene 1: Heartbeat Breathing of the entire valley
    delay(() => {
      setPhase("scene1_breathing");
    }, 4500);

    // Scene 2: Power Cut
    delay(() => {
      setPhase("scene2_blackout");
    }, 9500);

    // Scene 3: Lights sweep in waves and form number "4"
    delay(() => {
      setPhase("scene3_number4");
    }, 12500);

    // Scene 4: Another Blackout
    delay(() => {
      setPhase("scene4_blackout");
    }, 18500);

    // Scene 5: Lights awaken to form "3"
    delay(() => {
      setPhase("scene5_number3");
    }, 21000);

    // Scene 6: Celebration lights, bells tolling, fireworks
    delay(() => {
      setPhase("scene6_celebration");
      // Trigger church bell chimes synthesized on the fly
      synthRef.current?.playChurchBells();
    }, 28000);

    // Final countdown text reveals
    delay(() => {
      setPhase("final_reveal");
    }, 34000);

    // Emotional zoom-in and fadeout
    delay(() => {
      setPhase("emotional_ending");
    }, 41000);

    // Prompt Interactive chest surprise
    delay(() => {
      setPhase("interactive_chest");
    }, 50000);
  };

  useEffect(() => {
    initializeEntities();
    runSequenceTimers();

    return () => {
      timersRef.current.forEach(t => clearTimeout(t));
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [triggerReplay]);

  // Main canvas animation and drone movement math
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

    const animationLoop = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const tNow = Date.now();

      // Clear canvas
      ctx.clearRect(0, 0, w, h);

      // 1. Draw Sky Background Gradient (Deep midnight romantic scene)
      const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
      skyGrad.addColorStop(0, "#020205");
      skyGrad.addColorStop(0.35, "#0b0c1b");
      skyGrad.addColorStop(0.70, "#191730");
      skyGrad.addColorStop(1.0, "#080611");
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h);

      // 2. Stars Twinkling & Rendering
      starsRef.current.forEach(star => {
        star.twinklePhase += star.twinkleSpeed;
        const currentAlpha = Math.max(0.1, Math.min(1.0, star.alpha + Math.sin(star.twinklePhase) * 0.35));
        ctx.fillStyle = `rgba(255, 255, 255, ${currentAlpha})`;
        ctx.beginPath();
        ctx.arc(star.x * w, star.y * h, star.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // 3. Moon (Soft, cinematic glowing circle)
      const moonX = w * 0.82;
      const moonY = h * 0.18;
      const moonR = Math.min(w, h) * 0.075;

      // Outer moon radial glow
      const moonGlow = ctx.createRadialGradient(moonX, moonY, moonR * 0.4, moonX, moonY, moonR * 3.2);
      moonGlow.addColorStop(0, "rgba(255, 252, 243, 0.85)");
      moonGlow.addColorStop(0.15, "rgba(255, 250, 230, 0.35)");
      moonGlow.addColorStop(0.40, "rgba(255, 245, 220, 0.08)");
      moonGlow.addColorStop(1.0, "rgba(255, 245, 220, 0)");
      ctx.fillStyle = moonGlow;
      ctx.beginPath();
      ctx.arc(moonX, moonY, moonR * 3.2, 0, Math.PI * 2);
      ctx.fill();

      // Draw solid moon disc
      ctx.fillStyle = "#fffdf5";
      ctx.shadowBlur = 20;
      ctx.shadowColor = "rgba(255, 253, 240, 0.65)";
      ctx.beginPath();
      ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0; // Reset shadow

      // Moonlight craters/shadows details
      ctx.fillStyle = "rgba(238, 230, 204, 0.3)";
      ctx.beginPath();
      ctx.arc(moonX - moonR * 0.3, moonY + moonR * 0.2, moonR * 0.25, 0, Math.PI * 2);
      ctx.arc(moonX + moonR * 0.2, moonY - moonR * 0.4, moonR * 0.22, 0, Math.PI * 2);
      ctx.arc(moonX + moonR * 0.4, moonY + moonR * 0.1, moonR * 0.18, 0, Math.PI * 2);
      ctx.fill();

      // 4. Drifting clouds in front of the moon
      cloudsRef.current.forEach(cloud => {
        cloud.x += cloud.speed;
        if (cloud.x > 1.2) cloud.x = -0.3; // loop clouds around

        const cx = cloud.x * w;
        const cy = cloud.y * h;
        const cw = cloud.width * w;
        const ch = cloud.height * h;

        ctx.fillStyle = `rgba(224, 231, 255, ${cloud.alpha})`;
        ctx.beginPath();
        ctx.ellipse(cx, cy, cw, ch, 0, 0, Math.PI * 2);
        ctx.fill();
      });

      // 5. Update Drone Camera Coordinates based on active phase
      const cam = cameraRef.current;
      switch (phaseRef.current) {
        case "opening":
          cam.targetScale = 1.35;
          cam.targetX = w * 0.15;
          cam.targetY = h * 0.08;
          break;
        case "scene1_breathing":
          cam.targetScale = 1.05;
          cam.targetX = 0;
          cam.targetY = 0;
          break;
        case "scene2_blackout":
          cam.targetScale = 1.02;
          cam.targetX = 0;
          cam.targetY = h * 0.02;
          break;
        case "scene3_number4":
          cam.targetScale = 0.90;
          cam.targetX = -w * 0.05;
          cam.targetY = -h * 0.04;
          break;
        case "scene4_blackout":
          cam.targetScale = 1.00;
          cam.targetX = 0;
          cam.targetY = 0;
          break;
        case "scene5_number3":
          cam.targetScale = 0.82;
          cam.targetX = w * 0.04;
          cam.targetY = -h * 0.06;
          break;
        case "scene6_celebration":
          cam.targetScale = 0.95;
          cam.targetX = 0;
          cam.targetY = -h * 0.03;
          break;
        case "final_reveal":
          cam.targetScale = 1.00;
          cam.targetX = 0;
          cam.targetY = -h * 0.05;
          break;
        case "emotional_ending":
          // Find the special Mammoty's brightest house to zoom in on it
          const bHouse = housesRef.current.find(h => h.isBrightest);
          if (bHouse) {
            const baseScale = Math.min(w, h) * 0.9;
            const houseSX = w / 2 + (bHouse.nx - 0.5) * baseScale;
            const houseSY = h / 2 + (bHouse.ny - 0.5) * baseScale;
            
            cam.targetScale = 3.6;
            // Align screen center directly to this house
            cam.targetX = w / 2 - houseSX * 3.6;
            cam.targetY = h / 2 - houseSY * 3.6;
          }
          break;
        case "interactive_chest":
          cam.targetScale = 1.00;
          cam.targetX = 0;
          cam.targetY = -h * 0.02;
          break;
      }

      // Smooth camera interpolation (Lerp at 60 FPS)
      cam.scale += (cam.targetScale - cam.scale) * 0.015;
      cam.x += (cam.targetX - cam.x) * 0.015;
      cam.y += (cam.targetY - cam.y) * 0.015;

      // Apply camera transformation matrices
      ctx.save();
      ctx.translate(cam.x, cam.y);
      ctx.scale(cam.scale, cam.scale);

      const baseScale = Math.min(w, h) * 0.9;

      // Helper function: Maps normalized village coordinates to screen pixels under the camera lens
      const toScreenX = (nx: number) => w / 2 + (nx - 0.5) * baseScale;
      const toScreenY = (ny: number) => h / 2 + (ny - 0.5) * baseScale;

      // 6. Background Mountains Layers (overlapping silhouette hillsides)
      const drawMountainRange = (
        heightOffsets: number[],
        baseY: number,
        fillColor: string,
        fogGrad: CanvasGradient
      ) => {
        ctx.fillStyle = fillColor;
        ctx.beginPath();
        ctx.moveTo(0 - w * 0.5, h * 1.5);
        for (let i = 0; i <= 20; i++) {
          const t = i / 20;
          const x = (t * 2.0 - 0.5) * w;
          const y = baseY - heightOffsets[i % heightOffsets.length] * baseScale;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(w * 1.5, h * 1.5);
        ctx.closePath();
        ctx.fill();

        // Overlay soft fog behind the peaks
        ctx.fillStyle = fogGrad;
        ctx.fillRect(0 - w * 0.5, baseY - 0.15 * baseScale, w * 2.0, h);
      };

      // Mountain 1 (Far peaks)
      const farMountainHeight = [0.22, 0.28, 0.20, 0.26, 0.35, 0.25, 0.18, 0.29, 0.33, 0.22, 0.26];
      const farFog = ctx.createLinearGradient(0, h * 0.25, 0, h * 0.5);
      farFog.addColorStop(0, "rgba(25, 23, 48, 0.0)");
      farFog.addColorStop(1, "rgba(9, 9, 21, 0.18)");
      drawMountainRange(farMountainHeight, h * 0.40, "#080816", farFog);

      // Mountain 2 (Medium peaks)
      const midMountainHeight = [0.12, 0.17, 0.15, 0.09, 0.18, 0.22, 0.14, 0.19, 0.16, 0.11, 0.13];
      const midFog = ctx.createLinearGradient(0, h * 0.38, 0, h * 0.65);
      midFog.addColorStop(0, "rgba(25, 23, 48, 0.0)");
      midFog.addColorStop(1, "rgba(10, 10, 24, 0.25)");
      drawMountainRange(midMountainHeight, h * 0.52, "#0a0c1b", midFog);

      // 7. Mountain Valley Winding River & Bridges
      ctx.strokeStyle = "rgba(43, 85, 137, 0.35)";
      ctx.lineWidth = 4;
      ctx.shadowBlur = 8;
      ctx.shadowColor = "rgba(63, 142, 233, 0.3)";
      ctx.beginPath();
      // River coordinates winding from top-middle down to bottom right
      ctx.moveTo(toScreenX(0.48), toScreenY(0.38));
      ctx.quadraticCurveTo(
        toScreenX(0.40), toScreenY(0.50),
        toScreenX(0.53), toScreenY(0.65)
      );
      ctx.quadraticCurveTo(
        toScreenX(0.68), toScreenY(0.80),
        toScreenX(0.55), toScreenY(0.95)
      );
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Moonlight reflections over river surfaces
      ctx.strokeStyle = "rgba(255, 253, 240, 0.3)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Stone bridge crosses
      const drawBridge = (nx: number, ny: number) => {
        const bx = toScreenX(nx);
        const by = toScreenY(ny);
        ctx.fillStyle = "#0c0a1a";
        ctx.strokeStyle = "#25213b";
        ctx.lineWidth = 2.5;
        // Draw bridge arch
        ctx.beginPath();
        ctx.arc(bx, by, 16, Math.PI, 0);
        ctx.fill();
        ctx.stroke();
        // Handrails
        ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
        ctx.beginPath();
        ctx.moveTo(bx - 20, by - 6);
        ctx.lineTo(bx + 20, by - 6);
        ctx.stroke();
      };
      drawBridge(0.44, 0.52);

      // 8. Pine trees scattered across fields
      const pineTrees = [
        { nx: 0.28, ny: 0.44 }, { nx: 0.32, ny: 0.48 }, { nx: 0.35, ny: 0.41 },
        { nx: 0.65, ny: 0.46 }, { nx: 0.69, ny: 0.41 }, { nx: 0.72, ny: 0.50 },
        { nx: 0.45, ny: 0.76 }, { nx: 0.48, ny: 0.81 }, { nx: 0.39, ny: 0.80 },
        { nx: 0.56, ny: 0.88 }, { nx: 0.61, ny: 0.90 }, { nx: 0.63, ny: 0.82 }
      ];
      ctx.fillStyle = "#05060f";
      pineTrees.forEach(tree => {
        const tx = toScreenX(tree.nx);
        const ty = toScreenY(tree.ny);
        ctx.beginPath();
        ctx.moveTo(tx, ty - 18);
        ctx.lineTo(tx - 6, ty - 2);
        ctx.lineTo(tx + 6, ty - 2);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(tx, ty - 10);
        ctx.lineTo(tx - 8, ty + 6);
        ctx.lineTo(tx + 8, ty + 6);
        ctx.closePath();
        ctx.fill();
      });

      // 9. Update & Render Houses light dynamics based on story progression
      const houses = housesRef.current;
      houses.forEach(house => {
        // Evaluate target light intensities per scene sequence rules
        switch (phaseRef.current) {
          case "opening":
            // All fully lit during landing scene
            house.targetLight = 0.85;
            break;
          case "scene1_breathing":
            // breathing like a heartbeat: pulses in unison
            const pulse = 0.45 + 0.55 * Math.sin(tNow * 0.0016 + house.pulseOffset);
            house.targetLight = pulse;
            break;
          case "scene2_blackout":
            // Instant absolute power cut
            house.targetLight = 0.0;
            break;
          case "scene3_number4":
            // Wave sweeps to form digit "4"
            if (house.isPart4) {
              // Wave sweeps from left (nx=0) to right (nx=1)
              const waveElapsed = (tNow - (phaseStartTimeRef.current + 12500)) * 0.0003;
              const threshold = Math.min(1.1, waveElapsed); // sweep range
              const waveOffset = house.nx;
              if (threshold > waveOffset) {
                house.targetLight = 0.9 + 0.1 * Math.sin(tNow * 0.002 + house.pulseOffset);
              } else {
                house.targetLight = 0.0;
              }
            } else {
              house.targetLight = 0.0;
            }
            break;
          case "scene4_blackout":
            // Slow blackout: everything fades back into sleep
            house.targetLight = 0.0;
            break;
          case "scene5_number3":
            // Wave sweeps in another direction (e.g. diagonally from top-left to bottom-right)
            if (house.isPart3) {
              const waveElapsed = (tNow - (phaseStartTimeRef.current + 21000)) * 0.00028;
              const threshold = Math.min(1.5, waveElapsed);
              const waveOffset = (house.nx + house.ny) / 2.0; // diagonal distance
              if (threshold > waveOffset) {
                // Breathing heartbeat pulse remains active
                house.targetLight = 0.95 + 0.05 * Math.sin(tNow * 0.0018 + house.pulseOffset);
              } else {
                house.targetLight = 0.0;
              }
            } else {
              house.targetLight = 0.0;
            }
            break;
          case "scene6_celebration":
            // Entire village lights up brighter than ever
            house.targetLight = 1.0;
            break;
          case "final_reveal":
            // Stays brightly lit
            house.targetLight = 1.0;
            break;
          case "emotional_ending":
            // Every light slowly fades except the Mammoty's brightest house
            if (house.isBrightest) {
              house.targetLight = 1.0;
            } else {
              // Smoothly decay to zero
              house.targetLight = Math.max(0, house.currentLight - 0.015);
            }
            break;
          case "interactive_chest":
            // Only Mammoty house remains glowing warmly
            if (house.isBrightest) {
              house.targetLight = 1.0;
            } else {
              house.targetLight = 0.0;
            }
            break;
        }

        // Apply smooth transition (lerp) from current intensity to target intensity
        if (phaseRef.current === "scene2_blackout") {
          // Instant power cut
          house.currentLight = 0.0;
        } else {
          // Normal soft transition
          house.currentLight += (house.targetLight - house.currentLight) * 0.06;
        }

        // RENDER THE HOUSE SHAPES
        const hx = toScreenX(house.nx);
        const hy = toScreenY(house.ny);
        const hSize = 8.5 * house.sizeMultiplier;

        ctx.save();
        ctx.translate(hx, hy);

        // Draw cottage base / walls
        ctx.fillStyle = `rgba(${30 - Math.floor(house.currentLight * 10)}, ${38 - Math.floor(house.currentLight * 12)}, ${56 - Math.floor(house.currentLight * 16)}, 1.0)`;
        if (house.currentLight > 0.05) {
          // Lit cottage walls
          ctx.fillStyle = `rgba(${135 + Math.floor(house.currentLight * 35)}, ${105 + Math.floor(house.currentLight * 25)}, ${90 + Math.floor(house.currentLight * 15)}, 1.0)`;
        }

        if (house.type === "church") {
          // Draw Cathedral spire shape
          ctx.beginPath();
          ctx.rect(-hSize * 0.5, -hSize * 0.5, hSize, hSize);
          ctx.rect(-hSize * 0.22, -hSize * 1.5, hSize * 0.44, hSize);
          ctx.fill();
          
          // Draw spire pyramid roof
          ctx.fillStyle = house.currentLight > 0.1 ? "#9c4033" : "#0d091a";
          ctx.beginPath();
          ctx.moveTo(0, -hSize * 2.3);
          ctx.lineTo(-hSize * 0.25, -hSize * 1.5);
          ctx.lineTo(hSize * 0.25, -hSize * 1.5);
          ctx.closePath();
          ctx.fill();

          // Small cross at top spire
          ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(0, -hSize * 2.3);
          ctx.lineTo(0, -hSize * 2.5);
          ctx.moveTo(-hSize * 0.12, -hSize * 2.45);
          ctx.lineTo(hSize * 0.12, -hSize * 2.45);
          ctx.stroke();

          // Stained glass window glow
          if (house.currentLight > 0.05) {
            ctx.shadowBlur = 12 * house.currentLight;
            ctx.shadowColor = "rgba(251, 146, 60, 0.85)";
            ctx.fillStyle = "rgba(251, 146, 60, " + house.currentLight + ")";
            ctx.beginPath();
            ctx.arc(0, -hSize * 0.8, hSize * 0.16, 0, Math.PI, true);
            ctx.lineTo(hSize * 0.16, -hSize * 0.5);
            ctx.lineTo(-hSize * 0.16, -hSize * 0.5);
            ctx.closePath();
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        } 
        else if (house.type === "lamp") {
          // Draw Street lamp post
          ctx.strokeStyle = "#110f22";
          ctx.lineWidth = 2.0;
          ctx.beginPath();
          ctx.moveTo(0, hSize * 0.8);
          ctx.lineTo(0, -hSize * 0.4);
          ctx.stroke();

          // Draw lamp sphere
          if (house.currentLight > 0.05) {
            ctx.shadowBlur = 14 * house.currentLight;
            ctx.shadowColor = "rgba(253, 224, 71, 0.95)";
            ctx.fillStyle = `rgba(253, 224, 71, ${house.currentLight})`;
            ctx.beginPath();
            ctx.arc(0, -hSize * 0.4, 2.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
          } else {
            ctx.fillStyle = "#0c0c16";
            ctx.beginPath();
            ctx.arc(0, -hSize * 0.4, 2, 0, Math.PI * 2);
            ctx.fill();
          }
        } 
        else {
          // Standard house shapes
          ctx.beginPath();
          ctx.rect(-hSize * 0.5, -hSize * 0.4, hSize, hSize * 0.8);
          ctx.fill();

          // Triangular roof
          ctx.fillStyle = house.currentLight > 0.1 ? "#aa4d3d" : "#0d091f";
          ctx.beginPath();
          ctx.moveTo(0, -hSize * 0.85);
          ctx.lineTo(-hSize * 0.65, -hSize * 0.4);
          ctx.lineTo(hSize * 0.65, -hSize * 0.4);
          ctx.closePath();
          ctx.fill();

          // Glowing windows
          if (house.currentLight > 0.05) {
            ctx.shadowBlur = 10 * house.currentLight;
            ctx.shadowColor = "rgba(251, 191, 36, 0.9)";
            ctx.fillStyle = `rgba(251, 191, 36, ${house.currentLight})`;

            // Draw window rectangles
            ctx.fillRect(-hSize * 0.28, -hSize * 0.15, hSize * 0.18, hSize * 0.18);
            ctx.fillRect(hSize * 0.1, -hSize * 0.15, hSize * 0.18, hSize * 0.18);
            
            // Brightest house door glow
            if (house.isBrightest) {
              ctx.fillStyle = `rgba(249, 115, 22, ${house.currentLight})`;
              ctx.fillRect(-hSize * 0.1, hSize * 0.1, hSize * 0.2, hSize * 0.3);
            }
            ctx.shadowBlur = 0;
          }
        }

        ctx.restore();
      });

      // 10. Fireflies floating & pulsing
      firefliesRef.current.forEach(f => {
        // Random walker noise
        f.x += f.vx;
        f.y += f.vy;
        f.vx += (Math.random() - 0.5) * 0.0001;
        f.vy += (Math.random() - 0.5) * 0.0001;
        
        // Bounce off canvas boundaries
        if (f.x < 0) f.x = 1.0;
        if (f.x > 1.0) f.x = 0;
        if (f.y < 0.3) f.y = 0.95;
        if (f.y > 1.0) f.y = 0.3;

        f.pulsePhase += f.pulseSpeed;
        const currentAlpha = Math.max(0.1, Math.min(1.0, f.alpha + Math.sin(f.pulsePhase) * 0.45));

        ctx.fillStyle = `rgba(180, 240, 60, ${currentAlpha * 0.85})`;
        ctx.shadowBlur = 8 * currentAlpha;
        ctx.shadowColor = "rgba(180, 240, 60, 0.8)";
        ctx.beginPath();
        ctx.arc(toScreenX(f.x), toScreenY(f.y), f.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // 11. Drifting Golden Sparkles particles
      sparklesRef.current.forEach(sp => {
        sp.x += sp.vx;
        sp.y += sp.vy;
        if (sp.y < -0.1) {
          sp.y = 1.1;
          sp.x = Math.random();
        }

        sp.twinklePhase += sp.twinkleSpeed;
        const currentAlpha = Math.max(0.15, Math.min(1.0, sp.alpha + Math.sin(sp.twinklePhase) * 0.35));

        ctx.fillStyle = `rgba(251, 191, 36, ${currentAlpha * 0.8})`;
        ctx.shadowBlur = 5 * currentAlpha;
        ctx.shadowColor = "rgba(251, 191, 36, 0.75)";
        ctx.beginPath();
        ctx.arc(toScreenX(sp.x), toScreenY(sp.y), sp.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // 12. Distant Tiny Fireworks in the Mountains (Scene 6)
      if (phaseRef.current === "scene6_celebration") {
        // Randomly launch new firework
        if (Math.random() < 0.035 && fireworksRef.current.length < 5) {
          const fx = 0.2 + Math.random() * 0.6;
          const fy = 0.2 + Math.random() * 0.22;
          const colors = [
            "rgba(244, 63, 94, ", // rose
            "rgba(168, 85, 247, ", // purple
            "rgba(251, 191, 36, ", // amber
            "rgba(20, 184, 166, ", // teal
            "rgba(255, 255, 255, "  // white
          ];
          const colorPrefix = colors[Math.floor(Math.random() * colors.length)];

          const particles: FireworkParticle[] = [];
          for (let pCount = 0; pCount < 50; pCount++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 0.001 + Math.random() * 0.0035;
            particles.push({
              x: fx,
              y: fy,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              size: 0.8 + Math.random() * 1.5,
              alpha: 1.0,
              color: colorPrefix,
              fadeSpeed: 0.015 + Math.random() * 0.015,
              gravity: 0.00004,
            });
          }

          fireworksRef.current.push({
            id: Date.now() + Math.random(),
            x: fx,
            y: fy,
            particles,
          });
        }
      }

      // Update & Draw Fireworks particles
      fireworksRef.current.forEach((fw, index) => {
        fw.particles.forEach(p => {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += p.gravity; // Gravitational drift downwards
          p.alpha -= p.fadeSpeed;

          if (p.alpha > 0.0) {
            ctx.fillStyle = p.color + p.alpha + ")";
            ctx.beginPath();
            ctx.arc(toScreenX(p.x), toScreenY(p.y), p.size, 0, Math.PI * 2);
            ctx.fill();
          }
        });

        // Filter out dead fireworks
        fw.particles = fw.particles.filter(p => p.alpha > 0.0);
      });
      fireworksRef.current = fireworksRef.current.filter(fw => fw.particles.length > 0);

      ctx.restore(); // Restore camera matrices

      // Request next frame
      animationFrameIdRef.current = requestAnimationFrame(animationLoop);
    };

    animationLoop();

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, []);

  // When letter is closed, spawn 180 star particles that float up
  const triggerStarExplosion = () => {
    setLetterOpened(false);
    
    // Spawn 180 particles
    const list: FloatingSparkle[] = [];
    for (let i = 0; i < 180; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.5 + Math.random() * 2.8;
      
      list.push({
        x: 0.5 + (Math.random() - 0.5) * 0.08,
        y: 0.45 + (Math.random() - 0.5) * 0.12,
        vx: Math.cos(angle) * speed * 0.002,
        vy: -0.005 - Math.random() * 0.004, // Ascending velocities
        size: 1.2 + Math.random() * 2.4,
        alpha: 1.0,
        color: i % 2 === 0 ? "rgba(255, 255, 255, 1.0)" : "rgba(251, 191, 36, 1.0)",
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.05 + Math.random() * 0.05,
      });
    }

    // Merge into sparkles list
    sparklesRef.current = [...sparklesRef.current, ...list];
    
    setTimeout(() => {
      setChestDissolved(true);
    }, 1800);
  };

  // Helper variables for timelines
  const showOpening = phase === "opening";
  const showUIReveal = phase === "final_reveal" || phase === "scene6_celebration";
  const showEmotionalEnding = phase === "emotional_ending";

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-black text-white">
      {/* Cinematic background canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full pointer-events-none" />

      {/* Floating speaker toggle */}
      <button
        onClick={toggleMusic}
        className="absolute right-6 top-6 z-50 flex items-center justify-center rounded-full border border-white/35 bg-black/45 p-3.5 text-white/90 shadow-[0_0_15px_rgba(255,255,255,0.15)] backdrop-blur-md transition-all duration-300 hover:bg-white/10 hover:scale-105 active:scale-95 group cursor-pointer"
      >
        {musicEnabled ? (
          <Volume2 className="h-6 w-6 animate-pulse text-amber-300" />
        ) : (
          <VolumeX className="h-6 w-6 text-white/70" />
        )}
      </button>

      {/* Close main scene option */}
      <button
        onClick={onClose}
        className="absolute left-6 top-6 z-50 flex items-center justify-center rounded-full border border-white/35 bg-black/45 p-3.5 text-white/90 shadow-[0_0_15px_rgba(255,255,255,0.15)] backdrop-blur-md transition-all duration-300 hover:bg-white/10 hover:scale-105 active:scale-95 cursor-pointer"
      >
        <X className="h-6 w-6" />
      </button>

      {/* Overlay: Opening Narrative Text */}
      <AnimatePresence>
        {showOpening && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="pointer-events-none absolute inset-x-8 top-[32%] z-30 flex flex-col items-center text-center select-none"
          >
            <h2 className={`${playfair.className} text-3xl font-light tracking-wide text-amber-100/95 md:text-5xl leading-relaxed max-w-2xl`}>
              Tonight...
            </h2>
            <h3 className={`${playfair.className} mt-6 text-2.5xl font-light tracking-wide text-white/90 md:text-4.5xl leading-relaxed max-w-3xl`}>
              an entire village has a surprise for someone very special... ❤️
            </h3>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay: Cinematic 3 Days To Go Titles */}
      <AnimatePresence>
        {showUIReveal && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="pointer-events-none absolute inset-x-8 bottom-[20%] z-30 flex flex-col items-center text-center select-none"
          >
            <div className="flex flex-col items-center p-8 rounded-[2.5rem] border border-white/10 bg-black/25 backdrop-blur-[4px] shadow-[0_0_50px_rgba(0,0,0,0.4)]">
              <span className="text-pink-400 text-3xl flex items-center gap-1.5 animate-pulse">
                ✨❤️
              </span>
              <h1 className={`${playfair.className} text-5xl font-black md:text-7xl tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-300 to-amber-100 drop-shadow-[0_4px_12px_rgba(251,191,36,0.3)] mt-2`}>
                3 DAYS TO GO
              </h1>
              <span className="text-pink-400 text-3xl flex items-center gap-1.5 animate-pulse mt-2">
                ❤️✨
              </span>
              
              <p className={`${caveat.className} mt-5 max-w-lg text-2.5xl font-bold leading-relaxed text-amber-200/90 md:text-3.5xl`}>
                "An entire village lit up...
                just to celebrate the countdown
                to my Mammoty's birthday. ❤️"
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay: Emotional Ending Single House Quote */}
      <AnimatePresence>
        {showEmotionalEnding && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 1.0 }}
            className="pointer-events-none absolute inset-x-8 bottom-[25%] z-30 flex flex-col items-center text-center select-none"
          >
            <p className={`${caveat.className} max-w-xl text-3xl font-bold leading-relaxed text-amber-100/95 md:text-4.5xl drop-shadow-[0_2px_15px_rgba(0,0,0,0.9)]`}>
              "No matter how many lights shine tonight...
              you'll always be the brightest one. ❤️"
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interactive Chest Secret Section */}
      <AnimatePresence>
        {phase === "interactive_chest" && !chestDissolved && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute z-40 flex flex-col items-center gap-6"
          >
            {!chestOpened ? (
              <div className="flex flex-col items-center gap-6">
                {/* Floating click instruction badge */}
                <motion.div 
                  className="rounded-full bg-gradient-to-r from-amber-400/90 to-yellow-500/95 border border-amber-300 px-6 py-2 shadow-2xl"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
                >
                  <span className={`${playfair.className} font-bold text-amber-950 text-base tracking-wide flex items-center gap-2`}>
                    🎁 Open My Little Secret
                  </span>
                </motion.div>

                {/* Animated Vintage Treasure Chest */}
                <button
                  onClick={() => setChestOpened(true)}
                  className="relative group cursor-pointer w-48 h-40 hover:scale-105 transition duration-300 focus:outline-none"
                >
                  {/* Chest body graphic */}
                  <div className="absolute inset-0 bg-gradient-to-b from-amber-800 to-amber-950 rounded-2xl border-4 border-amber-900 shadow-2xl flex flex-col justify-end p-1">
                    {/* Metal bands */}
                    <div className="absolute left-6 inset-y-0 w-3 bg-yellow-600/90 border-x border-yellow-700/50" />
                    <div className="absolute right-6 inset-y-0 w-3 bg-yellow-600/90 border-x border-yellow-700/50" />
                    {/* Keyhole */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-yellow-500 border-2 border-yellow-600 flex items-center justify-center">
                      <div className="w-2 h-4 bg-black rounded" />
                    </div>
                  </div>
                  {/* Lid graphic */}
                  <div className="absolute top-0 inset-x-0 h-14 bg-gradient-to-b from-amber-700 to-amber-800 rounded-t-2xl border-x-4 border-t-4 border-amber-900 flex items-center justify-between px-6 shadow-md transition duration-300 group-hover:-translate-y-1">
                    <div className="w-3 h-full bg-yellow-600/90 border-x border-yellow-700/50" />
                    <div className="w-3 h-full bg-yellow-600/90 border-x border-yellow-700/50" />
                  </div>
                </button>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                {!letterOpened ? (
                  <motion.div
                    key="crystal"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center gap-6"
                  >
                    {/* Glowing escape magic particles & crystal shape */}
                    <div className="relative flex items-center justify-center h-48 w-48">
                      <div className="absolute inset-0 animate-ping rounded-full bg-amber-400/25 blur-xl" />
                      <div className="absolute h-36 w-36 rounded-full bg-radial-gradient from-amber-300/40 via-yellow-500/10 to-transparent blur-md" />
                      
                      {/* Floating glowing diamond crystal */}
                      <motion.div
                        animate={{ y: [0, -12, 0], rotate: [0, 15, 0] }}
                        transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
                        onClick={() => setLetterOpened(true)}
                        className="cursor-pointer relative z-10 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-200 to-yellow-400 shadow-[0_0_35px_rgba(251,191,36,0.85)] border border-amber-100"
                      >
                        <Sparkles className="h-10 w-10 text-amber-950 animate-pulse" />
                      </motion.div>
                    </div>

                    <button
                      onClick={() => setLetterOpened(true)}
                      className="rounded-full bg-white/20 px-8 py-3.5 border border-white/35 backdrop-blur-md hover:bg-white/35 transition-all text-white font-bold"
                    >
                      ✨ Read the secret note ✨
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="handwritten-letter"
                    initial={{ opacity: 0, scale: 0.9, y: 40 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.85, y: -40 }}
                    transition={{ type: "spring", stiffness: 100, damping: 15 }}
                    className="relative max-w-md w-[92vw] rounded-[2rem] border-[3px] border-amber-900/60 bg-[#faf6ea] p-8 shadow-[0_25px_70px_rgba(0,0,0,0.8)] backdrop-blur-sm text-amber-950 flex flex-col gap-6"
                  >
                    {/* Retro seal logo */}
                    <div className="absolute top-4 right-4 text-xs font-bold text-amber-800/40 select-none">
                      🔒 CONFIDENTIAL
                    </div>

                    {/* Letter cursive content */}
                    <div className="overflow-y-auto max-h-[60vh] pr-2">
                      <p className={`${caveat.className} whitespace-pre-line text-2.5xl md:text-3xl font-bold leading-relaxed`}>
                        {SECRET_MESSAGE}
                      </p>
                    </div>

                    <button
                      onClick={triggerStarExplosion}
                      className="relative overflow-hidden w-full rounded-2xl bg-gradient-to-r from-amber-800 to-amber-950 py-3.5 shadow-lg border border-amber-900 text-white font-bold tracking-wide transition hover:scale-[1.02] active:scale-95 cursor-pointer"
                    >
                      Close my secret ❤️
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dissolved End Screen: Option to Replay */}
      {chestDissolved && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute z-40 flex flex-col items-center gap-4 text-center p-6 bg-black/60 backdrop-blur-md rounded-3xl border border-white/10 shadow-2xl"
        >
          <p className={`${caveat.className} text-4xl font-bold text-amber-200`}>
            Thank you for unlocking Day 3... 🏰✨
          </p>
          <button
            onClick={() => {
              setTriggerReplay(prev => prev + 1);
            }}
            className="flex items-center gap-2 rounded-full border border-amber-400 bg-amber-400/20 px-8 py-3.5 text-amber-300 font-bold transition hover:bg-amber-400 hover:text-black cursor-pointer"
          >
            <RefreshCw size={18} />
            <span>Replay Experience</span>
          </button>
        </motion.div>
      )}
    </div>
  );
}
