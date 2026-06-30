"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowLeft, RefreshCw } from "lucide-react";
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
    gainNode.gain.linearRampToValueAtTime(gainValue * 0.15, startTime + 1.5);
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

    // Cinematic chords: Cmaj9, Gsus4, Am9, Fmaj7
    const chords = [
      [130.81, 196.00, 261.63, 329.63, 392.00, 493.88], // Cmaj9
      [146.83, 220.00, 293.66, 392.00, 440.00, 587.33], // Gsus4
      [110.00, 220.00, 293.66, 349.23, 440.00, 587.33], // Am9
      [174.61, 261.63, 349.23, 440.00, 523.25, 659.25]  // Fmaj7
    ];

    let currentChord = 0;
    const playNext = () => {
      if (this.isMuted || !this.ctx) return;
      const notes = chords[currentChord];
      const now = this.ctx.currentTime;
      const chordDuration = 9.0;

      notes.forEach((freq, i) => {
        const delay = i * 0.25;
        const volume = i === 0 ? 0.35 : 0.20;
        this.playTone(freq, now + delay, chordDuration - delay, volume);
      });

      currentChord = (currentChord + 1) % chords.length;
      this.timer = setTimeout(playNext, 8500);
    };

    playNext();
  }

  playChurchBells() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    
    for (let toll = 0; toll < 3; toll++) {
      const startTime = now + toll * 2.2;
      const baseFreq = 164.81; // E3 note
      
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
        gainNode.gain.linearRampToValueAtTime(partial.vol * 0.3, startTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + 6.0);

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
  | "scene8_one_light"
  | "scene9_quote"
  | "scene10_fade_moon"
  | "interactive_chest";

interface StaticHouse {
  id: number;
  nx: number;
  ny: number;
  type: "house" | "cottage" | "church";
  sizeMultiplier: number;
  wallColor: string;
  roofColor: string;
  isBrightest: boolean;
}

interface VillageLight {
  id: number;
  nx: number;
  ny: number;
  type: "window" | "streetlamp" | "fairy" | "garden" | "church" | "bridge";
  isPart4: boolean;
  isPart3: boolean;
  isBrightest: boolean;
  currentLight: number;
  targetLight: number;
  pulseOffset: number;
  color: string;
  size: number;
  // Optional string index to draw physical cables between fairy light bulbs
  stringIndex?: number;
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

interface FairyStringPath {
  points: { nx: number; ny: number }[];
  isPart4: boolean;
  isPart3: boolean;
  color: string;
}

export default function BirthdayThreeReveal({ onClose }: BirthdayThreeRevealProps) {
  const [phase, setPhase] = useState<Phase>("opening");
  const [musicEnabled, setMusicEnabled] = useState(false);
  const [chestOpened, setChestOpened] = useState(false);
  const [letterOpened, setLetterOpened] = useState(false);
  const [chestDissolved, setChestDissolved] = useState(false);
  const [audioHintVisible, setAudioHintVisible] = useState(true);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const synthRef = useRef<MountainVillageSynth | null>(null);
  const phaseRef = useRef<Phase>("opening");
  
  // Drone camera rig
  const cameraRef = useRef({
    x: 0,
    y: 0,
    scale: 1.0,
    targetX: 0,
    targetY: 0,
    targetScale: 1.0,
  });

  // Entities
  const starsRef = useRef<Star[]>([]);
  const cloudsRef = useRef<Cloud[]>([]);
  const firefliesRef = useRef<Firefly[]>([]);
  const sparklesRef = useRef<FloatingSparkle[]>([]);
  const fireworksRef = useRef<Firework[]>([]);
  
  // Real Village Static Layout
  const staticHousesRef = useRef<StaticHouse[]>([]);
  // Synchronized Light Show Bulbs
  const lightsRef = useRef<VillageLight[]>([]);
  // Hanging Fairy Wires
  const fairyStringsRef = useRef<FairyStringPath[]>([]);

  const animationFrameIdRef = useRef<number | null>(null);
  const timersRef = useRef<NodeJS.Timeout[]>([]);
  const phaseStartTimeRef = useRef(Date.now());

  useEffect(() => {
    phaseRef.current = phase;
    phaseStartTimeRef.current = Date.now();
  }, [phase]);

  // Handle first tap audio init
  useEffect(() => {
    synthRef.current = new MountainVillageSynth();

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

  // Initialize fully realistic static village elements and overlay lights
  const initializeEntities = () => {
    // 1. Stars
    const stars: Star[] = [];
    for (let i = 0; i < 240; i++) {
      stars.push({
        x: Math.random(),
        y: Math.random() * 0.55,
        size: 0.5 + Math.random() * 1.5,
        alpha: 0.15 + Math.random() * 0.85,
        twinkleSpeed: 0.015 + Math.random() * 0.035,
        twinklePhase: Math.random() * Math.PI * 2,
      });
    }
    starsRef.current = stars;

    // 2. Clouds
    const clouds: Cloud[] = [];
    for (let i = 0; i < 5; i++) {
      clouds.push({
        x: Math.random() * 1.5 - 0.25,
        y: 0.04 + Math.random() * 0.20,
        width: 0.22 + Math.random() * 0.2,
        height: 0.05 + Math.random() * 0.04,
        speed: 0.00025 + Math.random() * 0.0003,
        alpha: 0.08 + Math.random() * 0.12,
      });
    }
    cloudsRef.current = clouds;

    // 3. Fireflies
    const fireflies: Firefly[] = [];
    for (let i = 0; i < 45; i++) {
      fireflies.push({
        x: Math.random(),
        y: 0.45 + Math.random() * 0.5,
        size: 0.9 + Math.random() * 1.6,
        vx: (Math.random() - 0.5) * 0.0008,
        vy: (Math.random() - 0.5) * 0.0008,
        alpha: 0.2 + Math.random() * 0.8,
        pulsePhase: Math.random() * Math.PI * 2,
        pulseSpeed: 0.02 + Math.random() * 0.04,
      });
    }
    firefliesRef.current = fireflies;

    // 4. Sparkles
    const sparkles: FloatingSparkle[] = [];
    for (let i = 0; i < 50; i++) {
      sparkles.push({
        x: Math.random(),
        y: Math.random(),
        vx: (Math.random() - 0.5) * 0.0006,
        vy: -0.0004 - Math.random() * 0.0008,
        size: 0.8 + Math.random() * 1.8,
        alpha: 0.1 + Math.random() * 0.6,
        color: "rgba(251, 191, 36, " + (0.3 + Math.random() * 0.5) + ")",
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.03 + Math.random() * 0.06,
      });
    }
    sparklesRef.current = sparkles;

    // 5. Generate Real Static Houses (Natural cluster streets layout)
    const houses: StaticHouse[] = [];
    let lightId = 0;
    
    // Winding street paths to structure buildings realistically
    const street1Y = (x: number) => 0.54 + 0.06 * Math.sin((x - 0.2) * 5);
    const street2Y = (x: number) => 0.72 + 0.04 * Math.sin(x * 6);

    const houseWallColors = ["#0e0f21", "#0b0c1b", "#14152b", "#101126", "#0a0b18"];
    const houseRoofColors = ["#070814", "#0b0404", "#04090c", "#050611", "#09030c"];

    // Central Stated Church
    houses.push({
      id: 0,
      nx: 0.48,
      ny: 0.46,
      type: "church",
      sizeMultiplier: 1.8,
      wallColor: "#0f1026",
      roofColor: "#1a0808",
      isBrightest: false,
    });

    // Special Brightest Cottage (Mammoty's House)
    houses.push({
      id: 1,
      nx: 0.56,
      ny: 0.55, // Located on the light intersections
      type: "cottage",
      sizeMultiplier: 1.5,
      wallColor: "#12142e",
      roofColor: "#180a0a",
      isBrightest: true,
    });

    // Generate normal houses along streets organically
    let houseIdCounter = 2;
    for (let x = 0.16; x <= 0.84; x += 0.045) {
      // Row 1 street
      if (Math.abs(x - 0.48) > 0.06 && Math.abs(x - 0.56) > 0.05) {
        houses.push({
          id: houseIdCounter++,
          nx: x + (Math.random() - 0.5) * 0.015,
          ny: street1Y(x) + (Math.random() - 0.5) * 0.02,
          type: Math.random() < 0.25 ? "cottage" : "house",
          sizeMultiplier: 0.85 + Math.random() * 0.3,
          wallColor: houseWallColors[Math.floor(Math.random() * houseWallColors.length)],
          roofColor: houseRoofColors[Math.floor(Math.random() * houseRoofColors.length)],
          isBrightest: false,
        });
      }
      
      // Row 2 street
      houses.push({
        id: houseIdCounter++,
        nx: x + (Math.random() - 0.5) * 0.015,
        ny: street2Y(x) + (Math.random() - 0.5) * 0.02,
        type: Math.random() < 0.22 ? "cottage" : "house",
        sizeMultiplier: 0.85 + Math.random() * 0.3,
        wallColor: houseWallColors[Math.floor(Math.random() * houseWallColors.length)],
        roofColor: houseRoofColors[Math.floor(Math.random() * houseRoofColors.length)],
        isBrightest: false,
      });
    }

    // Add extra scatter houses on the mountain slopes
    const scatterCoords = [
      { x: 0.22, y: 0.36 }, { x: 0.30, y: 0.40 }, { x: 0.34, y: 0.37 },
      { x: 0.65, y: 0.38 }, { x: 0.70, y: 0.44 }, { x: 0.78, y: 0.42 }
    ];
    scatterCoords.forEach(pt => {
      houses.push({
        id: houseIdCounter++,
        nx: pt.x,
        ny: pt.y,
        type: "house",
        sizeMultiplier: 0.75 + Math.random() * 0.2,
        wallColor: houseWallColors[Math.floor(Math.random() * houseWallColors.length)],
        roofColor: houseRoofColors[Math.floor(Math.random() * houseRoofColors.length)],
        isBrightest: false,
      });
    });

    staticHousesRef.current = houses;

    // 6. Generate Village Lights System
    const lights: VillageLight[] = [];

    // Math function checks to tag lights representing 4 and 3
    const checkIsPart4 = (x: number, y: number): boolean => {
      // Stem: x=0.56, y from 0.28 to 0.74
      const onStem = Math.abs(x - 0.56) < 0.026 && y >= 0.28 && y <= 0.74;
      // Cross: y=0.55, x from 0.34 to 0.72
      const onCross = Math.abs(y - 0.55) < 0.026 && x >= 0.34 && x <= 0.72;
      // Diagonal: y = 0.55 - (0.56 - x) * 1.35
      const onDiag = Math.abs(y - (0.55 - (0.56 - x) * 1.35)) < 0.028 && x >= 0.36 && x <= 0.56;
      return onStem || onCross || onDiag;
    };

    const checkIsPart3 = (x: number, y: number): boolean => {
      // Concentric circles center/radius
      const cy3_t = 0.40, cy3_b = 0.62;
      const d1_t = Math.hypot(x - 0.50, y - cy3_t);
      const d1_b = Math.hypot(x - 0.50, y - cy3_b);

      const inTopCurve = (d1_t >= 0.115 && d1_t <= 0.155) && x >= 0.485;
      const inBotCurve = (d1_b >= 0.145 && d1_b <= 0.198) && (x >= 0.47 || y >= 0.64);
      return inTopCurve || inBotCurve;
    };

    // A. Add Window Lights for each house
    houses.forEach(house => {
      const isBr = house.isBrightest;
      
      if (house.type === "church") {
        // Stained glass center window
        lights.push({
          id: lightId++,
          nx: house.nx,
          ny: house.ny + 0.005,
          type: "church",
          isPart4: checkIsPart4(house.nx, house.ny + 0.005),
          isPart3: checkIsPart3(house.nx, house.ny + 0.005),
          isBrightest: false,
          currentLight: 0.0,
          targetLight: 0.0,
          pulseOffset: Math.random() * Math.PI * 2,
          color: "rgba(251, 146, 60, 0.95)",
          size: 4.5,
        });
        // Steeple top light
        lights.push({
          id: lightId++,
          nx: house.nx,
          ny: house.ny - 0.038,
          type: "church",
          isPart4: checkIsPart4(house.nx, house.ny - 0.038),
          isPart3: checkIsPart3(house.nx, house.ny - 0.038),
          isBrightest: false,
          currentLight: 0.0,
          targetLight: 0.0,
          pulseOffset: Math.random() * Math.PI * 2,
          color: "rgba(254, 240, 138, 0.95)",
          size: 2.2,
        });
      } else {
        // Left Window
        const wx1 = house.nx - 0.0045 * house.sizeMultiplier;
        const wy1 = house.ny - 0.002 * house.sizeMultiplier;
        lights.push({
          id: lightId++,
          nx: wx1,
          ny: wy1,
          type: "window",
          isPart4: checkIsPart4(wx1, wy1),
          isPart3: checkIsPart3(wx1, wy1),
          isBrightest: isBr,
          currentLight: 0.0,
          targetLight: 0.0,
          pulseOffset: Math.random() * Math.PI * 2,
          color: "rgba(251, 191, 36, 0.9)",
          size: 1.8 * house.sizeMultiplier,
        });

        // Right Window
        const wx2 = house.nx + 0.0045 * house.sizeMultiplier;
        const wy2 = house.ny - 0.002 * house.sizeMultiplier;
        lights.push({
          id: lightId++,
          nx: wx2,
          ny: wy2,
          type: "window",
          isPart4: checkIsPart4(wx2, wy2),
          isPart3: checkIsPart3(wx2, wy2),
          isBrightest: isBr,
          currentLight: 0.0,
          targetLight: 0.0,
          pulseOffset: Math.random() * Math.PI * 2,
          color: "rgba(251, 191, 36, 0.9)",
          size: 1.8 * house.sizeMultiplier,
        });
      }
    });

    // B. Add Winding Street Lamps
    for (let x = 0.18; x <= 0.82; x += 0.04) {
      const y1 = street1Y(x) + 0.03;
      lights.push({
        id: lightId++,
        nx: x,
        ny: y1,
        type: "streetlamp",
        isPart4: checkIsPart4(x, y1),
        isPart3: checkIsPart3(x, y1),
        isBrightest: false,
        currentLight: 0.0,
        targetLight: 0.0,
        pulseOffset: Math.random() * Math.PI * 2,
        color: "rgba(254, 240, 138, 0.95)",
        size: 2.2,
      });

      const y2 = street2Y(x) - 0.025;
      lights.push({
        id: lightId++,
        nx: x,
        ny: y2,
        type: "streetlamp",
        isPart4: checkIsPart4(x, y2),
        isPart3: checkIsPart3(x, y2),
        isBrightest: false,
        currentLight: 0.0,
        targetLight: 0.0,
        pulseOffset: Math.random() * Math.PI * 2,
        color: "rgba(254, 240, 138, 0.95)",
        size: 2.2,
      });
    }

    // C. Bridge Lamps (on the stone bridge)
    const bridgeX = 0.44;
    const bridgeY = 0.52;
    for (let bx = -15; bx <= 15; bx += 7.5) {
      const nx = bridgeX + bx * 0.0012;
      const ny = bridgeY - 0.01;
      lights.push({
        id: lightId++,
        nx,
        ny,
        type: "bridge",
        isPart4: checkIsPart4(nx, ny),
        isPart3: checkIsPart3(nx, ny),
        isBrightest: false,
        currentLight: 0.0,
        targetLight: 0.0,
        pulseOffset: Math.random() * Math.PI * 2,
        color: "rgba(253, 224, 71, 0.95)",
        size: 1.8,
      });
    }

    // D. Garden Floor decorative clusters
    const gardenPoints = [
      { x: 0.28, y: 0.60 }, { x: 0.35, y: 0.65 }, { x: 0.68, y: 0.62 },
      { x: 0.74, y: 0.69 }, { x: 0.51, y: 0.81 }, { x: 0.42, y: 0.78 }
    ];
    gardenPoints.forEach(pt => {
      for (let i = 0; i < 4; i++) {
        const lx = pt.x + (Math.random() - 0.5) * 0.024;
        const ly = pt.y + (Math.random() - 0.5) * 0.015;
        lights.push({
          id: lightId++,
          nx: lx,
          ny: ly,
          type: "garden",
          isPart4: checkIsPart4(lx, ly),
          isPart3: checkIsPart3(lx, ly),
          isBrightest: false,
          currentLight: 0.0,
          targetLight: 0.0,
          pulseOffset: Math.random() * Math.PI * 2,
          color: "rgba(251, 191, 36, 0.8)",
          size: 1.2,
        });
      }
    });

    // E. Synchronized Fairy Garland Strings (Light show wires)
    // These wires hang between street posts/roofs and map the number paths
    const strings: FairyStringPath[] = [];
    const stringsLightsCount = 20;

    // String for number 4 diagonal
    const s4_diag: FairyStringPath = { points: [], isPart4: true, isPart3: false, color: "rgba(251,191,36,0.85)" };
    for (let i = 0; i <= stringsLightsCount; i++) {
      const t = i / stringsLightsCount;
      s4_diag.points.push({ nx: 0.56 - t * 0.20, ny: 0.28 + t * 0.27 });
    }
    strings.push(s4_diag);

    // String for number 4 horizontal
    const s4_cross: FairyStringPath = { points: [], isPart4: true, isPart3: false, color: "rgba(251,191,36,0.85)" };
    for (let i = 0; i <= stringsLightsCount; i++) {
      const t = i / stringsLightsCount;
      s4_cross.points.push({ nx: 0.34 + t * 0.38, ny: 0.55 });
    }
    strings.push(s4_cross);

    // String for number 4 stem
    const s4_stem: FairyStringPath = { points: [], isPart4: true, isPart3: false, color: "rgba(251,191,36,0.85)" };
    for (let i = 0; i <= stringsLightsCount; i++) {
      const t = i / stringsLightsCount;
      s4_stem.points.push({ nx: 0.56, ny: 0.28 + t * 0.46 });
    }
    strings.push(s4_stem);

    // String 3 top outer loop
    const s3_t_out: FairyStringPath = { points: [], isPart4: false, isPart3: true, color: "rgba(251,191,36,0.9)" };
    for (let i = 0; i <= stringsLightsCount; i++) {
      const a = -Math.PI * 0.55 + (i / stringsLightsCount) * (Math.PI * 1.1);
      s3_t_out.points.push({ nx: 0.50 + 0.145 * Math.cos(a), ny: 0.40 + 0.145 * Math.sin(a) });
    }
    strings.push(s3_t_out);

    // String 3 top inner loop
    const s3_t_in: FairyStringPath = { points: [], isPart4: false, isPart3: true, color: "rgba(251,191,36,0.9)" };
    for (let i = 0; i <= stringsLightsCount; i++) {
      const a = -Math.PI * 0.52 + (i / stringsLightsCount) * (Math.PI * 1.04);
      s3_t_in.points.push({ nx: 0.50 + 0.125 * Math.cos(a), ny: 0.40 + 0.125 * Math.sin(a) });
    }
    strings.push(s3_t_in);

    // String 3 bottom outer loop
    const s3_b_out: FairyStringPath = { points: [], isPart4: false, isPart3: true, color: "rgba(251,191,36,0.9)" };
    for (let i = 0; i <= stringsLightsCount; i++) {
      const a = -Math.PI * 0.52 + (i / stringsLightsCount) * (Math.PI * 1.34);
      s3_b_out.points.push({ nx: 0.50 + 0.185 * Math.cos(a), ny: 0.62 + 0.185 * Math.sin(a) });
    }
    strings.push(s3_b_out);

    // String 3 bottom inner loop
    const s3_b_in: FairyStringPath = { points: [], isPart4: false, isPart3: true, color: "rgba(251,191,36,0.9)" };
    for (let i = 0; i <= stringsLightsCount; i++) {
      const a = -Math.PI * 0.50 + (i / stringsLightsCount) * (Math.PI * 1.30);
      s3_b_in.points.push({ nx: 0.50 + 0.155 * Math.cos(a), ny: 0.62 + 0.155 * Math.sin(a) });
    }
    strings.push(s3_b_in);

    // Background festival strings (to blend and represent overall village lighting)
    const backStrings = [
      { x1: 0.18, y1: 0.50, x2: 0.32, y2: 0.52 },
      { x1: 0.68, y1: 0.50, x2: 0.82, y2: 0.48 },
      { x1: 0.25, y1: 0.68, x2: 0.40, y2: 0.70 },
      { x1: 0.60, y1: 0.70, x2: 0.76, y2: 0.73 }
    ];
    backStrings.forEach((bStr, sIdx) => {
      const fStr: FairyStringPath = { points: [], isPart4: false, isPart3: false, color: "rgba(251,191,36,0.7)" };
      for (let i = 0; i <= 10; i++) {
        const t = i / 10;
        const nx = bStr.x1 + (bStr.x2 - bStr.x1) * t;
        const sag = 0.02 * Math.sin(t * Math.PI); // Sagging wire catenary look
        const ny = bStr.y1 + (bStr.y2 - bStr.y1) * t + sag;
        fStr.points.push({ nx, ny });
      }
      strings.push(fStr);
    });

    fairyStringsRef.current = strings;

    // Convert fairy string coordinates to lights
    strings.forEach((str, sIdx) => {
      str.points.forEach(pt => {
        lights.push({
          id: lightId++,
          nx: pt.nx,
          ny: pt.ny,
          type: "fairy",
          isPart4: str.isPart4,
          isPart3: str.isPart3,
          isBrightest: false,
          currentLight: 0.0,
          targetLight: 0.0,
          pulseOffset: Math.random() * Math.PI * 2,
          color: "rgba(253, 224, 71, 0.9)",
          size: 1.3,
          stringIndex: sIdx,
        });
      });
    });

    // Make sure Mammoty's window light is locked to isBrightest
    const brightestWindow = lights.find(l => l.isBrightest);
    if (brightestWindow) {
      brightestWindow.size = 3.5;
      brightestWindow.color = "rgba(249, 115, 22, 1.0)"; // Special intense sunset glow
    }

    lightsRef.current = lights;
  };

  const runSequenceTimeline = () => {
    timersRef.current.forEach(t => clearTimeout(t));
    timersRef.current = [];
    fireworksRef.current = [];
    setChestOpened(false);
    setLetterOpened(false);
    setChestDissolved(false);

    const delay = (fn: () => void, ms: number) => {
      timersRef.current.push(setTimeout(fn, ms));
    };

    // 0s: Opening pan
    setPhase("opening");

    // 4s: The Village Breathes (6s)
    delay(() => {
      setPhase("scene1_breathing");
    }, 4000);

    // 10s: First Blackout (2.5s)
    delay(() => {
      setPhase("scene2_blackout");
    }, 10000);

    // 12.5s: Yesterday - Number 4 Forms (8s)
    delay(() => {
      setPhase("scene3_number4");
    }, 12500);

    // 20.5s: Second Blackout (2.5s)
    delay(() => {
      setPhase("scene4_blackout");
    }, 20500);

    // 23s: Today - Number 3 Forms (8s)
    delay(() => {
      setPhase("scene5_number3");
    }, 23000);

    // 31s: Celebration - Background Lights turn on, 3 stays highlighted (8s)
    delay(() => {
      setPhase("scene6_celebration");
      if (synthRef.current) {
        synthRef.current.playChurchBells();
      }
    }, 31000);

    // 39s: Final Reveal Titles (7s)
    delay(() => {
      setPhase("final_reveal");
    }, 39000);

    // 46s: Emotional Ending - Everything dims together, leaving one (7s)
    delay(() => {
      setPhase("scene8_one_light");
    }, 46000);

    // 53s: Emotional Quote Display (5s)
    delay(() => {
      setPhase("scene9_quote");
    }, 53000);

    // 58s: Rise to Moon (4s)
    delay(() => {
      setPhase("scene10_fade_moon");
    }, 58000);

    // 62s: End sequence - Reveal Interactive Chest
    delay(() => {
      setPhase("interactive_chest");
    }, 62000);
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

      ctx.clearRect(0, 0, w, h);

      // 1. Sky Gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
      skyGrad.addColorStop(0, "#010103");
      skyGrad.addColorStop(0.35, "#090a16");
      skyGrad.addColorStop(0.70, "#131224");
      skyGrad.addColorStop(1.0, "#06050b");
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h);

      // 2. Twinkling Stars
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
      moonGlow.addColorStop(0.15, "rgba(255, 248, 225, 0.32)");
      moonGlow.addColorStop(0.40, "rgba(255, 242, 215, 0.08)");
      moonGlow.addColorStop(1.0, "rgba(255, 242, 215, 0)");
      ctx.fillStyle = moonGlow;
      ctx.beginPath();
      ctx.arc(moonX, moonY, moonR * 3.4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#fffdf3";
      ctx.shadowBlur = 22;
      ctx.shadowColor = "rgba(255, 251, 235, 0.65)";
      ctx.beginPath();
      ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.fillStyle = "rgba(235, 226, 198, 0.28)";
      ctx.beginPath();
      ctx.arc(moonX - moonR * 0.3, moonY + moonR * 0.25, moonR * 0.24, 0, Math.PI * 2);
      ctx.arc(moonX + moonR * 0.25, moonY - moonR * 0.38, moonR * 0.20, 0, Math.PI * 2);
      ctx.arc(moonX + moonR * 0.45, moonY + moonR * 0.12, moonR * 0.16, 0, Math.PI * 2);
      ctx.fill();

      // 4. Moving Clouds
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

      // 5. Camera transitions (Cinematic drone)
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
          cam.targetY = h * 0.01;
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
          cam.targetScale = 0.80;
          cam.targetX = w * 0.05;
          cam.targetY = -h * 0.08;
          break;
        case "scene6_celebration":
          cam.targetScale = 0.88;
          cam.targetX = 0;
          cam.targetY = -h * 0.05;
          break;
        case "final_reveal":
          cam.targetScale = 0.92;
          cam.targetX = 0;
          cam.targetY = -h * 0.06;
          break;
        case "scene8_one_light":
          const bLight = lightsRef.current.find(l => l.isBrightest);
          if (bLight) {
            const baseScale = Math.min(w, h) * 0.9;
            const lightSX = w / 2 + (bLight.nx - 0.5) * baseScale;
            const lightSY = h / 2 + (bLight.ny - 0.5) * baseScale;
            cam.targetScale = 2.6;
            cam.targetX = w / 2 - lightSX * 2.6;
            cam.targetY = h / 2 - (lightSY + 0.005 * baseScale) * 2.6;
          }
          break;
        case "scene9_quote":
          const bLightQ = lightsRef.current.find(l => l.isBrightest);
          if (bLightQ) {
            const baseScale = Math.min(w, h) * 0.9;
            const lightSX = w / 2 + (bLightQ.nx - 0.5) * baseScale;
            const lightSY = h / 2 + (bLightQ.ny - 0.5) * baseScale;
            cam.targetScale = 3.8;
            cam.targetX = w / 2 - lightSX * 3.8;
            cam.targetY = h / 2 - (lightSY + 0.005 * baseScale) * 3.8;
          }
          break;
        case "scene10_fade_moon":
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

      const baseScale = Math.min(w, h) * 0.9;
      const toScreenX = (nx: number) => w / 2 + (nx - 0.5) * baseScale;
      const toScreenY = (ny: number) => h / 2 + (ny - 0.5) * baseScale;

      // 6. Draw Mountains
      const drawMountainRange = (heightOffsets: number[], baseY: number, fillColor: string, fogGrad: CanvasGradient) => {
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

        ctx.fillStyle = fogGrad;
        ctx.fillRect(0 - w * 0.5, baseY - 0.15 * baseScale, w * 2.0, h);
      };

      const farMountainHeight = [0.22, 0.28, 0.20, 0.26, 0.35, 0.25, 0.18, 0.29, 0.33, 0.22, 0.26];
      const farFog = ctx.createLinearGradient(0, h * 0.25, 0, h * 0.5);
      farFog.addColorStop(0, "rgba(25, 23, 48, 0.0)");
      farFog.addColorStop(1, "rgba(9, 9, 21, 0.16)");
      drawMountainRange(farMountainHeight, h * 0.40, "#070714", farFog);

      const midMountainHeight = [0.12, 0.17, 0.15, 0.09, 0.18, 0.22, 0.14, 0.19, 0.16, 0.11, 0.13];
      const midFog = ctx.createLinearGradient(0, h * 0.38, 0, h * 0.65);
      midFog.addColorStop(0, "rgba(25, 23, 48, 0.0)");
      midFog.addColorStop(1, "rgba(10, 10, 24, 0.22)");
      drawMountainRange(midMountainHeight, h * 0.52, "#090a19", midFog);

      // 7. River and bridge
      ctx.strokeStyle = "rgba(43, 85, 137, 0.30)";
      ctx.lineWidth = 4;
      ctx.shadowBlur = 8;
      ctx.shadowColor = "rgba(63, 142, 233, 0.25)";
      ctx.beginPath();
      ctx.moveTo(toScreenX(0.48), toScreenY(0.38));
      ctx.quadraticCurveTo(toScreenX(0.40), toScreenY(0.50), toScreenX(0.53), toScreenY(0.65));
      ctx.quadraticCurveTo(toScreenX(0.68), toScreenY(0.80), toScreenX(0.55), toScreenY(0.95));
      ctx.stroke();
      ctx.shadowBlur = 0;

      ctx.strokeStyle = "rgba(255, 253, 240, 0.22)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      const bx = toScreenX(0.44);
      const by = toScreenY(0.52);
      ctx.fillStyle = "#0a0917";
      ctx.strokeStyle = "#1b1830";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(bx, by, 16, Math.PI, 0);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
      ctx.beginPath();
      ctx.moveTo(bx - 20, by - 6);
      ctx.lineTo(bx + 20, by - 6);
      ctx.stroke();

      // 8. Pine trees (realistic wind sway)
      const pineTrees = [
        { nx: 0.28, ny: 0.44 }, { nx: 0.32, ny: 0.48 }, { nx: 0.35, ny: 0.41 },
        { nx: 0.65, ny: 0.46 }, { nx: 0.69, ny: 0.41 }, { nx: 0.72, ny: 0.50 },
        { nx: 0.45, ny: 0.76 }, { nx: 0.48, ny: 0.81 }, { nx: 0.39, ny: 0.80 },
        { nx: 0.56, ny: 0.88 }, { nx: 0.61, ny: 0.90 }, { nx: 0.63, ny: 0.82 }
      ];
      ctx.fillStyle = "#04040a";
      pineTrees.forEach(tree => {
        const tx = toScreenX(tree.nx);
        const ty = toScreenY(tree.ny);
        const windSway = Math.sin(tNow * 0.0016 + tree.nx * 20) * 1.5;
        
        ctx.beginPath();
        ctx.moveTo(tx + windSway, ty - 18);
        ctx.lineTo(tx - 6, ty - 2);
        ctx.lineTo(tx + 6, ty - 2);
        ctx.closePath();
        ctx.fill();
      });

      // 9. Draw Static Houses & Buildings (SILHOUETTES ALWAYS REMAIN)
      staticHousesRef.current.forEach(house => {
        const hx = toScreenX(house.nx);
        const hy = toScreenY(house.ny);
        const hSize = 8.5 * house.sizeMultiplier;

        ctx.save();
        ctx.translate(hx, hy);

        if (house.type === "church") {
          // Church silhouette walls
          ctx.fillStyle = house.wallColor;
          ctx.beginPath();
          ctx.rect(-hSize * 0.5, -hSize * 0.5, hSize, hSize);
          ctx.rect(-hSize * 0.22, -hSize * 1.5, hSize * 0.44, hSize);
          ctx.fill();
          
          // Church steeple roof
          ctx.fillStyle = house.roofColor;
          ctx.beginPath();
          ctx.moveTo(0, -hSize * 2.3);
          ctx.lineTo(-hSize * 0.25, -hSize * 1.5);
          ctx.lineTo(hSize * 0.25, -hSize * 1.5);
          ctx.closePath();
          ctx.fill();

          // Church cross outline
          ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(0, -hSize * 2.3);
          ctx.lineTo(0, -hSize * 2.5);
          ctx.moveTo(-hSize * 0.10, -hSize * 2.44);
          ctx.lineTo(hSize * 0.10, -hSize * 2.44);
          ctx.stroke();
        } 
        else {
          // Standard house silhouette walls
          ctx.fillStyle = house.wallColor;
          ctx.beginPath();
          ctx.rect(-hSize * 0.5, -hSize * 0.4, hSize, hSize * 0.8);
          ctx.fill();

          // House roofs
          ctx.fillStyle = house.roofColor;
          ctx.beginPath();
          ctx.moveTo(0, -hSize * 0.85);
          ctx.lineTo(-hSize * 0.65, -hSize * 0.4);
          ctx.lineTo(hSize * 0.65, -hSize * 0.4);
          ctx.closePath();
          ctx.fill();
        }

        ctx.restore();
      });

      // 10. Draw Fairy Light Garland wires (Silhouettes/wires always remain)
      fairyStringsRef.current.forEach(str => {
        ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        str.points.forEach((pt, idx) => {
          if (idx === 0) ctx.moveTo(toScreenX(pt.nx), toScreenY(pt.ny));
          else ctx.lineTo(toScreenX(pt.nx), toScreenY(pt.ny));
        });
        ctx.stroke();
      });

      // 11. Update & Draw Village Light Points (THE SHOWN LIGHT SHOW)
      const lights = lightsRef.current;
      lights.forEach(light => {
        switch (phaseRef.current) {
          case "opening":
            // Full illumination at beginning
            light.targetLight = 0.85;
            break;
          case "scene1_breathing":
            // Breathe smoothly
            const pulse = 0.45 + 0.55 * Math.sin(tNow * 0.0016 + light.pulseOffset);
            light.targetLight = pulse;
            break;
          case "scene2_blackout":
            // Sudden blackout
            light.targetLight = 0.0;
            break;
          case "scene3_number4":
            // Lights sweep on to form 4
            if (light.isPart4) {
              const waveElapsed = (tNow - (phaseStartTimeRef.current + 2000)) * 0.0003;
              const threshold = Math.min(1.1, waveElapsed);
              if (threshold > light.nx) {
                light.targetLight = 0.90 + 0.1 * Math.sin(tNow * 0.002 + light.pulseOffset);
              } else {
                light.targetLight = 0.0;
              }
            } else {
              light.targetLight = 0.0;
            }
            break;
          case "scene4_blackout":
            // Blackout again
            light.targetLight = 0.0;
            break;
          case "scene5_number3":
            // Lights sweep on to form 3
            if (light.isPart3) {
              const waveElapsed = (tNow - (phaseStartTimeRef.current + 2000)) * 0.00028;
              const threshold = Math.min(1.5, waveElapsed);
              const waveOffset = (light.nx + light.ny) / 2.0;
              if (threshold > waveOffset) {
                light.targetLight = 0.95 + 0.05 * Math.sin(tNow * 0.0018 + light.pulseOffset);
              } else {
                light.targetLight = 0.0;
              }
            } else {
              light.targetLight = 0.0;
            }
            break;
          case "scene6_celebration":
          case "final_reveal":
            // Keep 3 fully visible, slowly fade back in other lights to softer intensity
            if (light.isPart3) {
              light.targetLight = 1.0;
            } else {
              const elapsed = (tNow - phaseStartTimeRef.current) * 0.00015;
              light.targetLight = Math.min(0.38, elapsed) + 0.04 * Math.sin(tNow * 0.0016 + light.pulseOffset);
            }
            break;
          case "scene8_one_light":
          case "scene9_quote":
            if (light.isBrightest) {
              light.targetLight = 1.0;
            } else {
              // Smooth decay back to zero (naturally blending 3 back into the village as they all dim)
              light.targetLight = Math.max(0, light.currentLight - 0.012);
            }
            break;
          case "scene10_fade_moon":
            light.targetLight = Math.max(0, light.currentLight - 0.02);
            break;
          default:
            light.targetLight = 0.0;
            break;
        }

        // Apply fast blackout resets
        if (phaseRef.current === "scene2_blackout" || phaseRef.current === "scene4_blackout") {
          light.currentLight = 0.0;
        } else {
          light.currentLight += (light.targetLight - light.currentLight) * 0.065;
        }

        if (light.currentLight > 0.03) {
          const lx = toScreenX(light.nx);
          const ly = toScreenY(light.ny);
          const lSize = light.size;

          ctx.save();
          ctx.translate(lx, ly);

          if (light.type === "church") {
            // Glowing church windows with bloom
            ctx.shadowBlur = 12 * light.currentLight;
            ctx.shadowColor = "rgba(251, 146, 60, 0.95)";
            ctx.fillStyle = `rgba(251, 146, 60, ${light.currentLight})`;
            ctx.beginPath();
            ctx.arc(0, 0, lSize * light.currentLight, 0, Math.PI, true);
            ctx.lineTo(lSize * light.currentLight, lSize * 0.8);
            ctx.lineTo(-lSize * light.currentLight, lSize * 0.8);
            ctx.closePath();
            ctx.fill();
          } 
          else if (light.type === "streetlamp" || light.type === "bridge") {
            // Lamp post bulbs with high glow bloom
            ctx.shadowBlur = 15 * light.currentLight;
            ctx.shadowColor = light.isPart3 ? "rgba(254, 240, 138, 0.95)" : "rgba(251, 191, 36, 0.9)";
            ctx.fillStyle = light.isPart3 ? `rgba(254, 240, 138, ${light.currentLight})` : `rgba(251, 191, 36, ${light.currentLight})`;
            ctx.beginPath();
            ctx.arc(0, 0, lSize * (0.8 + 0.3 * light.currentLight), 0, Math.PI * 2);
            ctx.fill();

            // Tiny glass bulb core
            ctx.shadowBlur = 0;
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.arc(0, 0, lSize * 0.35, 0, Math.PI * 2);
            ctx.fill();
          } 
          else if (light.type === "window") {
            // House windows
            ctx.shadowBlur = 9 * light.currentLight;
            ctx.shadowColor = light.isBrightest ? "rgba(249, 115, 22, 0.9)" : "rgba(251, 191, 36, 0.95)";
            ctx.fillStyle = light.isBrightest ? `rgba(249, 115, 22, ${light.currentLight})` : `rgba(251, 191, 36, ${light.currentLight})`;
            ctx.fillRect(-lSize * 0.5, -lSize * 0.5, lSize, lSize);
          } 
          else if (light.type === "fairy" || light.type === "garden") {
            // Little fairy light dots
            ctx.shadowBlur = 8 * light.currentLight;
            ctx.shadowColor = light.isPart3 ? "rgba(253, 224, 71, 0.95)" : "rgba(251, 191, 36, 0.9)";
            ctx.fillStyle = light.isPart3 ? `rgba(253, 224, 71, ${light.currentLight})` : `rgba(251, 191, 36, ${light.currentLight})`;
            ctx.beginPath();
            ctx.arc(0, 0, lSize * (0.9 + 0.2 * light.currentLight), 0, Math.PI * 2);
            ctx.fill();
          }

          ctx.restore();
        }
      });

      // 12. Fireflies
      firefliesRef.current.forEach(f => {
        f.x += f.vx;
        f.y += f.vy;
        f.vx += (Math.random() - 0.5) * 0.00012;
        f.vy += (Math.random() - 0.5) * 0.00012;
        
        if (f.x < 0) f.x = 1.0;
        if (f.x > 1.0) f.x = 0;
        if (f.y < 0.3) f.y = 0.95;
        if (f.y > 1.0) f.y = 0.3;

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

      // 13. Sparkles
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

      // 14. Fireworks
      if (phaseRef.current === "scene6_celebration") {
        if (Math.random() < 0.035 && fireworksRef.current.length < 5) {
          const fx = 0.2 + Math.random() * 0.6;
          const fy = 0.2 + Math.random() * 0.22;
          const colors = ["rgba(244, 63, 94, ", "rgba(168, 85, 247, ", "rgba(251, 191, 36, ", "rgba(20, 184, 166, ", "rgba(255, 255, 255, "];
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

      fireworksRef.current.forEach((fw) => {
        fw.particles.forEach(p => {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += p.gravity;
          p.alpha -= p.fadeSpeed;

          if (p.alpha > 0.0) {
            ctx.fillStyle = p.color + p.alpha + ")";
            ctx.beginPath();
            ctx.arc(toScreenX(p.x), toScreenY(p.y), p.size, 0, Math.PI * 2);
            ctx.fill();
          }
        });

        fw.particles = fw.particles.filter(p => p.alpha > 0.0);
      });
      fireworksRef.current = fireworksRef.current.filter(fw => fw.particles.length > 0);

      ctx.restore();

      // Zoom-to-moon screen fadeout
      if (phaseRef.current === "scene10_fade_moon") {
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
  }, []);

  // Closed letter - trigger 180 stars explosion
  const triggerStarExplosion = () => {
    setLetterOpened(false);
    const list: FloatingSparkle[] = [];
    for (let i = 0; i < 180; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.5 + Math.random() * 2.8;
      
      list.push({
        x: 0.5 + (Math.random() - 0.5) * 0.08,
        y: 0.45 + (Math.random() - 0.5) * 0.12,
        vx: Math.cos(angle) * speed * 0.002,
        vy: -0.005 - Math.random() * 0.004,
        size: 1.2 + Math.random() * 2.4,
        alpha: 1.0,
        color: i % 2 === 0 ? "rgba(255, 255, 255, 1.0)" : "rgba(251, 191, 36, 1.0)",
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.05 + Math.random() * 0.05,
      });
    }

    sparklesRef.current = [...sparklesRef.current, ...list];
    setTimeout(() => {
      setChestDissolved(true);
    }, 1800);
  };

  const isPlaying = phase !== "interactive_chest";

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-center items-center overflow-hidden bg-black text-amber-50 select-none">
      
      {/* Cinematic background canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full pointer-events-none z-0" />

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
            🎵 Tap anywhere to enable cinematic ambient music & bells
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
                  Tonight...
                </h2>
                <h3 className={`${playfair.className} mt-6 text-2.5xl font-light tracking-wide text-white/90 md:text-4.5xl leading-relaxed`}>
                  an entire village has a surprise<br/>for someone truly special... ❤️
                </h3>
              </motion.div>
            )}

            {phase === "final_reveal" && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2, ease: "easeOut" }} 
                className="p-8 rounded-[2rem] border border-white/10 bg-black/40 backdrop-blur-[2px] shadow-2xl max-w-xl"
              >
                <span className="text-pink-400 text-2.5xl flex items-center justify-center gap-1.5 animate-pulse">✨❤️</span>
                <h1 className={`${playfair.className} text-4.5xl font-black md:text-6xl tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-300 to-amber-100 mt-2`}>
                  3 DAYS TO GO
                </h1>
                <span className="text-pink-400 text-2.5xl flex items-center justify-center gap-1.5 animate-pulse mt-2">❤️✨</span>
                
                <p className={`${caveat.className} mt-4 text-2.2xl font-bold leading-relaxed text-amber-200/90 md:text-3xl`}>
                  "An entire village lit up...<br/>
                  just to celebrate the countdown<br/>
                  to my Mammoty's birthday. ❤️"
                </p>
              </motion.div>
            )}

            {phase === "scene9_quote" && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                transition={{ duration: 1.8, ease: "easeOut", delay: 0.8 }} 
                className="max-w-lg p-5"
              >
                <p className={`${caveat.className} text-3.2xl font-bold leading-relaxed text-amber-100 drop-shadow-[0_2px_15px_rgba(0,0,0,0.95)]`}>
                  "No matter how many lights shine tonight...<br/>
                  you'll always be the brightest one. ❤️"
                </p>
              </motion.div>
            )}

          </div>
        )}
      </AnimatePresence>

      {/* RENDER THE CHEST MODAL AND BACK BUTTON AT THE END OF THE ANIMATION */}
      <AnimatePresence>
        {phase === "interactive_chest" && !chestDissolved && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 bg-black/90 flex flex-col justify-center items-center gap-10"
          >
            
            {/* Wooden chest surprise container */}
            {!chestOpened ? (
              <div className="flex flex-col items-center gap-6">
                <motion.div 
                  className="rounded-full bg-gradient-to-r from-amber-400/90 to-yellow-500/95 border border-amber-300 px-6 py-2 shadow-2xl"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
                >
                  <span className={`${playfair.className} font-bold text-amber-950 text-base tracking-wide flex items-center gap-2`}>
                    🎁 Open My Little Secret
                  </span>
                </motion.div>

                {/* Chest graphics wrapper */}
                <button
                  onClick={() => setChestOpened(true)}
                  className="relative group cursor-pointer w-48 h-40 hover:scale-105 transition duration-300 focus:outline-none"
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-amber-800 to-amber-950 rounded-2xl border-4 border-amber-900 shadow-2xl flex flex-col justify-end p-1">
                    <div className="absolute left-6 inset-y-0 w-3 bg-yellow-600/90 border-x border-yellow-700/50" />
                    <div className="absolute right-6 inset-y-0 w-3 bg-yellow-600/90 border-x border-yellow-700/50" />
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-yellow-500 border-2 border-yellow-600 flex items-center justify-center">
                      <div className="w-2 h-4 bg-black rounded" />
                    </div>
                  </div>
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
                    <div className="relative flex items-center justify-center h-48 w-48">
                      <div className="absolute inset-0 animate-ping rounded-full bg-amber-400/25 blur-xl" />
                      <div className="absolute h-36 w-36 rounded-full bg-radial-gradient from-amber-300/40 via-yellow-500/10 to-transparent blur-md" />
                      
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
                      className="rounded-full bg-white/20 px-8 py-3.5 border border-white/35 backdrop-blur-md hover:bg-white/35 transition-all text-white font-bold cursor-pointer"
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
                    className="relative max-w-md w-[92vw] rounded-[2rem] border-[3px] border-amber-900/60 bg-[#faf6ea] p-8 shadow-[0_25px_70px_rgba(0,0,0,0.8)] text-amber-950 flex flex-col gap-6"
                  >
                    <div className="absolute top-4 right-4 text-xs font-bold text-amber-800/40 select-none">
                      🔒 CONFIDENTIAL
                    </div>

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

            {/* Back button */}
            {!letterOpened && (
              <motion.button
                onClick={onClose}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="absolute bottom-12 rounded-full border border-amber-400/40 bg-black/60 hover:bg-amber-400/20 px-8 py-3.5 text-sm font-bold uppercase tracking-widest text-amber-300 hover:text-amber-200 transition cursor-pointer flex items-center gap-2"
              >
                <ArrowLeft size={16} />
                <span>← Back to Countdown</span>
              </motion.button>
            )}

          </motion.div>
        )}
      </AnimatePresence>

      {/* End Screen layout visible on finished letter closing */}
      {chestDissolved && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-black">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
            className="flex flex-col items-center gap-6 text-center p-8 bg-black/60 backdrop-blur-md rounded-3xl border border-white/10 shadow-2xl max-w-md mx-4"
          >
            <p className={`${caveat.className} text-4xl font-bold text-amber-200`}>
              Thank you for unlocking Day 3... 🏰✨
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <button
                onClick={() => {
                  setChestDissolved(false);
                  setChestOpened(false);
                  setLetterOpened(false);
                  setPhase("opening");
                  runSequenceTimeline();
                }}
                className="flex-1 flex items-center justify-center gap-2 rounded-full border border-amber-400 bg-amber-400/25 px-8 py-3.5 text-amber-300 font-bold transition hover:bg-amber-400 hover:text-black cursor-pointer"
              >
                <RefreshCw size={16} />
                <span>Replay Cinematic</span>
              </button>
              
              <button
                onClick={onClose}
                className="flex-1 flex items-center justify-center gap-2 rounded-full border border-amber-400/40 bg-black/65 hover:bg-amber-400/20 px-8 py-3.5 text-amber-300 font-bold transition cursor-pointer"
              >
                <span>Back to List</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}

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
