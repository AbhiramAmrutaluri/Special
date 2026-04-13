"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { Lock, Unlock } from "lucide-react";

export default function UnlockPage() {
  const router = useRouter();
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    // Fire confetti immediately on load
    const duration = 2000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 7,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#f43f5e', '#ec4899', '#d946ef', '#a855f7', '#60a5fa']
      });
      confetti({
        particleCount: 7,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#f43f5e', '#ec4899', '#d946ef', '#a855f7', '#60a5fa']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();

    // Trigger the unlock animation after 1 second
    const timer = setTimeout(() => {
      setIsUnlocked(true);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 selection:bg-pink-300 selection:text-white p-6 overflow-hidden">
      
      {/* Magical glowing orb background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center">
        <motion.div
           className="absolute w-[40vw] h-[40vw] bg-pink-300/30 rounded-full mix-blend-multiply filter blur-[80px]"
           animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
           transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
           className="absolute w-[30vw] h-[30vw] bg-purple-300/30 rounded-full mix-blend-multiply filter blur-[80px]"
           animate={{ scale: [1.2, 1, 1.2], opacity: [0.5, 0.8, 0.5] }}
           transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
      </div>

      <motion.div
        className="z-10 w-full max-w-2xl bg-white/50 backdrop-blur-3xl rounded-[3rem] p-12 shadow-[0_0_50px_rgba(236,72,153,0.15)] border border-white/80 flex flex-col items-center text-center relative overflow-hidden"
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 1, type: "spring", bounce: 0.4 }}
      >
        {/* Glowing Lock Icon */}
        <div className="relative mb-8 w-32 h-32 flex items-center justify-center">
          <motion.div 
            className="absolute inset-0 bg-gradient-to-tr from-pink-400 to-purple-500 rounded-full blur-2xl opacity-60"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          <AnimatePresence mode="wait">
            {!isUnlocked ? (
              <motion.div
                key="locked"
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 30, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="relative z-10 bg-white p-6 rounded-full shadow-lg border border-pink-100"
              >
                <Lock className="w-12 h-12 text-pink-500" strokeWidth={2.5} />
              </motion.div>
            ) : (
              <motion.div
                key="unlocked"
                initial={{ scale: 0, rotate: -30, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                transition={{ duration: 0.8, type: "spring", stiffness: 300, damping: 12 }}
                className="relative z-10 bg-gradient-to-br from-pink-100 to-purple-100 p-6 rounded-full shadow-[0_0_30px_rgba(217,70,239,0.5)] border border-pink-200"
              >
                <Unlock className="w-12 h-12 text-purple-600" strokeWidth={2.5} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.h1
          className="text-3xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 mb-6 leading-tight tracking-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          🎉 You unlocked something special 💖
        </motion.h1>

        <motion.p
          className="text-lg md:text-xl text-gray-600 font-medium mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 1 }}
        >
          A tiny piece of our beautiful journey, just for you... 
        </motion.p>
        
        <motion.button
          onClick={() => router.push("/timeline")}
          className="relative group px-12 py-4 font-bold text-lg text-white bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-full overflow-hidden shadow-xl hover:shadow-[0_0_30px_rgba(217,70,239,0.6)] transition-all duration-300 transform hover:scale-105 active:scale-95 z-30"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.6 }}
          whileHover={{ y: -2 }}
        >
          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 group-hover:via-rose-400 group-hover:to-pink-600 transition-colors duration-500" />
          <span className="relative flex items-center justify-center gap-2">
            See what it is 👀
          </span>
        </motion.button>
      </motion.div>
    </div>
  );
}
