import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import QuizTimer from "@/components/ui/QuizTimer";
import QuestionCard from "@/components/ui/QuestionCard";

const PlayerQuizBattleScreen = ({
  timeLeft,
  trackShield,
  trackSpell,
  hitsReceived,
  opponentState,
}) => {
  const [flashRed, setFlashRed] = useState(false);

  const prevShieldActive = useRef(false);
  const prevHitsReceived = useRef(0);

  // Flash red on new hit
  useEffect(() => {
    if (hitsReceived > prevHitsReceived.current) {
      setFlashRed(true);
      const timer = setTimeout(() => setFlashRed(false), 1000);
      return () => clearTimeout(timer);
    }
    prevHitsReceived.current = hitsReceived;
  }, [hitsReceived]);

  return (
   <div className="relative w-full min-h-screen bg-gray-900 text-white overflow-hidden p-4 flex flex-col">
      {
      /* Timer and BackToHome Button at the top */}
      <div className="flex justify-between items-center mb-4">
        <QuizTimer timeLeft={timeLeft} />
      </div>

      {/* Shield Side Glow */}
      <div
        className={`absolute left-0 top-0 h-full w-1/2 pointer-events-none transition-all duration-500 ${
          trackShield.shieldActive ? "bg-blue-500/20 shadow-[0_0_60px_rgba(59,130,246,0.8)]" : ""
        }`}
      />

    {/* Full Screen Red Flash on Hit */}
      <div
        className={`fixed inset-0 pointer-events-none transition-opacity duration-300 ${
          flashRed ? "bg-red-600/50 opacity-100" : "opacity-0"
        }`}
        style={{ zIndex: 50 }}
      />

      {/* Main Quiz Layout */}
      <div className="flex flex-grow gap-6 relative z-10">
        {/* Track A (Shield) */}
        <div className="flex-1 flex flex-col border-r border-gray-600 pr-6">
          <h3 className="text-xl font-semibold mb-2">Track A</h3>
          <QuestionCard
            question={trackShield.currentQuestion}
            answer={trackShield.playerAnswer}
            onAnswerChange={trackShield.setPlayerAnswer}
            onSubmit={trackShield.submitAnswer}
          />
          <p className="mt-auto text-sm text-gray-300">
            {trackShield.correctCount ?? 0} correct of {trackShield.answeredCount ?? 0}
          </p>
        </div>

        {/* Track B (Spell) */}
        <div className="flex-1 flex flex-col pl-6 relative">
          <h3 className="text-xl font-semibold mb-2">Track B</h3>
          <QuestionCard
            question={trackSpell.currentQuestion}
            answer={trackSpell.playerAnswer}
            onAnswerChange={trackSpell.setPlayerAnswer}
            onSubmit={trackSpell.submitAnswer}
          />
          <p className="mt-auto text-sm text-gray-300">
            {trackSpell.correctCount ?? 0} correct of {trackSpell.answeredCount ?? 0}
          </p>

          {/* Opponent Name Bottom Right */}
          <div className="absolute bottom-0 right-0 p-2 text-right text-white bg-black bg-opacity-50 rounded-tl-md select-none pointer-events-none">
            {opponentState ? (
              opponentState.waiting ? (
                <span className="italic text-gray-400">Waiting for opponent...</span>
              ) : (
                <span>Opponent: <strong>{opponentState.name || opponentState.id}</strong></span>
              )
            ) : (
              <span>Loading opponent...</span>
            )}
          </div>
        </div>
      </div>
    </div>  
  );
};

export default PlayerQuizBattleScreen;
