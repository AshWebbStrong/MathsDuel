import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useState, useEffect } from "react";
import { db } from "@/firebase/firebase.js";
import { generateUniqueSessionCode } from "@/utils/GenerateUniqueSessionCode.js";
import BackToHomeButton from "@/components/ui/BackToHomeButton.jsx";
import QuestionSetLibrary from "@/components/ui/QuestionSetLibrary";

export default function HostSessionSetup({ onSessionStarted, goHome }) {
  const [questionSetDataA, setQuestionSetDataA] = useState(null);
  const [questionSetDataB, setQuestionSetDataB] = useState(null);

    const QUIZ_MODES = {
    DUEL: "duel",
    PRACTICE: "practice",
    // add more modes later here
  };
  
  const [quizMode, setQuizMode] = useState(QUIZ_MODES.DUEL);
  const [quizDuration, setQuizDuration] = useState(5);
  const [startShielded, setStartShielded] = useState(true);








  async function startSession() {
    try {
      const sessionCode = await generateUniqueSessionCode();
      const sessionRef = doc(db, "sessions", sessionCode);

      await setDoc(sessionRef, {
        id: sessionRef.id,
        questionSetIdShield: questionSetDataA?.id,
        questionSetNameShield: questionSetDataA?.title,
        questionSetIdSpell: questionSetDataB?.id,
        questionSetNameSpell: questionSetDataB?.title,
        quizMode: quizMode,
        startTime: serverTimestamp(),
        finishTime: null,
        quizDuration: quizDuration * 60,
        startShielded: startShielded,
        hostActive: true,
        sessionStarted: false,
        sessionFinished: false,
        currentRound: 0,
        totalRounds: 3,                // or get from your settings
        roundDuration: 45,             // seconds per round
        summaryDuration: 5,            // summary screen duration
        roundState: "waiting",         // initial state before rounds start
        roundStartTime: null,
        pairs: [],
      });

      onSessionStarted(sessionRef.id);
    } catch (err) {
      console.error("Error creating session:", err);
      alert("Failed to start session.");
    }
  }

  return (
    <div className="w-screen h-screen bg-sky-100 flex">
      {/* Left panel: Setup */}
      <div className="flex-1 p-10 flex flex-col justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-800 mb-8">Maths Duel</h1>

          {/* Quiz Mode */}
          <div className="mb-6">
            <label className="block text-lg font-medium text-gray-700 mb-2">
              Quiz Mode
            </label>
            <div className="flex gap-4">
              <button
                className={`px-4 py-2 rounded-md ${
                  quizMode === QUIZ_MODES.DUEL
                    ? "bg-indigo-600 text-white"
                    : "bg-white text-gray-800 border"
                }`}
                onClick={() => setQuizMode(QUIZ_MODES.DUEL)}
              >
                Duel Mode
              </button>
              <button
                className={`px-4 py-2 rounded-md ${
                  quizMode === QUIZ_MODES.PRACTICE
                    ? "bg-indigo-600 text-white"
                    : "bg-white text-gray-800 border"
                }`}
                onClick={() => setQuizMode(QUIZ_MODES.PRACTICE)}
              >
                Practice
              </button>
            </div>
          </div>

          {/* Quiz Duration */}
          <div className="mb-6">
            <label className="block text-lg font-medium text-gray-700 mb-2">
              Quiz Duration: {quizDuration} min
            </label>
            <input
              type="range"
              min="0.5"
              max="5"
              value={quizDuration}
              onChange={(e) => setQuizDuration(Number(e.target.value))}
              className="w-full accent-indigo-600"
            />
          </div>

          {/* Start Shielded */}
          <div className="mb-6">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={startShielded}
                onChange={(e) => setStartShielded(e.target.checked)}
                className="form-checkbox h-5 w-5 text-indigo-600"
              />
              <span className="ml-2 text-lg text-gray-700">Start Shielded</span>
            </label>
          </div>

          {/* Future settings */}
          <div className="text-gray-500 text-sm italic">
            More settings coming soon...
          </div>
        </div>

        {/* Start Session Button */}
        <button
          onClick={startSession}
          className="mt-8 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          Start Session
        </button>
      </div>

      {/* Right panel: Question Set Library */}
      <div className="w-2/5 bg-white p-8 border-l border-gray-300 flex flex-col">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Question Set Library
        </h2>
        <div className="flex-1 overflow-auto rounded-lg border border-gray-200 p-4 bg-gray-50 shadow-inner">
          <QuestionSetLibrary
            onSelectA={(qs) => setQuestionSetDataA(qs)}
            onSelectB={(qs) => setQuestionSetDataB(qs)}
          />
        </div>

        <div className="mt-6">
          <BackToHomeButton goHome={goHome} />
        </div>
      </div>
    </div>
  );
}