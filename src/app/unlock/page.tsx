"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Confetti from "react-confetti";
import { Heart, Sparkles, WandSparkles } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Caveat } from "next/font/google";
import { useRouter } from "next/navigation";
import BirthdayCountdownReveal from "./BirthdayCountdownReveal";
import BirthdaySevenReveal from "./BirthdaySevenReveal";
import BirthdaySixReveal from "./BirthdaySixReveal";
import BirthdayFiveReveal from "./BirthdayFiveReveal";
import BirthdayFourReveal from "./BirthdayFourReveal";

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["400", "700"],
});

type Point = {
  x: number;
  y: number;
};

// Casing matched exactly with public/photos filenames
const COLLAGE_IMAGES = [
  { src: "/photos/1.jpg?v=2", alt: "Memory 1" },
  { src: "/photos/2.jpg?v=2", alt: "Memory 2" },
  { src: "/photos/3.jpg?v=2", alt: "Memory 3" },
  { src: "/photos/4.png?v=2", alt: "Memory 4" },
  { src: "/photos/5.JPG?v=2", alt: "Memory 5" }, // case-sensitive check matched "5.JPG"
  { src: "/photos/6.png?v=2", alt: "Memory 6" },
  { src: "/photos/7.png?v=2", alt: "Memory 7" },
  { src: "/photos/8.png?v=2", alt: "Memory 8" },
  { src: "/photos/9.png?v=2", alt: "Memory 9" },
];

const TYPEWRITER_TEXT =
  "Just 9 more days until I get to see my favorite smile again ❤️";

function useViewport() {
  const [viewport, setViewport] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const update = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return viewport;
}

