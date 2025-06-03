import { useEffect, useState, useRef } from "react";
import { getDoc, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase/firebase.js";
import BackToHomeButton from "@/components/ui/BackToHomeButton.jsx";
import QuizTimer from "@/components/ui/QuizTimer";

export default function HostSessionActive({ sessionId, goHome, onFinishQuiz }) {

const timerRef = useRef(null);
const [timeLeft, setTimeLeft] = useState(180);
const [offset, setOffset] = useState(0); // store offset here
const [session, setSession] = useState(null); // store session data

  useEffect(() => {
    if (!sessionId) return;

    const sessionRef = doc(db, "sessions", sessionId);

    // Live listener
    const unsubscribe = onSnapshot(sessionRef, (docSnap) => {
      if (docSnap.exists()) {
        setSession(docSnap.data());
      } else {
        console.warn("Session not found");
      }
    });

    return () => unsubscribe();
  }, [sessionId]);


  // Timer management - depends on session and offset
  useEffect(() => {
      if (!session?.startTime || !session?.quizDuration || offset == null) return;

      const startTimestamp = session.startTime.toMillis();
      const endTimestamp = startTimestamp + session.quizDuration * 1000;

      const sessionRef = doc(db, "sessions", sessionId);  // Make sure sessionId is in scope here

      const updateTimer = async () => {
        const estimatedNow = Date.now() + offset;
        const remaining = Math.max(0, Math.floor((endTimestamp - estimatedNow) / 1000));
        setTimeLeft(remaining);

        try {
          await updateDoc(sessionRef, { timeLeft: remaining });
        } catch (err) {
          console.error("Failed to update timeLeft in Firestore:", err);
        }

        if (remaining === 0) {
          setQuizEnded(true);
          clearInterval(timerRef.current);
        }
      };

      updateTimer();

      timerRef.current = setInterval(updateTimer, 1000);

      return () => {
        clearInterval(timerRef.current);
      };
    }, [session?.startTime, session?.quizDuration, offset]);


  return (
    <div>
      <h2>Hosting session! {sessionId}</h2>
      <BackToHomeButton goHome={goHome} />

      <div className="w-full text-center mb-6">
        <QuizTimer timeLeft={timeLeft} />
      </div>
    </div>
    
  );
}
