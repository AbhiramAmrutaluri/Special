"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowLeft } from "lucide-react";
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

// Custom secret message for Day 2
const SECRET_MESSAGE = `Oiii Papaaaa, ❤️

They say that some stories don't need words—they simply find each other in the quiet moments of the world, like two swans gliding across a mirror-calm lake. 

Tonight, the mountains are hushed and the lake itself is glowing to celebrate you. You are my calm in every storm, my anchor, and my absolute favorite soul. In just 2 more sunrises, the world celebrates the day you were born... 🦢✨

I am so incredibly lucky to walk this path with you.

Forever and always,
Your Abhiiii ❤️`;

// Web Audio API Sound Synthesizer for Alpine Lake
class LakeAmbienceSynth {
  private ctx: AudioContext | null = null;
  private activeNodes: AudioNode[] = [];
  private isMuted: boolean = false;
  private timer: NodeJS.Timeout | null = null;
  private breezeTimer: NodeJS.Timeout | null = null;

  init() {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    this.ctx = new AudioContextClass();
    this.startAmbientProgression();
    this.startSoftBreezeNoise();
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
      this.startSoftBreezeNoise();
    }
  }

  private stopActiveNotes() {
    this.activeNodes.forEach(node => {
      try {
        (node as any).stop?.();
      } catch (e) { }
    });
    this.activeNodes = [];
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    if (this.breezeTimer) {
      clearTimeout(this.breezeTimer);
      this.breezeTimer = null;
    }
  }

  private playTone(freq: number, startTime: number, duration: number, gainValue: number, type: "sine" | "triangle" = "sine") {
    if (!this.ctx || this.isMuted) return;

    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = type;
    osc.frequency.value = freq;

    filter.type = "lowpass";
    filter.frequency.value = 350; // Warm soft cutoff
    filter.Q.value = 1.0;

    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(gainValue * 0.14, startTime + 1.8);
    gainNode.gain.setValueAtTime(gainValue * 0.14, startTime + duration - 2.0);
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

    // Romantic slow lake progression: Dmaj9, Asus4, Bm9, Gmaj7
    const chords = [
      [146.83, 220.00, 277.18, 369.99, 440.00, 554.37], // Dmaj9
      [220.00, 293.66, 392.00, 440.00, 587.33, 659.25], // Asus4
      [123.47, 185.00, 246.94, 329.63, 369.99, 493.88], // Bm9
      [196.00, 246.94, 293.66, 392.00, 493.88, 587.33]  // Gmaj7
    ];

    let currentChord = 0;
    const playNext = () => {
      if (this.isMuted || !this.ctx) return;
      const notes = chords[currentChord];
      const now = this.ctx.currentTime;
      const chordDuration = 9.5;

      notes.forEach((freq, i) => {
        const delay = i * 0.3;
        const volume = i === 0 ? 0.35 : 0.18;
        this.playTone(freq, now + delay, chordDuration - delay, volume, "sine");
      });

      currentChord = (currentChord + 1) % chords.length;
      this.timer = setTimeout(playNext, 9000);
    };

    playNext();
  }

  private startSoftBreezeNoise() {
    if (!this.ctx || this.isMuted) return;

    // Synthesize gentle wind sound using white noise and a modulated bandpass filter
    try {
      const bufferSize = 2 * this.ctx.sampleRate;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = 400;
      filter.Q.value = 1.5;

      const gainNode = this.ctx.createGain();
      gainNode.gain.value = 0.015; // Extremely soft background level

      // Modulate wind volume/frequency slowly to sound natural
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = 0.05; // 20-second cycles
      oscGain.gain.value = 150;

      osc.connect(oscGain);
      oscGain.connect(filter.frequency);
      whiteNoise.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(this.ctx.destination);

      osc.start();
      whiteNoise.start();

      this.activeNodes.push(osc);
      this.activeNodes.push(whiteNoise);
    } catch (e) { }
  }

  // Synthesize tiny, high-frequency water ripple chimes
  playWaterChime() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const freq = 800 + Math.random() * 600;

    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.5, now + 0.6);

    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.06, now + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);

    osc.connect(gainNode);
    gainNode.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.7);

    this.activeNodes.push(osc);
  }

  destroy() {
    this.stopActiveNotes();
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
  }
}

interface BirthdayTwoRevealProps {
  onClose: () => void;
}

type Phase =
  | "opening"
  | "scene1_breathing"
  | "scene2_swans_appear"
  | "scene3_drawing"
  | "scene4_heart"
  | "scene5_reveal"
  | "scene6_feather"
  | "scene7_ending"
  | "scene8_fade_moon"
  | "ended";

interface Star {
  x: number;
  y: number;
  size: number;
  alpha: number;
  twinkleSpeed: number;
  twinklePhase: number;
}

