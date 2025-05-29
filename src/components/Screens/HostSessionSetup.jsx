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
      const durationSeconds = 180
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
      });
    

    onSessionStarted(sessionRef.id);

    //Check for erorr
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
        <QuestionSetLibrary
          onSelectA={(qs) => setQuestionSetDataA(qs)}
          onSelectB={(qs) => setQuestionSetDataB(qs)}
        />
      </div>
    </div>
  );


}
