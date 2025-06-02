// src/components/QuizBattleScreen.jsx
import React, { useState, useEffect, useRef} from "react";
import { motion, AnimatePresence } from "framer-motion";
import QuizTimer from "@/components/ui/QuizTimer";
import QuestionCard from "@/components/ui/QuestionCard";
// import bgImage from "@/assets/fantasy-background.jpg"; // use your own background


const PlayerQuizBattleScreen = ({timeLeft, trackShield, trackSpell}) => {

  const [shieldGlowing, setShieldGlowing] = useState(false);
  const [spellAnimating, setSpellAnimating] = useState(false);


  const prevShieldCorrect = useRef(null);
  const prevSpellCorrect = useRef(null);


  // Set glowing for shield when shieldcount increases
  useEffect(() => {
    const current = trackShield?.correctCount;
    if (
      prevShieldCorrect.current !== null &&
      current > prevShieldCorrect.current
    ) {
      setShieldGlowing(true);
      const timer = setTimeout(() => setShieldGlowing(false), 1500);
      return () => clearTimeout(timer);
    }
    prevShieldCorrect.current = current;
  }, [trackShield?.correctCount]);

  // Set animation for spell when spellcount increases
  useEffect(() => {
    const current = trackSpell?.correctCount;
    if (
      prevSpellCorrect.current !== null &&
      current > prevSpellCorrect.current
    ) {
      setSpellAnimating(true);
      const timer = setTimeout(() => setSpellAnimating(false), 1500);
      return () => clearTimeout(timer);
    }
    prevSpellCorrect.current = current;
  }, [trackSpell?.correctCount]);



  return (
    <div className="relative w-full min-h-full bg-gray-900 text-white overflow-hidden p-4">
      {/* Shield Side Glow */}
      <div
        className={`absolute left-0 top-0 h-full w-1/2 transition-all duration-500 pointer-events-none ${
          shieldGlowing ? "bg-blue-500/10 shadow-[0_0_50px_rgba(59,130,246,0.7)]" : ""
        }`}
      />

      {/* Spell Animation */}
      <AnimatePresence>
        {spellAnimating && (
          <motion.div
            key="spell"
            initial={{ top: "100vh", opacity: 1, scale: 1 }}
            animate={{ top: "-20vh", opacity: 0, scale: 1.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute right-10 w-16 h-16 bg-purple-500 shadow-xl"
            style={{
              clipPath:
                "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
            }}
          />
        )}
      </AnimatePresence>
        <div className="w-full text-center mb-6">
          <QuizTimer timeLeft={timeLeft} />
        </div>
      {/* Main Quiz Layout */}
      <div className="flex flex-col lg:flex-row gap-6 relative z-10">

        {/* Track A */}
        <div className="flex-1 border-b lg:border-b-0 lg:border-r border-gray-600 pr-0 lg:pr-6">
          <h3 className="text-xl font-semibold mb-2">Track A</h3>
          <QuestionCard
            question={trackShield.currentQuestion}
            answer={trackShield.playerAnswer}
            onAnswerChange={trackShield.setPlayerAnswer}
            onSubmit={trackShield.submitAnswer}
          />
          <p className="mt-2 text-sm text-gray-300">
            {trackShield.correctCount} correct of {trackShield.answeredCount}
          </p>
        </div>

        {/* Track B */}
        <div className="flex-1 lg:pl-6">
          <h3 className="text-xl font-semibold mb-2">Track B</h3>
          <QuestionCard
            question={trackSpell.currentQuestion}
            answer={trackSpell.playerAnswer}
            onAnswerChange={trackSpell.setPlayerAnswer}
            onSubmit={trackSpell.submitAnswer}
          />
          <p className="mt-2 text-sm text-gray-300">
            {trackSpell.correctCount} correct of {trackSpell.answeredCount}
          </p>
        </div>
      </div>
    </div>
  );
};


export default PlayerQuizBattleScreen;
