import { useEffect, useState, useRef } from "react";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { getDatabase, ref, onValue } from "firebase/database";
import { db } from "@/firebase/firebase.js";

export function useQuizSession(sessionId) {

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

  const [timeLeft, setTimeLeft] = useState(180);
  const [quizEnded, setQuizEnded] = useState(false);
  const [playerId, setPlayerId] = useState(null);

  const [offset, setOffset] = useState(0); // store offset here
  const [session, setSession] = useState(null); // store session data

  const timerRef = useRef(null);

  //error checking
  useEffect(() => {
  console.log("✅ useQuizSession mounted");
  return () => {
    console.log("🧹 useQuizSession unmounted");
  };
}, []);


  // Generate or retrieve player ID once
  useEffect(() => {
    let id = sessionStorage.getItem("playerId");
    if (!id) {
      id = Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem("playerId", id);
    }
    setPlayerId(id);
  }, []);

  // Listen for server time offset
  useEffect(() => {
    const offsetRef = ref(getDatabase(), ".info/serverTimeOffset");
    const unsubscribe = onValue(offsetRef, (snap) => {
      const newOffset = snap.val() || 0;
      setOffset(newOffset);
    });

    return () => unsubscribe();
  }, []);

  // Listen for session snapshot updates
  useEffect(() => {
    if (!sessionId) return;

    const sessionRef = doc(db, "sessions", sessionId);
    const unsub = onSnapshot(sessionRef, (snap) => {
      const data = snap.data();
      setSession(data);
    });

    return () => unsub();
  }, [sessionId]);

  // Load questions once when session questionSetId is available
  useEffect(() => {
    async function loadBothQuestionSets() {
      if (!session?.questionSetIdShield || !session?.questionSetIdSpell) return;

      try {
        const shieldSnap = await getDoc(doc(db, "questionSets", session.questionSetIdShield));
        const spellSnap = await getDoc(doc(db, "questionSets", session.questionSetIdSpell));

        if (shieldSnap.exists()) {
          const shuffled = shieldSnap.data().questions.sort(() => Math.random() - 0.5);
          setShieldQuestions(shuffled);
        }

        if (spellSnap.exists()) {
          const shuffled = spellSnap.data().questions.sort(() => Math.random() - 0.5);
          setSpellQuestions(shuffled);
        }
      } catch (err) {
        console.error("Error loading question sets:", err);
      }
    }

    loadBothQuestionSets();
  }, [session?.questionSetIdShield, session?.questionSetIdSpell]);


  // Timer management - depends on session and offset
 useEffect(() => {
  if (!session?.startTime || !session?.duration || offset == null) return;

  const startTimestamp = session.startTime.toMillis();
  const endTimestamp = startTimestamp + session.duration * 1000

  const updateTimer = () => {
    const estimatedNow = Date.now() + offset;
    const remaining = Math.max(0, Math.floor((endTimestamp - estimatedNow) / 1000));
    setTimeLeft(remaining);
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
}, [session?.startTime, session?.duration, offset]);

  // Dealing with questions : checking if correct, moving onto next question, resetting answer input.
  const submitShieldAnswer = async () => {
    const question = shieldQuestions[shieldIndex];
    if (!shieldUserAnswer || !playerId || !question) return;

    const isCorrect = shieldUserAnswer.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase();

    setShieldAnsweredCount((prev) => prev + 1);
    if (isCorrect) setShieldCorrectCount((prev) => prev + 1);

    await setDoc(doc(db, "sessions", sessionId, "players", playerId), { //What does this whole bit do?
      lastShieldAnswer: shieldUserAnswer,
    }, { merge: true });

    setShieldIndex((prev) => (prev + 1) % shieldQuestions.length);
    setShieldUserAnswer("");
  };

  const submitSpellAnswer = async () => {
    const question = spellQuestions[spellIndex];
    if (!spellUserAnswer || !playerId || !question) return;

    const isCorrect = spellUserAnswer.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase();

    setSpellAnsweredCount((prev) => prev + 1);
    if (isCorrect) setSpellCorrectCount((prev) => prev + 1);

    await setDoc(doc(db, "sessions", sessionId, "players", playerId), {
      lastSpellAnswer: spellUserAnswer,
    }, { merge: true });

    setSpellIndex((prev) => (prev + 1) % spellQuestions.length);
    setSpellUserAnswer("");
  };

  
    // Listen to see if host is still in the game
    useEffect(() => {
    const sessionRef = doc(db, "sessions", sessionId);
    const unsubscribe = onSnapshot(sessionRef, (docSnap) => {
      if (!docSnap.exists()) return;
      const data = docSnap.data();
      if (data.hostActive === false) {
        alert("Host has left. The session will now end.");
        // handle kicking players out or redirecting
      }
    });
    return () => unsubscribe();
  }, [sessionId]);


  return {
  trackShield: {
    currentQuestion: shieldQuestions[shieldIndex],
    playerAnswer: shieldUserAnswer,
    setPlayerAnswer: setShieldUserAnswer,
    submitAnswer: submitShieldAnswer,
    answeredCount: shieldAnsweredCount,
    correctCount: shieldCorrectCount,
  },
  trackSpell: {
    currentQuestion: spellQuestions[spellIndex],
    playerAnswer: spellUserAnswer,
    setPlayerAnswer: setSpellUserAnswer,
    submitAnswer: submitSpellAnswer,
    answeredCount: spellAnsweredCount,
    correctCount: spellCorrectCount,
  },
  timeLeft,
  quizEnded,
};

}
