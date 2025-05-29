import { useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/firebase.js";
import BackToHomeButton from "@/components/BackToHomeButton.jsx";

export default function JoinQuiz({ onJoined, goHome }) {
  const [code, setCode] = useState("");

  async function handleJoin() {
    if (!code) return;

    const sessionRef = doc(db, "sessions", code.toUpperCase());
    const snap = await getDoc(sessionRef);

    if (!snap.exists()) {
      alert("Session not found. Check the code and try again.");
      return;
    }

    onJoined(code.toUpperCase());
  }

  return (
    <div>
      <h2>Join a Quiz</h2>
      <input placeholder="Enter session code" value={code} onChange={(e) => setCode(e.target.value)} />
      <button onClick={handleJoin}>Join</button>
      <BackToHomeButton goHome={goHome} />
    </div>
  );
}
