import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useState, useEffect } from "react";
import { db } from "@/firebase/firebase.js";
import { generateUniqueSessionCode } from "@/utils/GenerateUniqueSessionCode.js";
import BackToHomeButton from "@/components/ui/BackToHomeButton.jsx";
import QuestionSetLibrary from "@/components/ui/QuestionSetLibrary";

export default function HostSession({ onSessionStarted, goHome}) {

  const [questionSetDataA, setQuestionSetDataA] = useState(null);
  const [questionSetDataB, setQuestionSetDataB] = useState(null);



  async function startSession() {
    try {
      const durationSeconds = 900
      //Generate a session with a unique code
      const sessionCode = await generateUniqueSessionCode();
      const sessionRef = doc(db, "sessions", sessionCode);

      //Add to the session the questionSets & other stuff chosen later
      await setDoc(sessionRef, {
        questionSetIdShield: questionSetDataA.id,
        questionSetIdSpell: questionSetDataB.id,
        currentQuestionIndex: 0,
        startTime: serverTimestamp(), // use server timestamp
        duration: durationSeconds,
        hostActive: true,
        sessionStarted: false,
      });
    

    onSessionStarted(sessionRef.id);

    //Check for erorr
    } catch (err) {
      console.error("Error creating session:", err);
      alert("Failed to start session.");
    }
  }


  
  return (
    <div className="p-0 w-screen h-screen box-border bg-sky-200 flex min-h-screen">
      {/* Left section */}
      <div className="flex-1 p-8 space-x-4" >
        <h2 className="text-xl text-black font-semibold mb-4">
          Ready to host question set:
          </h2>
        <button
          onClick={startSession}
          className="mb-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
        >
          Start Session
        </button>
        <BackToHomeButton goHome={goHome} />
      </div>

      {/* Right section */}
      <div className="w-2/5 p-8 border-l border-gray-300 overflow-auto">
        <QuestionSetLibrary
          onSelectA={(qs) => setQuestionSetDataA(qs)}
          onSelectB={(qs) => setQuestionSetDataB(qs)}
        />
      </div>
    </div>

  );


}
