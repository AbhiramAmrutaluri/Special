"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Animated Mesh Background
const BackgroundBlobs = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {/* Pink blob */}
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
    {/* Purple blob */}
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
    {/* Sky blob */}
    <motion.div
      className="absolute bg-sky-400/80 w-[500px] h-[500px] rounded-full mix-blend-multiply filter blur-[120px]"
      animate={{
        x: [0, 100, -100, 50, 0],
        y: [0, -100, -200, -100, 0],
        scale: [1, 1.3, 1, 0.9, 1],
      }}
      transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
      style={{ bottom: "-10%", left: "30%" }}
    />
    {/* Extra Rose blob for more depth */}
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

const NAMES = ["Vedhaa", "Mammotty", "Andhraa", "Hippooo"];

// Floating Heart Interactive Component
const FloatingHeart = ({ delay = 0, initialXOffset = 0, initialScale = 1, duration = 10 }: { delay?: number; initialXOffset?: number; initialScale?: number; duration?: number }) => {
  // 0: inside bubble, 1: just heart, 2: name revealed
  const [clickState, setClickState] = useState(0);
  const [runId, setRunId] = useState(0);
  const [assignedName, setAssignedName] = useState(NAMES[0]);

  useEffect(() => {
    // Randomize name for each new bubble journey
    setAssignedName(NAMES[Math.floor(Math.random() * NAMES.length)]);
    setClickState(0);
  }, [runId]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // prevent underlying elements from handling the click
    if (clickState < 2) {
      setClickState((prev) => prev + 1);
    }
  };

  const handleAnimationComplete = () => {
    // Increment runId to fully remount the animation parameters with a new random X drift and restart from bottom
    setRunId((prev) => prev + 1);
  };

  return (
    <motion.div
      key={runId} // Forces reset of the animation states when runId increments
      className="absolute flex items-center justify-center cursor-pointer drop-shadow-sm select-none pointer-events-auto"
      initial={{ y: "110vh", x: `calc(50vw + ${initialXOffset}px)`, opacity: 0 }}
      animate={{
        y: "-20vh",
        x: `calc(50vw + ${initialXOffset + (Math.random() * 80 - 40)}px)`,
        // gentle rocking motion
        rotate: [0, 5, -5, 0],
        opacity: [0, 1, 1, 0],
      }}
      transition={{
        duration,
        delay: runId === 0 ? delay : 0, // only apply staggering delay on very first load
        ease: "linear",
      }}
      onAnimationComplete={handleAnimationComplete}
      onClick={handleClick}
      style={{ zIndex: 50 }}
    >
      <div 
        className="relative flex items-center justify-center w-24 h-24" 
        style={{ transform: `scale(${initialScale})` }}
      >
        {/* State 0: Bubble */}
        {clickState === 0 && (
          <motion.div 
            className="absolute inset-0 rounded-full bg-white/20 border-2 border-white/70 shadow-[inset_0_0_20px_rgba(255,255,255,0.9),0_8px_16px_rgba(0,0,0,0.1)] backdrop-blur-[3px]"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
          />
        )}
        
        {/* State 0 or 1: Heart */}
        {clickState < 2 && (
          <motion.div
            className="text-pink-500 opacity-90 drop-shadow-md z-10"
            style={{ fontSize: "2.8rem" }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            💖
          </motion.div>
        )}

        {/* State 2: Name */}
        {clickState === 2 && (
          <motion.div
            className="absolute z-20 text-2xl font-extrabold px-6 py-3 rounded-full bg-white/90 backdrop-blur-md text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600 shadow-2xl border border-pink-200/50 whitespace-nowrap"
            initial={{ scale: 0.5, opacity: 0, y: 10 }}
            animate={{ scale: 1.1, opacity: 1, y: -20 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            {assignedName}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default function WelcomePage() {
  const router = useRouter();
  const [hearts, setHearts] = useState<{ id: number; delay: number; xOffset: number; scale: number; duration: number }[]>([]);

  useEffect(() => {
    // Generate random properties for floating interactive bubbles
    const newHearts = Array.from({ length: 24 }).map((_, i) => ({
      id: i,
      delay: Math.random() * 15, // Staggered delays up to 15s
      xOffset: (Math.random() - 0.5) * window.innerWidth * 0.9, // Spread across width
      scale: Math.random() * 0.5 + 0.7, // Random sizes
      duration: Math.random() * 12 + 18, // Slowed down from 18-30s so they can be clicked
    }));
    setHearts(newHearts);
  }, []);

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-pink-50 selection:bg-pink-300 selection:text-white">
      {/* Dynamic Animated Mesh Background */}
      <BackgroundBlobs />

      {/* Background Interactive Hearts - Z index 20 ensures they overlap visually but don't block main button unless nearby */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
        {hearts.map((heart) => (
          <FloatingHeart
            key={heart.id}
            delay={heart.delay}
            initialXOffset={heart.xOffset}
            initialScale={heart.scale}
            duration={heart.duration}
          />
        ))}
      </div>

      {/* Main Content Box */}
      <motion.div
        className="z-10 flex flex-col items-center max-w-lg mx-auto p-8 lg:p-12 rounded-[2.5rem] bg-white/20 backdrop-blur-xl shadow-[0_8px_40px_rgb(0,0,0,0.08)] border border-white/50"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        <motion.h1
          className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600 mb-4 text-center tracking-tight"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          Hi Vedhaaa 💖
        </motion.h1>

        <motion.p
          className="text-lg md:text-xl text-gray-700 font-medium mb-12 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
        >
          I made something special just for you...
        </motion.p>

        <div className="flex flex-col gap-4 w-full z-30">
          <motion.button
            onClick={() => router.push("/quiz")}
            className="w-full relative group px-10 py-4 font-bold text-lg text-white bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-full overflow-hidden shadow-xl hover:shadow-[0_0_25px_rgba(236,72,153,0.4)] transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            whileHover={{ y: -2 }}
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 group-hover:via-pink-500 group-hover:to-purple-600 transition-colors duration-500" />
            <span className="relative flex items-center justify-center gap-2">
              Start 💌
            </span>
          </motion.button>

          <motion.button
            onClick={() => router.push("/surprises")}
            className="w-full relative group px-10 py-4 font-bold text-lg text-white bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 rounded-full overflow-hidden shadow-xl hover:shadow-[0_0_25px_rgba(168,85,247,0.4)] transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.4 }}
            whileHover={{ y: -2 }}
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 group-hover:via-purple-500 group-hover:to-pink-600 transition-colors duration-500" />
            <span className="relative flex items-center justify-center gap-2">
              Check Surprises 🎁
            </span>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
