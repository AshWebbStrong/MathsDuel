import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useState, useEffect } from "react";
import { db } from "@/firebase/firebase.js";
import { generateUniqueSessionCode } from "@/utils/GenerateUniqueSessionCode.js";
import BackToHomeButton from "@/components/ui/BackToHomeButton.jsx";
import QuestionSetLibrary from "@/components/ui/QuestionSetLibrary";

export default function HostSession({ onSessionStarted, goHome}) {

  const [questionSetData, setQuestionSetData] = useState(null);



  async function startSession() {
    try {
      const durationSeconds = 180
      const sessionCode = await generateUniqueSessionCode();
      const sessionRef = doc(db, "sessions", sessionCode);

      
      await setDoc(sessionRef, {
        questionSetId: questionSetData.id,
        currentQuestionIndex: 0,
        startTime: serverTimestamp(), // use server timestamp
        duration: durationSeconds,
        hostActive: true,
      });
    

    onSessionStarted(sessionRef.id);
    } catch (err) {
      console.error("Error creating session:", err);
      alert("Failed to start session.");
    }
  }

  return (
    <div style={{ display: "flex", width: "100%", minHeight: "100vh" }}>
      {/* Left section */}
      <div style={{ flex: 1, padding: "2rem" }}>
        <h2>Ready to host question set:</h2>
        <button onClick={startSession}>Start Session</button>
        <BackToHomeButton goHome={goHome} />
      </div>

      {/* Right section */}
      <div style={{ width: "40%", padding: "2rem", borderLeft: "1px solid #ccc" }}>
        <QuestionSetLibrary onSelect={(qs) => setQuestionSetData(qs)} />
      </div>
    </div>
  );


}
