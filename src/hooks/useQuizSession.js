import { useEffect, useState, useRef } from "react";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { getDatabase, ref, onValue } from "firebase/database";
import { db } from "@/firebase/firebase.js";

export function useQuizSession({sessionId, playerId}) {

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


  const [quizEnded, setQuizEnded] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);

  const [timeLeft, setTimeLeft] = useState(180);
  const [localTimeLeft, setLocalTimeLeft] = useState(null);
  const localTimerRef = useRef(null);


  const [session, setSession] = useState(null); // store session data

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
      if (data?.timeLeft !== undefined) {
      setTimeLeft(data.timeLeft);
    }
      setSession(data);

    });

    return () => unsub();
  }, [sessionId]);

    
    // Listen to see if host is still in the game
useEffect(() => {
  console.log("hostActive changed:", session?.hostActive);
  if (session?.hostActive === false) {
    alert("Host has left. The session will now end.");
    setQuizEnded(true);
  }
}, [session?.hostActive]);

    // Listens to see if host has started the game
    useEffect(() => {
      if (session?.sessionStarted === true) {
        setQuizStarted(true);
        console.log("quiz has started");
      }
  }, [session?.sessionStarted]);



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

    return () => clearInterval(localTimerRef.current);
  }, [timeLeft]);  


  // Dealing with questions : checking if correct, moving onto next question, resetting answer input.
  const submitShieldAnswer = async () => {
    const question = shieldQuestions[shieldIndex];
    if (!shieldUserAnswer || !playerId || !question) return;

    const isCorrect = shieldUserAnswer.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase();

    setShieldAnsweredCount((prev) => prev + 1);
    if (isCorrect) {
      setShieldCorrectCount((prev) => prev + 1);
    }

    setShieldIndex((prev) => (prev + 1) % shieldQuestions.length);
    setShieldUserAnswer("");
  };

  const submitSpellAnswer = async () => {
    const question = spellQuestions[spellIndex];
    if (!spellUserAnswer || !playerId || !question) return;

    const isCorrect = spellUserAnswer.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase();

    setSpellAnsweredCount((prev) => prev + 1);
    if (isCorrect) {
      setSpellCorrectCount((prev) => prev + 1);
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
  localTimeLeft,
  quizEnded,
  quizStarted,
};

}
