import { useEffect, useState, useRef } from "react";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { getDatabase, ref, onValue } from "firebase/database";
import { db } from "@/firebase/firebase.js";
import { usePracticeQuizSession } from "@/hooks/usePracticeQuizSession.js";
import { useDuelQuizSession } from "@/hooks/useDuelQuizSession.js";

export function useQuizSession({sessionId, playerId}) {

  const [quizMode, setQuizMode] = useState(null);
  const [session, setSession] = useState(null); // store session data

  const [shieldQuestions, setShieldQuestions] = useState([]);
  const [spellQuestions, setSpellQuestions] = useState([])

  const [shieldIndex, setShieldIndex] = useState(0);
  const [spellIndex, setSpellIndex] = useState(0);

  const [shieldUserAnswer, setShieldUserAnswer] = useState("");
  const [spellUserAnswer, setSpellUserAnswer] = useState("");

  const [shieldCorrectCount, setShieldCorrectCount] = useState(0);
  const [spellCorrectCount, setSpellCorrectCount] = useState(0);

  const [shieldAnsweredCount, setShieldAnsweredCount] = useState(0);
  const [spellAnsweredCount, setSpellAnsweredCount] = useState(0);


  const [quizFinished, setQuizFinished] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);

  const [timeLeft, setTimeLeft] = useState(null);
  const [localTimeLeft, setLocalTimeLeft] = useState(null);
  const localTimerRef = useRef(null);


  //error checking
  useEffect(() => {
  console.log("✅ useQuizSession mounted");
  return () => {
    console.log("🧹 useQuizSession unmounted");
  };
}, []);

  // Listen for session snapshot updates
  useEffect(() => {
    if (!sessionId) return;

    const sessionRef = doc(db, "sessions", sessionId);
    const unsub = onSnapshot(sessionRef, (snap) => {
    const data = snap.data();
      setQuizMode(data.quizMode);
      setSession(data);

    if (data?.timeLeft !== undefined && timeLeft === null) { //Should only set timeLeft once at the start
      setTimeLeft(data.timeLeft);
    }
  });

    return () => unsub();
  }, [sessionId]);


    
      // Listen to see if host is still in the game
  useEffect(() => {
    console.log("hostActive changed:", session?.hostActive);
    if (session?.hostActive === false) {
      alert("Host has left. The session will now end.");
      setQuizFinished(true);
    }
  }, [session?.hostActive]);

    // Listens to see if host has started the game
  useEffect(() => {
    if (session?.sessionStarted === true) {
      setQuizStarted(true);
      console.log("quiz has started");
    }
  }, [session?.sessionStarted]);

  // Listens to see if host has finished the game
  useEffect(() => {
    if (session?.sessionFinished === true) {
      setQuizFinished(true);
    }
  }, [session?.sessionFinished]);

  // Player Time management
  useEffect(() => {
    if (timeLeft === undefined || timeLeft === null) return;

    // Sync local timer to firestore timer value
    setLocalTimeLeft(timeLeft);

    // Clear any existing interval to avoid duplicates
    if (localTimerRef.current) clearInterval(localTimerRef.current);

    // Start local countdown
    localTimerRef.current = setInterval(() => {
      setLocalTimeLeft(prev => {
        if (prev === null || prev <= 0) {
          clearInterval(localTimerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    
    if (localTimeLeft === 0) {
      setQuizFinished(true)
    }

    return () => clearInterval(localTimerRef.current);
  }, [timeLeft]);  

    // Delegate to mode-specific hooks *passing session and playerId*


    
  const practiceState = usePracticeQuizSession(session, playerId);
  const duelState = useDuelQuizSession(session, playerId);

  // Combine results depending on mode
  let modeState = {};
  if (quizMode === "practice") {
    modeState = practiceState;
  } else if (quizMode === "duel") {
    modeState = duelState;
  }


  return {

  ...modeState,
  localTimeLeft,
  quizFinished,
  quizStarted,
};

}