interface Cloud {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  alpha: number;
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

interface LotusFlower {
  nx: number;
  ny: number;
  size: number;
  color: string;
}

interface WoodenBoat {
  nx: number;
  ny: number;
  scale: number;
  bobPhase: number;
}

interface FloatingLantern {
  nx: number;
  ny: number;
  size: number;
  flickerOffset: number;
}

interface WaterRipple {
  nx: number;
  ny: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
}

export default function BirthdayTwoReveal({ onClose }: BirthdayTwoRevealProps) {
  const [phase, setPhase] = useState<Phase>("opening");
  const [musicEnabled, setMusicEnabled] = useState(false);
  const [audioHintVisible, setAudioHintVisible] = useState(true);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const synthRef = useRef<LakeAmbienceSynth | null>(null);
  const phaseRef = useRef<Phase>("opening");

  // Camera settings
  const cameraRef = useRef({
    x: 0,
    y: 0,
    scale: 1.0,
    targetX: 0,
    targetY: 0,
    targetScale: 1.0,
  });

  // Swan dynamic variables
  const swan1Ref = useRef({ nx: -0.1, ny: 0.6, targetNx: 0.22, targetNy: 0.38, currentAngle: 0 });
  const swan2Ref = useRef({ nx: 1.1, ny: 0.6, targetNx: 0.78, targetNy: 0.62, currentAngle: Math.PI });
  const trailPointsRef = useRef<{ nx: number; ny: number; alpha: number; id: number }[]>([]);

  // Feather dynamic variables
  const featherRef = useRef({ nx: 0.5, ny: -0.2, angle: 0, speedY: 0.0018, speedX: 0.0006, driftPhase: 0, landed: false });
  const featherRippleRef = useRef<WaterRipple | null>(null);

  // Entities arrays
  const starsRef = useRef<Star[]>([]);
  const cloudsRef = useRef<Cloud[]>([]);
  const firefliesRef = useRef<Firefly[]>([]);
  const sparklesRef = useRef<FloatingSparkle[]>([]);
  const fireworksRef = useRef<Firework[]>([]);
  const lotusesRef = useRef<LotusFlower[]>([]);
  const boatsRef = useRef<WoodenBoat[]>([]);
  const lanternsRef = useRef<FloatingLantern[]>([]);
  const ripplesRef = useRef<WaterRipple[]>([]);

  const timersRef = useRef<NodeJS.Timeout[]>([]);
  const phaseStartTimeRef = useRef(Date.now());
  const animationFrameIdRef = useRef<number | null>(null);

  useEffect(() => {
    phaseRef.current = phase;
    phaseStartTimeRef.current = Date.now();
  }, [phase]);

  // Audio initialize on first click
  useEffect(() => {
    synthRef.current = new LakeAmbienceSynth();

    const handleFirstClick = () => {
      if (synthRef.current) {
        synthRef.current.init();
        synthRef.current.setMute(false);
        setMusicEnabled(true);
      }
      setAudioHintVisible(false);
      window.removeEventListener("click", handleFirstClick);
    };

    window.addEventListener("click", handleFirstClick);

    const hintTimer = setTimeout(() => {
      setAudioHintVisible(false);
    }, 4500);

    return () => {
      synthRef.current?.destroy();
      window.removeEventListener("click", handleFirstClick);
      clearTimeout(hintTimer);
    };
  }, []);

  // Compute mathematical path points for number "2"
  const points2 = useMemo(() => {
    const pts: { nx: number; ny: number }[] = [];
    const pointsCount = 120;

    // Segment 1: Hook circle (from 0 to 55% of the points)
    const hookCount = Math.floor(pointsCount * 0.55);
    const cx = 0.50;
    const cy = 0.44;
    const r = 0.075;
    const startAngle = Math.PI * 0.85;
    const endAngle = Math.PI * 2.15;
    for (let i = 0; i < hookCount; i++) {
      const a = startAngle + (i / hookCount) * (endAngle - startAngle);
      pts.push({ nx: cx + r * Math.cos(a), ny: cy + r * Math.sin(a) });
    }

    // Segment 2: Slant line down-left (from 55% to 77% of the points)
    const slantCount = Math.floor(pointsCount * 0.22);
    const startX = cx + r * Math.cos(endAngle);
    const startY = cy + r * Math.sin(endAngle);
    const endX = 0.435;
    const endY = 0.62;
    for (let i = 0; i < slantCount; i++) {
      const t = i / slantCount;
      pts.push({
        nx: startX + t * (endX - startX),
        ny: startY + t * (endY - startY)
      });
    }

    // Segment 3: Horizontal Base line (from 77% to 100% of the points)
    const baseCount = pointsCount - hookCount - slantCount;
    const baseEndX = 0.575;
    const baseEndY = 0.62;
    for (let i = 0; i <= baseCount; i++) {
      const t = i / baseCount;
      pts.push({
        nx: endX + t * (baseEndX - endX),
        ny: endY + t * (baseEndY - endY)
      });
    }

    return pts;
  }, []);

  // Initialize lake scene visual entities
  const initializeEntities = () => {
    // 1. Stars
    const stars: Star[] = [];
    for (let i = 0; i < 220; i++) {
      stars.push({
        x: Math.random(),
        y: Math.random() * 0.52,
        size: 0.5 + Math.random() * 1.4,
        alpha: 0.2 + Math.random() * 0.8,
        twinkleSpeed: 0.015 + Math.random() * 0.03,
        twinklePhase: Math.random() * Math.PI * 2,
      });
    }
    starsRef.current = stars;

    // 2. Clouds
    const clouds: Cloud[] = [];
    for (let i = 0; i < 4; i++) {
      clouds.push({
        x: Math.random() * 1.4 - 0.2,
        y: 0.05 + Math.random() * 0.18,
        width: 0.20 + Math.random() * 0.18,
        height: 0.05 + Math.random() * 0.03,
        speed: 0.0002 + Math.random() * 0.0002,
        alpha: 0.08 + Math.random() * 0.10,
      });
    }
    cloudsRef.current = clouds;

    // 3. Fireflies
    const fireflies: Firefly[] = [];
    for (let i = 0; i < 35; i++) {
      fireflies.push({
        x: Math.random(),
        y: 0.50 + Math.random() * 0.45,
        size: 0.8 + Math.random() * 1.6,
        vx: (Math.random() - 0.5) * 0.0008,
        vy: (Math.random() - 0.5) * 0.0008,
        alpha: 0.25 + Math.random() * 0.75,
        pulsePhase: Math.random() * Math.PI * 2,
        pulseSpeed: 0.02 + Math.random() * 0.05,
      });
    }
    firefliesRef.current = fireflies;

    // 4. Sparkles
    const sparkles: FloatingSparkle[] = [];
    for (let i = 0; i < 50; i++) {
      sparkles.push({
        x: Math.random(),
        y: Math.random(),
        vx: (Math.random() - 0.5) * 0.0005,
        vy: -0.0003 - Math.random() * 0.0006,
        size: 0.8 + Math.random() * 1.6,
        alpha: 0.1 + Math.random() * 0.6,
        color: "rgba(251, 191, 36, " + (0.3 + Math.random() * 0.5) + ")",
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.03 + Math.random() * 0.05,
      });
    }
    sparklesRef.current = sparkles;

    // 5. Lotuses & Lily pads
    const lotuses: LotusFlower[] = [];
    const padPositions = [
      { x: 0.28, y: 0.75 }, { x: 0.32, y: 0.72 }, { x: 0.35, y: 0.79 },
      { x: 0.64, y: 0.81 }, { x: 0.68, y: 0.78 }, { x: 0.72, y: 0.84 },
      { x: 0.48, y: 0.88 }, { x: 0.52, y: 0.90 }
    ];
    padPositions.forEach((pt, i) => {
      lotuses.push({
        nx: pt.x,
        ny: pt.y,
        size: 5 + Math.random() * 3,
        color: i % 2 === 0 ? "rgba(244, 63, 94, 0.85)" : "rgba(255, 255, 255, 0.9)", // Pink & White petals
      });
    });
    lotusesRef.current = lotuses;

    // 6. Wooden rowboats
    boatsRef.current = [
      { nx: 0.22, ny: 0.68, scale: 1.1, bobPhase: 0 },
      { nx: 0.78, ny: 0.74, scale: 0.95, bobPhase: Math.PI }
    ];

    // 7. Shoreline lanterns
    const lanterns: FloatingLantern[] = [];
    const lanternShoreline = [
      { x: 0.16, y: 0.62 }, { x: 0.24, y: 0.63 }, { x: 0.32, y: 0.66 },
      { x: 0.66, y: 0.67 }, { x: 0.74, y: 0.65 }, { x: 0.82, y: 0.63 }
    ];
    lanternShoreline.forEach(pt => {
      lanterns.push({
        nx: pt.x,
        ny: pt.y,
        size: 5.5 + Math.random() * 2,
        flickerOffset: Math.random() * Math.PI * 2,
      });
    });
    lanternsRef.current = lanterns;

    // Reset swans
    swan1Ref.current = { nx: -0.1, ny: 0.6, targetNx: points2[0].nx, targetNy: points2[0].ny, currentAngle: 0 };
    swan2Ref.current = { nx: 1.1, ny: 0.6, targetNx: points2[points2.length - 1].nx, targetNy: points2[points2.length - 1].ny, currentAngle: Math.PI };
    trailPointsRef.current = [];

    // Reset feather
    featherRef.current = { nx: 0.5, ny: -0.2, angle: 0, speedY: 0.0018, speedX: 0.0006, driftPhase: 0, landed: false };
    featherRippleRef.current = null;
    ripplesRef.current = [];
  };

  // Timeline scheduler matching story beats
  const runSequenceTimeline = () => {
    timersRef.current.forEach(t => clearTimeout(t));
    timersRef.current = [];
    fireworksRef.current = [];

    const delay = (fn: () => void, ms: number) => {
      timersRef.current.push(setTimeout(fn, ms));
    };

    // 0s: Opening - Title and drone glide
    setPhase("opening");

    // 6s: Scene 1 - Lake breathes (6s)
    delay(() => {
      setPhase("scene1_breathing");
    }, 6000);

    // 12s: Scene 2 - Swans Appear & swim naturally (6s)
    delay(() => {
      setPhase("scene2_swans_appear");
    }, 12000);

    // 18s: Scene 3 - Swan paths trace the number 2 (12s)
    delay(() => {
      setPhase("scene3_drawing");
    }, 18000);

    // 30s: Scene 4 - Swans meet and form heart in center (8s)
    delay(() => {
      setPhase("scene4_heart");
    }, 30000);

    // 38s: Scene 5 - Countdown Reveal text appears (10s)
    delay(() => {
      setPhase("scene5_reveal");
    }, 38000);

    // 48s: Scene 6 - Falling Feather & expanding sweep ripple (14s)
    delay(() => {
      setPhase("scene6_feather");
    }, 48000);

    // 62s: Scene 7 - Ending quote appears & swans swim away (8s)
    delay(() => {
      setPhase("scene7_ending");
    }, 62000);

    // 70s: Scene 8 - Camera rises and zooms into moon, fade to black (6s)
    delay(() => {
      setPhase("scene8_fade_moon");
    }, 70000);

    // 76s: Show Back to Countdown button on black screen
    delay(() => {
      setPhase("ended");
    }, 76000);
  };

  useEffect(() => {
    initializeEntities();
    runSequenceTimeline();

    return () => {
      timersRef.current.forEach(t => clearTimeout(t));
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, []);

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

    const animationLoop = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const tNow = Date.now();

      const baseScale = Math.min(w, h) * 0.9;
      const toScreenX = (nx: number) => w / 2 + (nx - 0.5) * baseScale;
      const toScreenY = (ny: number) => h / 2 + (ny - 0.5) * baseScale;

      ctx.clearRect(0, 0, w, h);

      // 1. Sky Gradient (Alpine blue hour)
      const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
      skyGrad.addColorStop(0, "#010103");
      skyGrad.addColorStop(0.35, "#060918");
      skyGrad.addColorStop(0.55, "#0b122c");
      skyGrad.addColorStop(0.85, "#151c40");
      skyGrad.addColorStop(1.0, "#04060f");
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h);

      // 2. Stars
      starsRef.current.forEach(star => {
        star.twinklePhase += star.twinkleSpeed;
        const currentAlpha = Math.max(0.1, Math.min(1.0, star.alpha + Math.sin(star.twinklePhase) * 0.3));
        ctx.fillStyle = `rgba(255, 255, 255, ${currentAlpha})`;
        ctx.beginPath();
        ctx.arc(star.x * w, star.y * h, star.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // 3. Volumetric Moon Glow
      const moonX = w * 0.82;
      const moonY = h * 0.18;
      const moonR = Math.min(w, h) * 0.075;

      const moonGlow = ctx.createRadialGradient(moonX, moonY, moonR * 0.4, moonX, moonY, moonR * 3.4);
      moonGlow.addColorStop(0, "rgba(255, 251, 240, 0.85)");
      moonGlow.addColorStop(0.15, "rgba(255, 246, 220, 0.32)");
      moonGlow.addColorStop(0.40, "rgba(255, 240, 210, 0.08)");
      moonGlow.addColorStop(1.0, "rgba(255, 240, 210, 0)");
      ctx.fillStyle = moonGlow;
      ctx.beginPath();
      ctx.arc(moonX, moonY, moonR * 3.4, 0, Math.PI * 2);
      ctx.fill();

      // Moon Circle
      ctx.fillStyle = "#fffdf0";
      ctx.shadowBlur = 24;
      ctx.shadowColor = "rgba(255, 250, 230, 0.65)";
      ctx.beginPath();
      ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Moon craters
      ctx.fillStyle = "rgba(235, 226, 198, 0.28)";
      ctx.beginPath();
      ctx.arc(moonX - moonR * 0.3, moonY + moonR * 0.25, moonR * 0.24, 0, Math.PI * 2);
      ctx.arc(moonX + moonR * 0.25, moonY - moonR * 0.38, moonR * 0.20, 0, Math.PI * 2);
      ctx.arc(moonX + moonR * 0.45, moonY + moonR * 0.12, moonR * 0.16, 0, Math.PI * 2);
      ctx.fill();

      // 4. Clouds
      cloudsRef.current.forEach(cloud => {
        cloud.x += cloud.speed;
        if (cloud.x > 1.25) cloud.x = -0.3;
        const cx = cloud.x * w;
        const cy = cloud.y * h;
        const cw = cloud.width * w;
        const ch = cloud.height * h;
        ctx.fillStyle = `rgba(219, 228, 255, ${cloud.alpha})`;
        ctx.beginPath();
        ctx.ellipse(cx, cy, cw, ch, 0, 0, Math.PI * 2);
        ctx.fill();
      });

      // 5. Camera translations (cinematic Hollywood drone)
      const cam = cameraRef.current;
      switch (phaseRef.current) {
        case "opening":
          cam.targetScale = 1.35;
          cam.targetX = w * 0.12;
          cam.targetY = h * 0.08;
          break;
        case "scene1_breathing":
          cam.targetScale = 1.10;
          cam.targetX = 0;
          cam.targetY = 0;
          break;
        case "scene2_swans_appear":
          cam.targetScale = 1.02;
          cam.targetX = 0;
          cam.targetY = -h * 0.01;
          break;
        case "scene3_drawing":
          cam.targetScale = 0.88;
          cam.targetX = 0;
          cam.targetY = -h * 0.06;
          break;
        case "scene4_heart":
          cam.targetScale = 1.30;
          cam.targetX = w / 2 - (w * 0.5) * 1.30;
          cam.targetY = h / 2 - (h * 0.375) * 1.30;
          break;
        case "scene5_reveal":
          cam.targetScale = 0.90;
          cam.targetX = 0;
          cam.targetY = -h * 0.05;
          break;
        case "scene6_feather":
          // Follow the feather coordinate
          const fx = toScreenX(featherRef.current.nx);
          const fy = toScreenY(featherRef.current.ny);
          cam.targetScale = 1.6;
          cam.targetX = w / 2 - fx * 1.6;
          cam.targetY = h / 2 - fy * 1.6;
          break;
        case "scene7_ending":
          cam.targetScale = 1.15;
          cam.targetX = 0;
          cam.targetY = -h * 0.02;
          break;
        case "scene8_fade_moon":
          cam.targetScale = 4.2;
          cam.targetX = w / 2 - moonX * 4.2;
          cam.targetY = h / 2 - moonY * 4.2;
          break;
        default:
          cam.targetScale = 1.00;
          cam.targetX = 0;
          cam.targetY = 0;
          break;
      }

      cam.scale += (cam.targetScale - cam.scale) * 0.02;
      cam.x += (cam.targetX - cam.x) * 0.02;
      cam.y += (cam.targetY - cam.y) * 0.02;

      ctx.save();
      ctx.translate(cam.x, cam.y);
      ctx.scale(cam.scale, cam.scale);

      // 6. Draw Mountains with snow peaks & waterfalls
      const drawMountains = () => {
        // Far mountain range
        ctx.fillStyle = "#060714";
        ctx.beginPath();
        ctx.moveTo(-w * 0.5, h * 1.5);
        const peakHeights1 = [0.24, 0.32, 0.20, 0.28, 0.38, 0.25, 0.18, 0.29, 0.36, 0.22, 0.26];
        for (let i = 0; i <= 20; i++) {
          const t = i / 20;
          const x = (t * 2.0 - 0.5) * w;
          const y = h * 0.42 - peakHeights1[i % peakHeights1.length] * baseScale;
          ctx.lineTo(x, y);

          // Snow cap highlight
          if (i % 3 === 0) {
            ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x - 14, y + 25);
            ctx.lineTo(x + 14, y + 25);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = "#060714";
          }
        }
        ctx.lineTo(w * 1.5, h * 1.5);
        ctx.closePath();
        ctx.fill();

        // Drifting fog above horizon
        const fog = ctx.createLinearGradient(0, h * 0.35, 0, h * 0.55);
        fog.addColorStop(0, "rgba(25, 23, 48, 0.0)");
        fog.addColorStop(0.5, "rgba(219, 228, 255, 0.06)");
        fog.addColorStop(1, "rgba(10, 10, 24, 0.18)");
        ctx.fillStyle = fog;
        ctx.fillRect(-w * 0.5, h * 0.35, w * 2.0, h * 0.3);

        // Near mountain range
        ctx.fillStyle = "#090a19";
        ctx.beginPath();
        ctx.moveTo(-w * 0.5, h * 1.5);
        const peakHeights2 = [0.14, 0.18, 0.15, 0.10, 0.20, 0.24, 0.16, 0.21, 0.18, 0.13, 0.15];
        for (let i = 0; i <= 20; i++) {
          const t = i / 20;
          const x = (t * 2.0 - 0.5) * w;
          const y = h * 0.54 - peakHeights2[i % peakHeights2.length] * baseScale;
          ctx.lineTo(x, y);

          // Waterfall chasm representation
          if (i === 6) {
            ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + 2, y + 60);
            ctx.stroke();

            // Splash mist
            ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
            ctx.beginPath();
            ctx.arc(x + 2, y + 60, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#090a19";
          }
        }
        ctx.lineTo(w * 1.5, h * 1.5);
        ctx.closePath();
        ctx.fill();
      };
      drawMountains();

      // 7. Shoreline dense pine forest
      const drawPineForest = () => {
        const pineCoords = [
          { nx: 0.12, ny: 0.52 }, { nx: 0.15, ny: 0.54 }, { nx: 0.18, ny: 0.51 },
          { nx: 0.80, ny: 0.55 }, { nx: 0.83, ny: 0.53 }, { nx: 0.86, ny: 0.56 },
          { nx: 0.26, ny: 0.78 }, { nx: 0.74, ny: 0.80 }
        ];
        ctx.fillStyle = "#030409";
        pineCoords.forEach(tree => {
          const tx = toScreenX(tree.nx);
          const ty = toScreenY(tree.ny);
          const sway = Math.sin(tNow * 0.0015 + tree.nx * 25) * 1.4;

          ctx.beginPath();
          ctx.moveTo(tx + sway, ty - 22);
          ctx.lineTo(tx - 7, ty - 2);
          ctx.lineTo(tx + 7, ty - 2);
          ctx.closePath();
          ctx.fill();
        });
      };
      drawPineForest();

      // 8. Bridge and boats
      const drawBridgeAndBoats = () => {
        // Wooden bridge left corner
        const brX = toScreenX(0.18);
        const brY = toScreenY(0.70);
        ctx.strokeStyle = "#0d0e1b";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(brX - 25, brY);
        ctx.lineTo(brX + 25, brY);
        ctx.stroke();

        ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(brX - 25, brY - 4);
        ctx.lineTo(brX + 25, brY - 4);
        ctx.stroke();

        // Wooden rowboats bobbing gently
        boatsRef.current.forEach(boat => {
          boat.bobPhase += 0.015;
          const bx = toScreenX(boat.nx);
          const by = toScreenY(boat.ny) + Math.sin(boat.bobPhase) * 1.8;
          const bScale = boat.scale;

          ctx.save();
          ctx.translate(bx, by);
          ctx.rotate(Math.sin(boat.bobPhase * 0.5) * 0.04);
          ctx.fillStyle = "#06070f";
          ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
          ctx.lineWidth = 1.0;

          // Draw simple oval rowboat hull
          ctx.beginPath();
          ctx.ellipse(0, 0, 16 * bScale, 6 * bScale, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Bench line
          ctx.beginPath();
          ctx.moveTo(-4, -4);
          ctx.lineTo(-4, 4);
          ctx.stroke();

          ctx.restore();
        });
      };
      drawBridgeAndBoats();

      // 9. Floating lanterns shoreline reflections
      lanternsRef.current.forEach(lan => {
        lan.flickerOffset += 0.08;
        const lx = toScreenX(lan.nx);
        const ly = toScreenY(lan.ny) + Math.sin(lan.flickerOffset * 0.2) * 0.8;
        const currentGlow = 0.75 + Math.sin(lan.flickerOffset) * 0.20;

        // Long golden reflection in the water
        const refGrad = ctx.createLinearGradient(lx, ly, lx, ly + 40);
        refGrad.addColorStop(0, `rgba(251, 146, 60, ${currentGlow * 0.35})`);
        refGrad.addColorStop(0.3, `rgba(251, 191, 36, ${currentGlow * 0.15})`);
        refGrad.addColorStop(1.0, "rgba(251, 191, 36, 0)");
        ctx.fillStyle = refGrad;
        ctx.fillRect(lx - 4, ly + 2, 8, 40);

        // Lantern body
        ctx.fillStyle = "#0c0d18";
        ctx.fillRect(lx - 3, ly - 6, 6, 8);
        ctx.fillStyle = `rgba(251, 146, 60, ${currentGlow})`;
        ctx.shadowBlur = 10 * currentGlow;
        ctx.shadowColor = "rgba(251, 146, 60, 0.9)";
        ctx.fillRect(lx - 2, ly - 4, 4, 5);
        ctx.shadowBlur = 0;
      });

      // 10. Draw Wavy/Shimmering Moon reflection path on the water
      const drawMoonpath = () => {
        if (phaseRef.current === "ended") return;

        ctx.fillStyle = "rgba(255, 253, 240, 0.08)";
        ctx.shadowBlur = 12;
        ctx.shadowColor = "rgba(255, 253, 240, 0.25)";

        for (let rowY = toScreenY(0.48); rowY < toScreenY(0.95); rowY += 12) {
          const relativeScale = (rowY - toScreenY(0.48)) / baseScale;
          const width = 12 + relativeScale * 180;
          const shift = Math.sin(tNow * 0.0015 + rowY * 0.2) * (3 + relativeScale * 10);

          ctx.fillRect(moonX + shift - width * 0.5, rowY, width, 1.5);
        }
        ctx.shadowBlur = 0;
      };
      drawMoonpath();

      // 11. Water Ripples system update & rendering
      ripplesRef.current.forEach(rip => {
        rip.radius += 0.45;
        rip.alpha = Math.max(0.0, 1.0 - rip.radius / rip.maxRadius);

        if (rip.alpha > 0.0) {
          ctx.strokeStyle = rip.color.replace("ALPHA", rip.alpha.toString());
          ctx.lineWidth = 1.0;
          ctx.beginPath();
          ctx.ellipse(toScreenX(rip.nx), toScreenY(rip.ny), rip.radius * 2.2, rip.radius * 0.75, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
      });
      ripplesRef.current = ripplesRef.current.filter(rip => rip.alpha > 0.0);

      // Trigger random ripples in the background lake
      if (Math.random() < 0.015 && phaseRef.current !== "ended") {
        ripplesRef.current.push({
          nx: 0.15 + Math.random() * 0.7,
          ny: 0.58 + Math.random() * 0.35,
          radius: 1,
          maxRadius: 25 + Math.random() * 25,
          alpha: 1.0,
          color: "rgba(255, 255, 255, ALPHA)",
        });
      }

      // Draw small wooden dock projecting from left shoreline
      const drawWoodenDock = () => {
        const dkX = toScreenX(0.28);
        const dkY = toScreenY(0.72);
        ctx.save();
        ctx.fillStyle = "#04050a";
        ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
        ctx.lineWidth = 1.0;

        // Dock pillars
        ctx.fillRect(dkX - 10, dkY - 2, 4, 18);
        ctx.fillRect(dkX + 10, dkY - 2, 4, 18);
        ctx.strokeRect(dkX - 10, dkY - 2, 4, 18);
        ctx.strokeRect(dkX + 10, dkY - 2, 4, 18);

        // Dock platform
        ctx.fillStyle = "#070711";
        ctx.fillRect(dkX - 18, dkY - 4, 36, 4);
        ctx.strokeRect(dkX - 18, dkY - 4, 36, 4);
        ctx.restore();
      };
      drawWoodenDock();

      // 12. Swan state machine glide and painting curves
      const s1 = swan1Ref.current;
      const s2 = swan2Ref.current;

      const updateSwans = () => {
        if (phaseRef.current === "opening" || phaseRef.current === "scene1_breathing" || phaseRef.current === "ended") {
          return; // Wait
        }

        // Glide onto paths in Scene 2
        if (phaseRef.current === "scene2_swans_appear") {
          const speed = 0.015;
          s1.nx += (points2[0].nx - s1.nx) * speed;
          s1.ny += (points2[0].ny - s1.ny) * speed;
          s1.currentAngle = Math.atan2(points2[0].ny - s1.ny, points2[0].nx - s1.nx);

          s2.nx += (points2[points2.length - 1].nx - s2.nx) * speed;
          s2.ny += (points2[points2.length - 1].ny - s2.ny) * speed;
          s2.currentAngle = Math.atan2(points2[points2.length - 1].ny - s2.ny, points2[points2.length - 1].nx - s2.nx);
        }

        // Draw "2" trails in Scene 3
        else if (phaseRef.current === "scene3_drawing") {
          const elapsed = tNow - phaseStartTimeRef.current;
          const progress = Math.min(1.0, elapsed / 10500); // 10.5 seconds to trace

          // Swan 1 traces the upper curve (indices 0 to 82)
          const targetIndex1 = Math.floor(progress * 82);
          const p1 = points2[Math.min(targetIndex1, 82)];
          const prevP1 = points2[Math.max(0, targetIndex1 - 1)];
          s1.nx = p1.nx;
          s1.ny = p1.ny;
          s1.currentAngle = Math.atan2(p1.ny - prevP1.ny, p1.nx - prevP1.nx);

          // Swan 2 traces the base line (indices 119 down to 82)
          const totalBasePoints = 119 - 82;
          const targetIndex2 = 119 - Math.floor(progress * totalBasePoints);
          const p2 = points2[Math.max(82, targetIndex2)];
          const prevP2 = points2[Math.min(119, targetIndex2 + 1)];
          s2.nx = p2.nx;
          s2.ny = p2.ny;
          s2.currentAngle = Math.atan2(p2.ny - prevP2.ny, p2.nx - prevP2.nx);

          // Add glowing points to trail
          if (tNow % 4 === 0) {
            trailPointsRef.current.push({ nx: s1.nx, ny: s1.ny, alpha: 1.0, id: Math.random() });
            trailPointsRef.current.push({ nx: s2.nx, ny: s2.ny, alpha: 1.0, id: Math.random() });

            if (Math.random() < 0.15 && synthRef.current) {
              synthRef.current.playWaterChime();
            }
          }
        }

        // Meet in the center to form a heart in Scene 4, 5, 6 (until feather lands)
        else if (phaseRef.current === "scene4_heart" || phaseRef.current === "scene5_reveal" || (phaseRef.current === "scene6_feather" && !featherRef.current.landed)) {
          const centerLX = 0.49;
          const centerLY = 0.375;
          const centerRX = 0.51;
          const centerRY = 0.375;

          const speed = 0.024;
          s1.nx += (centerLX - s1.nx) * speed;
          s1.ny += (centerLY - s1.ny) * speed;
          s1.currentAngle = Math.atan2(centerLY - s1.ny, centerLX - s1.nx);

          s2.nx += (centerRX - s2.nx) * speed;
          s2.ny += (centerRY - s2.ny) * speed;
          s2.currentAngle = Math.atan2(centerRY - s2.ny, centerRX - s2.nx);
        }

        // Scene 6 (after landing), 7 (ending) & 8 (fade_moon): swim away gracefully
        else if (phaseRef.current === "scene7_ending" || phaseRef.current === "scene8_fade_moon" || (phaseRef.current === "scene6_feather" && featherRef.current.landed)) {
          const speed = 0.0035;
          s1.nx -= speed * 0.6;
          s1.ny += speed * 0.15;
          s1.currentAngle = Math.PI * 0.95;

          s2.nx += speed * 0.6;
          s2.ny += speed * 0.15;
          s2.currentAngle = Math.PI * 0.05;
        }
      };
      updateSwans();

      // 13. Draw the swan coordinates glowing curves trails (Golden light trails)
      const drawSwanTrails = () => {
        if (phaseRef.current === "opening" || phaseRef.current === "scene1_breathing" || phaseRef.current === "scene2_swans_appear") {
          return;
        }

        // Draw a very soft, faint, blurred continuous curve beneath the shimmering ripples
        if (trailPointsRef.current.length > 1) {
          ctx.save();
          ctx.strokeStyle = "rgba(251, 191, 36, 0.05)";
          ctx.lineWidth = 4;
          ctx.shadowBlur = 12;
          ctx.shadowColor = "rgba(251, 191, 36, 0.35)";
          ctx.beginPath();
          trailPointsRef.current.forEach((pt, idx) => {
            const px = toScreenX(pt.nx);
            const py = toScreenY(pt.ny);
            if (idx === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          });
          ctx.stroke();
          ctx.restore();
        }

        // Decay or pulse trails
        trailPointsRef.current.forEach(pt => {
          if (phaseRef.current === "scene6_feather" || phaseRef.current === "scene7_ending" || phaseRef.current === "scene8_fade_moon") {
            pt.alpha = Math.max(0.0, pt.alpha - 0.004); // Slowly dissolve
          } else {
            pt.alpha = 0.8 + 0.2 * Math.sin(tNow * 0.002 + pt.nx * 20); // Golden pulse
          }

          if (pt.alpha > 0.0) {
            const px = toScreenX(pt.nx);
            const py = toScreenY(pt.ny);

            // Calculate a horizontal stretch width that oscillates to simulate lake shimmer
            const relativeWidth = 14 * pt.alpha;
            const width = relativeWidth + Math.sin(tNow * 0.006 + pt.id * 100) * (4 * pt.alpha);
            const height = 1.2;

            const grad = ctx.createLinearGradient(px - width / 2, py, px + width / 2, py);
            grad.addColorStop(0, "rgba(251, 191, 36, 0)");
            grad.addColorStop(0.5, `rgba(251, 191, 36, ${pt.alpha * 0.75})`);
            grad.addColorStop(1, "rgba(251, 191, 36, 0)");

            ctx.fillStyle = grad;
            ctx.shadowBlur = 5 * pt.alpha;
            ctx.shadowColor = "rgba(251, 191, 36, 0.55)";
            ctx.fillRect(px - width / 2, py, width, height);
            ctx.shadowBlur = 0;
          }
        });
        trailPointsRef.current = trailPointsRef.current.filter(pt => pt.alpha > 0.0);
      };
      drawSwanTrails();

      // 14. Draw Swans (SVG curves / Canvas paths)
      const drawSwan = (sw: { nx: number; ny: number; currentAngle: number }, reverseWing: boolean) => {
        if (phaseRef.current === "opening" || phaseRef.current === "ended") return;

        const sx = toScreenX(sw.nx);
        const sy = toScreenY(sw.ny);

        ctx.save();
        ctx.translate(sx, sy);
        ctx.scale(reverseWing ? -1 : 1, 1);

        // Water reflection glow around swan
        const glowGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, 16);
        glowGrad.addColorStop(0, "rgba(255, 255, 255, 0.15)");
        glowGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(0, 0, 16, 0, Math.PI * 2);
        ctx.fill();

        // 14A. Neck Heart Curve (if in heart neck-lock phase)
        const isH = phaseRef.current === "scene4_heart" || phaseRef.current === "scene5_reveal" || (phaseRef.current === "scene6_feather" && !featherRef.current.landed);

        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2.4;
        ctx.lineCap = "round";
        ctx.shadowBlur = 6;
        ctx.shadowColor = "rgba(255, 255, 255, 0.5)";

        if (isH) {
          // Draw graceful S-like heart curve segment
          ctx.beginPath();
          ctx.moveTo(-4, 1);
          ctx.bezierCurveTo(-14, -8, -12, -22, -2, -24);
          ctx.bezierCurveTo(4, -25, 6, -18, 5, -16);
          ctx.stroke();

          // Swan head
          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.arc(5, -16, 2.2, 0, Math.PI * 2);
          ctx.fill();

          // Beak (Orange)
          ctx.fillStyle = "#fb923c";
          ctx.beginPath();
          ctx.moveTo(7, -17);
          ctx.lineTo(11, -15);
          ctx.lineTo(7, -14);
          ctx.closePath();
          ctx.fill();
        } else {
          // Normal neck profile based on angle
          ctx.beginPath();
          ctx.moveTo(-3, 1);
          ctx.quadraticCurveTo(4, -6, 2, -16);
          ctx.stroke();

          // Swan head
          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.arc(2, -16, 2.0, 0, Math.PI * 2);
          ctx.fill();

          // Beak
          ctx.fillStyle = "#fb923c";
          ctx.beginPath();
          ctx.moveTo(3.8, -17);
          ctx.lineTo(8.0, -15.5);
          ctx.lineTo(3.8, -14);
          ctx.closePath();
          ctx.fill();
        }
        ctx.shadowBlur = 0;

        // 14B. Swan Body
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.ellipse(-6, 2, 8.5, 4.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Wing layer
        ctx.fillStyle = "#f3f4f6";
        ctx.beginPath();
        ctx.ellipse(-7, 1, 6.5, 3.2, -0.08, 0, Math.PI * 2);
        ctx.fill();

        // Water ripples from base
        ctx.strokeStyle = "rgba(255, 255, 255, 0.22)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(-6, 4, 11, 3.5, 0, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
      };

      // Draw Swan 1 (facing right) & Swan 2 (facing left, reversed scale)
      drawSwan(s1, false);
      drawSwan(s2, true);

      // 15. Falling feather logic and ripple-2 expansion in Scene 6
      if (phaseRef.current === "scene6_feather") {
        const feather = featherRef.current;
        if (!feather.landed) {
          feather.driftPhase += 0.035;
          // Slowly drop and drift left/right
          feather.ny += feather.speedY;
          feather.nx += Math.sin(feather.driftPhase) * feather.speedX;
          feather.angle = Math.sin(feather.driftPhase * 0.6) * 0.45;

          const fX = toScreenX(feather.nx);
          const fY = toScreenY(feather.ny);

          // Draw floating white feather
          ctx.save();
          ctx.translate(fX, fY);
          ctx.rotate(feather.angle);

          ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
          ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
          ctx.shadowBlur = 8;
          ctx.shadowColor = "rgba(255, 255, 255, 0.6)";

          ctx.beginPath();
          ctx.ellipse(0, 0, 7, 2, -Math.PI / 4, 0, Math.PI * 2);
          ctx.fill();

          ctx.beginPath();
          ctx.moveTo(-6, 4);
          ctx.quadraticCurveTo(0, 0, 6, -4);
          ctx.stroke();
          ctx.restore();
          ctx.shadowBlur = 0;

          // Check landing contact
          if (feather.ny >= 0.58) {
            feather.landed = true;
            if (synthRef.current) {
              synthRef.current.playWaterChime();
            }

            // Trigger the massive expanding final number 2 ripple
            featherRippleRef.current = {
              nx: feather.nx,
              ny: feather.ny,
              radius: 1,
              maxRadius: 380,
              alpha: 1.0,
              color: "rgba(255, 253, 240, ALPHA)",
            };
          }
        }
      }

      // Draw expanding feather ripple numbers (sweep intersection glow)
      if (featherRippleRef.current) {
        const rip = featherRippleRef.current;
        rip.radius += 1.45; // slightly faster sweep expansion
        rip.alpha = Math.max(0.0, 1.0 - rip.radius / rip.maxRadius);

        if (rip.alpha > 0.0) {
          const lX = toScreenX(rip.nx);
          const lY = toScreenY(rip.ny);

          // Render physical circular ripple line
          ctx.save();
          ctx.strokeStyle = `rgba(255, 253, 240, ${rip.alpha * 0.18})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.ellipse(lX, lY, rip.radius * 2.2, rip.radius * 0.75, 0, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();

          // Calculate intersection and draw shimmering path of 2
          points2.forEach((pt, idx) => {
            const px = toScreenX(pt.nx);
            const py = toScreenY(pt.ny);

            const dx = px - lX;
            const dy = py - lY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // If the circular ripple crosses this point, illuminate it
            if (Math.abs(dist - rip.radius) < 24) {
              const diffRatio = Math.max(0, 1 - Math.abs(dist - rip.radius) / 24);
              const pointAlpha = diffRatio * rip.alpha;

              if (pointAlpha > 0.01) {
                // Draw horizontal shimmering reflection
                const relativeWidth = 18 * pointAlpha;
                const width = relativeWidth + Math.sin(tNow * 0.008 + idx * 3) * (5 * pointAlpha);
                const height = 1.4;

                const grad = ctx.createLinearGradient(px - width / 2, py, px + width / 2, py);
                grad.addColorStop(0, "rgba(255, 253, 240, 0)");
                grad.addColorStop(0.5, `rgba(255, 253, 240, ${pointAlpha * 0.90})`);
                grad.addColorStop(1, "rgba(255, 253, 240, 0)");

                ctx.save();
                ctx.fillStyle = grad;
                ctx.shadowBlur = 10 * pointAlpha;
                ctx.shadowColor = "rgba(255, 253, 240, 0.75)";
                ctx.fillRect(px - width / 2, py, width, height);
                ctx.restore();
              }
            }
          });
        } else {
          featherRippleRef.current = null;
        }
      }

      // 16. Lotuses and Lily pads rendering
      lotusesRef.current.forEach(lot => {
        const lx = toScreenX(lot.nx);
        const ly = toScreenY(lot.ny);
        const lSize = lot.size;

        ctx.save();
        ctx.translate(lx, ly);

        // Lily pad (green)
        ctx.fillStyle = "rgba(20, 83, 45, 0.35)";
        ctx.beginPath();
        ctx.ellipse(0, 2, lSize * 1.5, lSize * 0.6, 0, 0, Math.PI * 1.85);
        ctx.fill();

        if (phaseRef.current !== "ended") {
          // Petals (colored chimes)
          ctx.fillStyle = lot.color;
          ctx.beginPath();
          ctx.arc(-2, -1, lSize * 0.4, 0, Math.PI * 2);
          ctx.arc(2, -1, lSize * 0.4, 0, Math.PI * 2);
          ctx.arc(0, -3, lSize * 0.5, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      });

      // 17. Fireflies
      firefliesRef.current.forEach(f => {
        f.x += f.vx;
        f.y += f.vy;
        f.vx += (Math.random() - 0.5) * 0.0001;
        f.vy += (Math.random() - 0.5) * 0.0001;

        if (f.x < 0) f.x = 1.0;
        if (f.x > 1.0) f.x = 0;
        if (f.y < 0.45) f.y = 0.95;
        if (f.y > 1.0) f.y = 0.45;

        f.pulsePhase += f.pulseSpeed;
        const currentAlpha = Math.max(0.1, Math.min(1.0, f.alpha + Math.sin(f.pulsePhase) * 0.4));

        ctx.fillStyle = `rgba(180, 240, 60, ${currentAlpha * 0.85})`;
        ctx.shadowBlur = 8 * currentAlpha;
        ctx.shadowColor = "rgba(180, 240, 60, 0.8)";
        ctx.beginPath();
        ctx.arc(toScreenX(f.x), toScreenY(f.y), f.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // 18. Floating Sparkles
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

      ctx.restore();

      // Zoom-to-moon screen fadeout
      if (phaseRef.current === "scene8_fade_moon") {
        const elapsed = tNow - phaseStartTimeRef.current;
        const progress = Math.min(1.0, elapsed / 4000);
        ctx.fillStyle = `rgba(0, 0, 0, ${progress})`;
        ctx.fillRect(0, 0, w, h);
      }

      animationFrameIdRef.current = requestAnimationFrame(animationLoop);
    };

    animationLoop();

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [points2]);

  // Skip Intro click handler
  const handleSkip = () => {
    timersRef.current.forEach(t => clearTimeout(t));
    timersRef.current = [];
    setPhase("ended");
  };

  const isPlaying = phase !== "ended";

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-center items-center overflow-hidden bg-black text-amber-50 select-none">

      {/* Cinematic background canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full pointer-events-none z-0" />

      {/* Skip Intro Option */}
      <AnimatePresence>
        {isPlaying && phase !== "scene8_fade_moon" && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.65 }}
            exit={{ opacity: 0 }}
            whileHover={{ opacity: 1.0, scale: 1.05 }}
            onClick={handleSkip}
            className="absolute top-6 right-6 z-50 rounded-full border border-white/20 bg-black/40 hover:bg-white/10 px-4 py-2 text-xs font-semibold text-white/95 backdrop-blur-sm transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span>Skip Intro</span>
            <span>⏭️</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Audio initialization hint overlay */}
      <AnimatePresence>
        {audioHintVisible && isPlaying && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 0.8, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.0 }}
            className="absolute top-8 z-50 pointer-events-none rounded-full border border-white/10 bg-black/45 px-5 py-2 text-xs font-semibold text-white/80 backdrop-blur-sm animate-pulse"
          >
            🎵 Tap anywhere to enable romantic lake music & chimes
          </motion.div>
        )}
      </AnimatePresence>

      {/* RENDER CINEMATIC TEXT OVERLAYS */}
      <AnimatePresence>
        {isPlaying && (
          <div className="absolute inset-x-8 top-[30%] pointer-events-none z-30 flex flex-col items-center text-center select-none">

            {phase === "opening" && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="max-w-2xl"
              >
                <h2 className={`${playfair.className} text-3xl font-light tracking-wide text-amber-100/90 md:text-5xl leading-relaxed`}>
                  Some journeys...
                </h2>
                <h3 className={`${playfair.className} mt-6 text-2.5xl font-light tracking-wide text-white/90 md:text-4.5xl leading-relaxed`}>
                  don't begin with words...<br />they begin with destiny. ❤️
                </h3>
              </motion.div>
            )}

            {phase === "scene5_reveal" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="p-8 rounded-[2rem] border border-white/10 bg-black/45 backdrop-blur-[2px] shadow-2xl max-w-xl flex flex-col items-center gap-4"
              >
                <span className="text-pink-400 text-2.5xl flex items-center justify-center gap-1.5 animate-pulse">🦢🤍</span>
                <h1 className={`${playfair.className} text-4.5xl font-black md:text-6xl tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-300 to-amber-100 mt-2`}>
                  2 DAYS TO GO
                </h1>
                <span className="text-pink-400 text-2.5xl flex items-center justify-center gap-1.5 animate-pulse mt-2">🤍🦢</span>

                <p className={`${caveat.className} mt-4 text-2.2xl font-bold leading-relaxed text-amber-200/90 md:text-3xl`}>
                  "Only two more sunrises...<br />
                  until I finally celebrate<br />
                  my Mammoty's birthday. ❤️"
                </p>
              </motion.div>
            )}

            {phase === "scene7_ending" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.8, ease: "easeOut", delay: 0.8 }}
                className="max-w-lg p-5"
              >
                <p className={`${caveat.className} text-3.2xl font-bold leading-relaxed text-amber-100 drop-shadow-[0_2px_15px_rgba(0,0,0,0.95)]`}>
                  "Some souls were always meant to find each other. ❤️"
                </p>
              </motion.div>
            )}

          </div>
        )}
      </AnimatePresence>

      {/* RENDER BACK BUTTON AND SECRET MESSAGE AT THE END OF THE ANIMATION */}
      <AnimatePresence>
        {phase === "ended" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2 }}
            className="absolute inset-0 z-45 bg-black flex flex-col justify-center items-center p-6 md:p-12 overflow-y-auto"
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="max-w-md w-full rounded-[2rem] border border-amber-900/40 bg-amber-950/20 p-8 shadow-2xl backdrop-blur-md text-amber-50/95 flex flex-col gap-6"
            >
              <div className="absolute top-4 right-6 text-[10px] font-bold text-amber-600/40 tracking-widest select-none">
                🔒 CONFIDENTIAL NOTE
              </div>

              <div className="overflow-y-auto max-h-[50vh] pr-2">
                <p className={`${caveat.className} whitespace-pre-line text-2.5xl md:text-3xl font-bold leading-relaxed text-amber-100`}>
                  {SECRET_MESSAGE}
                </p>
              </div>

              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full rounded-2xl bg-gradient-to-r from-amber-800 to-amber-950 py-3.5 shadow-lg border border-amber-900 text-white font-bold tracking-wide transition cursor-pointer flex items-center justify-center gap-2"
              >
                <ArrowLeft size={16} />
                <span>← Back to Countdown</span>
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global CSS settings */}
      <style jsx global>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 12s linear infinite;
        }
      `}</style>

    </div>
  );
}
