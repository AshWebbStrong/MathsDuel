import React, { useState, useEffect, useRef } from "react";
import QuizTimer from "@/components/ui/QuizTimer";
import QuestionCard from "@/components/ui/QuestionCard";
import OnScreenKeyboard from "@/components/ui/OnScreenKeyboard.jsx"; // your new keyboard component


const PlayerQuizBattleScreen = ({
  playerName,
  timeLeft,
  trackShield,
  trackSpell,
  hitsReceived,
  opponentHitsReceived,
  opponentState,
}) => {
  const [flashRed, setFlashRed] = useState(false);

  const [showOpponentSpellHit, setShowOpponentSpellHit] = useState(false);
  const [showPlayerSpellHit, setShowPlayerSpellHit] = useState(false);

  const prevHitsReceived = useRef(0);
  const prevOpponentSpellCorrectCount = useRef(null);
  const prevPlayerSpellCorrectCount = useRef(null);



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


    // Triggers opponnent spell animation when they get a spell question correct
  useEffect(() => {
    if (!opponentState) return;
    const currentCount = opponentState.spellCorrectCount ?? 0;
    console.log("Opponent spellCorrectCount:", currentCount, "Previous:", prevOpponentSpellCorrectCount.current);


     if (prevOpponentSpellCorrectCount.current === null) {
    // First time opponentState is loaded, just initialize
    prevOpponentSpellCorrectCount.current = currentCount;
    return;
  }
    if (currentCount > prevOpponentSpellCorrectCount.current) {
      console.log("Triggering spell hit animation");
      setShowOpponentSpellHit(true);
      const timer = setTimeout(() => setShowOpponentSpellHit(false), 800);
      return () => clearTimeout(timer);
    }
    prevOpponentSpellCorrectCount.current = currentCount;
  }, [opponentState?.spellCorrectCount]);

  // Triggers a spell animation when getting a spell question correct
  useEffect(() => {
    const currentCount = trackSpell.correctCount ?? 0;

    if (prevPlayerSpellCorrectCount.current === null) {
      prevPlayerSpellCorrectCount.current = currentCount;
      return;
    }

    if (currentCount > prevPlayerSpellCorrectCount.current) {
      setShowPlayerSpellHit(true);
      const timer = setTimeout(() => setShowPlayerSpellHit(false), 800);
      return () => clearTimeout(timer);
    }
    prevPlayerSpellCorrectCount.current = currentCount;
  }, [trackSpell.correctCount]);



    // Player Health
    const maxHits = 4; // Adjust if needed

    const playerDamageFraction = Math.min(hitsReceived / maxHits, 1);
    const playerHealthFraction = 1 - playerDamageFraction;
    const playerHealthBarGradient = `linear-gradient(to right, 
      #22c55e ${playerHealthFraction * 100}%, 
      #dc2626 ${playerHealthFraction * 100}%)`;

    // Opponent Health
    const opponentDamageFraction = Math.min(opponentHitsReceived / maxHits, 1);
    const opponentHealthFraction = 1 - opponentDamageFraction;
    const opponentHealthBarGradient = `linear-gradient(to right, 
      #22c55e ${opponentHealthFraction * 100}%, 
      #dc2626 ${opponentHealthFraction * 100}%)`;

  return (
   <div className="relative w-full min-h-screen bg-gray-900 text-black overflow-hidden bg-cover bg-center flex flex-col"
    style={{ backgroundImage: "url('/images/duelBackground11.png')" }}
    >

        {/* ✅ Player Health Bar with Name on top */}
        <div className="absolute top-5 left-4 w-128 h-10 border-2 border-blue-500 rounded overflow-hidden z-50 relative">
          {/* Health bar gradient fills the container */}
          <div
            className="h-full transition-all duration-300"
            style={{ width: "100%", background: playerHealthBarGradient }}
          ></div>

          {/* Name positioned absolutely centered on top */}
          <div className="absolute inset-0 flex items-center justify-center text-white font-semibold text-3xl select-none pointer-events-none">
            {playerName || "Player"}
          </div>
        </div>

        {/* ✅ Opponent Health Bar with Name on top */}
        <div className="absolute top-5 right-4 w-128 z-50">
          <div className="relative h-10 border-2 border-red-500 rounded overflow-hidden">
            {/* Health bar fills the container */}
            <div
              className="h-full transition-all duration-300"
              style={{ width: "100%", background: opponentHealthBarGradient }}
            ></div>

            {/* Name absolutely centered on top */}
            <div className="absolute inset-0 flex items-center justify-center text-white font-semibold text-3xl select-none pointer-events-none">
              {opponentState?.name || "Opponent"}
            </div>
          </div>
        </div>



      {/* Timer at the top top */}
      <div className="flex justify-center items-center mb-2 mt-2 text-6xl font-bold">
        <QuizTimer timeLeft={timeLeft} />
      </div>
      
      {/* Shield Side Glow */}
      <div
        className={`absolute left-0 top-0 h-full w-1/2 pointer-events-none transition-all duration-500 ${
          trackShield.shieldActive ? "bg-blue-500/40 shadow-[0_0_100px_40px_rgba(59,130,246,0.9)]" : ""
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
            className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center p-4 rounded-lg  bg-opacity-70 transition-shadow duration-300 ${
              opponentState.shieldActive
                ? "shadow-[0_0_20px_5px_rgba(59,130,246,0.8)]"
                : ""
            }`}
            style={{ zIndex: 40 }}
          >
                <div
                  className="w-32 h-32 rounded-full mb-1 flex items-center justify-center bg-grey/300 backdrop-blur-sm relative" // <-- relative here
                  aria-label="Opponent Icon"
                  role="img"
                >
                  {opponentState.icon ? (
                    <img
                      src={opponentState.icon}
                      alt="Opponent avatar"
                      className="w-full h-full object-contain"
                      style={{ imageRendering: "pixelated" }}
                    />
                  ) : (
                    <span className="text-4xl select-none">👤</span>
                  )}

                  {/* Your red glow */}
                    {showOpponentSpellHit && (
                      <div
                        className="absolute left-1/2 -translate-x-6 bg-red-600 rounded"
                        style={{
                          top: "80%",
                          width: "12px",
                          animation: "flyDown 2s ease forwards, pulseGlow 1.5s infinite",
                          zIndex: 50,
                          pointerEvents: "none",
                          height: "900px", // final height it grows to
                          boxShadow: "0 0 12px 4px rgba(220,38,38,0.8)", // red glow around the line
                        }}
                      />
                    )}

                </div>
            <span className="text-lg font-bold">
              {opponentState.name || "Opponent"}
            </span>
          </div>
        )}


      {/* Main Quiz Layout */}
      <div className="flex flex-grow justify-between relative z-10 px-4">
        {/* Track A (Shield) */}
        <div className="w-128 flex flex-col">
      
          
          <QuestionCard
            question={trackShield.currentQuestion}
            answer={trackShield.playerAnswer}
            onAnswerChange={trackShield.setPlayerAnswer}
            onSubmit={trackShield.submitAnswer}
            onFocus={handleShieldFocus}
            onBlur={handleInputBlur}
            inputRef={shieldInputRef}
            shieldActive={trackShield.shieldActive}
            cooldown = {trackShield.cooldown}
            spellName = {"Protect!"}

          />
          <p className="mt-auto mr-auto bg-gray-800 bg-opacity-70 text-3xl text-gray-100 px-3 py-2 rounded-lg">
            {trackShield.correctCount ?? 0} correct of {trackShield.answeredCount ?? 0}
          </p>
        </div>

        {/* Track B (Spell) */}
        <div className="w-128 flex flex-col">
          
          <QuestionCard
            question={trackSpell.currentQuestion}
            answer={trackSpell.playerAnswer}
            onAnswerChange={trackSpell.setPlayerAnswer}
            onSubmit={trackSpell.submitAnswer}
            onFocus={handleSpellFocus}
            onBlur={handleInputBlur}
            inputRef={spellInputRef}
            cooldown = {trackSpell.cooldown}
            spellName = {"Attack!"}
          />
            <p className="mt-auto ml-auto bg-gray-800 bg-opacity-70 text-3xl text-gray-100 px-3 py-2 rounded-lg">
              {trackSpell.correctCount ?? 0} correct of {trackSpell.answeredCount ?? 0}
            </p>
        </div>
      </div>
      {/* Animation for casting a spell */}
      {showPlayerSpellHit && (
        <div
          className="absolute left-1/2 translate-x-6 bg-yellow-400 rounded"
          style={{
            
            bottom: "0%",
            width: "12px",
            animation: "flyDown 2s ease forwards, pulseGlow 1.5s infinite",
            zIndex: 50,
            pointerEvents: "none",
            height: "900px", // final height it grows to
            boxShadow: `
              0 0 8px 2px rgba(255, 255, 102, 0.9),    /* bright yellow */
              0 0 15px 5px rgba(255, 255, 204, 1),      /* pale yellow glow */
              0 0 25px 10px rgba(255, 255, 153, 0.7)    /* softer yellow spread */
            `,
          }}
        />
      )}
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
