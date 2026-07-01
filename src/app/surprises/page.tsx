"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Heart, Sparkles, ArrowLeft } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { Caveat } from "next/font/google";

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["400", "700"],
});

// Reuse the landing page's animated background blobs
const BackgroundBlobs = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <motion.div
      className="absolute bg-pink-400/80 w-[400px] h-[400px] rounded-full mix-blend-multiply filter blur-[100px]"
      animate={{
        x: [0, 150, 0, -150, 0],
        y: [0, 100, 150, 100, 0],
        scale: [1, 1.2, 1, 0.8, 1],
      }}
      transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      style={{ top: "10%", left: "10%" }}
    />
    <motion.div
      className="absolute bg-purple-500/80 w-[450px] h-[450px] rounded-full mix-blend-multiply filter blur-[120px]"
      animate={{
        x: [0, -150, 0, 150, 0],
        y: [0, 150, 50, 150, 0],
        scale: [1, 0.9, 1.1, 0.9, 1],
      }}
      transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      style={{ top: "30%", right: "10%" }}
    />
    <motion.div
      className="absolute bg-rose-300/60 w-[300px] h-[300px] rounded-full mix-blend-multiply filter blur-[80px]"
      animate={{
        x: [0, -50, 100, -50, 0],
        y: [0, 50, -50, 50, 0],
        scale: [1, 1.1, 0.9, 1.1, 1],
      }}
      transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      style={{ top: "40%", left: "40%" }}
    />
  </div>
);

