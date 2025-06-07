import { useState, useEffect } from "react";
import { doc, getDoc, updateDoc, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase/firebase.js";

export function useDuelQuizSession(session, playerId) {
  const [shieldQuestions, setShieldQuestions] = useState([]);
  const [spellQuestions, setSpellQuestions] = useState([]);

  const [shieldIndex, setShieldIndex] = useState(0);
  const [spellIndex, setSpellIndex] = useState(0);

  const [shieldUserAnswer, setShieldUserAnswer] = useState("");
  const [spellUserAnswer, setSpellUserAnswer] = useState("");

  // Player's own state
  const [shieldActive, setShieldActive] = useState(false);
  const [hitsReceived, setHitsReceived] = useState(0);
  const [opponentId, setOpponentId] = useState(null);

  // Opponent state
  const [opponentState, setOpponentState] = useState(null);

  // Load questions (shuffle on load)
  useEffect(() => {
    async function loadQuestions() {
      if (!session?.questionSetIdShield || !session?.questionSetIdSpell) return;

      try {
        const shieldSnap = await getDoc(doc(db, "questionSets", session.questionSetIdShield));
        const spellSnap = await getDoc(doc(db, "questionSets", session.questionSetIdSpell));

        if (shieldSnap.exists()) {
          const shuffledShield = shieldSnap.data().questions.sort(() => Math.random() - 0.5);
          setShieldQuestions(shuffledShield);
        }

        if (spellSnap.exists()) {
          const shuffledSpell = spellSnap.data().questions.sort(() => Math.random() - 0.5);
          setSpellQuestions(shuffledSpell);
        }
      } catch (err) {
        console.error("Failed to load questions:", err);
      }
    }
    loadQuestions();
  }, [session?.questionSetIdShield, session?.questionSetIdSpell]);

  // Listen to own player doc for real-time updates (shield, hits, opponentId)
  useEffect(() => {
    if (!session?.id || !playerId) return;

    const playerDocRef = doc(db, "sessions", session.id, "players", playerId);

    const unsubscribe = onSnapshot(playerDocRef, (docSnap) => {
      if (!docSnap.exists()) return;
      const data = docSnap.data();

      setShieldActive(data.shieldActive ?? false);
      setHitsReceived(data.hitsReceived ?? 0);
      setOpponentId(data.opponentId ?? null);
    });

    return () => unsubscribe();
  }, [session?.id, playerId]);

  // Listen to opponent's player doc
  useEffect(() => {
    if (!session?.id || !opponentId) {
      setOpponentState(null);
      return;
    }

    const opponentDocRef = doc(db, "sessions", session.id, "players", opponentId);

    const unsubscribe = onSnapshot(opponentDocRef, (docSnap) => {
      if (!docSnap.exists()) return;
      setOpponentState(docSnap.data());
    });

    return () => unsubscribe();
  }, [session?.id, opponentId]);

  // Submit shield answer
  const submitShieldAnswer = async () => {
    const question = shieldQuestions[shieldIndex];
    if (!question || !shieldUserAnswer.trim()) return;

    const isCorrect =
      shieldUserAnswer.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase();

    if (isCorrect) {
      // Activate shield on own player doc
      const playerDocRef = doc(db, "sessions", session.id, "players", playerId);
      await updateDoc(playerDocRef, { shieldActive: true });
    }

    setShieldIndex((prev) => (prev + 1) % shieldQuestions.length);
    setShieldUserAnswer("");
  };

  // Submit spell answer
  const submitSpellAnswer = async () => {
    const question = spellQuestions[spellIndex];
    if (!question || !spellUserAnswer.trim() || !opponentId) return;

    const isCorrect =
      spellUserAnswer.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase();

    if (isCorrect) {
      const opponentDocRef = doc(db, "sessions", session.id, "players", opponentId);

      // Fetch opponent's latest state (could also rely on opponentState but might be stale)
      const opponentSnap = await getDoc(opponentDocRef);
      if (!opponentSnap.exists()) return;

      const opponentData = opponentSnap.data();

      if (opponentData.shieldActive) {
        // Break opponent's shield
        await updateDoc(opponentDocRef, { shieldActive: false });
      } else {
        // Hit opponent if no shield
        const newHits = (opponentData.hitsReceived ?? 0) + 1;
        await updateDoc(opponentDocRef, { hitsReceived: newHits });
      }
    }

    setSpellIndex((prev) => (prev + 1) % spellQuestions.length);
    setSpellUserAnswer("");
  };

  return {
    trackShield: {
      currentQuestion: shieldQuestions[shieldIndex],
      playerAnswer: shieldUserAnswer,
      setPlayerAnswer: setShieldUserAnswer,
      submitAnswer: submitShieldAnswer,
      shieldActive,
    },
    trackSpell: {
      currentQuestion: spellQuestions[spellIndex],
      playerAnswer: spellUserAnswer,
      setPlayerAnswer: setSpellUserAnswer,
      submitAnswer: submitSpellAnswer,
    },
    hitsReceived,
    opponentState,
  };
}

