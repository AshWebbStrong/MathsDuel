import { useState, useEffect, useRef } from "react";
import { doc, getDoc, updateDoc, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase/firebase.js";
import { evaluate, simplify } from 'mathjs';

export function useDuelQuizSession(session, playerId) {
  const [shieldQuestions, setShieldQuestions] = useState([]);
  const [spellQuestions, setSpellQuestions] = useState([]);

  const [shieldIndex, setShieldIndex] = useState(0);
  const [spellIndex, setSpellIndex] = useState(0);

  const [shieldCorrectCount, setShieldCorrectCount] = useState(0);
  const [spellCorrectCount, setSpellCorrectCount] = useState(0);

  const [shieldAnsweredCount, setShieldAnsweredCount] = useState(0);
  const [spellAnsweredCount, setSpellAnsweredCount] = useState(0);

  const [shieldUserAnswer, setShieldUserAnswer] = useState("");
  const [spellUserAnswer, setSpellUserAnswer] = useState("");

  const [shieldKeyboardLayout, setShieldKeyboardLayout] = useState([]);
  const [spellKeyboardLayout, setSpellKeyboardLayout] = useState([]);

  // Player's own state
  const [shieldActive, setShieldActive] = useState(false);
  const [hitsReceived, setHitsReceived] = useState(0);
  const [opponentId, setOpponentId] = useState(null);

  // Opponent state
  const [opponentState, setOpponentState] = useState(null);

    // New duel round states
  const [roundState, setRoundState] = useState(null);
  const [currentRound, setCurrentRound] = useState(0);
  const [roundDuration, setRoundDuration] = useState(0);
  const [pairs, setPairs] = useState([]);

  // Timer
  const [localRoundTimeLeft, setLocalRoundTimeLeft] = useState(null);
  const localTimerRef = useRef(null);

  // Load questions (shuffle on load)
  useEffect(() => {
    async function loadQuestions() {
      if (!session?.questionSetIdShield || !session?.questionSetIdSpell) return;

      try {
        const shieldSnap = await getDoc(doc(db, "questionSets", session.questionSetIdShield));
        const spellSnap = await getDoc(doc(db, "questionSets", session.questionSetIdSpell));

      if (shieldSnap.exists()) {
        const data = shieldSnap.data();
        const shuffledShield = data.questions.sort(() => Math.random() - 0.5);
        setShieldQuestions(shuffledShield);
        setShieldKeyboardLayout(data.keyboardLayout || []); // ✅
      }

      if (spellSnap.exists()) {
        const data = spellSnap.data();
        const shuffledSpell = data.questions.sort(() => Math.random() - 0.5);
        setSpellQuestions(shuffledSpell);
        setSpellKeyboardLayout(data.keyboardLayout || []); // ✅
      }

      } catch (err) {
        console.error("Failed to load questions:", err);
      }
    }
    loadQuestions();
  }, [session?.questionSetIdShield, session?.questionSetIdSpell, currentRound]);

  // Listen to own player doc for real-time updates (shield, hits, opponentId)
  useEffect(() => {
    if (!session?.id || !playerId) return;

    const playerDocRef = doc(db, "sessions", session.id, "players", playerId);

    const unsubscribe = onSnapshot(playerDocRef, (docSnap) => {
      if (!docSnap.exists()) return;
      const data = docSnap.data();

      setShieldActive(data.shieldActive ?? false);
      setHitsReceived(data.hitsReceived ?? 0);
      // setOpponentId(data.opponentId ?? null);
    });

    return () => unsubscribe();
  }, [session?.id, playerId]);

   // Update duel round state from session prop
  useEffect(() => {
    if (!session) return;
    setRoundState(session.roundState || null);
    setCurrentRound(session.currentRound || 0);
    setRoundDuration(session.roundDuration || 0);
    setPairs(session.pairs || []);
  }, [session]);

    // Derive opponentId from pairs and playeraId
  useEffect(() => {
    if (!pairs || pairs.length === 0 || !playerId) {
      setOpponentId(null);
      return;
    }
    const pair = pairs.find(
      (p) => p.playerAId === playerId || p.playerBId === playerId
    );
    if (!pair) {
      setOpponentId(null);
    } else {
      setOpponentId(pair.playerAId === playerId ? pair.playerBId : pair.playerAId);
    }
  }, [pairs, playerId]);

  // Listen to opponent's player doc using the derived opponentId
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

      const isCorrect = question.acceptableAnswers.some(ans =>
        checkAnswer(shieldUserAnswer, ans.value, ans.mode)
      );

    if (isCorrect) {
      // Activate shield on own player doc
      const playerDocRef = doc(db, "sessions", session.id, "players", playerId);
      await updateDoc(playerDocRef, { shieldActive: true });
      setShieldCorrectCount((prev) => (prev + 1));
    }

    setShieldAnsweredCount((prev) => (prev + 1));
    setShieldIndex((prev) => (prev + 1) % shieldQuestions.length);
    setShieldUserAnswer("");
  };

  // Submit spell answer
  const submitSpellAnswer = async () => {
    if (!opponentId) {
      console.log("No opponent to shoot at");
      return;
    }
    const question = spellQuestions[spellIndex];
    if (!question || !spellUserAnswer.trim() || !opponentId) return;

      const isCorrect = question.acceptableAnswers.some(ans =>
        checkAnswer(spellUserAnswer, ans.value, ans.mode)
      );

    if (isCorrect) {
      setSpellCorrectCount((prev) => (prev + 1));
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

    setSpellAnsweredCount((prev) => (prev + 1));
    setSpellIndex((prev) => (prev + 1) % spellQuestions.length);
    setSpellUserAnswer("");
  };

  // Normalises the answer to math form
  function normalizeInput(str) {
    return str
      .replace(/÷/g, "/")
      .replace(/×/g, "*")
      .replace(/(\d)([a-zA-Z])/g, '$1*$2') // e.g. 4a → 4*a
      .replace(/\s+/g, "");
  }

  function checkAnswer(userInput, expectedAnswer, mode = 'numeric') {
    const u = normalizeInput(userInput);
    const e = normalizeInput(expectedAnswer);

    try {
      if (mode === 'exact') {
        return u === e;
      }

      if (mode === 'numeric') {
        return evaluate(u) === evaluate(e);
      }

      if (mode === 'algebra') {
        return simplify(u).equals(simplify(e));
      }

      throw new Error(`Unknown mode: ${mode}`);
    } catch (err) {
      console.error(`Math check failed [${mode}] for "${userInput}" vs "${expectedAnswer}": ${err.message}`);
      return false;
    }
  }

  //Timer Logic
  useEffect(() => {
    if (!roundDuration) return;

    // Reset local time left to new round duration
    setLocalRoundTimeLeft(roundDuration);

    // Clear previous timer
    if (localTimerRef.current) clearInterval(localTimerRef.current);

    // Start new countdown
    localTimerRef.current = setInterval(() => {
      setLocalRoundTimeLeft(prev => {
        if (prev <= 0) {
          clearInterval(localTimerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(localTimerRef.current);

  }, [roundDuration, currentRound]);

  return {
    trackShield: {
      currentQuestion: shieldQuestions[shieldIndex],
      playerAnswer: shieldUserAnswer,
      setPlayerAnswer: setShieldUserAnswer,
      submitAnswer: submitShieldAnswer,
      shieldActive,
      keyboardLayout: shieldKeyboardLayout,
      answeredCount: shieldAnsweredCount,
      correctCount: shieldCorrectCount,
    },
    trackSpell: {
      currentQuestion: spellQuestions[spellIndex],
      playerAnswer: spellUserAnswer,
      setPlayerAnswer: setSpellUserAnswer,
      submitAnswer: submitSpellAnswer,
      keyboardLayout: spellKeyboardLayout,
      answeredCount: spellAnsweredCount,
      correctCount: spellCorrectCount,
    },
    hitsReceived,
    opponentState,
        // New duel round info
    roundState,
    currentRound,
    roundDuration,
    localRoundTimeLeft,

    pairs,
    opponentId,
  };
}

