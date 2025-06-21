import React, { useState, useEffect, useRef } from "react";
import QuizTimer from "@/components/ui/QuizTimer";
import QuestionCard from "@/components/ui/QuestionCard";
import OnScreenKeyboard from "@/components/ui/OnScreenKeyboard.jsx"; // your new keyboard component


const PlayerQuizBattleScreen = ({
  timeLeft,
  trackShield,
  trackSpell,
  hitsReceived,
  opponentState,
}) => {
  const [flashRed, setFlashRed] = useState(false);

  const prevHitsReceived = useRef(0);


  // keyboard
  const [activeKeyboard, setActiveKeyboard] = useState({  input: "",layout: [],onInput: null, });
  const shieldInputRef = useRef(null);
  const spellInputRef = useRef(null);

  // Show keyboard when input is focused
  const handleShieldFocus = () => {
    setActiveKeyboard({
      input: "shield",
      layout: trackShield.keyboardLayout || [],
      onInput: trackShield.setPlayerAnswer,
    });
  };

  const handleSpellFocus = () => {
    setActiveKeyboard({
      input: "spell",
      layout: trackSpell.keyboardLayout || [],
      onInput: trackSpell.setPlayerAnswer,
    });
  };

  // Hide keyboard when input loses focus (but delay a bit to allow keyboard button clicks)
  const handleInputBlur = () => {
    // Use a small timeout so that if the blur is caused by clicking on keyboard buttons, it doesn't hide immediately
    setTimeout(() => {
      if (
        document.activeElement !== shieldInputRef.current &&
        document.activeElement !== spellInputRef.current
      ) {
        setActiveKeyboard({ layout: [], onInput: null });
      }
    }, 100);
  };

  // Flash red on new hit
  useEffect(() => {
    if (hitsReceived > prevHitsReceived.current) {
      setFlashRed(true);
      const timer = setTimeout(() => setFlashRed(false), 1000);
      return () => clearTimeout(timer);
    }
    prevHitsReceived.current = hitsReceived;
  }, [hitsReceived]);

  // ✅ Health Bar logic: green to red
  const maxHits = 4; // adjust to match game rules
  const damageFraction = Math.min(hitsReceived / maxHits, 1);
  const healthFraction = 1 - damageFraction;

  const healthBarGradient = `linear-gradient(to right, 
    #22c55e ${healthFraction * 100}%, 
    #dc2626 ${healthFraction * 100}%)`;

  return (
   <div className="relative w-full min-h-screen bg-gray-900 text-white overflow-hidden bg-cover bg-center flex flex-col"
    style={{ backgroundImage: "url('/images/duelBackground7.png')" }}
    >
         {/* ✅ Health Bar top-left */}
      <div className="absolute top-3 left-4 w-120 h-7 border-2 border-white rounded overflow-hidden bg-black/40 z-50">
        <div
          className="h-full transition-all duration-300"
          style={{ width: "100%", background: healthBarGradient }}
        ></div>
      </div>

      {/* Timer at the top top */}
      <div className="flex justify-center items-center mb-2 mt-2 text-3xl font-bold">
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

       {/* ✅ Opponent card dead center */}
      {opponentState && (
        <div
          className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center p-4 rounded-lg bg-black bg-opacity-70 border-2 border-white transition-shadow duration-300 ${
            opponentState.shieldActive
              ? "shadow-[0_0_20px_5px_rgba(59,130,246,0.8)]"
              : ""
          }`}
          style={{ zIndex: 40 }}
        >
          <div
            className="w-16 h-16 rounded-full mb-1 border-1 border-white flex items-center justify-center text-4xl select-none bg-white/20 backdrop-blur-sm"
            aria-label="Opponent Icon"
            role="img"
          >
            {opponentState.icon || "👤"}
          </div>
          <span className="text-lg font-bold">
            {opponentState.name || "Opponent"}
          </span>
        </div>
      )}

      {/* Main Quiz Layout */}
      <div className="flex flex-grow gap-0 relative z-10">
        {/* Track A (Shield) */}
        <div className="flex-1 flex flex-col">
      
          
          <QuestionCard
            question={trackShield.currentQuestion}
            answer={trackShield.playerAnswer}
            onAnswerChange={trackShield.setPlayerAnswer}
            onSubmit={trackShield.submitAnswer}
            onFocus={handleShieldFocus}
            onBlur={handleInputBlur}
            inputRef={shieldInputRef}

          />
          <p className="mt-auto mr-auto bg-gray-800 bg-opacity-70 text-3xl text-gray-100 px-3 py-2 rounded-lg">
            {trackShield.correctCount ?? 0} correct of {trackShield.answeredCount ?? 0}
          </p>
        </div>

        {/* Track B (Spell) */}
        <div className="flex-1 flex flex-col relative">
          
          <QuestionCard
            question={trackSpell.currentQuestion}
            answer={trackSpell.playerAnswer}
            onAnswerChange={trackSpell.setPlayerAnswer}
            onSubmit={trackSpell.submitAnswer}
            onFocus={handleSpellFocus}
            onBlur={handleInputBlur}
            inputRef={spellInputRef}
          />
            <p className="mt-auto ml-auto bg-gray-800 bg-opacity-70 text-3xl text-gray-100 px-3 py-2 rounded-lg">
              {trackSpell.correctCount ?? 0} correct of {trackSpell.answeredCount ?? 0}
            </p>
        </div>
      </div>
      {/*keyboard*/}
      {Object.values(activeKeyboard.layout).some(row => row.length > 0) && (
        <div
          className="absolute bottom-20 left-0 w-full bg-black bg-opacity-80 p-4 border-4 border-yellow-500 z-[9999]"
          onMouseDown={(e) => e.preventDefault()}
        >
          <OnScreenKeyboard
            layout={activeKeyboard.layout}
            onKeyPress={(key) => {
              console.log("Key pressed:", key);
              if (activeKeyboard.input === "shield") {
                  activeKeyboard.onInput(trackShield.playerAnswer + key);
                } else if (activeKeyboard.input === "spell") {
                  activeKeyboard.onInput(trackSpell.playerAnswer + key);
                }
            }}
            onBackspace={() => {
              if (activeKeyboard.input === "shield") {
                  activeKeyboard.onInput(trackShield.playerAnswer.slice(0, -1));
                } else if (activeKeyboard.input === "spell") {
                  activeKeyboard.onInput(trackSpell.playerAnswer.slice(0, -1));
                }
            }}
            onClear={() => {
              if (activeKeyboard.input === "shield") {
                activeKeyboard.onInput("");
              } else if (activeKeyboard.input === "spell") {
                activeKeyboard.onInput("");
              }
            }}
            onSubmit={() => {
              
            if (activeKeyboard.input == "shield" ){
              trackShield.submitAnswer()
            }
            if (activeKeyboard.input == "spell" ){
              trackSpell.submitAnswer()
            }
            
          }}
          />
        </div>
      )}
    </div>  
  );
};

export default PlayerQuizBattleScreen;
