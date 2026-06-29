"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Gift, Sparkles } from "lucide-react";

const TARGET_DATE = new Date("July 4, 2026 00:00:00").getTime();

function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center bg-white/20 backdrop-blur-3xl border border-white/60 p-4 md:p-8 rounded-[2rem] w-24 md:w-40 shadow-[0_10px_40px_rgba(244,63,94,0.1)]"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
    >
      <span className="text-4xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-pink-600 to-purple-600 drop-shadow-md">
        {value.toString().padStart(2, "0")}
      </span>
      <span className="text-xs md:text-lg font-bold text-gray-700 uppercase tracking-widest mt-2 opacity-80">
        {label}
      </span>
    </motion.div>
  );
}

export default function CountdownPage() {
  const router = useRouter();

  const [timeLeft, setTimeLeft] = useState({
    months: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const [isCalculated, setIsCalculated] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const difference = TARGET_DATE - now;

      if (difference > 0) {
        // Calculate totally precise units
        const months = Math.floor(difference / (1000 * 60 * 60 * 24 * 30));
        const days = Math.floor((difference % (1000 * 60 * 60 * 24 * 30)) / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ months, days, hours, minutes, seconds });
      } else {
        setTimeLeft({ months: 0, days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
      setIsCalculated(true);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center bg-[#faf8f9] selection:bg-pink-300 selection:text-white p-6 overflow-hidden">
      
      {/* Background Animated Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-50 via-purple-50 to-rose-50 opacity-80" />
        <motion.div
          className="absolute bg-rose-400/40 w-[80vw] h-[80vw] rounded-full mix-blend-multiply filter blur-[120px]"
          animate={{ x: ["-10%", "10%", "-10%"], y: ["-10%", "10%", "-10%"], scale: [1, 1.1, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          style={{ top: "-10%", left: "-10%" }}
        />
        <motion.div
          className="absolute bg-purple-400/30 w-[80vw] h-[80vw] rounded-full mix-blend-multiply filter blur-[120px]"
          animate={{ x: ["10%", "-10%", "10%"], y: ["10%", "-10%", "10%"], scale: [1, 0.9, 1] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          style={{ bottom: "-10%", right: "-10%" }}
        />
      </div>

      <motion.div
        className="z-10 w-full max-w-5xl flex flex-col items-center text-center relative"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, type: "spring", bounce: 0.3 }}
      >
        <motion.p
          className="text-2xl md:text-4xl text-gray-800 font-serif font-bold mb-16 italic drop-shadow-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          Idi just sample matrame just wait till the countdown ends...
        </motion.p>

        {isCalculated && (
          <div className="flex flex-wrap justify-center gap-4 md:gap-8 w-full mb-20">
            <TimeUnit value={timeLeft.months} label="Months" />
            <TimeUnit value={timeLeft.days} label="Days" />
            <TimeUnit value={timeLeft.hours} label="Hours" />
            <TimeUnit value={timeLeft.minutes} label="Mins" />
            <TimeUnit value={timeLeft.seconds} label="Secs" />
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <motion.button
            onClick={() => router.push("/unlock")}
            className="inline-flex items-center gap-2 px-8 py-3 font-bold text-white bg-gradient-to-r from-pink-500 via-rose-500 to-fuchsia-500 rounded-full shadow-xl shadow-pink-500/20 border border-white/50 hover:shadow-2xl hover:shadow-pink-500/30 transition-all active:scale-95"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.35 }}
            whileHover={{ y: -2 }}
          >
            <Gift className="h-4 w-4" />
            Check Surprise
            <Sparkles className="h-4 w-4" />
          </motion.button>

          <motion.button
            onClick={() => router.push("/message")}
            className="px-8 py-3 font-bold text-pink-600 bg-white/60 backdrop-blur-md rounded-full border border-pink-200 shadow-lg hover:shadow-xl hover:bg-white transition-all active:scale-95"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.5 }}
            whileHover={{ y: -2 }}
          >
            &larr; Go Back
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
