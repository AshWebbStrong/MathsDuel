import { useEffect, useState, useRef } from "react";
import {
  collection,
  getDocs,
  getDoc,
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/firebase/firebase.js";
import BackToHomeButton from "@/components/ui/BackToHomeButton.jsx";
import QuizTimer from "@/components/ui/QuizTimer";

export default function HostSessionActive({ sessionId, goHome, onFinishQuiz }) {
  const [session, setSession] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef(null);

  // Utility: live session listener
  useEffect(() => {
    if (!sessionId) return;
    const sessionRef = doc(db, "sessions", sessionId);
    const unsubscribe = onSnapshot(sessionRef, (docSnap) => {
      if (docSnap.exists()) {
        setSession(docSnap.data());
      } else {
        console.warn("Session not found");
      }
    });
    return unsubscribe;
  }, [sessionId]);

  // Pair players randomly
  async function generatePairs() {
    const playersRef = collection(db, "sessions", sessionId, "players");
    const playersSnapshot = await getDocs(playersRef);
    const allPlayers = playersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    if (allPlayers.length === 0) {
      console.warn("No players to pair.");
      return [];
    }

    const shuffled = [...allPlayers].sort(() => 0.5 - Math.random());
    const pairs = [];

    while (shuffled.length >= 2) {
      const p1 = shuffled.pop();
      const p2 = shuffled.pop();
      pairs.push({ playerAId: p1.id, playerBId: p2.id });
    }
    if (shuffled.length === 1) {
      pairs.push({ playerAId: shuffled.pop().id, playerBId: null });
    }
    return pairs;
  }

  // Core: run all rounds
  const runRoundCycle = async () => {
    if (!sessionId) return;
    const sessionRef = doc(db, "sessions", sessionId);

    const totalRounds = session?.totalRounds ?? 3;
    const roundDuration = session?.roundDuration ?? 300;
    const summaryDuration = session?.summaryDuration ?? 5;
    const prepareDuration = 2;

    // === Prepare stage (only once at the start) ===
    await updateDoc(sessionRef, {
      roundState: "prepare",
      currentRound: 0,
      pairs: [],
      roundStartTime: null,
    });

    setTimeLeft(prepareDuration);
    await sleepTimer(prepareDuration);

    // === Run each round ===
    for (let round = 1; round <= totalRounds; round++) {
      console.log(`Starting round ${round}`);

      // Reset hits/shields and generate pairs
      await resetHitsAndShields();
      const pairs = await generatePairs();

      // Assign pairs to session
      await updateDoc(sessionRef, { pairs });
      console.log("Generated pairs:", pairs);

      // Reload questions for each player and clear their inputs
      await reloadPlayerQuestionsAndClearInputs(pairs);

      // Start active round
      await updateDoc(sessionRef, {
        roundState: "active",
        currentRound: round,
        roundStartTime: serverTimestamp(),
      });

      setTimeLeft(roundDuration);
      await sleepTimer(roundDuration);

      // Summary
      await updateDoc(sessionRef, { roundState: "summary" });

      setTimeLeft(summaryDuration);
      await sleepTimer(summaryDuration);
    }

    // Done
    onFinishQuiz();
  };

  async function reloadPlayerQuestionsAndClearInputs(pairs) {
    const questionSetIdShield = session?.questionSetIdShield;
    const questionSetIdSpell = session?.questionSetIdSpell;
    if (!questionSetIdShield || !questionSetIdSpell) return;

    // Load question sets
    const shieldSnap = await getDoc(doc(db, "questionSets", questionSetIdShield));
    const spellSnap = await getDoc(doc(db, "questionSets", questionSetIdSpell));

    if (!shieldSnap.exists() || !spellSnap.exists()) {
      console.warn("Question sets missing");
      return;
    }

    const shieldQuestions = shieldSnap.data().questions || [];
    const spellQuestions = spellSnap.data().questions || [];

    // Prepare batched update for players
    const batch = writeBatch(db);

    for (const pair of pairs) {
      for (const playerId of [pair.playerAId, pair.playerBId]) {
        if (!playerId) continue;

        const playerRef = doc(db, "sessions", sessionId, "players", playerId);

        batch.update(playerRef, {
          shieldQuestions: shuffleArray(shieldQuestions),
          spellQuestions: shuffleArray(spellQuestions),
          shieldUserAnswer: "",
          spellUserAnswer: "",
          shieldIndex: 0,
          spellIndex: 0,
        });
      }
    }

    await batch.commit();
  }

  // Utility shuffle function
  function shuffleArray(array) {
    return [...array].sort(() => Math.random() - 0.5);
  }


  // Utility: sleep with live countdown
  const sleepTimer = (seconds) => {
    return new Promise((resolve) => {
      let remaining = seconds;
      setTimeLeft(remaining);

      if (timerRef.current) clearInterval(timerRef.current);

      timerRef.current = setInterval(() => {
        remaining -= 1;
        setTimeLeft(remaining);

        if (remaining <= 0) {
          clearInterval(timerRef.current);
          resolve();
        }
      }, 1000);
    });
  };

  // Run round cycle when session starts
  useEffect(() => {
    if (session?.sessionStarted && session.roundState === "waiting") {
      runRoundCycle();
    }
  }, [session]);

  // Host can finish manually
  const handleFinishQuiz = async () => {
    if (!sessionId) return;
    await updateDoc(doc(db, "sessions", sessionId), {
      sessionFinished: true,
      finishTime: serverTimestamp(),
      roundState: "finished",
    });
    onFinishQuiz();
  };

  // Reset player states
  async function resetHitsAndShields() {
    const playersRef = collection(db, "sessions", sessionId, "players");
    const playersSnapshot = await getDocs(playersRef);
    const batch = writeBatch(db);

    playersSnapshot.forEach((docSnap) => {
      batch.update(docSnap.ref, {
        hitsReceived: 0,
        shieldActive: false,
      });
    });

    await batch.commit();
  }

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h2 className="text-2xl font-bold mb-4">Hosting Session: {sessionId}</h2>

      {session && (
        <>
          <p>
            Round: {session.currentRound ?? 0} / {session.totalRounds ?? "?"}
          </p>
          <p>Status: {session.roundState ?? "waiting"}</p>
        </>
      )}

      <div className="my-6">
        <QuizTimer timeLeft={timeLeft} />
      </div>

      <button
        onClick={handleFinishQuiz}
        className="mb-6 px-5 py-3 bg-red-600 text-white rounded hover:bg-red-700 transition"
      >
        End Quiz Now
      </button>

      <BackToHomeButton goHome={goHome} />
    </div>
  );
}
