/* eslint-disable react/no-unescaped-entities */
"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

// Live Ambient Liquid Background that constantly shifts
const LiveLiquidBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
    {/* Base dark/warm gradient gradient */}
    <div className="absolute inset-0 bg-gradient-to-br from-rose-100 via-pink-50 to-purple-100 opacity-80" />
    
    <motion.div
      className="absolute bg-rose-400/40 w-[100vw] h-[100vw] rounded-full mix-blend-multiply filter blur-[100px]"
      animate={{
        x: ["-20%", "20%", "-10%", "-20%"],
        y: ["-20%", "10%", "30%", "-20%"],
        scale: [1, 1.2, 0.9, 1],
      }}
      transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
      style={{ top: "-10%", left: "-10%" }}
    />
    
    <motion.div
      className="absolute bg-fuchsia-400/40 w-[90vw] h-[90vw] rounded-full mix-blend-multiply filter blur-[120px]"
      animate={{
        x: ["20%", "-20%", "30%", "20%"],
        y: ["30%", "-10%", "-20%", "30%"],
        scale: [1, 0.8, 1.3, 1],
      }}
      transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
      style={{ bottom: "-10%", right: "-10%" }}
    />

    <motion.div
      className="absolute bg-purple-400/30 w-[80vw] h-[80vw] rounded-full mix-blend-multiply filter blur-[100px]"
      animate={{
        x: ["0%", "40%", "-30%", "0%"],
        y: ["40%", "0%", "-40%", "40%"],
        scale: [1, 1.5, 0.9, 1],
      }}
      transition={{ duration: 35, repeat: Infinity, ease: "easeInOut" }}
      style={{ top: "20%", left: "10%" }}
    />
  </div>
);

// Gentle falling elements (petals/diamonds/sparkles)
const FallingElement = ({ delay, xOffset, scale, duration, type }: { delay: number; xOffset: number; scale: number; duration: number; type: string }) => {
  return (
    <motion.div
      className="absolute pointer-events-none drop-shadow-md select-none z-0"
      initial={{ y: "-10vh", x: `calc(${xOffset}vw)`, opacity: 0, rotate: 0 }}
      animate={{
        y: "110vh",
        x: `calc(${xOffset}vw + ${Math.random() * 20 - 10}vw)`,
        rotate: [0, 90, 180, 270, 360],
        opacity: [0, 0.8, 0.8, 0],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "linear",
      }}
      style={{ fontSize: `${scale}rem` }}
    >
      {type === "sparkle" ? "✨" : type === "star" ? "🌟" : "🌸"}
    </motion.div>
  );
};

