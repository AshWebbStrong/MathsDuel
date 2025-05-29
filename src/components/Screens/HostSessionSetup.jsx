import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useState, useEffect } from "react";
import { db } from "@/firebase/firebase.js";
import { generateUniqueSessionCode } from "../GenerateUniqueSessionCode.jsx";
import BackToHomeButton from "@/components/BackToHomeButton.jsx";
import QuestionSetLibrary from "@/components/QuestionSetLibrary";

export default function HostSession({ onSessionStarted, goHome}) {

  const [questionSetData, setQuestionSetData] = useState(null);

  useEffect(() => {
    
    console.log("opening library");
    }, []);
 





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
    <div>
      <h2>Ready to host question set: </h2>
      <button onClick={startSession}>Start Session</button>
      <QuestionSetLibrary onSelect={(qs) => setQuestionSetData(qs)} />
      <BackToHomeButton goHome={goHome} />
    </div>
  );
}
