/* eslint-disable react/no-unescaped-entities */
"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";

// Reordered list: Priority ones first with captions, then the rest
// NOTE: Replaced .HEIC with .JPG since browsers cannot render HEIC files.
const images = [
  { src: "/photos/Snapchat-953361467.jpg", caption: "Our first Photo Together ✨" },
  { src: "/photos/Screenshot_20260413-162109.png", caption: "For me It was Our First Date ... Don't take it in a wrong wayy 🥺" },
  { src: "/photos/Screenshot_20260413-161752.png", caption: "I hope that it is your special dayy.... 💖" },
  { src: "/photos/IMG-20250705-WA0042.jpg", caption: "Heyy!! Thats your Birthday.. The day where my happiness has no limits 🎁" },
  { src: "/photos/IMG_3690.HEIC", caption: "Not Beautiful one.. But It is one of My Special Onesss!!!! 🥰" }, // Restored .HEIC 
  { src: "/photos/IMG-20250108-WA0068.jpg", caption: "" },
  { src: "/photos/IMG_3059.JPG", caption: "" },
  { src: "/photos/IMG_3083.JPG", caption: "" },
  { src: "/photos/IMG_7436.jpg", caption: "" },
  { src: "/photos/PXL_20250417_093654995.MP.jpg", caption: "" },
  { src: "/photos/PXL_20250704_080346165.MP.jpg", caption: "" },
  { src: "/photos/Snapchat-1298842608.jpg", caption: "" },
  { src: "/photos/Snapchat-1325004194.jpg", caption: "" },
  { src: "/photos/Snapchat-1715329677.jpg", caption: "" },
  { src: "/photos/Snapchat-550631017.jpg", caption: "" },
  { src: "/photos/Snapchat-971992566.jpg", caption: "" },
];

export default function GalleryPage() {
  const router = useRouter();

  return (
    <div className="h-screen w-full bg-black text-white overflow-y-scroll overflow-x-hidden snap-y snap-mandatory scroll-smooth relative no-scrollbar">

      {/* Intro Slide */}
      <div className="h-screen w-full snap-start snap-always flex flex-col items-center justify-center relative bg-gradient-to-br from-pink-950 via-rose-900 to-purple-950">
        <motion.div 
          className="absolute inset-0 bg-black/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
        />
        <motion.div 
          className="z-10 text-center px-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-200 to-purple-200 mb-6 font-serif">
            Our Gallery
          </h1>
          <p className="text-xl md:text-2xl text-pink-100/70 italic font-light">
            Scroll down for pure magic... 👇
          </p>
        </motion.div>
      </div>

      {/* Cinematic Feed */}
      {images.map((img, index) => (
        <div 
          key={index} 
          className="h-screen w-full snap-start snap-always relative flex items-center justify-center bg-black overflow-hidden group"
        >
          {/* Ambient blurred backdrop replicating the image colors! */}
          <div className="absolute inset-0 w-full h-full opacity-30 select-none z-0 overflow-hidden">
             <Image
              src={img.src}
              alt=""
              fill
              className="object-cover filter blur-[100px] scale-150 transform"
              priority={index < 3}
              unoptimized={img.src.toLowerCase().endsWith('.heic')}
            />
          </div>

          <motion.div 
            className="w-full max-w-4xl h-[90vh] md:h-[85vh] relative z-10 transition-transform duration-700 ease-out flex items-center justify-center p-4 md:p-8"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
          >
            {/* The Image Container */}
            <div className="relative w-full h-full rounded-[2.5rem] md:rounded-[3rem] overflow-hidden shadow-2xl bg-black/40 border border-white/10 flex items-center justify-center">
              <Image
                src={img.src}
                alt={img.caption || `Memory ${index + 1}`}
                fill
                className="object-contain" // Preserves original ratio without clipping!
                sizes="(max-width: 1024px) 100vw, 1024px"
                priority={index < 3}
                unoptimized={img.src.toLowerCase().endsWith('.heic')}
              />

              {/* Caption Overlay - Only shows if there is a caption! */}
              {img.caption && (
                <>
                  {/* Soft bottom vignette so text is always readable */}
                  <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />
                  
                  <motion.div 
                    className="absolute bottom-10 md:bottom-16 left-0 right-0 px-6 md:px-16 text-center"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.8 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                  >
                    <p className="text-xl md:text-3xl lg:text-4xl font-serif text-white/95 leading-relaxed drop-shadow-2xl font-light italic">
                      "{img.caption}"
                    </p>
                  </motion.div>
                </>
              )}
            </div>
          </motion.div>
        </div>
      ))}

      {/* Final Outro Slide */}
      <div className="h-screen w-full snap-start snap-always flex flex-col items-center justify-center relative bg-gradient-to-tl from-purple-950 via-rose-900 to-black p-4">
        <motion.div 
          className="z-10 text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-6xl font-serif text-white mb-12 drop-shadow-lg">
            Beautiful, isn't it? ✨
          </h2>

          <button
            onClick={() => router.push("/message")}
            className="relative group px-12 py-5 font-bold text-xl text-white bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-full overflow-hidden shadow-2xl hover:shadow-[0_0_40px_rgba(217,70,239,0.8)] transition-all duration-300 transform hover:scale-105 active:scale-95"
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 group-hover:via-rose-400 group-hover:to-pink-600 transition-colors duration-500" />
            <span className="relative flex items-center justify-center gap-3 drop-shadow-md">
              One last thing 💌
            </span>
          </button>
        </motion.div>
      </div>

      <style jsx global>{`
        /* Hide scrollbar for Chrome, Safari and Opera */
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        /* Hide scrollbar for IE, Edge and Firefox */
        .no-scrollbar {
          -ms-overflow-style: none; /* IE and Edge */
          scrollbar-width: none; /* Firefox */
        }
      `}</style>
    </div>
  );
}
