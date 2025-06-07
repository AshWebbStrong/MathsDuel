import { useEffect, useState, useRef } from "react";
import { collection, getDocs, onSnapshot, doc, updateDoc, serverTimestamp } from "firebase/firestore";
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

  const [pairsAssigned, setPairsAssigned] = useState(false);

  useEffect(() => {
    if (session && session.quizMode === "duel" && !pairsAssigned) {
      assignDuelPairs();
      setPairsAssigned(true);
    }
  }, [session, pairsAssigned]);


  const assignDuelPairs = async () => {
  if (!sessionId) return;

  try {
    const playersRef = collection(db, "sessions", sessionId, "players");
    const playersSnapshot = await getDocs(playersRef);
    const allPlayers = playersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    if (allPlayers.length === 0) {
      console.warn("No players to pair.");
      return;
    }

    // Shuffle players randomly
    const shuffled = [...allPlayers].sort(() => 0.5 - Math.random());

    while (shuffled.length >= 2) {
      const p1 = shuffled.pop();
      const p2 = shuffled.pop();

      // Update p1 document with opponentId = p2.id and initial state
      await updateDoc(doc(db, "sessions", sessionId, "players", p1.id), {
        opponentId: p2.id,
        shieldActive: false,
        hit: false,
        waiting: false,
      });

      // Update p2 document with opponentId = p1.id and initial state
      await updateDoc(doc(db, "sessions", sessionId, "players", p2.id), {
        opponentId: p1.id,
        shieldActive: false,
        hit: false,
        waiting: false,
      });
    }

    // Handle odd player left
    if (shuffled.length === 1) {
      const lonelyPlayer = shuffled.pop();
      await updateDoc(doc(db, "sessions", sessionId, "players", lonelyPlayer.id), {
        opponentId: null,
        waiting: true,
      });
    }

    console.log("Duel pairs assigned individually to player docs");
  } catch (err) {
    console.error("Failed to assign duel pairs:", err);
  }
};


  // Quiz finishing
    const handleFinishQuiz = async () => {
        if (!sessionId) {
          console.error("No sessionId provided");
          return;
        }

        console.log("Finishing quiz for session:", sessionId);

        await updateDoc(doc(db, "sessions", sessionId), {
        sessionFinished: true,
        finishTime: serverTimestamp(),
        });
        onFinishQuiz();
    };


  // Timer management - depends on session and offset
useEffect(() => {
  if (!session?.startTime || !session?.quizDuration || offset == null) return;

  const startTimestamp = session.startTime.toMillis();
  const endTimestamp = startTimestamp + session.quizDuration * 1000;
  if (!sessionId) return;
  const sessionRef = doc(db, "sessions", sessionId);

    let lastWrite = null;

    const updateTimer = async () => {
    const estimatedNow = Date.now() + offset;
    const remaining = Math.max(0, Math.floor((endTimestamp - estimatedNow) / 1000));
    setTimeLeft(remaining);

// Write immediately if it's the first run
    if (lastWrite === null || remaining % 5 === 0 && remaining !== lastWrite) {
      lastWrite = remaining;
      try {
        await updateDoc(sessionRef, { timeLeft: remaining });
      } catch (err) {
        console.error("Failed to update timeLeft in Firestore:", err);
      }
    }


    if (remaining === 0) {
      onFinishQuiz()
      clearInterval(timerRef.current);
    }
  };

  updateTimer();
  timerRef.current = setInterval(updateTimer, 1000);

  return () => clearInterval(timerRef.current);
}, [session?.startTime, session?.quizDuration, offset]);


  return (
    <div>
      <h2>Hosting session! {sessionId}</h2>
      <BackToHomeButton goHome={goHome} />
      <button
      onClick={handleFinishQuiz}
      className="mt-4 px-5 py-3 bg-blue-600 text-white font-semibold rounded-md shadow-md
                 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300
                 transition duration-200"
    >
      End Quiz
    </button>
      <div className="w-full text-center mb-6">
        <QuizTimer timeLeft={timeLeft} />
      </div>
    </div>
    
  );
}
