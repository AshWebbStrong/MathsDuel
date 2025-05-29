import { useEffect, useState, useRef } from "react";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { getDatabase, ref, onValue } from "firebase/database";
import { db } from "@/firebase/firebase.js";

export function useQuizSession(sessionId) {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [playerAnswer, setPlayerAnswer] = useState("");
  const [answeredCount, setAnsweredCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
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
    async function loadQuestions() {
      if (!session?.questionSetId) return;
      try {
        const qsRef = doc(db, "questionSets", session.questionSetId);
        const qsSnap = await getDoc(qsRef);
        if (!qsSnap.exists()) {
          console.warn("Question set not found in Firestore.");
          return;
        }
        const shuffled = qsSnap.data().questions.sort(() => Math.random() - 0.5);
        setQuestions(shuffled);
      } catch (err) {
        console.error("Error loading question set:", err);
      }
    }
    loadQuestions();
  }, [session?.questionSetId]);

  // Timer management - depends on session and offset
 useEffect(() => {
  if (!session?.startTime || !session?.duration || offset === null) return;

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

  // Dealing with questions
  const currentQuestion = questions[currentQuestionIndex];

  const submitAnswer = async () => {
    if (!playerAnswer || !playerId || !currentQuestion) return;

    const isCorrect =
      playerAnswer.trim().toLowerCase() === currentQuestion.correctAnswer.trim().toLowerCase();

    setAnsweredCount((prev) => prev + 1);
    if (isCorrect) setCorrectCount((prev) => prev + 1);

    const playerRef = doc(db, "sessions", sessionId, "players", playerId);
    await setDoc(playerRef, { lastAnswer: playerAnswer }, { merge: true });

    // Move to next random question
    setCurrentQuestionIndex((prev) => (prev + 1) % questions.length);
    setPlayerAnswer("");
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
    currentQuestion,
    playerAnswer,
    setPlayerAnswer,
    submitAnswer,
    answeredCount,
    correctCount,
    timeLeft,
    quizEnded,
  };
}
