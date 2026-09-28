"use client";
import { cn } from "@/lib/utils";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface HeroTextProps {
  text?: string;
  className?: string;
  textSize?: string;
}

export default function HeroText({
  text = "IMMERSE",
  className = "",
  textSize,
}: HeroTextProps) {
  const [count, setCount] = useState(0);
  const characters = text.split("");
  const sizeClass = textSize || (characters.length > 12 ? "text-[7.5vw] sm:text-[5vw] md:text-[4vw]" : "text-[15vw]");

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center h-full w-full bg-transparent transition-colors duration-700",
        className
      )}
    >
      {/* Immersive Background Grid */}
      <div
        className="absolute inset-0 opacity-[0.05] dark:opacity-[0.15] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, #888 1px, transparent 1px), linear-gradient(to bottom, #888 1px, transparent 1px)`,
          backgroundSize: "clamp(20px, 5vw, 60px) clamp(20px, 5vw, 60px)",
        }}
      />

      {/* Main Text Container */}
      <div 
        onClick={() => setCount((c) => c + 1)}
        title="Clic para reanimar texto"
        className="relative z-10 w-full px-4 flex flex-col items-center cursor-pointer select-none"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={count}
            className="flex flex-wrap justify-center items-center w-full"
          >
            {characters.map((char, i) => (
              <div
                key={i}
                className="relative px-[0.1vw] overflow-hidden group"
              >
                {/* Main Character - Responsive sizing using vw */}
                <motion.span
                  initial={{ opacity: 0, filter: "blur(10px)" }}
                  animate={{ opacity: 1, filter: "blur(0px)" }}
                  transition={{ delay: i * 0.04 + 0.3, duration: 0.8 }}
                  className={cn(sizeClass, "leading-none font-black text-white tracking-tighter drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]")}
                >
                  {char === " " ? "\u00A0" : char}
                </motion.span>

                {/* Top Slice Layer */}
                <motion.span
                  initial={{ x: "-100%", opacity: 0 }}
                  animate={{ x: "100%", opacity: [0, 1, 0] }}
                  transition={{
                    duration: 0.7,
                    delay: i * 0.04,
                    ease: "easeInOut",
                  }}
                  className={cn(
                    sizeClass,
                    "absolute inset-0 leading-none font-black text-[#0033FF] z-10 pointer-events-none drop-shadow-[0_0_25px_rgba(0,51,255,0.7)]"
                  )}
                  style={{ clipPath: "polygon(0 0, 100% 0, 100% 35%, 0 35%)" }}
                >
                  {char}
                </motion.span>

                {/* Middle Slice Layer */}
                <motion.span
                  initial={{ x: "100%", opacity: 0 }}
                  animate={{ x: "-100%", opacity: [0, 1, 0] }}
                  transition={{
                    duration: 0.7,
                    delay: i * 0.04 + 0.1,
                    ease: "easeInOut",
                  }}
                  className={cn(
                    sizeClass,
                    "absolute inset-0 leading-none font-black text-[#D4D6E6] z-10 pointer-events-none"
                  )}
                  style={{
                    clipPath: "polygon(0 35%, 100% 35%, 100% 65%, 0 65%)",
                  }}
                >
                  {char}
                </motion.span>

                {/* Bottom Slice Layer */}
                <motion.span
                  initial={{ x: "-100%", opacity: 0 }}
                  animate={{ x: "100%", opacity: [0, 1, 0] }}
                  transition={{
                    duration: 0.7,
                    delay: i * 0.04 + 0.2,
                    ease: "easeInOut",
                  }}
                  className={cn(
                    sizeClass,
                    "absolute inset-0 leading-none font-black text-[#807DFE] z-10 pointer-events-none drop-shadow-[0_0_25px_rgba(128,125,254,0.7)]"
                  )}
                  style={{
                    clipPath: "polygon(0 65%, 100% 65%, 100% 100%, 0 100%)",
                  }}
                >
                  {char}
                </motion.span>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
