import { useEffect, useState, useRef } from "react";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase/firebase.js";
import { usePracticeQuizSession } from "@/hooks/usePracticeQuizSession.js";
import { useDuelQuizSession } from "@/hooks/useDuelQuizSession.js";

export function useQuizSession({sessionId, playerId}) {

  const [quizMode, setQuizMode] = useState(null);
  const [session, setSession] = useState(null); // store session data

  const [playerName, setPlayerName] = useState(null);

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


  // Listen to player data changes, including player name
  useEffect(() => {
    if (!sessionId || !playerId) return;

    const playerRef = doc(db, "sessions", sessionId, "players", playerId);
    const unsubscribe = onSnapshot(playerRef, (snap) => {
      const data = snap.data();
      console.log("Player snapshot data:", data);
      if (data?.name) {
        setPlayerName(data.name);
      }
    });

    return () => unsubscribe();
  }, [sessionId, playerId]);

  // Listen for session snapshot updates
  useEffect(() => {
    if (!sessionId) return;

    const sessionRef = doc(db, "sessions", sessionId);
    const unsub = onSnapshot(sessionRef, (snap) => {
    const data = snap.data();
      setQuizMode(data.quizMode);
      setSession(data);
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
  playerName,
  quizFinished,
  quizStarted,
};

}
