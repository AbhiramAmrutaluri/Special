"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";
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

// Sound Synthesizer using Web Audio API
class CinematicDayOneSynth {
  private ctx: AudioContext | null = null;
  private activeNodes: AudioNode[] = [];
  private isMuted: boolean = false;
  private chordTimer: NodeJS.Timeout | null = null;
  private birdTimer: NodeJS.Timeout | null = null;
  private initialized: boolean = false;

  init() {
    if (this.initialized) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      this.ctx = new AudioContextClass();
      this.initialized = true;
      this.startAmbience();
      this.startPianoProgression();
      this.scheduleBirdChirps();
    } catch (e) {
      console.warn("AudioContext initialization failed:", e);
    }
  }

  setMute(mute: boolean) {
    this.isMuted = mute;
    if (mute) {
      this.stop();
    } else {
      if (this.ctx?.state === "suspended") {
        this.ctx.resume();
      }
      this.startAmbience();
      this.startPianoProgression();
      this.scheduleBirdChirps();
    }
  }

  private startAmbience() {
    if (!this.ctx || this.isMuted) return;

    // 1. Synthesize Wind (Filtered Pink/Brownish Noise)
    try {
      const bufferSize = 2 * this.ctx.sampleRate;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const windSource = this.ctx.createBufferSource();
      windSource.buffer = noiseBuffer;
      windSource.loop = true;

      const windFilter = this.ctx.createBiquadFilter();
      windFilter.type = "bandpass";
      windFilter.frequency.value = 300;
      windFilter.Q.value = 1.0;

      const windGain = this.ctx.createGain();
      windGain.gain.value = 0.008; // extremely quiet background

      // Slow wind modulator
      const windModulator = this.ctx.createOscillator();
      const windModulatorGain = this.ctx.createGain();
      windModulator.type = "sine";
      windModulator.frequency.value = 0.08; // 12-second cycle
      windModulatorGain.gain.value = 120; // modulate filter cutoff by 120Hz

      windModulator.connect(windModulatorGain);
      windModulatorGain.connect(windFilter.frequency);
      windSource.connect(windFilter);
      windFilter.connect(windGain);
      windGain.connect(this.ctx.destination);

      windModulator.start();
      windSource.start();

      this.activeNodes.push(windModulator, windSource);
    } catch (e) {
      console.warn("Wind synthesis failed:", e);
    }

    // 2. Synthesize River Flowing (Low Rumble Filtered White Noise)
    try {
      const bufferSize = 2 * this.ctx.sampleRate;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const riverSource = this.ctx.createBufferSource();
      riverSource.buffer = noiseBuffer;
      riverSource.loop = true;

      const riverFilter = this.ctx.createBiquadFilter();
      riverFilter.type = "lowpass";
      riverFilter.frequency.value = 120; // low frequency river rumble
      riverFilter.Q.value = 0.7;

      const riverGain = this.ctx.createGain();
      riverGain.gain.value = 0.012;

      riverSource.connect(riverFilter);
      riverFilter.connect(riverGain);
      riverGain.connect(this.ctx.destination);

      riverSource.start();
      this.activeNodes.push(riverSource);
    } catch (e) {
      console.warn("River synthesis failed:", e);
    }
  }

  private startPianoProgression() {
    if (!this.ctx || this.isMuted) return;

    // Cinematic chord arpeggio notes (Gmaj9, Dsus4, Em9, Cmaj9)
    const chords = [
      [98.00, 146.83, 196.00, 246.94, 293.66, 369.99, 440.00], // Gmaj9
      [73.42, 110.00, 146.83, 196.00, 220.00, 293.66, 440.00], // Dsus4/D
      [82.41, 123.47, 164.81, 196.00, 246.94, 293.66, 369.99], // Em9
      [65.41, 130.81, 196.00, 246.94, 261.63, 329.63, 392.00]  // Cmaj9
    ];

    let currentChord = 0;

    const playChord = () => {
      if (!this.ctx || this.isMuted) return;
      const notes = chords[currentChord];
      const now = this.ctx.currentTime;
      const chordDuration = 9.0;

      notes.forEach((freq, idx) => {
        // Stagger note starts to sound like a natural gentle strum
        const delay = idx * 0.18 + Math.random() * 0.05;
        const volume = idx === 0 ? 0.28 : 0.12 - idx * 0.01;
        this.playPianoTone(freq, now + delay, chordDuration - delay, Math.max(0.02, volume));
      });

      currentChord = (currentChord + 1) % chords.length;
      this.chordTimer = setTimeout(playChord, 8000);
    };

    playChord();
  }

  private playPianoTone(freq: number, startTime: number, duration: number, maxGain: number) {
    if (!this.ctx || this.isMuted) return;

    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, startTime);

    // Subtle detune to mimic acoustic piano
    osc.detune.setValueAtTime((Math.random() - 0.5) * 6, startTime);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(800, startTime);
    filter.frequency.exponentialRampToValueAtTime(300, startTime + duration * 0.8);

    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(maxGain * 0.12, startTime + 0.08); // soft attack
    gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration); // long decay

    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration);

    this.activeNodes.push(osc);
  }

  private scheduleBirdChirps() {
    if (this.isMuted || !this.ctx) return;

    const playChirp = () => {
      if (this.isMuted || !this.ctx) return;
      const now = this.ctx.currentTime;

      // Create a sequence of 2-4 tiny high frequency chirps
      const count = 2 + Math.floor(Math.random() * 3);
      for (let i = 0; i < count; i++) {
        const tStart = now + i * 0.15;
        const duration = 0.08;
        const startFreq = 2200 + Math.random() * 800;
        const endFreq = 3800 + Math.random() * 600;

        const osc = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(startFreq, tStart);
        osc.frequency.exponentialRampToValueAtTime(endFreq, tStart + duration);

        gainNode.gain.setValueAtTime(0, tStart);
        gainNode.gain.linearRampToValueAtTime(0.005, tStart + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, tStart + duration);

        osc.connect(gainNode);
        gainNode.connect(this.ctx.destination);

        osc.start(tStart);
        osc.stop(tStart + duration + 0.05);
      }

      // Schedule next chirp session in 4 to 8 seconds
      this.birdTimer = setTimeout(playChirp, 4000 + Math.random() * 4000);
    };

    this.birdTimer = setTimeout(playChirp, 3000);
  }

  private stop() {
    this.activeNodes.forEach(node => {
      try {
        (node as any).stop?.();
      } catch (e) {}
    });
    this.activeNodes = [];
    if (this.chordTimer) {
      clearTimeout(this.chordTimer);
      this.chordTimer = null;
    }
    if (this.birdTimer) {
      clearTimeout(this.birdTimer);
      this.birdTimer = null;
    }
  }

  destroy() {
    this.stop();
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
    this.initialized = false;
  }
}

// Boid Bird Particle Interface
interface Bird {
  x: number;
  y: number;
  vx: number;
  vy: number;
  wingPhase: number;
  wingSpeed: number;
  size: number;
}

// Butterfly Particle Interface
interface Butterfly {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  wingPhase: number;
  wingSpeed: number;
  color: string;
  size: number;
  speed: number;
}

// Floating Particle Interface
interface Particle {
  x: number;
  y: number;
  size: number;
  alpha: number;
  speedY: number;
  speedX: number;
  twinkleSpeed: number;
  twinklePhase: number;
}

// Cherry Blossom Petal Particle Interface
interface BlossomPetal {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  angle: number;
  spinSpeed: number;
  wobbleSpeed: number;
  wobblePhase: number;
}