export default function SurprisesPage() {
  const router = useRouter();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const handleLockedClick = () => {
    setToastMessage("Wait until the time arrives 🔒");
  };

  // Floating background elements
  const floatingHearts = useMemo(() => {
    return Array.from({ length: 18 }, (_, i) => ({
      id: i,
      left: `${(i * 17 + 5) % 100}%`,
      top: `${(i * 23 + 9) % 100}%`,
      size: 12 + (i % 4) * 6,
      duration: 10 + (i % 5) * 3,
      delay: (i % 6) * 0.4,
    }));
  }, []);

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-pink-50 px-4 py-8 text-rose-950">
      <BackgroundBlobs />

      {/* Floating Hearts Decorations */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {floatingHearts.map((item) => (
          <motion.div
            key={item.id}
            className="absolute text-pink-400/40 drop-shadow-[0_0_8px_rgba(255,182,193,0.4)]"
            style={{ left: item.left, top: item.top }}
            animate={{ y: [-15, 15, -15], opacity: [0.35, 0.8, 0.35], rotate: [0, 15, 0] }}
            transition={{ duration: item.duration, delay: item.delay, repeat: Infinity, ease: "easeInOut" }}
          >
            {item.id % 2 === 0 ? <Heart size={item.size} fill="currentColor" /> : <Sparkles size={item.size} />}
          </motion.div>
        ))}
      </div>

      {/* Back to Home Button */}
      <button
        onClick={() => router.push("/")}
        className="absolute left-6 top-6 z-30 rounded-full border border-white/50 bg-white/25 p-3 text-rose-900 shadow-md backdrop-blur-md transition-all duration-300 hover:bg-white/40 hover:scale-110 active:scale-95 cursor-pointer flex items-center gap-1 text-sm font-semibold"
      >
        <ArrowLeft size={18} />
        <span>Back</span>
      </button>

      {/* Main glass card */}
      <motion.div
        className="z-10 flex flex-col items-center max-w-4xl w-full p-8 md:p-12 rounded-[2.5rem] bg-white/20 backdrop-blur-xl shadow-[0_20px_50px_rgba(236,72,153,0.1)] border border-white/55 text-center gap-6"
        initial={{ opacity: 0, scale: 0.92, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div>
          <h1 className="text-3.5xl md:text-4.5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 tracking-tight font-sans mb-2">
            Your Surprises 💝
          </h1>
          <p className={`${caveat.className} text-xl md:text-2xl text-rose-900/80 font-bold`}>
            Select a day to open the countdown magic
          </p>
        </div>

        {/* Days selection list */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full justify-center mt-4">
          
          {/* Day 9 Card */}
          <motion.button
            onClick={() => router.push("/unlock?day=9")}
            className="flex-1 rounded-[2rem] border border-white/60 bg-white/30 hover:bg-white/45 p-6 shadow-[0_12px_30px_rgba(236,72,153,0.06)] backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95 text-rose-950 font-bold flex flex-col items-center gap-3 cursor-pointer group"
            whileHover={{ y: -4, boxShadow: "0px 20px 40px rgba(236,72,153,0.12)" }}
          >
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-100 to-rose-200 text-pink-500 group-hover:scale-110 transition duration-300 shadow-sm border border-white/60">
              <span className="text-3xl">✨</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-xl font-black text-rose-900">Day 9 Surprise</span>
            </div>
          </motion.button>

          {/* Day 8 Card */}
          <motion.button
            onClick={() => router.push("/unlock?day=8")}
            className="flex-1 rounded-[2rem] border border-white/60 bg-white/30 hover:bg-white/45 p-6 shadow-[0_12px_30px_rgba(236,72,153,0.06)] backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95 text-rose-950 font-bold flex flex-col items-center gap-3 cursor-pointer group"
            whileHover={{ y: -4, boxShadow: "0px 20px 40px rgba(236,72,153,0.12)" }}
          >
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-100 to-pink-200 text-purple-600 group-hover:scale-110 transition duration-300 shadow-sm border border-white/60">
              <span className="text-3xl">🦋</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-xl font-black text-rose-900">Day 8 Surprise</span>
            </div>
          </motion.button>
          
          {/* Day 7 Card */}
          <motion.button
            onClick={() => router.push("/unlock?day=7")}
            className="flex-1 rounded-[2rem] border border-white/60 bg-white/30 hover:bg-white/45 p-6 shadow-[0_12px_30px_rgba(236,72,153,0.06)] backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95 text-rose-950 font-bold flex flex-col items-center gap-3 cursor-pointer group"
            whileHover={{ y: -4, boxShadow: "0px 20px 40px rgba(236,72,153,0.12)" }}
          >
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-100 to-sky-200 text-indigo-600 group-hover:scale-110 transition duration-300 shadow-sm border border-white/60">
              <span className="text-3xl">🌙</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-xl font-black text-rose-900">Day 7 Surprise</span>
            </div>
          </motion.button>

          {/* Day 6 Card */}
          <motion.button
            onClick={() => router.push("/unlock?day=6")}
            className="flex-1 rounded-[2rem] border border-white/60 bg-white/30 hover:bg-white/45 p-6 shadow-[0_12px_30px_rgba(236,72,153,0.06)] backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95 text-rose-950 font-bold flex flex-col items-center gap-3 cursor-pointer group"
            whileHover={{ y: -4, boxShadow: "0px 20px 40px rgba(236,72,153,0.12)" }}
          >
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-100 to-red-200 text-rose-700 group-hover:scale-110 transition duration-300 shadow-sm border border-white/60">
              <span className="text-3xl">🌹</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-xl font-black text-rose-900">Day 6 Surprise</span>
            </div>
          </motion.button>

          {/* Day 5 Card */}
          <motion.button
            onClick={() => router.push("/unlock?day=5")}
            className="flex-1 rounded-[2rem] border border-white/60 bg-white/30 hover:bg-white/45 p-6 shadow-[0_12px_30px_rgba(236,72,153,0.06)] backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95 text-rose-950 font-bold flex flex-col items-center gap-3 cursor-pointer group"
            whileHover={{ y: -4, boxShadow: "0px 20px 40px rgba(236,72,153,0.12)" }}
          >
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-100 to-orange-200 text-orange-600 group-hover:scale-110 transition duration-300 shadow-sm border border-white/60">
              <span className="text-3xl">🏮</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-xl font-black text-rose-900">Day 5 Surprise</span>
            </div>
          </motion.button>

          {/* Day 4 Card */}
          <motion.button
            onClick={() => router.push("/unlock?day=4")}
            className="flex-1 rounded-[2rem] border border-white/60 bg-white/30 hover:bg-white/45 p-6 shadow-[0_12px_30px_rgba(236,72,153,0.06)] backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95 text-rose-950 font-bold flex flex-col items-center gap-3 cursor-pointer group"
            whileHover={{ y: -4, boxShadow: "0px 20px 40px rgba(236,72,153,0.12)" }}
          >
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-100 to-sky-200 text-teal-600 group-hover:scale-110 transition duration-300 shadow-sm border border-white/60">
              <span className="text-3xl">🌊</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-xl font-black text-rose-900">Day 4 Surprise</span>
            </div>
          </motion.button>

          {/* Day 3 Card */}
          <motion.button
            onClick={() => router.push("/unlock?day=3")}
            className="flex-1 rounded-[2rem] border border-white/60 bg-white/30 hover:bg-white/45 p-6 shadow-[0_12px_30px_rgba(236,72,153,0.06)] backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95 text-rose-950 font-bold flex flex-col items-center gap-3 cursor-pointer group"
            whileHover={{ y: -4, boxShadow: "0px 20px 40px rgba(236,72,153,0.12)" }}
          >
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-200 text-indigo-700 group-hover:scale-110 transition duration-300 shadow-sm border border-white/60">
              <span className="text-3xl">🏰</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-xl font-black text-rose-900">Day 3 Surprise</span>
            </div>
          </motion.button>

          {/* Day 2 Card */}
          <motion.button
            onClick={() => router.push("/unlock?day=2")}
            className="flex-1 rounded-[2rem] border border-white/60 bg-white/30 hover:bg-white/45 p-6 shadow-[0_12px_30px_rgba(236,72,153,0.06)] backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95 text-rose-950 font-bold flex flex-col items-center gap-3 cursor-pointer group"
            whileHover={{ y: -4, boxShadow: "0px 20px 40px rgba(236,72,153,0.12)" }}
          >
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-100 to-indigo-200 text-indigo-700 group-hover:scale-110 transition duration-300 shadow-sm border border-white/60">
              <span className="text-3xl">🦢</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-xl font-black text-rose-900">Day 2 Surprise</span>
            </div>
          </motion.button>

          {/* Day 1 Card (Locked) */}
          <motion.button
            onClick={handleLockedClick}
            className="flex-1 rounded-[2rem] border border-white/40 bg-white/15 opacity-75 hover:opacity-90 p-6 shadow-[0_12px_30px_rgba(0,0,0,0.03)] backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95 text-rose-950 font-bold flex flex-col items-center gap-3 cursor-pointer group"
            whileHover={{ y: -4, boxShadow: "0px 20px 40px rgba(0,0,0,0.08)" }}
          >
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-200/80 to-slate-300/80 text-slate-500 group-hover:scale-110 transition duration-300 shadow-sm border border-white/40">
              <span className="text-3xl">🔒</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-xl font-black text-rose-900/60">Day 1 Surprise</span>
            </div>
          </motion.button>
          
        </div>
      </motion.div>

      {/* Floating Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9, x: "-50%" }}
            animate={{ opacity: 1, y: 0, scale: 1, x: "-50%" }}
            exit={{ opacity: 0, y: 20, scale: 0.9, x: "-50%" }}
            className="fixed bottom-8 left-1/2 z-50 rounded-[1.5rem] border border-rose-200/60 bg-white/95 px-6 py-3.5 shadow-2xl backdrop-blur-md flex items-center gap-2 text-rose-900 font-bold"
          >
            <span className="text-xl">🔒</span>
            <span className={`${caveat.className} text-xl md:text-2xl`}>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
