"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

const timelineData = [
  {
    title: "Day We Met",
    description: "The beautiful moment our journey started. Everything felt different from this day onwards.",
    date: "The Beginning",
    emoji: "✨",
    color: "from-pink-400 to-rose-400"
  },
  {
    title: "First Fight 😂",
    description: "Who knew a silly argument would actually bring us closer? We learned so much about each other.",
    date: "Growing Together",
    emoji: "😤",
    color: "from-blue-400 to-indigo-400"
  },
  {
    title: "Best Memory 💖",
    description: "It felt like pure magic. A day I will hold in my heart forever.",
    date: "Unforgettable",
    emoji: "🌅",
    color: "from-purple-400 to-fuchsia-400"
  },
  {
    title: "Today 🌟",
    description: "Here we are, looking back at all these moments, and I couldn't be happier.",
    date: "Right Now",
    emoji: "🎁",
    color: "from-amber-400 to-orange-400"
  }
];

export default function TimelinePage() {
  const router = useRouter();

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center bg-gradient-to-b from-pink-50 via-rose-50 to-purple-50 selection:bg-pink-300 selection:text-white py-20 px-4 sm:px-8 overflow-hidden">
      
      {/* Background soft ambient blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
        <motion.div
           className="absolute w-[80vw] h-[80vw] sm:w-[50vw] sm:h-[50vw] bg-pink-200/40 rounded-full mix-blend-multiply filter blur-[100px]"
           animate={{ x: [0, 50, -50, 0], y: [0, -50, 50, 0] }}
           transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
           style={{ top: "0%", left: "-10%" }}
        />
        <motion.div
           className="absolute w-[70vw] h-[70vw] sm:w-[40vw] sm:h-[40vw] bg-purple-200/40 rounded-full mix-blend-multiply filter blur-[100px]"
           animate={{ x: [0, -50, 50, 0], y: [0, 50, -50, 0] }}
           transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
           style={{ bottom: "-10%", right: "-10%" }}
        />
      </div>

      {/* Header */}
      <motion.div 
        className="z-10 text-center mb-24"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600 mb-6 drop-shadow-sm">
          Our Special Timeline ⏳
        </h1>
        <p className="text-lg md:text-xl text-gray-600 font-medium max-w-lg mx-auto">
          Every moment led us to exactly where we are supposed to be. Let&apos;s look back at the journey...
        </p>
      </motion.div>

      {/* Timeline Container */}
      <div className="z-10 relative w-full max-w-4xl mx-auto flex flex-col items-center pb-32">
        {/* Center Vertical Line */}
        <div className="absolute top-0 bottom-0 left-1/2 w-1 -translate-x-1/2 bg-gradient-to-b from-pink-200 via-purple-300 to-pink-200 rounded-full" />

        {/* Timeline Items */}
        {timelineData.map((item, index) => {
          const isLeft = index % 2 === 0;

          return (
            <div key={index} className="relative flex items-center justify-between w-full mb-16 md:mb-24 last:mb-0 group">
              
              {/* Left Side Content Container */}
              <div className={`w-5/12 flex ${isLeft ? "justify-end" : "justify-start opacity-0 hidden md:flex"}`}>
                {isLeft && (
                  <motion.div 
                    className="w-full bg-white/50 backdrop-blur-xl p-6 md:p-8 rounded-3xl shadow-xl border border-white/60 text-right transform transition-transform duration-300 hover:scale-105"
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.7, type: "spring", bounce: 0.3 }}
                  >
                    <span className="text-sm font-bold text-pink-400 block mb-2 tracking-wider uppercase">{item.date}</span>
                    <h3 className="text-2xl font-extrabold text-gray-800 mb-3">{item.title}</h3>
                    <p className="text-gray-600 leading-relaxed bg-white/30 p-4 rounded-xl shadow-inner inline-block text-left">
                      {item.description}
                    </p>
                  </motion.div>
                )}
              </div>

              {/* Center Dot */}
              <motion.div 
                className="absolute left-1/2 -translate-x-1/2 w-14 h-14 flex items-center justify-center rounded-full bg-white shadow-[0_0_20px_rgba(236,72,153,0.3)] border-4 border-pink-100 z-10"
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: 0.2, type: "spring" }}
              >
                <div className={`w-full h-full rounded-full bg-gradient-to-br ${item.color} flex items-center justify-center text-2xl drop-shadow-md`}>
                  {item.emoji}
                </div>
              </motion.div>

              {/* Right Side Content Container */}
              <div className={`w-full md:w-5/12 flex pl-20 md:pl-0 ${!isLeft ? "justify-start" : "justify-end opacity-0 hidden md:flex"}`}>
                {!isLeft && (
                  <motion.div 
                    className="w-full bg-white/50 backdrop-blur-xl p-6 md:p-8 rounded-3xl shadow-xl border border-white/60 text-left transform transition-transform duration-300 hover:scale-105"
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.7, type: "spring", bounce: 0.3 }}
                  >
                    <span className="text-sm font-bold text-purple-400 block mb-2 tracking-wider uppercase">{item.date}</span>
                    <h3 className="text-2xl font-extrabold text-gray-800 mb-3">{item.title}</h3>
                    <p className="text-gray-600 leading-relaxed bg-white/30 p-4 rounded-xl shadow-inner inline-block">
                      {item.description}
                    </p>
                  </motion.div>
                )}
              </div>

              {/* Mobile Fallback Container for Left Items (Since on mobile we want everything on the right of the line, wait, actually let's adjust for pure responsive ease) */}
              {isLeft && (
                <div className="w-full flex md:hidden justify-start pl-20">
                  <motion.div 
                    className="w-full bg-white/50 backdrop-blur-xl p-6 rounded-3xl shadow-xl border border-white/60 text-left"
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.7, type: "spring", bounce: 0.3 }}
                  >
                    <span className="text-sm font-bold text-pink-400 block mb-2 tracking-wider uppercase">{item.date}</span>
                    <h3 className="text-2xl font-extrabold text-gray-800 mb-3">{item.title}</h3>
                    <p className="text-gray-600 leading-relaxed bg-white/30 p-4 rounded-xl shadow-inner inline-block">
                      {item.description}
                    </p>
                  </motion.div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* End Button */}
      <motion.div 
        className="z-20 mt-10 mb-20"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "0px" }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        <button
          onClick={() => router.push("/gallery")}
          className="relative group px-12 py-5 font-bold text-xl text-white bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-full overflow-hidden shadow-2xl hover:shadow-[0_0_30px_rgba(217,70,239,0.7)] transition-all duration-300 transform hover:scale-105 active:scale-95"
        >
          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 group-hover:via-rose-400 group-hover:to-pink-600 transition-colors duration-500" />
          <span className="relative flex items-center justify-center gap-3 drop-shadow-md">
            See our memories 📸
          </span>
        </button>
      </motion.div>

    </div>
  );
}