export default function MessagePage() {
  const [elements, setElements] = useState<{ id: number; delay: number; xOffset: number; scale: number; duration: number; type: string }[]>([]);

  useEffect(() => {
    // Generate beautiful falling particles
    const types = ["sparkle", "star", "petal"];
    const newElements = Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      delay: Math.random() * 20,
      xOffset: Math.random() * 100, // 0 to 100vw
      scale: Math.random() * 1 + 0.5, // 0.5rem to 1.5rem
      duration: Math.random() * 10 + 15, // 15 to 25 seconds falling
      type: types[i % types.length],
    }));
    setElements(newElements);
  }, []);

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center bg-[#faf8f9] selection:bg-pink-300 selection:text-white overflow-hidden py-10 px-4 md:px-0">
      
      {/* Live Ambient Background */}
      <LiveLiquidBackground />

      {/* Raining Magical Effects */}
      {elements.map((el) => (
        <FallingElement
          key={el.id}
          delay={el.delay}
          xOffset={el.xOffset}
          scale={el.scale}
          duration={el.duration}
          type={el.type}
        />
      ))}

      {/* The Message Letter/Envelope UI */}
      <motion.div
        className="z-10 w-full max-w-3xl bg-white/30 backdrop-blur-3xl rounded-[3rem] shadow-[0_20px_60px_rgba(244,63,94,0.15)] border border-white/60 flex flex-col items-center text-center overflow-hidden relative"
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 1, type: "spring", bounce: 0.3 }}
      >
        {/* Soft internal gradient for the card */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/60 to-transparent pointer-events-none" />
        
        <div className="p-12 md:p-16 relative z-10 flex flex-col items-center">
          <motion.div 
            className="w-20 h-20 bg-gradient-to-tr from-pink-400 to-rose-500 rounded-full flex items-center justify-center mb-8 shadow-xl shadow-pink-500/30"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 200, damping: 15 }}
          >
            <span className="text-4xl">💌</span>
          </motion.div>

          <motion.h2
            className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-rose-500 to-red-500 mb-10 leading-tight tracking-tight font-serif"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.7 }}
          >
            My Dearest Vedhaa,
          </motion.h2>

          <motion.div
            className="text-lg md:text-xl text-gray-700 leading-relaxed font-serif space-y-6 max-w-2xl px-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, delay: 1.2 }}
          >
            <p>
              Hmmm… Ekkad ninchi start cheyalo ardham kavatle idhi nen neeku chala sarlu cheppindi… You're not only my best friend ra… you're more than that 💖 you are very special in my life ✨ nenu neetho matladutunte time gurthu undadhu ⏳💬 topic lekapoyina kuda netho matladali anipistadi… always 💖
            </p>
            <p>
              Nuvvu nannu prioritize chesthe naku chala happy ga untadi 🥰 nenu kuda na best ivvadanki try chestha just to make you happy 😊 but in return I won't expect anything more than friendship 💫 nee chinna chinna things kuda nannu chala happy ga chestayi ❤️ especially nuvvu na kosam time and attention ivvadam… that means a lot to me 🫶 nenu neetho unte naku ee prapancham e gurthu raadhu 🌍❌
            </p>
            <p>
              Recent ga na health kuda baaledu kada… aa time lo okka assurance evarikaina chala important 🥺 nenu adagadam kuda chala takkuva kani nuvvu chala sarlu ivvavu even unknowingly 💖 konni times lo naku body shivering vastundi aa time lo evaro cheyi pattukovali anipistadi 🤍 nuvvu na cheyi pattukunnapudu leda hug ichinapudu naku anipistadi ee prapancham motham aagipoyindhi ani 🫂💫
            </p>
            <p>
              Nenu ekkuva expect cheyyanu just chats 💬 calls 📞 and appudu appudu bayatiki veladam 🌸 basic ga mana chat eppudu agakudadhu ani anukunta 💭 adhi koncham high expectation ayina nak telidu ra 😅 inka nuvvu natho anni share cheskovali anukunta daily small things kuda 💖 ivi high expectations aa kadha naku telidhu kani nenu nee kosam na best istanu always 💯✨
            </p>
            <p className="font-medium text-pink-600 pt-4 text-center">
              I made this entire journey just for you 💌 to remind you of all the beautiful moments we've shared 📸 and the incredible connection we have 💖 every smile 😊 every laugh 😂 and every little moment together means the absolute world to me 🌍❤️ no matter what tomorrow brings having you by my side makes everything brighter ✨💫
            </p>
          </motion.div>

          <motion.div
            className="mt-14"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 2, duration: 1, type: "spring" }}
          >
            <span className="text-3xl animate-pulse inline-block mb-10">💖</span>
          </motion.div>

          <motion.button
            onClick={() => window.location.href = "/countdown"}
            className="relative group px-12 py-5 font-bold text-xl text-white bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 rounded-full overflow-hidden shadow-2xl hover:shadow-[0_0_30px_rgba(236,72,153,0.6)] transition-all duration-300 transform hover:scale-105 active:scale-95 z-30 w-full md:w-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 2.5 }}
            whileHover={{ y: -2 }}
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 group-hover:via-rose-600 group-hover:to-pink-600 transition-colors duration-500" />
            <span className="relative flex items-center justify-center gap-3 drop-shadow-md">
              There's something big 🌟
            </span>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