function FloatingDecorations() {
  const ornaments = useMemo(
    () =>
      Array.from({ length: 16 }, (_, index) => ({
        id: index,
        left: `${(index * 13 + 5) % 100}%`,
        top: `${(index * 17 + 9) % 100}%`,
        size: 12 + (index % 4) * 5,
        duration: 9 + (index % 5) * 2,
        delay: (index % 6) * 0.5,
      })),
    []
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.95),_rgba(255,228,240,0.9)_25%,_rgba(255,196,216,0.75)_55%,_rgba(247,157,208,0.9)_100%)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      />
      <motion.div
        className="absolute -left-24 top-10 h-80 w-80 rounded-full bg-pink-300/40 blur-3xl"
        animate={{ x: [0, 40, 0], y: [0, 30, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -right-24 top-24 h-96 w-96 rounded-full bg-rose-300/40 blur-3xl"
        animate={{ x: [0, -40, 0], y: [0, 30, 0], scale: [1.05, 0.95, 1.05] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute left-1/2 top-1/2 h-[45rem] w-[45rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-pink-200/30 blur-3xl"
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      {ornaments.map((item) => (
        <motion.div
          key={item.id}
          className="absolute text-pink-400/45 drop-shadow-[0_0_10px_rgba(255,182,193,0.5)]"
          style={{ left: item.left, top: item.top }}
          animate={{ y: [-15, 15, -15], opacity: [0.3, 0.85, 0.3], rotate: [0, 20, 0] }}
          transition={{ duration: item.duration, delay: item.delay, repeat: Infinity, ease: "easeInOut" }}
        >
          {item.id % 2 === 0 ? <Heart size={item.size} fill="currentColor" /> : <Sparkles size={item.size} />}
        </motion.div>
      ))}
    </div>
  );
}

function TypewriterText({ active }: { active: boolean }) {
  const [text, setText] = useState("");

  useEffect(() => {
    if (!active) return;

    let index = 0;
    const timer = window.setInterval(() => {
      index += 1;
      setText(TYPEWRITER_TEXT.slice(0, index));

      if (index >= TYPEWRITER_TEXT.length) {
        window.clearInterval(timer);
      }
    }, 35);

    return () => window.clearInterval(timer);
  }, [active]);

  return (
    <div className="mx-auto mt-6 flex w-full max-w-xl justify-center px-4">
      <div className="relative w-full rounded-[2rem] border border-white/50 bg-white/20 px-8 py-6 text-center shadow-[0_15px_50px_rgba(236,72,153,0.15)] backdrop-blur-xl md:px-12 md:py-8">
        <span className={`${caveat.className} absolute left-5 top-2 text-6xl text-rose-400/40 select-none`}>“</span>
        <span className={`${caveat.className} absolute right-5 bottom-0 text-6xl text-rose-400/40 select-none`}>”</span>
        <p className={`${caveat.className} mx-auto max-w-lg text-2xl font-bold leading-relaxed text-rose-950/90 md:text-3.5xl tracking-wide`}>
          {text}
          {text.length < TYPEWRITER_TEXT.length ? (
            <span className="ml-1 inline-block animate-pulse text-rose-500 font-sans">|</span>
          ) : null}
        </p>
      </div>
    </div>
  );
}

function ScratchCard({ onReveal }: { onReveal: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const surfaceRef = useRef<HTMLDivElement | null>(null);
  const isScratchingRef = useRef(false);
  const lastPointRef = useRef<Point | null>(null);
  const revealTriggeredRef = useRef(false);
  const animationFrameRef = useRef<number | null>(null);

  const drawCover = () => {
    const canvas = canvasRef.current;
    const surface = surfaceRef.current;

    if (!canvas || !surface) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const rect = surface.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    context.clearRect(0, 0, rect.width, rect.height);
    context.globalCompositeOperation = "source-over";

    // Pink glitter texture background
    const gradient = context.createLinearGradient(0, 0, rect.width, rect.height);
    gradient.addColorStop(0, "#f9a8d4");
    gradient.addColorStop(0.35, "#fed7e7");
    gradient.addColorStop(0.7, "#fbcfe8");
    gradient.addColorStop(1, "#f472b6");

    context.fillStyle = gradient;
    context.fillRect(0, 0, rect.width, rect.height);

    // Soft shimmer diagonal lines
    const shimmer = context.createLinearGradient(0, 0, rect.width, 0);
    shimmer.addColorStop(0, "rgba(255,255,255,0.02)");
    shimmer.addColorStop(0.5, "rgba(255,255,255,0.3)");
    shimmer.addColorStop(1, "rgba(255,255,255,0.02)");
    context.fillStyle = shimmer;
    context.fillRect(0, 0, rect.width, rect.height);

    // Draw sparkle dust
    const sparkleCount = Math.max(150, Math.floor((rect.width * rect.height) / 1200));
    for (let index = 0; index < sparkleCount; index += 1) {
      const x = Math.random() * rect.width;
      const y = Math.random() * rect.height;
      const radius = Math.random() * 2.2 + 0.3;
      context.beginPath();
      context.fillStyle = `rgba(255, 255, 255, ${0.15 + Math.random() * 0.4})`;
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fill();
    }

    // Glitter reflections
    context.strokeStyle = "rgba(255,255,255,0.25)";
    context.lineWidth = 1.2;
    for (let index = 0; index < 30; index += 1) {
      const x = Math.random() * rect.width;
      const y = Math.random() * rect.height;
      const size = 6 + Math.random() * 6;
      context.beginPath();
      context.moveTo(x - size, y);
      context.lineTo(x + size, y);
      context.moveTo(x, y - size);
      context.lineTo(x, y + size);
      context.stroke();
    }

    // Text on card
    context.shadowColor = "rgba(236,72,153,0.5)";
    context.shadowBlur = 12;
    context.fillStyle = "rgba(255,255,255,0.98)";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.font = "bold 26px Arial, sans-serif";
    context.fillText("🎁 Scratch to Reveal", rect.width / 2, rect.height / 2 - 12);
    context.shadowBlur = 0;

    context.font = "500 13px Arial, sans-serif";
    context.fillStyle = "rgba(255,255,255,0.85)";
    context.fillText("Rub the glitter screen away to unlock", rect.width / 2, rect.height / 2 + 24);
  };

  useEffect(() => {
    drawCover();

    const handleResize = () => {
      drawCover();
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationFrameRef.current) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const revealIfNeeded = () => {
    const canvas = canvasRef.current;
    if (!canvas || revealTriggeredRef.current) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    if (animationFrameRef.current) {
      window.cancelAnimationFrame(animationFrameRef.current);
    }

    animationFrameRef.current = window.requestAnimationFrame(() => {
      const data = context.getImageData(0, 0, canvas.width, canvas.height).data;
      let visiblePixels = 0;
      let scratchedPixels = 0;

      const stride = Math.max(1, Math.floor(data.length / 60000));

      for (let index = 3; index < data.length; index += 4 * stride) {
        visiblePixels += 1;
        if (data[index] < 20) {
          scratchedPixels += 1;
        }
      }

      const scratchedPercentage = scratchedPixels / Math.max(1, visiblePixels);

      if (scratchedPercentage >= 0.45 && !revealTriggeredRef.current) {
        revealTriggeredRef.current = true;
        onReveal();
      }
    });
  };

  const getPoint = (event: React.PointerEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * canvas.width / (window.devicePixelRatio || 1),
      y: ((event.clientY - rect.top) / rect.height) * canvas.height / (window.devicePixelRatio || 1),
    };
  };

  const scratchAt = (point: Point, previous: Point | null) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const dpr = window.devicePixelRatio || 1;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    context.globalCompositeOperation = "destination-out";
    context.lineJoin = "round";
    context.lineCap = "round";
    context.lineWidth = 45;

    if (!previous) {
      context.beginPath();
      context.arc(point.x, point.y, 22.5, 0, Math.PI * 2);
      context.fill();
    } else {
      context.beginPath();
      context.moveTo(previous.x, previous.y);
      context.lineTo(point.x, point.y);
      context.stroke();
      context.beginPath();
      context.arc(point.x, point.y, 22.5, 0, Math.PI * 2);
      context.fill();
    }

    context.globalCompositeOperation = "source-over";
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    isScratchingRef.current = true;

    const point = getPoint(event);
    lastPointRef.current = point;
    scratchAt(point, null);
    revealIfNeeded();
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isScratchingRef.current) return;

    event.preventDefault();
    const point = getPoint(event);
    scratchAt(point, lastPointRef.current);
    lastPointRef.current = point;
    revealIfNeeded();
  };

  const stopScratching = () => {
    isScratchingRef.current = false;
    lastPointRef.current = null;
  };

  return (
    <div className="relative w-full max-w-2xl rounded-[2.5rem] border border-white/50 bg-white/20 p-4 shadow-[0_30px_120px_rgba(236,72,153,0.22)] backdrop-blur-2xl md:p-5">
      <div
        ref={surfaceRef}
        className="relative overflow-hidden rounded-[2rem] bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.6),_rgba(255,240,248,0.4)_35%,_rgba(255,214,231,0.3)_60%,_rgba(255,255,255,0.25)_100%)]"
        style={{ aspectRatio: "4 / 3", touchAction: "none" }}
      >
        <div className="absolute inset-0 flex items-center justify-center px-8 text-center">
          <div className="max-w-md rounded-[2rem] border border-white/45 bg-white/25 px-6 py-8 shadow-[0_16px_50px_rgba(255,255,255,0.25)] backdrop-blur-md">
            <motion.div
              className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/60 text-2xl shadow-lg"
              animate={{ y: [0, -8, 0], rotate: [0, 8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <Heart className="h-8 w-8 text-pink-500 fill-current" />
            </motion.div>
            <h1 className="text-2xl font-bold tracking-tight text-rose-950 md:text-3xl">
              A sweet surprise is waiting...
            </h1>
            <p className="mt-3 text-sm leading-6 text-rose-950/75 md:text-base">
              Swipe your finger or move your cursor across the glitter layer above to reveal a special memory.
            </p>
          </div>
        </div>

        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full cursor-grab active:cursor-grabbing"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={stopScratching}
          onPointerCancel={stopScratching}
          onPointerLeave={stopScratching}
          aria-label="Scratch card"
        />
      </div>
    </div>
  );
}

function NineCollage() {
  // Using 6-column, 4-row grid to map out the number 9 layout perfectly.
  // Gaps align with grid settings, clipping masks outer shape, individual cells are rounded.
  const photoTiles = [
    // Row 1: Top Loop (Photos 1, 2, 3)
    {
      image: COLLAGE_IMAGES[0],
      gridClass: "col-span-2 row-span-1",
      index: 0,
    },
    {
      image: COLLAGE_IMAGES[1],
      gridClass: "col-span-2 row-span-1",
      index: 1,
    },
    {
      image: COLLAGE_IMAGES[2],
      gridClass: "col-span-2 row-span-1",
      index: 2,
    },
    // Row 2: Middle Loop (Photo 4, Circular Hole, Photo 5)
    {
      image: COLLAGE_IMAGES[3],
      gridClass: "col-span-2 row-span-1",
      index: 3,
    },
    {
      isHole: true,
      gridClass: "col-span-2 row-span-1",
    },
    {
      image: COLLAGE_IMAGES[4],
      gridClass: "col-span-2 row-span-1",
      index: 4,
    },
    // Row 3: Bottom of Loop (Photo 6, Photo 7)
    {
      image: COLLAGE_IMAGES[5],
      gridClass: "col-span-3 row-span-1",
      index: 5,
    },
    {
      image: COLLAGE_IMAGES[6],
      gridClass: "col-span-3 row-span-1",
      index: 6,
    },
    // Row 4: Tail Section (Empty gap, Photo 8, Photo 9)
    {
      isEmpty: true,
      gridClass: "col-span-1 row-span-1",
    },
    {
      image: COLLAGE_IMAGES[7],
      gridClass: "col-span-2 row-span-1",
      index: 7,
    },
    {
      image: COLLAGE_IMAGES[8],
      gridClass: "col-span-3 row-span-1",
      index: 8,
    },
  ];

  return (
    <div className="relative mx-auto w-full max-w-[420px] xs:max-w-[480px] sm:max-w-[580px] md:max-w-[660px] lg:max-w-[740px] xl:max-w-[800px] aspect-[100/130] p-1 select-none">
      {/* SVG Clip Path Definition to crop the layout into a digit '9' */}
      <svg className="absolute w-0 h-0">
        <defs>
          <clipPath id="nine-clip" clipPathUnits="objectBoundingBox">
            <path
              clipRule="evenodd"
              d="M 0.50,0.038 C 0.72,0.038 0.90,0.177 0.90,0.346 C 0.90,0.538 0.90,0.692 0.85,0.846 C 0.80,0.938 0.65,0.962 0.50,0.962 C 0.32,0.962 0.18,0.908 0.15,0.831 C 0.12,0.754 0.20,0.731 0.30,0.731 L 0.55,0.731 C 0.55,0.669 0.50,0.654 0.45,0.654 C 0.25,0.654 0.10,0.523 0.10,0.346 C 0.10,0.177 0.28,0.038 0.50,0.038 Z M 0.50,0.223 A 0.16,0.123 0 1 0 0.50,0.469 A 0.16,0.123 0 1 0 0.50,0.223 Z"
            />
          </clipPath>
        </defs>
      </svg>

      {/* Grid Container for Photos clipped to a perfect number 9 */}
      <div
        className="w-full h-full grid grid-cols-6 grid-rows-[22%_25%_23%_30%] gap-[5px] transition-all duration-500 bg-transparent"
        style={{ clipPath: "url(#nine-clip)" }}
      >
        {photoTiles.map((tile, i) => {
          if (tile.isHole) {
            return (
              <div
                key={`hole-${i}`}
                className={`${tile.gridClass} bg-transparent pointer-events-none`}
              />
            );
          }
          if (tile.isEmpty) {
            return (
              <div
                key={`empty-${i}`}
                className={`${tile.gridClass} bg-transparent pointer-events-none`}
              />
            );
          }

          return (
            <motion.div
              key={tile.image?.src}
              className={`${tile.gridClass} group relative overflow-hidden rounded-[1.2rem] border-[1.5px] border-white/95 bg-white/20 shadow-[0_0_12px_rgba(244,63,94,0.35)]`}
              initial={{ opacity: 0, scale: 0.82, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{
                duration: 0.8,
                delay: tile.index! * 0.08,
                ease: [0.16, 1, 0.3, 1],
              }}
              whileHover={{ scale: 1.05, zIndex: 10 }}
            >
              <div className="relative w-full h-full overflow-hidden">
                <img
                  src={tile.image!.src}
                  alt={tile.image!.alt}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading={tile.index! < 4 ? "eager" : "lazy"}
                />
                {/* Subtle soft pink overlay highlight on hover */}
                <div className="absolute inset-0 bg-pink-400/0 group-hover:bg-pink-400/10 transition-colors duration-300 pointer-events-none" />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* SVG Outline Overlay with Glowing Stroke */}
      <svg
        viewBox="0 0 100 130"
        className="absolute inset-0 w-full h-full pointer-events-none z-30 drop-shadow-[0_0_16px_rgba(244,63,94,0.65)]"
      >
        <defs>
          <linearGradient id="glow-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="35%" stopColor="#ffedf1" />
            <stop offset="70%" stopColor="#ffd1df" />
            <stop offset="100%" stopColor="#ffb3cb" />
          </linearGradient>
          <filter id="pink-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComponentTransfer in="blur" result="glow1">
              <feFuncA type="linear" slope="2.6" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode in="glow1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* Outer Glow Border */}
        <path
          d="M 50,5 C 72,5 90,23 90,45 C 90,70 90,90 85,110 C 80,122 65,125 50,125 C 32,125 18,118 15,108 C 12,98 20,95 30,95 L 55,95 C 55,87 50,85 45,85 C 25,85 10,68 10,45 C 10,23 28,5 50,5 Z"
          fill="none"
          stroke="url(#glow-gradient)"
          strokeWidth="2.5"
          filter="url(#pink-glow)"
        />
        {/* Inner Hole Glow Border */}
        <circle
          cx="50"
          cy="45"
          r="15"
          fill="none"
          stroke="url(#glow-gradient)"
          strokeWidth="2.5"
          filter="url(#pink-glow)"
        />
      </svg>
    </div>
  );
}

export default function UnlockPage() {
  const router = useRouter();
  const viewport = useViewport();
  const [isRevealed, setIsRevealed] = useState(false);
  const [showCollage, setShowCollage] = useState(false);
  const [showNextMessage, setShowNextMessage] = useState(false);
  const [showSurprise, setShowSurprise] = useState(false);
  const [showSevenSurprise, setShowSevenSurprise] = useState(false);
  const [showSixSurprise, setShowSixSurprise] = useState(false);
  const [showFiveSurprise, setShowFiveSurprise] = useState(false);
  const [showFourSurprise, setShowFourSurprise] = useState(false);
  const showConfetti = isRevealed && !showSurprise && !showSevenSurprise && !showSixSurprise && !showFiveSurprise && !showFourSurprise;

  useEffect(() => {
    if (!isRevealed) return;

    // Show collage and bottom message after exactly 2 seconds
    const collageTimer = window.setTimeout(() => {
      setShowCollage(true);
    }, 2000);

    return () => {
      window.clearTimeout(collageTimer);
    };
  }, [isRevealed]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const day = params.get("day");
    if (day === "8") {
      setIsRevealed(true);
      setShowCollage(true);
      setShowSurprise(true);
    } else if (day === "7") {
      setIsRevealed(true);
      setShowCollage(true);
      setShowSevenSurprise(true);
    } else if (day === "6") {
      setIsRevealed(true);
      setShowCollage(true);
      setShowSixSurprise(true);
    } else if (day === "5") {
      setIsRevealed(true);
      setShowCollage(true);
      setShowFiveSurprise(true);
    } else if (day === "4") {
      setIsRevealed(true);
      setShowCollage(true);
      setShowFourSurprise(true);
    }
  }, []);

  if (showFourSurprise) {
    return (
      <AnimatePresence mode="wait">
        <BirthdayFourReveal
          onClose={() => {
            setShowFourSurprise(false);
            router.push("/surprises");
          }}
        />
      </AnimatePresence>
    );
  }

  if (showFiveSurprise) {
    return (
      <AnimatePresence mode="wait">
        <BirthdayFiveReveal
          onClose={() => {
            setShowFiveSurprise(false);
            router.push("/surprises");
          }}
        />
      </AnimatePresence>
    );
  }

  if (showSixSurprise) {
    return (
      <AnimatePresence mode="wait">
        <BirthdaySixReveal
          onClose={() => {
            setShowSixSurprise(false);
            router.push("/surprises");
          }}
        />
      </AnimatePresence>
    );
  }

  if (showSevenSurprise) {
    return (
      <AnimatePresence mode="wait">
        <BirthdaySevenReveal
          onClose={() => {
            setShowSevenSurprise(false);
            router.push("/surprises");
          }}
        />
      </AnimatePresence>
    );
  }

  if (showSurprise) {
    return (
      <AnimatePresence mode="wait">
        <BirthdayCountdownReveal
          onClose={() => {
            setShowSurprise(false);
            router.push("/surprises");
          }}
        />
      </AnimatePresence>
    );
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top,_#fff8fb_0%,_#ffd5e8_28%,_#f7a8cf_58%,_#f3a6d4_100%)] px-4 py-12 text-rose-950 sm:px-6 lg:px-8 flex flex-col justify-center items-center">
      {/* Stylesheet for Shimmer Animation */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 3s infinite;
        }
      `}</style>

      <FloatingDecorations />

      {showConfetti && viewport.width > 0 && viewport.height > 0 ? (
        <div className="pointer-events-none absolute inset-0 z-45">
          <Confetti
            width={viewport.width}
            height={viewport.height}
            numberOfPieces={280}
            recycle={false}
            gravity={0.15}
            wind={0.008}
            colors={[
              "#ffffff",
              "#fecdd3",
              "#f9a8d4",
              "#fb7185",
              "#f472b6",
              "#fbe2e9",
            ]}
          />
        </div>
      ) : null}

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-5xl flex-col items-center justify-center gap-6 py-6 text-center md:gap-8">
        <AnimatePresence mode="wait">
          {!isRevealed ? (
            <motion.div
              key="scratch-card"
              initial={{ opacity: 0, y: 22, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="w-full flex justify-center"
            >
              <ScratchCard onReveal={() => setIsRevealed(true)} />
            </motion.div>
          ) : (
            <motion.div
              key="reveal-stage"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="flex w-full flex-col items-center gap-6 md:gap-8"
            >
              {/* Header glassmorphism card matching image exactly */}
              <motion.div
                className="relative overflow-hidden rounded-[2rem] border border-white/50 bg-white/20 p-5 shadow-[0_20px_50px_rgba(236,72,153,0.15)] backdrop-blur-xl max-w-md w-full flex flex-col items-center gap-4"
                initial={{ opacity: 0, scale: 0.94, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
              >
                {/* Styled Badge at the top with pink-glitter style */}
                <div className="relative overflow-hidden rounded-[0.8rem] bg-gradient-to-r from-pink-300 via-rose-300 to-pink-300 px-6 py-2 shadow-inner border border-white/45 text-rose-950 font-medium text-sm flex items-center justify-center gap-1.5 min-w-[200px] select-none">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-shimmer" />
                  <span className={`${caveat.className} font-bold text-rose-900 text-lg tracking-wide flex items-center gap-1.5`}>
                    🎁 Scratch to Reveal
                  </span>
                </div>
                <h1 className="text-3xl font-extrabold tracking-wider text-rose-600/90 font-sans md:text-4xl text-center drop-shadow-[0_2px_10px_rgba(255,255,255,0.7)]">
                  ❤️ 9 DAYS TO GO ❤️
                </h1>
              </motion.div>

              {/* Delayed Section for Collage and Quote Card */}
              <div className="w-full flex flex-col items-center gap-6 md:gap-8 min-h-[480px] justify-center">
                {showCollage ? (
                  <motion.div
                    key="collage-and-quote"
                    initial={{ opacity: 0, scale: 0.94, y: 24 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full flex flex-col items-center gap-6 md:gap-8"
                  >
                    <NineCollage />
                    <TypewriterText active={showCollage} />

                    {/* Reveal The Next One Option */}
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.2, duration: 0.6 }}
                      className="mt-2 flex flex-col items-center gap-4"
                    >
                      <button
                        onClick={() => setShowSurprise(true)}
                        className="relative overflow-hidden rounded-full border border-white/50 bg-white/20 px-8 py-3.5 shadow-[0_10px_30px_rgba(236,72,153,0.15)] backdrop-blur-md transition-all duration-300 hover:bg-white/30 hover:scale-105 active:scale-95 text-rose-950 font-semibold flex items-center gap-2 cursor-pointer group"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:animate-shimmer" />
                        <span className="relative flex items-center gap-2 text-base md:text-lg">
                          ✨ Reveal The next one ✨
                        </span>
                      </button>

                      <AnimatePresence>
                        {showNextMessage && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: -10, height: 0 }}
                            animate={{ opacity: 1, scale: 1, y: 0, height: "auto" }}
                            exit={{ opacity: 0, scale: 0.9, y: -10, height: 0 }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                            className="overflow-hidden"
                          >
                            <div className="rounded-[1.5rem] border border-rose-200/60 bg-rose-50/80 px-6 py-4 shadow-lg flex items-center justify-center gap-2 text-rose-800 font-medium">
                              <span className={`${caveat.className} text-2xl font-bold md:text-3xl flex items-center gap-2`}>
                                🔒 Wait till tomorrow 12:00 am ❤️
                              </span>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </motion.div>
                ) : (
                  <div className="h-[380px] flex items-center justify-center">
                    <motion.div
                      initial={{ scale: 0.85, opacity: 0 }}
                      animate={{ scale: [0.92, 1.08, 0.92], opacity: [0.4, 0.9, 0.4] }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                      className="text-pink-500 flex flex-col items-center gap-3"
                    >
                      <Heart className="h-12 w-12 fill-current drop-shadow-[0_0_10px_rgba(244,63,94,0.5)]" />
                      <p className={`${caveat.className} text-xl font-bold tracking-wide text-rose-900/80`}>
                        Preparing your collage...
                      </p>
                    </motion.div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <AnimatePresence>
        {showSurprise && (
          <BirthdayCountdownReveal onClose={() => setShowSurprise(false)} />
        )}
        {showSevenSurprise && (
          <BirthdaySevenReveal onClose={() => setShowSevenSurprise(false)} />
        )}
        {showSixSurprise && (
          <BirthdaySixReveal onClose={() => setShowSixSurprise(false)} />
        )}
        {showFiveSurprise && (
          <BirthdayFiveReveal onClose={() => setShowFiveSurprise(false)} />
        )}
        {showFourSurprise && (
          <BirthdayFourReveal onClose={() => setShowFourSurprise(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
