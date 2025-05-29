import { doc, setDoc } from "firebase/firestore";
import { db } from "@/firebase/firebase.js";
import { serverTimestamp } from "firebase/firestore";
import { generateUniqueSessionCode } from "../GenerateUniqueSessionCode.jsx";
import BackToHomeButton from "@/components/BackToHomeButton.jsx";

export default function HostSession({ questionSetData, onSessionStarted, goHome}) {
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
      <h2>Ready to host question set: {questionSetData.title}</h2>
      <button onClick={startSession}>Start Session</button>
      <BackToHomeButton goHome={goHome} />
    </div>
  );
}