export default function BirthdayOneReveal({ onClose }: { onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const synthRef = useRef<CinematicDayOneSynth | null>(null);
  const [phase, setPhase] = useState<
    | "opening"
    | "sunrise"
    | "nature_wakes"
    | "bird_formation"
    | "golden_glow"
    | "gift_reveal"
    | "final_reveal"
    | "petal_fall"
    | "ending_ascent"
    | "ended"
  >("opening");

  const [audioHintVisible, setAudioHintVisible] = useState(true);
  const phaseRef = useRef<string>("opening");

  // Keep ref updated to access inside high performance animation loop
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  // Timers to clean up
  const timersRef = useRef<NodeJS.Timeout[]>([]);

  // Animation timeline configuration (total duration ~65s)
  useEffect(() => {
    // Initial audio synth instance
    synthRef.current = new CinematicDayOneSynth();

    const addTimer = (fn: () => void, delay: number) => {
      const t = setTimeout(fn, delay);
      timersRef.current.push(t);
    };

    // Transition Timeline
    addTimer(() => setPhase("sunrise"), 6000);        // 6s
    addTimer(() => setPhase("nature_wakes"), 13000);  // 13s
    addTimer(() => setPhase("bird_formation"), 20000);// 20s
    addTimer(() => setPhase("golden_glow"), 28000);    // 28s
    addTimer(() => setPhase("gift_reveal"), 34000);   // 34s
    addTimer(() => setPhase("final_reveal"), 44000);  // 44s
    addTimer(() => setPhase("petal_fall"), 52000);    // 52s
    addTimer(() => setPhase("ending_ascent"), 60000); // 60s
    addTimer(() => setPhase("ended"), 65000);         // 65s

    return () => {
      timersRef.current.forEach(t => clearTimeout(t));
      if (synthRef.current) {
        synthRef.current.destroy();
      }
    };
  }, []);

  // Set up interaction listener to unlock Audio Context
  const handleInteraction = () => {
    if (synthRef.current) {
      synthRef.current.init();
    }
    setAudioHintVisible(false);
  };

  // Generate target coordinates for number "1" (Scene 3)
  const targetPoints1 = useMemo(() => {
    const pts: { x: number; y: number }[] = [];
    const count = 150;
    const stemCount = Math.floor(count * 0.55); // 82
    const hookCount = Math.floor(count * 0.20); // 30
    const baseCount = count - stemCount - hookCount; // 38

    // Stem: x=0.5, y from 0.32 to 0.63
    for (let i = 0; i < stemCount; i++) {
      const t = i / (stemCount - 1 || 1);
      pts.push({ x: 0.5, y: 0.32 + t * 0.31 });
    }

    // Hook: Curving from top of stem (x=0.5, y=0.32) down and left (x=0.46, y=0.38)
    for (let i = 0; i < hookCount; i++) {
      const t = i / (hookCount - 1 || 1);
      const px = 0.5 - t * 0.04;
      const py = 0.32 + t * 0.06;
      pts.push({ x: px, y: py });
    }

    // Base: flat line at bottom (y=0.63, x from 0.44 to 0.56)
    for (let i = 0; i < baseCount; i++) {
      const t = i / (baseCount - 1 || 1);
      pts.push({ x: 0.44 + t * 0.12, y: 0.63 });
    }
    return pts;
  }, []);

  // Main Canvas Scene Setup and Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Initial camera tracking state
    const camera = { x: 0.5, y: 0.15, zoom: 1.4 };

    // Set up particles
    // 1. Birds flock
    const birds: Bird[] = Array.from({ length: 150 }, (_, i) => ({
      x: -100 - Math.random() * 500, // start far left
      y: h * 0.2 + Math.random() * h * 0.3,
      vx: 2.0 + Math.random() * 1.5,
      vy: (Math.random() - 0.4) * 0.8,
      wingPhase: Math.random() * Math.PI * 2,
      wingSpeed: 0.15 + Math.random() * 0.1,
      size: 4 + Math.random() * 3,
    }));

    // 2. Butterflies
    const butterflyColors = ["rgba(251, 146, 60, 0.8)", "rgba(244, 114, 182, 0.8)", "rgba(192, 132, 252, 0.8)", "rgba(96, 165, 250, 0.8)"];
    const butterflies: Butterfly[] = Array.from({ length: 12 }, () => ({
      x: Math.random() * w,
      y: h * 0.7 + Math.random() * h * 0.2,
      targetX: Math.random() * w,
      targetY: h * 0.65 + Math.random() * h * 0.25,
      wingPhase: Math.random() * Math.PI * 2,
      wingSpeed: 0.2 + Math.random() * 0.15,
      color: butterflyColors[Math.floor(Math.random() * butterflyColors.length)],
      size: 2.5 + Math.random() * 2,
      speed: 0.5 + Math.random() * 0.8,
    }));

    // 3. Golden particles
    const goldenParticles: Particle[] = Array.from({ length: 60 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      size: 1.0 + Math.random() * 2.5,
      alpha: 0.1 + Math.random() * 0.6,
      speedY: -0.2 - Math.random() * 0.5,
      speedX: (Math.random() - 0.5) * 0.4,
      twinkleSpeed: 0.02 + Math.random() * 0.03,
      twinklePhase: Math.random() * Math.PI * 2,
    }));

    // 4. Cherry Blossom Petals
    const cherryPetals: BlossomPetal[] = Array.from({ length: 45 }, () => ({
      x: Math.random() * w * 1.2 - w * 0.1,
      y: -Math.random() * h,
      size: 3 + Math.random() * 4,
      speedY: 0.6 + Math.random() * 1.0,
      speedX: 0.4 + Math.random() * 0.8,
      angle: Math.random() * Math.PI * 2,
      spinSpeed: 0.01 + Math.random() * 0.02,
      wobbleSpeed: 0.02 + Math.random() * 0.03,
      wobblePhase: Math.random() * Math.PI * 2,
    }));

    // 5. Ground flowers list (fixed positions in coordinates, we pre-generate so they don't jump)
    const flowers = Array.from({ length: 280 }, () => {
      const fx = Math.random();
      const fy = 0.65 + Math.random() * 0.35; // flower field y coordinates
      const colorType = Math.random();
      let color = "rgba(236, 72, 153, 0.75)"; // pink/rose
      if (colorType < 0.25) color = "rgba(167, 139, 250, 0.75)"; // purple
      else if (colorType < 0.5) color = "rgba(251, 191, 36, 0.75)"; // yellow
      else if (colorType < 0.7) color = "rgba(244, 63, 94, 0.85)";  // red
      return {
        x: fx,
        y: fy,
        size: 3.5 + Math.random() * 5.0,
        height: 12 + Math.random() * 16,
        color,
        phase: Math.random() * Math.PI * 2,
        swaySpeed: 0.01 + Math.random() * 0.02,
        dewSparkle: Math.random() > 0.6,
        dewPhase: Math.random() * Math.PI * 2
      };
    });

    // 6. Mountain range peaks (fixed ratios to screen width/height)
    const backPeaks = [
      { x: 0.0, y: 0.44 },
      { x: 0.18, y: 0.32 },
      { x: 0.35, y: 0.42 },
      { x: 0.52, y: 0.26 },
      { x: 0.70, y: 0.38 },
      { x: 0.85, y: 0.29 },
      { x: 1.0, y: 0.45 }
    ];
    const midPeaks = [
      { x: 0.0, y: 0.52 },
      { x: 0.12, y: 0.45 },
      { x: 0.28, y: 0.49 },
      { x: 0.45, y: 0.38 },
      { x: 0.62, y: 0.47 },
      { x: 0.78, y: 0.41 },
      { x: 0.90, y: 0.46 },
      { x: 1.0, y: 0.54 }
    ];

    // Single Falling Petal coordinates (Scene 8)
    const fallingPetal = {
      x: 0.5,
      y: 0.1,
      vx: 0.0005,
      vy: 0.004,
      angle: 0,
      spinSpeed: 0.015,
      wobblePhase: 0,
      wobbleSpeed: 0.04,
      landed: false,
      rippleRadius: 0,
      rippleAlpha: 0,
    };

    // Sunlight Handwriting offsets
    let lineDashOffset = 1000;
    let sparks: { x: number; y: number; vx: number; vy: number; size: number; alpha: number }[] = [];

    // General counters
    let time = 0;
    let startTime = Date.now();
    let localPhaseStartTime = Date.now();
    let currentLocalPhase = "opening";

    // Animation loop using requestAnimationFrame
    let animationFrameId: number;

    const renderLoop = () => {
      time += 0.01;
      const tNow = Date.now();

      // Detect phase transition locally for timings
      const activePhase = phaseRef.current;
      if (activePhase !== currentLocalPhase) {
        currentLocalPhase = activePhase;
        localPhaseStartTime = tNow;
      }

      const elapsedInPhase = tNow - localPhaseStartTime;

      // 1. CLEAR CANVAS
      ctx.clearRect(0, 0, w, h);

      // 2. INTERPOLATE CAMERA VALUES (Drone movements)
      let targetX = 0.5;
      let targetY = 0.15;
      let targetZoom = 1.4;

      if (activePhase === "opening") {
        targetX = 0.5;
        targetY = 0.18;
        targetZoom = 1.45;
      } else if (activePhase === "sunrise") {
        targetX = 0.5;
        targetY = 0.14;
        targetZoom = 1.35;
      } else if (activePhase === "nature_wakes") {
        // descend slowly
        targetX = 0.52;
        targetY = 0.38;
        targetZoom = 1.15;
      } else if (activePhase === "bird_formation") {
        // slide right horizontally
        targetX = 0.55;
        targetY = 0.35;
        targetZoom = 1.05;
      } else if (activePhase === "golden_glow") {
        // center on sun
        targetX = 0.5;
        targetY = 0.3;
        targetZoom = 1.1;
      } else if (activePhase === "gift_reveal") {
        // pan down to flower field
        targetX = 0.5;
        targetY = 0.65;
        targetZoom = 1.25;
      } else if (activePhase === "final_reveal") {
        // keep sun and rose visible, slight pull back
        targetX = 0.5;
        targetY = 0.45;
        targetZoom = 1.15;
      } else if (activePhase === "petal_fall") {
        // lock camera onto falling petal
        if (!fallingPetal.landed) {
          targetX = fallingPetal.x;
          targetY = fallingPetal.y;
          targetZoom = 1.6;
        } else {
          targetX = 0.5;
          targetY = 0.72;
          targetZoom = 1.5;
        }
      } else if (activePhase === "ending_ascent" || activePhase === "ended") {
        // ascend high, zoom out
        targetX = 0.5;
        targetY = -0.15;
        targetZoom = 0.75;
      }

      // Smooth camera interpolation
      camera.x += (targetX - camera.x) * 0.015;
      camera.y += (targetY - camera.y) * 0.015;
      camera.zoom += (targetZoom - camera.zoom) * 0.015;

      // Coordinate translators mapping world coords to screen coords
      const toScreenX = (rx: number) => {
        return w / 2 + (rx - camera.x) * w * camera.zoom;
      };

      const toScreenY = (ry: number) => {
        return h / 2 + (ry - camera.y) * h * camera.zoom;
      };

      // 3. DRAW SKY GRADIENT
      // Starts dark/night, becomes warm pink/orange, then golden sunrise
      let skyGradient = ctx.createLinearGradient(0, 0, 0, h);
      let sunIntensity = 0; // 0 to 1

      if (activePhase === "opening") {
        skyGradient.addColorStop(0, "#090918");
        skyGradient.addColorStop(0.5, "#0b0c1b");
        skyGradient.addColorStop(1, "#11142a");
        sunIntensity = 0;
      } else if (activePhase === "sunrise") {
        const p = Math.min(1.0, elapsedInPhase / 7000);
        // interpolate colors
        skyGradient.addColorStop(0, blendColors("#090918", "#121a3a", p));
        skyGradient.addColorStop(0.5, blendColors("#0b0c1b", "#36214c", p));
        skyGradient.addColorStop(1, blendColors("#11142a", "#63395c", p));
        sunIntensity = p * 0.45;
      } else if (activePhase === "nature_wakes" || activePhase === "bird_formation") {
        const p = activePhase === "nature_wakes" 
          ? 0.45 + (elapsedInPhase / 7000) * 0.35 
          : 0.8;
        skyGradient.addColorStop(0, blendColors("#121a3a", "#1b3564", p));
        skyGradient.addColorStop(0.4, blendColors("#36214c", "#f37a70", p));
        skyGradient.addColorStop(0.7, blendColors("#63395c", "#f7ac7d", p));
        skyGradient.addColorStop(1, blendColors("#11142a", "#fde089", p));
        sunIntensity = p;
      } else {
        // bright golden morning sky
        skyGradient.addColorStop(0, "#2c467a");
        skyGradient.addColorStop(0.35, "#f68571");
        skyGradient.addColorStop(0.65, "#fdb884");
        skyGradient.addColorStop(1, "#fef2c0");
        sunIntensity = 1.0;
      }

      ctx.fillStyle = skyGradient;
      ctx.fillRect(0, 0, w, h);

      // Apply blur to everything behind the rose petal in Phase 8 (depth of field)
      const needsDOFBlur = activePhase === "petal_fall" && !fallingPetal.landed;
      if (needsDOFBlur) {
        ctx.save();
        ctx.filter = "blur(4px)";
      }

      // 4. DRAW RISING SUN
      if (sunIntensity > 0) {
        // Sun position in world: (0.5, 0.42)
        const sunWorldX = 0.5;
        const sunWorldY = 0.42 - sunIntensity * 0.12; // rise up

        const sx = toScreenX(sunWorldX);
        const sy = toScreenY(sunWorldY);
        const radius = Math.max(10, w * 0.09 * sunIntensity * camera.zoom);

        // Core sun glow
        let sunGlow = ctx.createRadialGradient(sx, sy, 2, sx, sy, radius * 3.5);
        sunGlow.addColorStop(0, "rgba(255, 255, 255, 1.0)");
        sunGlow.addColorStop(0.12, "rgba(254, 240, 138, 0.95)");
        sunGlow.addColorStop(0.35, "rgba(249, 115, 22, 0.45)");
        sunGlow.addColorStop(0.6, "rgba(239, 68, 68, 0.15)");
        sunGlow.addColorStop(1, "rgba(239, 68, 68, 0)");

        ctx.fillStyle = sunGlow;
        ctx.beginPath();
        ctx.arc(sx, sy, radius * 3.5, 0, Math.PI * 2);
        ctx.fill();

        // 5. VOLUMETRIC SUNLIGHT RAYS
        if (sunIntensity > 0.4) {
          ctx.save();
          ctx.globalCompositeOperation = "screen";
          const numRays = 18;
          const rayIntensity = (sunIntensity - 0.4) * 2.5 * 0.04;
          for (let i = 0; i < numRays; i++) {
            const angle = (i * Math.PI * 2) / numRays + time * 0.02;
            const rWidth = 0.08 + Math.sin(time * 0.5 + i) * 0.015;
            ctx.beginPath();
            ctx.moveTo(sx, sy);
            ctx.lineTo(sx + Math.cos(angle - rWidth) * w * 1.5, sy + Math.sin(angle - rWidth) * w * 1.5);
            ctx.lineTo(sx + Math.cos(angle + rWidth) * w * 1.5, sy + Math.sin(angle + rWidth) * w * 1.5);
            ctx.closePath();
            ctx.fillStyle = `rgba(254, 240, 138, ${rayIntensity})`;
            ctx.fill();
          }
          ctx.restore();
        }
      }

      // 6. DRAW DISTANT MOUNTAINS
      // Parallax scroll factor: 0.15
      ctx.save();
      const backParallaxX = (camera.x - 0.5) * w * camera.zoom * 0.15;
      const backParallaxY = (camera.y - 0.15) * h * camera.zoom * 0.15;

      ctx.beginPath();
      // start bottom left
      ctx.moveTo(0, h);
      backPeaks.forEach((p, idx) => {
        const sx = p.x * w - backParallaxX;
        const sy = p.y * h * 0.95 - backParallaxY + (1 - camera.zoom) * h * 0.25;
        if (idx === 0) ctx.lineTo(sx, sy);
        else ctx.lineTo(sx, sy);
      });
      ctx.lineTo(w, h);
      ctx.closePath();

      // mountain colors
      let backMountainGlow = ctx.createLinearGradient(0, h * 0.2, 0, h);
      backMountainGlow.addColorStop(0, blendColors("#060812", "#60345d", Math.min(1.0, sunIntensity * 1.2)));
      backMountainGlow.addColorStop(1, blendColors("#101222", "#ef7c6d", Math.min(1.0, sunIntensity * 1.2)));
      ctx.fillStyle = backMountainGlow;
      ctx.fill();

      // Orange glow stroke on peaks catching the sun
      if (sunIntensity > 0.15) {
        ctx.strokeStyle = `rgba(251, 146, 60, ${(sunIntensity - 0.15) * 0.85})`;
        ctx.lineWidth = 2.0;
        ctx.shadowBlur = 10;
        ctx.shadowColor = "rgba(251, 146, 60, 0.7)";
        ctx.beginPath();
        backPeaks.forEach((p, idx) => {
          const sx = p.x * w - backParallaxX;
          const sy = p.y * h * 0.95 - backParallaxY + (1 - camera.zoom) * h * 0.25;
          if (idx === 0) ctx.moveTo(sx, sy);
          else ctx.lineTo(sx, sy);
        });
        ctx.stroke();
        ctx.shadowBlur = 0; // reset
      }
      ctx.restore();

      // 7. DRAW MORNING MIST (under mid-ground mountains)
      if (sunIntensity < 0.8) {
        const mistOpacity = Math.max(0, 0.8 - (activePhase === "nature_wakes" ? (elapsedInPhase / 7000) * 0.8 : sunIntensity * 0.9));
        ctx.save();
        ctx.globalAlpha = mistOpacity;
        let mistGradient = ctx.createLinearGradient(0, h * 0.35, 0, h * 0.65);
        mistGradient.addColorStop(0, "rgba(255, 255, 255, 0)");
        mistGradient.addColorStop(0.5, blendColors("rgba(240, 240, 255, 0.4)", "rgba(253, 186, 116, 0.45)", Math.min(1.0, sunIntensity * 1.2)));
        mistGradient.addColorStop(1, "rgba(255, 255, 255, 0)");
        ctx.fillStyle = mistGradient;
        ctx.fillRect(0, h * 0.35, w, h * 0.3);
        ctx.restore();
      }

      // 8. DRAW MID-GROUND MOUNTAINS
      // Parallax scroll factor: 0.4
      ctx.save();
      const midParallaxX = (camera.x - 0.5) * w * camera.zoom * 0.4;
      const midParallaxY = (camera.y - 0.15) * h * camera.zoom * 0.4;

      ctx.beginPath();
      ctx.moveTo(0, h);
      midPeaks.forEach((p, idx) => {
        const sx = p.x * w - midParallaxX;
        const sy = p.y * h - midParallaxY + (1 - camera.zoom) * h * 0.15;
        if (idx === 0) ctx.lineTo(sx, sy);
        else ctx.lineTo(sx, sy);
      });
      ctx.lineTo(w, h);
      ctx.closePath();

      let midMountainGlow = ctx.createLinearGradient(0, h * 0.35, 0, h);
      midMountainGlow.addColorStop(0, blendColors("#03040c", "#41214c", Math.min(1.0, sunIntensity * 1.2)));
      midMountainGlow.addColorStop(1, blendColors("#0c0d1b", "#d97463", Math.min(1.0, sunIntensity * 1.2)));
      ctx.fillStyle = midMountainGlow;
      ctx.fill();

      if (sunIntensity > 0.25) {
        ctx.strokeStyle = `rgba(254, 215, 170, ${(sunIntensity - 0.25) * 0.95})`;
        ctx.lineWidth = 1.8;
        ctx.shadowBlur = 8;
        ctx.shadowColor = "rgba(254, 215, 170, 0.6)";
        ctx.beginPath();
        midPeaks.forEach((p, idx) => {
          const sx = p.x * w - midParallaxX;
          const sy = p.y * h - midParallaxY + (1 - camera.zoom) * h * 0.15;
          if (idx === 0) ctx.moveTo(sx, sy);
          else ctx.lineTo(sx, sy);
        });
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
      ctx.restore();

      // 9. DRAW CRYSTAL-CLEAR RIVER
      // Flow coordinates in world: wind winding path down
      ctx.save();
      const riverGrad = ctx.createLinearGradient(0, toScreenY(0.48), 0, toScreenY(1.0));
      riverGrad.addColorStop(0, blendColors("#0b1424", "#1e3a6c", Math.min(1.0, sunIntensity)));
      riverGrad.addColorStop(0.5, blendColors("#162842", "#287b8f", Math.min(1.0, sunIntensity)));
      riverGrad.addColorStop(1, blendColors("#213f5c", "#38bdf8", Math.min(1.0, sunIntensity)));

      ctx.fillStyle = riverGrad;

      // Draw winding river polygon
      ctx.beginPath();
      // Left side path
      ctx.moveTo(toScreenX(0.48), toScreenY(0.47));
      ctx.quadraticCurveTo(toScreenX(0.47), toScreenY(0.55), toScreenX(0.43), toScreenY(0.62));
      ctx.quadraticCurveTo(toScreenX(0.38), toScreenY(0.70), toScreenX(0.31), toScreenY(0.78));
      ctx.quadraticCurveTo(toScreenX(0.20), toScreenY(0.88), toScreenX(0.08), toScreenY(1.05));
      // bottom edge
      ctx.lineTo(toScreenX(0.38), toScreenY(1.05));
      // Right side path winding back up
      ctx.quadraticCurveTo(toScreenX(0.42), toScreenY(0.88), toScreenX(0.48), toScreenY(0.78));
      ctx.quadraticCurveTo(toScreenX(0.51), toScreenY(0.70), toScreenX(0.51), toScreenY(0.62));
      ctx.quadraticCurveTo(toScreenX(0.51), toScreenY(0.55), toScreenX(0.51), toScreenY(0.47));
      ctx.closePath();
      ctx.fill();

      // Golden reflection path along the river
      if (sunIntensity > 0.3) {
        ctx.save();
        ctx.globalCompositeOperation = "screen";
        let reflectGrad = ctx.createLinearGradient(toScreenX(0.3), 0, toScreenX(0.65), 0);
        reflectGrad.addColorStop(0, "rgba(251, 146, 60, 0)");
        reflectGrad.addColorStop(0.5, `rgba(253, 224, 71, ${(sunIntensity - 0.3) * 0.42})`);
        reflectGrad.addColorStop(1, "rgba(251, 146, 60, 0)");
        ctx.fillStyle = reflectGrad;
        ctx.beginPath();
        ctx.moveTo(toScreenX(0.485), toScreenY(0.47));
        ctx.quadraticCurveTo(toScreenX(0.48), toScreenY(0.55), toScreenX(0.455), toScreenY(0.62));
        ctx.quadraticCurveTo(toScreenX(0.435), toScreenY(0.70), toScreenX(0.385), toScreenY(0.78));
        ctx.quadraticCurveTo(toScreenX(0.295), toScreenY(0.88), toScreenX(0.21), toScreenY(1.05));
        ctx.lineTo(toScreenX(0.25), toScreenY(1.05));
        ctx.quadraticCurveTo(toScreenX(0.325), toScreenY(0.88), toScreenX(0.405), toScreenY(0.78));
        ctx.quadraticCurveTo(toScreenX(0.455), toScreenY(0.70), toScreenX(0.48), toScreenY(0.62));
        ctx.quadraticCurveTo(toScreenX(0.50), toScreenY(0.55), toScreenX(0.505), toScreenY(0.47));
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

      // Animated Water ripples
      ctx.strokeStyle = "rgba(255, 255, 255, 0.16)";
      ctx.lineWidth = 1.0;
      for (let i = 0; i < 6; i++) {
        const ry = 0.5 + i * 0.08 + (time * 0.015 % 0.08);
        const rx = 0.5 - (ry - 0.5) * 0.5;
        const sizeX = (ry - 0.4) * 80;
        ctx.beginPath();
        ctx.ellipse(toScreenX(rx), toScreenY(ry), sizeX, 1.8, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();

      // 10. DRAW WOODEN BRIDGE
      ctx.save();
      // Wooden bridge coords in world: crossings at x=0.46, y=0.68
      const bx = toScreenX(0.465);
      const by = toScreenY(0.68);
      const bW = w * 0.08 * camera.zoom;
      const bH = 12 * camera.zoom;

      // Draw Bridge Arch
      ctx.fillStyle = blendColors("#180a04", "#542c16", Math.min(1.0, sunIntensity));
      ctx.beginPath();
      ctx.moveTo(bx - bW / 2, by + bH);
      ctx.quadraticCurveTo(bx, by - bH, bx + bW / 2, by + bH);
      ctx.lineTo(bx + bW / 2, by + bH * 1.8);
      ctx.quadraticCurveTo(bx, by, bx - bW / 2, by + bH * 1.8);
      ctx.closePath();
      ctx.fill();

      // Planks detail
      ctx.strokeStyle = blendColors("#0b0402", "#2d160b", Math.min(1.0, sunIntensity));
      ctx.lineWidth = 1.5 * camera.zoom;
      const planksCount = 9;
      for (let i = 0; i <= planksCount; i++) {
        const ratio = i / planksCount;
        const px = bx - bW / 2 + ratio * bW;
        // quadratic arch curve y value
        const py = by + bH - Math.sin(ratio * Math.PI) * bH * 1.5;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px, py + bH * 0.8);
        ctx.stroke();
      }

      // Handrails
      ctx.strokeStyle = blendColors("#220d04", "#6e3f22", Math.min(1.0, sunIntensity));
      ctx.lineWidth = 2.5 * camera.zoom;
      ctx.beginPath();
      ctx.moveTo(bx - bW / 2, by - bH * 0.2);
      ctx.quadraticCurveTo(bx, by - bH * 1.8, bx + bW / 2, by - bH * 0.2);
      ctx.stroke();

      // Rail posts
      ctx.lineWidth = 2.0 * camera.zoom;
      for (let i = 0; i <= 4; i++) {
        const ratio = i / 4;
        const px = bx - bW / 2 + ratio * bW;
        const py = by + bH - Math.sin(ratio * Math.PI) * bH * 1.5;
        const postTopY = by - bH * 0.2 - Math.sin(ratio * Math.PI) * bH * 1.1;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px, postTopY);
        ctx.stroke();
      }
      ctx.restore();

      // 11. DRAW VALLEYS & FOREGROUND HILLS
      // Ground fills
      ctx.save();
      let groundGrad = ctx.createLinearGradient(0, toScreenY(0.65), 0, toScreenY(1.0));
      groundGrad.addColorStop(0, blendColors("#060e0a", "#12301c", Math.min(1.0, sunIntensity)));
      groundGrad.addColorStop(0.4, blendColors("#091710", "#1b4d2e", Math.min(1.0, sunIntensity)));
      groundGrad.addColorStop(1, blendColors("#0c2114", "#1a5b32", Math.min(1.0, sunIntensity)));
      ctx.fillStyle = groundGrad;

      ctx.beginPath();
      ctx.moveTo(toScreenX(0.0), toScreenY(0.65));
      ctx.quadraticCurveTo(toScreenX(0.35), toScreenY(0.63), toScreenX(0.48), toScreenY(0.67));
      ctx.quadraticCurveTo(toScreenX(0.65), toScreenY(0.64), toScreenX(1.0), toScreenY(0.66));
      ctx.lineTo(toScreenX(1.0), toScreenY(1.1));
      ctx.lineTo(toScreenX(0.0), toScreenY(1.1));
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // 12. DRAW TREES (Large green trees on left, cherry blossom on right)
      // Tree coords in world: Left [x=0.12, y=0.70], Right [x=0.85, y=0.71]
      const drawTree = (worldX: number, worldY: number, scale: number, isBlossom: boolean) => {
        ctx.save();
        const tx = toScreenX(worldX);
        const ty = toScreenY(worldY);
        const tScale = scale * camera.zoom;

        const trunkColor = blendColors("#090302", "#402213", Math.min(1.0, sunIntensity));
        ctx.fillStyle = trunkColor;

        // Trunk
        ctx.beginPath();
        ctx.moveTo(tx - 6 * tScale, ty);
        ctx.lineTo(tx - 3 * tScale, ty - 45 * tScale);
        ctx.lineTo(tx + 3 * tScale, ty - 45 * tScale);
        ctx.lineTo(tx + 6 * tScale, ty);
        ctx.closePath();
        ctx.fill();

        // Branches
        ctx.strokeStyle = trunkColor;
        ctx.lineWidth = 4 * tScale;
        ctx.beginPath();
        ctx.moveTo(tx, ty - 35 * tScale);
        ctx.lineTo(tx - 15 * tScale, ty - 52 * tScale);
        ctx.moveTo(tx, ty - 38 * tScale);
        ctx.lineTo(tx + 18 * tScale, ty - 56 * tScale);
        ctx.stroke();

        // Foliage
        const sway = Math.sin(time * 0.8 + worldX * 10) * 1.5 * tScale;

        if (isBlossom) {
          // Pink/lavender cherry blossom leaves
          ctx.shadowBlur = 12 * sunIntensity;
          ctx.shadowColor = "rgba(244, 143, 177, 0.4)";
          const colors = ["#f48fb1", "#f06292", "#ec407a", "#ff80ab"];
          colors.forEach((col, i) => {
            ctx.fillStyle = blendColors("#1b0a12", col, Math.min(1.0, sunIntensity));
            const ox = (i % 2 === 0 ? -12 : 12) * tScale + sway;
            const oy = -55 * tScale - (i * 8) * tScale;
            const r = (20 - i * 2) * tScale;
            ctx.beginPath();
            ctx.arc(tx + ox, ty + oy, r, 0, Math.PI * 2);
            ctx.fill();
          });
        } else {
          // Dark green to emerald trees
          const colors = ["#064e3b", "#047857", "#10b981", "#34d399"];
          colors.forEach((col, i) => {
            ctx.fillStyle = blendColors("#021a11", col, Math.min(1.0, sunIntensity));
            const ox = (i % 2 === 0 ? -15 : 15) * tScale + sway;
            const oy = -58 * tScale - (i * 10) * tScale;
            const r = (25 - i * 3) * tScale;
            ctx.beginPath();
            ctx.arc(tx + ox, ty + oy, r, 0, Math.PI * 2);
            ctx.fill();
          });
        }
        ctx.restore();
      };

      drawTree(0.12, 0.70, 0.95, false);
      drawTree(0.24, 0.67, 0.75, false);
      drawTree(0.85, 0.71, 0.98, true);
      drawTree(0.75, 0.68, 0.72, true);

      // 13. DRAW THE FLOWER FIELD (Ground stems and colored dots swaying)
      flowers.forEach(f => {
        const fx = toScreenX(f.x);
        const fy = toScreenY(f.y);

        if (fx < -50 || fx > w + 50) return; // offscreen cull

        const sway = Math.sin(time * 1.5 + f.phase) * 4 * camera.zoom;
        const stemHeight = f.height * camera.zoom;

        // Draw stem
        ctx.strokeStyle = blendColors("#06170d", "#155e37", Math.min(1.0, sunIntensity));
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        ctx.moveTo(fx, fy);
        ctx.quadraticCurveTo(fx + sway * 0.5, fy - stemHeight * 0.5, fx + sway, fy - stemHeight);
        ctx.stroke();

        // Draw flower petal cap
        ctx.fillStyle = blendColors("#0c0406", f.color, Math.min(1.0, sunIntensity));
        ctx.beginPath();
        ctx.arc(fx + sway, fy - stemHeight, f.size * camera.zoom, 0, Math.PI * 2);
        ctx.fill();

        // Draw sparkling dew drops
        if (f.dewSparkle && sunIntensity > 0.3) {
          const sparkleVal = Math.sin(time * 2.0 + f.dewPhase);
          if (sparkleVal > 0.55) {
            const sparkleAlpha = (sparkleVal - 0.55) / 0.45;
            ctx.save();
            ctx.shadowBlur = 6;
            ctx.shadowColor = "#ffffff";
            ctx.fillStyle = `rgba(255, 255, 255, ${sparkleAlpha * 0.95})`;
            ctx.beginPath();
            ctx.arc(fx + sway + 2, fy - stemHeight + 1, 1.2 * camera.zoom, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
        }
      });

      // 14. DRAW BUTTERFLIES (Scene 2+)
      if (activePhase !== "opening" && activePhase !== "sunrise") {
        butterflies.forEach(b => {
          // fly toward target with slight smooth movement
          const dx = b.targetX - b.x;
          const dy = b.targetY - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 10) {
            b.targetX = Math.random() * w;
            b.targetY = h * 0.65 + Math.random() * h * 0.28;
          } else {
            b.x += (dx / dist) * b.speed * camera.zoom;
            b.y += (dy / dist) * b.speed * camera.zoom;
          }

          b.wingPhase += b.wingSpeed;
          const wingSpan = Math.abs(Math.sin(b.wingPhase));

          ctx.save();
          // Glow effect during bright sunrise
          ctx.shadowBlur = 6 * sunIntensity;
          ctx.shadowColor = b.color;

          ctx.fillStyle = blendColors("#100508", b.color, Math.min(1.0, sunIntensity));

          // Draw butterfly body
          ctx.beginPath();
          ctx.ellipse(b.x, b.y, 0.8, 4.5, 0, 0, Math.PI * 2);
          ctx.fill();

          // Left wing
          ctx.beginPath();
          ctx.ellipse(b.x - 3.5 * wingSpan, b.y - 2, 3.5 * wingSpan, 3.5, -Math.PI / 8, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.ellipse(b.x - 2.5 * wingSpan, b.y + 2, 2.5 * wingSpan, 2.2, Math.PI / 8, 0, Math.PI * 2);
          ctx.fill();

          // Right wing
          ctx.beginPath();
          ctx.ellipse(b.x + 3.5 * wingSpan, b.y - 2, 3.5 * wingSpan, 3.5, Math.PI / 8, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.ellipse(b.x + 2.5 * wingSpan, b.y + 2, 2.5 * wingSpan, 2.2, -Math.PI / 8, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();
        });
      }

      // 15. DRAW FLOATING GOLDEN PARTICLES (Scene 4+)
      if (sunIntensity > 0.4) {
        goldenParticles.forEach(p => {
          p.y += p.speedY * camera.zoom;
          p.x += p.speedX * camera.zoom;

          if (p.y < -10) {
            p.y = h + 10;
            p.x = Math.random() * w;
          }

          p.twinklePhase += p.twinkleSpeed;
          const currentAlpha = Math.max(0.1, Math.min(0.9, p.alpha + Math.sin(p.twinklePhase) * 0.35));

          ctx.save();
          ctx.shadowBlur = 8;
          ctx.shadowColor = "#fef08a";
          ctx.fillStyle = `rgba(254, 240, 138, ${currentAlpha * sunIntensity})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * camera.zoom, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });
      }

      // 16. DRAW DRIFTING CHERRY BLOSSOM PETALS
      if (activePhase !== "opening") {
        cherryPetals.forEach(p => {
          p.y += p.speedY * camera.zoom;
          p.x += p.speedX * camera.zoom;
          p.angle += p.spinSpeed;
          p.wobblePhase += p.wobbleSpeed;

          // Wind wobble
          const wobble = Math.sin(p.wobblePhase) * 1.5;

          if (p.y > h + 10 || p.x > w + 20) {
            p.y = -20;
            p.x = Math.random() * w * 0.8;
          }

          ctx.save();
          ctx.translate(p.x + wobble, p.y);
          ctx.rotate(p.angle);
          ctx.fillStyle = blendColors("#1f0d14", "rgba(244, 143, 177, 0.72)", Math.min(1.0, sunIntensity));
          ctx.beginPath();
          // Draw standard blossom petal shape (little heart-like leaf)
          ctx.ellipse(0, 0, p.size * 0.7, p.size, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });
      }

      // 17. DRAW BIRDS FLOCK AND THEIR "1" FORMATION
      if (activePhase !== "opening" && activePhase !== "sunrise" && activePhase !== "ended") {
        let formationBlend = 0.0; // 0 to 1

        if (activePhase === "bird_formation") {
          // Formation active. Blend in from 0s to 2.5s, stay full for 3s, fade to 0 by 8s
          if (elapsedInPhase < 2500) {
            formationBlend = elapsedInPhase / 2500;
          } else if (elapsedInPhase < 5500) {
            formationBlend = 1.0;
          } else {
            formationBlend = Math.max(0.0, 1.0 - (elapsedInPhase - 5500) / 2500);
          }
        }

        birds.forEach((b, idx) => {
          b.wingPhase += b.wingSpeed;
          const wingFlap = Math.sin(b.wingPhase) * b.size * 0.9;

          if (formationBlend > 0.0) {
            // Attract each bird to target points generating the "1" shape
            const targetPoint = targetPoints1[idx % targetPoints1.length];
            const targetScreenX = toScreenX(targetPoint.x);
            const targetScreenY = toScreenY(targetPoint.y);

            // Calculate distance to target
            const dx = targetScreenX - b.x;
            const dy = targetScreenY - b.y;

            // Interpolate velocity towards target
            b.vx = b.vx * (1 - formationBlend * 0.09) + dx * (formationBlend * 0.045);
            b.vy = b.vy * (1 - formationBlend * 0.09) + dy * (formationBlend * 0.045);
          } else {
            // Normal flight flock behavior: add slight random wave
            b.vx = b.vx * 0.98 + 0.07;
            b.vy = b.vy * 0.95 + (Math.random() - 0.5) * 0.15;
          }

          // Move bird
          b.x += b.vx;
          b.y += b.vy;

          // Recycle bird if it goes way offscreen right
          if (b.x > w + 200 && formationBlend === 0.0) {
            b.x = -150 - Math.random() * 200;
            b.y = h * 0.25 + Math.random() * h * 0.35;
            b.vx = 2.0 + Math.random() * 1.5;
            b.vy = (Math.random() - 0.45) * 0.8;
          }

          // Draw Bird V-Shape
          ctx.strokeStyle = blendColors("#101222", "rgba(255, 255, 255, 0.85)", Math.min(1.0, sunIntensity * 1.1));
          ctx.lineWidth = 1.6 * camera.zoom;
          ctx.beginPath();
          ctx.moveTo(b.x - b.size * camera.zoom, b.y - wingFlap);
          ctx.quadraticCurveTo(b.x, b.y, b.x + b.size * camera.zoom, b.y - wingFlap);
          ctx.stroke();
        });
      }

      // 18. SCENE 5: GIFT BOX AND RED ROSE BLOOM
      const showGiftBox = activePhase === "gift_reveal" || activePhase === "final_reveal" || activePhase === "petal_fall" || activePhase === "ending_ascent" || activePhase === "ended";
      if (showGiftBox) {
        ctx.save();
        const boxX = toScreenX(0.5);
        const boxY = toScreenY(0.78);
        const boxSize = 48 * camera.zoom;

        // Animate progression of gift box components inside Phase 5
        let phaseTime = activePhase === "gift_reveal" ? elapsedInPhase : 10000;
        let ribbonUntieProgress = Math.min(1.0, phaseTime / 3000); // 0s - 3s
        let lidOpenProgress = phaseTime > 3000 ? Math.min(1.0, (phaseTime - 3000) / 2500) : 0; // 3s - 5.5s
        let lightEscapeProgress = phaseTime > 4500 ? Math.min(1.0, (phaseTime - 4500) / 2500) : 0; // 4.5s - 7s
        let roseGrowthProgress = phaseTime > 5500 ? Math.min(1.0, (phaseTime - 5500) / 3500) : 0; // 5.5s - 9s

        // 18a. Draw Escape Light Fountain
        if (lightEscapeProgress > 0 && roseGrowthProgress < 0.95) {
          ctx.save();
          ctx.globalCompositeOperation = "screen";
          const sparkCount = Math.floor(lightEscapeProgress * 30);
          for (let i = 0; i < sparkCount; i++) {
            const angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.9;
            const spd = 2 + Math.random() * 5;
            const dist = spd * lightEscapeProgress * 35 * camera.zoom;
            const sx = boxX + Math.cos(angle) * dist;
            const sy = boxY - boxSize / 2 + Math.sin(angle) * dist;

            let sparkGlow = ctx.createRadialGradient(sx, sy, 0, sx, sy, 8 * camera.zoom);
            sparkGlow.addColorStop(0, "rgba(255, 255, 230, 0.95)");
            sparkGlow.addColorStop(0.3, "rgba(253, 224, 71, 0.8)");
            sparkGlow.addColorStop(1, "rgba(251, 146, 60, 0)");

            ctx.fillStyle = sparkGlow;
            ctx.beginPath();
            ctx.arc(sx, sy, 8 * camera.zoom, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        }

        // 18b. Draw Rose Stem & Bloom
        if (roseGrowthProgress > 0) {
          ctx.save();
          const stemEndY = boxY - boxSize * 0.4 - roseGrowthProgress * 55 * camera.zoom;

          // Draw stem
          ctx.strokeStyle = "#166534"; // green stem
          ctx.lineWidth = 3.0 * camera.zoom;
          ctx.beginPath();
          ctx.moveTo(boxX, boxY - boxSize * 0.4);
          ctx.quadraticCurveTo(boxX - 5 * camera.zoom * Math.sin(time), boxY - boxSize * 0.4 - (stemEndY - (boxY - boxSize * 0.4)) * 0.5, boxX, stemEndY);
          ctx.stroke();

          // Leaves along stem
          if (roseGrowthProgress > 0.45) {
            ctx.fillStyle = "#15803d";
            ctx.beginPath();
            ctx.ellipse(boxX - 6 * camera.zoom, boxY - boxSize * 0.4 - 20 * camera.zoom, 5 * camera.zoom, 3 * camera.zoom, -Math.PI / 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(boxX + 6 * camera.zoom, boxY - boxSize * 0.4 - 38 * camera.zoom, 5 * camera.zoom, 3 * camera.zoom, Math.PI / 6, 0, Math.PI * 2);
            ctx.fill();
          }

          // Draw Red Rose Petals Blooming (overlapping ellipses rotating)
          const bloomSize = Math.min(1.0, (roseGrowthProgress - 0.3) / 0.7);
          if (bloomSize > 0) {
            ctx.save();
            ctx.translate(boxX, stemEndY);
            ctx.scale(bloomSize, bloomSize);

            // Draw outer green sepals
            ctx.fillStyle = "#166534";
            for (let i = 0; i < 3; i++) {
              ctx.beginPath();
              ctx.ellipse(0, 5 * camera.zoom, 6 * camera.zoom, 4 * camera.zoom, (i - 1) * Math.PI / 5, 0, Math.PI * 2);
              ctx.fill();
            }

            // Draw rose petals layer by layer (nested red shapes)
            const petalCount = 8;
            ctx.shadowBlur = 12 * sunIntensity;
            ctx.shadowColor = "rgba(220, 38, 38, 0.6)";

            for (let layer = 0; layer < 4; layer++) {
              const count = petalCount - layer * 2;
              const rX = (15 - layer * 3.5) * camera.zoom;
              const rY = (11 - layer * 2.8) * camera.zoom;
              const offsetAngle = layer * Math.PI / 4;

              ctx.fillStyle = layer % 2 === 0 ? "#dc2626" : "#b91c1c"; // alternate shades

              for (let i = 0; i < count; i++) {
                const angle = (i * Math.PI * 2) / count + offsetAngle + Math.sin(time * 0.3) * 0.05;
                ctx.save();
                ctx.rotate(angle);
                ctx.beginPath();
                ctx.ellipse(0, -rY * 0.35, rX, rY, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
              }
            }

            // Bud center
            ctx.fillStyle = "#991b1b";
            ctx.beginPath();
            ctx.arc(0, 0, 5 * camera.zoom, 0, Math.PI * 2);
            ctx.fill();

            // Scent golden dust particles escaping rose
            if (bloomSize > 0.8) {
              const goldPCount = 3;
              for (let i = 0; i < goldPCount; i++) {
                if (Math.random() > 0.9) {
                  goldenParticles.push({
                    x: boxX + (Math.random() - 0.5) * 15 * camera.zoom,
                    y: stemEndY - (Math.random() * 5),
                    size: 0.8 + Math.random() * 1.5,
                    alpha: 0.8,
                    speedY: -0.6 - Math.random() * 0.7,
                    speedX: (Math.random() - 0.5) * 0.5,
                    twinkleSpeed: 0.05,
                    twinklePhase: Math.random() * Math.PI * 2
                  });
                }
              }
            }
            ctx.restore();
          }
          ctx.restore();
        }

        // 18c. Draw Gift Box Body (Gold and red box)
        let lidAngle = lidOpenProgress * -Math.PI / 3;
        let lidOffset = lidOpenProgress * -35 * camera.zoom;

        // Box Shadow
        ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
        ctx.beginPath();
        ctx.ellipse(boxX, boxY + boxSize / 2, boxSize * 0.7, boxSize * 0.18, 0, 0, Math.PI * 2);
        ctx.fill();

        // Box Base
        let baseGrad = ctx.createLinearGradient(boxX - boxSize / 2, 0, boxX + boxSize / 2, 0);
        baseGrad.addColorStop(0, blendColors("#4c0519", "#9f1239", Math.min(1.0, sunIntensity)));
        baseGrad.addColorStop(0.5, blendColors("#881337", "#f43f5e", Math.min(1.0, sunIntensity)));
        baseGrad.addColorStop(1, blendColors("#4c0519", "#be123c", Math.min(1.0, sunIntensity)));

        ctx.fillStyle = baseGrad;
        ctx.fillRect(boxX - boxSize / 2, boxY - boxSize / 2, boxSize, boxSize);

        // Gold base ribbon stripes (crossing center)
        ctx.fillStyle = blendColors("#78350f", "#fbbf24", Math.min(1.0, sunIntensity));
        ctx.fillRect(boxX - boxSize * 0.1, boxY - boxSize / 2, boxSize * 0.2, boxSize);

        // Box Lid
        ctx.save();
        ctx.translate(boxX - boxSize / 2, boxY - boxSize / 2); // pivot on top-left of box
        ctx.rotate(lidAngle);

        let lidGrad = ctx.createLinearGradient(0, lidOffset, boxSize, lidOffset);
        lidGrad.addColorStop(0, blendColors("#4c0519", "#e11d48", Math.min(1.0, sunIntensity)));
        lidGrad.addColorStop(0.5, blendColors("#881337", "#fb7185", Math.min(1.0, sunIntensity)));
        lidGrad.addColorStop(1, blendColors("#4c0519", "#f43f5e", Math.min(1.0, sunIntensity)));

        ctx.fillStyle = lidGrad;
        ctx.fillRect(0 - boxSize * 0.08, -boxSize * 0.22 + lidOffset, boxSize * 1.16, boxSize * 0.25);

        // Gold lid stripe
        ctx.fillStyle = blendColors("#78350f", "#fbbf24", Math.min(1.0, sunIntensity));
        ctx.fillRect(boxSize * 0.4, -boxSize * 0.22 + lidOffset, boxSize * 0.2, boxSize * 0.25);
        ctx.restore();

        // 18d. Draw Ribbons untying (before ribbon is pulled away)
        if (ribbonUntieProgress < 1.0) {
          ctx.save();
          ctx.strokeStyle = blendColors("#451a03", "#fbbf24", Math.min(1.0, sunIntensity));
          ctx.lineWidth = 3.5 * camera.zoom;
          ctx.shadowBlur = 6 * sunIntensity;
          ctx.shadowColor = "#f59e0b";

          const untieOffset = ribbonUntieProgress * 90 * camera.zoom;
          ctx.globalAlpha = 1.0 - ribbonUntieProgress;

          // Bow Left
          ctx.beginPath();
          ctx.moveTo(boxX, boxY - boxSize * 0.6);
          ctx.bezierCurveTo(
            boxX - 35 * camera.zoom - untieOffset, boxY - boxSize * 0.95 - untieOffset,
            boxX - 30 * camera.zoom - untieOffset, boxY - boxSize * 0.35 + untieOffset,
            boxX, boxY - boxSize * 0.6
          );
          ctx.stroke();

          // Bow Right
          ctx.beginPath();
          ctx.moveTo(boxX, boxY - boxSize * 0.6);
          ctx.bezierCurveTo(
            boxX + 35 * camera.zoom + untieOffset, boxY - boxSize * 0.95 - untieOffset,
            boxX + 30 * camera.zoom + untieOffset, boxY - boxSize * 0.35 + untieOffset,
            boxX, boxY - boxSize * 0.6
          );
          ctx.stroke();

          // Ribbon ends hanging
          ctx.beginPath();
          ctx.moveTo(boxX, boxY - boxSize * 0.6);
          ctx.quadraticCurveTo(boxX - 18 * camera.zoom - untieOffset, boxY - boxSize * 0.4, boxX - 25 * camera.zoom - untieOffset, boxY + boxSize * 0.2);
          ctx.moveTo(boxX, boxY - boxSize * 0.6);
          ctx.quadraticCurveTo(boxX + 18 * camera.zoom + untieOffset, boxY - boxSize * 0.4, boxX + 25 * camera.zoom + untieOffset, boxY + boxSize * 0.2);
          ctx.stroke();

          ctx.restore();
        }

        ctx.restore();
      }

      // Close DOF Blur context
      if (needsDOFBlur) {
        ctx.restore();
      }

      // 19. SCENE 8: SINGLE FALLING ROSE PETAL TRACKING & WRITING
      if (activePhase === "petal_fall" || activePhase === "ending_ascent" || activePhase === "ended") {
        const pPhaseTime = activePhase === "petal_fall" ? elapsedInPhase : 10000;

        if (!fallingPetal.landed) {
          // Petal falls slowly in a swaying pattern
          fallingPetal.wobblePhase += fallingPetal.wobbleSpeed;
          fallingPetal.angle += fallingPetal.spinSpeed;

          // Normalized coordinates: start from top center, drop to grass near rose
          fallingPetal.x = 0.5 + Math.sin(fallingPetal.wobblePhase) * 0.05;
          fallingPetal.y += fallingPetal.vy;

          if (fallingPetal.y >= 0.77) {
            fallingPetal.y = 0.77;
            fallingPetal.landed = true;
            localPhaseStartTime = Date.now(); // reset timer in phase for ground light writing
          }

          // Draw the falling rose petal in foreground (unblurred)
          ctx.save();
          const px = toScreenX(fallingPetal.x);
          const py = toScreenY(fallingPetal.y);
          const pSize = 13 * camera.zoom;

          ctx.translate(px, py);
          ctx.rotate(fallingPetal.angle);
          ctx.shadowBlur = 10;
          ctx.shadowColor = "rgba(185, 28, 28, 0.7)";

          // Red leaf/petal gradient
          let petalGrad = ctx.createRadialGradient(-3, -2, 0, 0, 0, pSize);
          petalGrad.addColorStop(0, "#ef4444");
          petalGrad.addColorStop(0.6, "#dc2626");
          petalGrad.addColorStop(1, "#991b1b");
          ctx.fillStyle = petalGrad;

          ctx.beginPath();
          ctx.ellipse(0, 0, pSize * 0.7, pSize, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        } else {
          // 19b. LANDED: Draw ripple expand & write text
          const landedDuration = tNow - localPhaseStartTime;

          // Draw resting petal
          ctx.save();
          const px = toScreenX(fallingPetal.x);
          const py = toScreenY(fallingPetal.y);
          const pSize = 13 * camera.zoom;
          ctx.translate(px, py);
          ctx.rotate(Math.PI / 4); // settled rotation
          ctx.fillStyle = "#991b1b";
          ctx.beginPath();
          ctx.ellipse(0, 0, pSize * 0.7, pSize, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          // Ripple of golden light expanding
          const rippleMaxRadius = w * 0.28;
          let rippleRadius = (landedDuration / 2200) * rippleMaxRadius;
          let rippleAlpha = 0.0;
          if (rippleRadius < rippleMaxRadius) {
            rippleAlpha = Math.max(0, 1.0 - rippleRadius / rippleMaxRadius);
          }

          if (rippleAlpha > 0) {
            ctx.save();
            ctx.strokeStyle = `rgba(253, 224, 71, ${rippleAlpha * 0.75})`;
            ctx.lineWidth = 3.5;
            ctx.shadowBlur = 15;
            ctx.shadowColor = "#f59e0b";
            ctx.beginPath();
            ctx.ellipse(px, py, rippleRadius, rippleRadius * 0.25, 0, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
          }

          // Write "See you tomorrow... ❤️" letter-by-letter with a gold stroke
          // We trigger writing after 1.8s of landing
          if (landedDuration > 1500) {
            const writingDuration = 4500; // 4.5 seconds to write
            const writingElapsed = landedDuration - 1500;
            const progress = Math.min(1.0, writingElapsed / writingDuration);

            // Animate line dash offset to draw cursive text
            lineDashOffset = Math.max(0, Math.floor(1000 * (1.0 - progress)));

            ctx.save();
            ctx.font = `bold ${28 * camera.zoom}px 'Caveat', ${caveat.style.fontFamily}, cursive`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            const textX = w / 2;
            const textY = toScreenY(0.85);

            // Set up glowing golden stroke
            ctx.strokeStyle = "#fbbf24";
            ctx.lineWidth = 3.0;
            ctx.shadowBlur = 10;
            ctx.shadowColor = "#f59e0b";
            ctx.setLineDash([1000, 1000]);
            ctx.lineDashOffset = lineDashOffset;

            // Draw stroke
            ctx.strokeText("See you tomorrow... ❤️", textX, textY);

            // Fill text slightly as progress completes
            if (progress > 0.85) {
              const textFillAlpha = (progress - 0.85) / 0.15;
              ctx.fillStyle = `rgba(255, 255, 255, ${textFillAlpha * 0.95})`;
              ctx.fillText("See you tomorrow... ❤️", textX, textY);
            }
            ctx.restore();

            // Spawn sparks at the active write tip
            // Map text cursor approximate coordinate on canvas
            if (progress < 0.98) {
              const textWidth = ctx.measureText("See you tomorrow... ❤️").width;
              // Simple approximation of cursor moving from left to right along text
              const writeCursorX = textX - textWidth / 2 + textWidth * progress;
              // Cursive letters fluctuate on Y coordinate
              const writeCursorY = textY + Math.sin(progress * Math.PI * 7) * 8 * camera.zoom;

              // spawn sparkles
              if (Math.random() > 0.25) {
                sparks.push({
                  x: writeCursorX,
                  y: writeCursorY,
                  vx: (Math.random() - 0.5) * 1.8,
                  vy: -1.0 - Math.random() * 1.5,
                  size: 1.0 + Math.random() * 2.2,
                  alpha: 1.0,
                });
              }
            }

            // Draw and update sparks
            sparks.forEach((sp, idx) => {
              sp.x += sp.vx;
              sp.y += sp.vy;
              sp.alpha -= 0.025;
              if (sp.alpha <= 0) {
                sparks.splice(idx, 1);
              } else {
                ctx.save();
                ctx.fillStyle = `rgba(254, 240, 138, ${sp.alpha})`;
                ctx.shadowBlur = 6;
                ctx.shadowColor = "#fbbf24";
                ctx.beginPath();
                ctx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
              }
            });
          }
        }
      }

      // 20. TRANSITIONAL FADES BETWEEN PHASES (Screen overlays)
      // Fade in from black at the beginning
      if (activePhase === "opening") {
        const overlayAlpha = Math.max(0, 1.0 - elapsedInPhase / 2000);
        if (overlayAlpha > 0) {
          ctx.fillStyle = `rgba(0, 0, 0, ${overlayAlpha})`;
          ctx.fillRect(0, 0, w, h);
        }
      }

      // Fade out to pure white at the end of the cinematic loop
      if (activePhase === "ending_ascent" || activePhase === "ended") {
        const overlayAlpha = Math.min(1.0, elapsedInPhase / 4500);
        ctx.fillStyle = `rgba(255, 255, 255, ${overlayAlpha})`;
        ctx.fillRect(0, 0, w, h);
      }

      animationFrameId = requestAnimationFrame(renderLoop);
    };

    renderLoop();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Helper utility to blend colors in hex/rgba space
  const blendColors = (color1: string, color2: string, ratio: number) => {
    // Basic hex parsing and interpolation
    const parse = (c: string) => {
      if (c.startsWith("#")) {
        const raw = c.substring(1);
        if (raw.length === 3) {
          return [
            parseInt(raw[0] + raw[0], 16),
            parseInt(raw[1] + raw[1], 16),
            parseInt(raw[2] + raw[2], 16),
            1.0,
          ];
        }
        return [
          parseInt(raw.substring(0, 2), 16),
          parseInt(raw.substring(2, 4), 16),
          parseInt(raw.substring(4, 6), 16),
          1.0,
        ];
      }
      if (c.startsWith("rgba")) {
        const parts = c.replace(/rgba\(|\)/g, "").split(",");
        return [
          parseInt(parts[0]),
          parseInt(parts[1]),
          parseInt(parts[2]),
          parseFloat(parts[3] || "1"),
        ];
      }
      return [255, 255, 255, 1.0];
    };

    const c1 = parse(color1);
    const c2 = parse(color2);

    const r = Math.round(c1[0] + (c2[0] - c1[0]) * ratio);
    const g = Math.round(c1[1] + (c2[1] - c1[1]) * ratio);
    const b = Math.round(c1[2] + (c2[2] - c1[2]) * ratio);
    const a = c1[3] + (c2[3] - c1[3]) * ratio;

    return `rgba(${r}, ${g}, ${b}, ${a})`;
  };

  // Immediate cinematic skip
  const handleSkip = () => {
    timersRef.current.forEach(t => clearTimeout(t));
    timersRef.current = [];
    setPhase("ended");
    if (synthRef.current) {
      synthRef.current.destroy();
    }
  };

  const isPlaying = phase !== "ended";

  return (
    <div
      onClick={handleInteraction}
      onTouchStart={handleInteraction}
      className="fixed inset-0 z-50 flex flex-col justify-center items-center overflow-hidden bg-black text-amber-50 select-none cursor-pointer"
    >
      {/* Background Cinematic Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full pointer-events-none z-0" />

      {/* Skip Button */}
      <AnimatePresence>
        {isPlaying && phase !== "ending_ascent" && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            exit={{ opacity: 0 }}
            whileHover={{ opacity: 1.0, scale: 1.05 }}
            onClick={(e) => {
              e.stopPropagation(); // prevent triggering audio hint interaction
              handleSkip();
            }}
            className="absolute top-6 right-6 z-50 rounded-full border border-white/20 bg-black/40 hover:bg-white/10 px-4 py-2 text-xs font-semibold text-white/95 backdrop-blur-sm transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span>Skip Intro</span>
            <span>⏭️</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Ambient Audio Activation Helper */}
      <AnimatePresence>
        {audioHintVisible && isPlaying && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 0.8, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.0 }}
            className="absolute top-8 z-50 pointer-events-none rounded-full border border-white/10 bg-black/45 px-5 py-2 text-xs font-semibold text-white/80 backdrop-blur-sm animate-pulse"
          >
            🎵 Tap anywhere to enable valley wind, birds & piano
          </motion.div>
        )}
      </AnimatePresence>

      {/* RENDER CINEMATIC TEXT OVERLAYS */}
      <AnimatePresence>
        {isPlaying && (
          <div className="absolute inset-x-8 top-[28%] pointer-events-none z-30 flex flex-col items-center text-center select-none">
            {phase === "opening" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 2.0, ease: "easeOut" }}
                className="max-w-2xl flex flex-col items-center gap-4"
              >
                <h2 className={`${playfair.className} text-3.5xl font-light tracking-wide text-amber-100/90 md:text-5xl leading-relaxed`}>
                  One last sunrise...
                </h2>
                <h3 className={`${playfair.className} mt-3 text-3.5xl font-light tracking-wide text-white/95 md:text-5xl leading-relaxed`}>
                  before your special day... ❤️
                </h3>
              </motion.div>
            )}

            {phase === "final_reveal" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.6, ease: "easeOut" }}
                className="p-8 rounded-[2.5rem] border border-white/15 bg-black/45 backdrop-blur-[2px] shadow-2xl max-w-xl flex flex-col items-center gap-4"
              >
                <span className="text-pink-400 text-3xl flex items-center justify-center gap-1.5 animate-pulse">🌅❤️</span>
                <h1 className={`${playfair.className} text-5xl font-black md:text-6.5xl tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-300 to-amber-100 mt-1`}>
                  1 DAY TO GO
                </h1>
                <span className="text-pink-400 text-3xl flex items-center justify-center gap-1.5 animate-pulse mt-1">❤️🌅</span>

                <p className={`${caveat.className} mt-4 text-2.2xl font-bold leading-relaxed text-amber-100/95 md:text-3.5xl`}>
                  "Every sunrise brought me one day closer...<br />
                  Tomorrow I finally get to celebrate<br />
                  the most beautiful person in my world.<br />
                  Happy almost Birthday, Mammoty. ❤️"
                </p>
              </motion.div>
            )}
          </div>
        )}
      </AnimatePresence>

      {/* RENDER CELEBRATION COMPONENT AT THE END OF CINEMATIC */}
      <AnimatePresence>
        {phase === "ended" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0 z-45 bg-black flex flex-col justify-center items-center p-6 md:p-12 overflow-y-auto"
          >
            {/* Elegant Serif typography and luxury romantic layout */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 1.0 }}
              className="max-w-lg w-full rounded-[2.5rem] border border-amber-900/30 bg-gradient-to-b from-amber-950/25 to-amber-950/40 p-8 md:p-10 shadow-[0_30px_100px_rgba(0,0,0,0.8)] backdrop-blur-md text-amber-50/95 flex flex-col gap-8 text-center items-center"
            >
              <div className="text-[10px] font-bold text-amber-600/60 tracking-widest select-none">
                🔒 THE LAST SUNRISE NOTE
              </div>

              <div className="flex flex-col gap-6">
                <span className="text-pink-500 text-5xl">🌹🌅</span>
                <h1 className={`${playfair.className} text-4xl md:text-5xl font-black text-amber-100 leading-snug`}>
                  1 Day to Go...
                </h1>

                <p className={`${caveat.className} text-2.8xl md:text-3.2xl font-bold leading-relaxed text-amber-200/95`}>
                  Mammoty, tomorrow is the day the world was blessed with your smile. Every step of this countdown, from Day 9 to today, has been a letter of my love.
                  <br /><br />
                  See you tomorrow for the grand celebration... ❤️
                </p>
              </div>

              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="w-full rounded-2xl bg-gradient-to-r from-amber-700 to-amber-900 py-4 shadow-[0_10px_25px_rgba(0,0,0,0.4)] border border-amber-800 text-white font-black tracking-widest text-sm transition cursor-pointer flex items-center justify-center gap-2 uppercase"
              >
                <span>← Celebrate Tomorrow</span>
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
