// src/components/QuizBattleScreen.jsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
// import bgImage from "@/assets/fantasy-background.jpg"; // use your own background

const QuizBattleScreen = ({ shieldActive, spellFired, children }) => {
  return (
    <div
      className="relative w-full h-screen bg-cover bg-center text-white overflow-hidden"
      // style={{ backgroundImage: `url(${bgImage})` }}
    >
      {/* Shield Side Glow */}
      <div
        className={`absolute left-0 top-0 h-full w-1/2 transition-all duration-500 ${
          shieldActive ? "bg-blue-500/20 shadow-[0_0_50px_rgba(59,130,246,0.7)]" : ""
        }`}
      />

      {/* Spell Animation */}
        <AnimatePresence>
        {spellFired && (
            <motion.div
            key="spell"
            initial={{ top: "100vh", opacity: 1, scale: 1 }}
            animate={{ top: "-20vh", opacity: 0, scale: 1.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute right-10 w-16 h-16 bg-purple-500 shadow-xl"
            style={{
                position: "absolute",
                clipPath: "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)"
            }}
            />
        )}
        </AnimatePresence>

      {/* Quiz UI in the middle */}
      <div className="relative z-10 p-8">
        {children}
      </div>
    </div>
  );
};

export default QuizBattleScreen;
