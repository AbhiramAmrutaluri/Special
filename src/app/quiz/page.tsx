"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";

// Beautiful Mesh Background strictly for the Quiz Page
const QuizBackgroundBlobs = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <motion.div
      className="absolute bg-rose-400/70 w-[400px] h-[400px] rounded-full mix-blend-multiply filter blur-[100px]"
      animate={{
        x: [0, -100, 50, -100, 0],
        y: [0, 50, -150, 50, 0],
        scale: [1, 1.2, 0.9, 1.1, 1],
      }}
      transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
      style={{ top: "10%", right: "10%" }}
    />
    <motion.div
      className="absolute bg-fuchsia-400/60 w-[450px] h-[450px] rounded-full mix-blend-multiply filter blur-[120px]"
      animate={{
        x: [0, 150, -50, 150, 0],
        y: [0, -100, 100, -100, 0],
        scale: [1, 0.9, 1.1, 0.9, 1],
      }}
      transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      style={{ top: "40%", left: "5%" }}
    />
    <motion.div
      className="absolute bg-pink-300/70 w-[500px] h-[500px] rounded-full mix-blend-multiply filter blur-[120px]"
      animate={{
        x: [0, -100, 100, -50, 0],
        y: [0, 100, -100, -100, 0],
        scale: [1, 1.3, 0.9, 1.2, 1],
      }}
      transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
      style={{ bottom: "0%", right: "20%" }}
    />
  </div>
);

const QUIZ_QUESTIONS = [
  "What is my most attractive quality? ✨",
  "Who apologizes first after a fight? 😤",
  "What was our most memorable day together? 🌅",
  "What makes me different from others? 🥺",
  "What am I to you? 💖",
];

const FEEDBACK_MESSAGES = [
  "Aww, that's so sweet! 🥺💖",
  "I knew you'd say that! 🥰",
  "You melt my heart! 🫠💕",
  "Hehe, you're the best! 🌸",
  "You are my everything! 😍",
];

export default function QuizPage() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleNext = () => {
    if (!inputValue.trim() || isTransitioning) return; // Prevent empty submits
    
    setIsTransitioning(true);
    setFeedback(FEEDBACK_MESSAGES[currentIndex]);

    // Wait 2 seconds showing feedback before moving on
    setTimeout(() => {
      setFeedback(null);
      setInputValue("");
      
      if (currentIndex < QUIZ_QUESTIONS.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setIsTransitioning(false);
      } else {
        // Redirect completely when done
        router.push("/unlock");
      }
    }, 2500);
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center bg-rose-50 overflow-hidden px-4 md:px-0 selection:bg-pink-300 selection:text-white">
      <QuizBackgroundBlobs />

      {/* Progress Indicator */}
      <motion.div 
        className="absolute top-10 font-medium text-pink-500 bg-white/40 px-6 py-2 rounded-full shadow-sm backdrop-blur-md border border-white/50 z-20"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, type: "spring" }}
      >
        Question {currentIndex + 1} of {QUIZ_QUESTIONS.length}
      </motion.div>

      <div className="z-10 w-full max-w-2xl relative">
        <AnimatePresence mode="wait">
          {!feedback ? (
            <motion.div
              key={`question-${currentIndex}`}
              className="bg-white/30 backdrop-blur-2xl rounded-[2.5rem] p-8 md:p-12 shadow-[0_8px_40px_rgb(0,0,0,0.08)] border border-white/60 flex flex-col items-center text-center w-full"
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -30 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <h2 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-600 mb-8 leading-tight">
                {QUIZ_QUESTIONS[currentIndex]}
              </h2>

              <div className="w-full relative mb-8">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Write your beautiful answer here..."
                  className="w-full bg-white/60 border-2 border-white/80 focus:border-pink-400 outline-none rounded-3xl p-6 text-lg text-gray-800 placeholder-gray-400 shadow-inner resize-none transition-all duration-300 min-h-[150px]"
                />
              </div>

              <motion.button
                onClick={handleNext}
                disabled={!inputValue.trim()}
                className="relative group px-12 py-4 font-bold text-lg text-white bg-gradient-to-r from-pink-500 to-rose-500 rounded-full overflow-hidden shadow-xl hover:shadow-[0_0_25px_rgba(244,63,94,0.5)] transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
                whileHover={{ y: -2 }}
              >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-pink-500 to-rose-500 group-hover:via-rose-400 group-hover:to-pink-600 transition-colors duration-500" />
                <span className="relative flex items-center justify-center gap-2">
                  Submit 💌
                </span>
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key={`feedback-${currentIndex}`}
              className="bg-white/40 backdrop-blur-3xl rounded-[3rem] p-12 shadow-[0_8px_40px_rgb(255,192,203,0.3)] border border-pink-200/60 flex flex-col items-center justify-center text-center w-full min-h-[350px]"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              transition={{ type: "spring", bounce: 0.5, duration: 0.8 }}
            >
              <h2 className="text-4xl md:text-5xl font-extrabold text-pink-600 leading-tight">
                {feedback}
              </h2>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
