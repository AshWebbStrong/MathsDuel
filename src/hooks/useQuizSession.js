// hooks/useQuizSession.js
import { useEffect, useState, useRef } from "react";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

export function useQuizSession(sessionId) {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [playerAnswer, setPlayerAnswer] = useState("");
  const [answeredCount, setAnsweredCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(180);
  const [quizEnded, setQuizEnded] = useState(false);
  const [playerId, setPlayerId] = useState(null);

  const timerRef = useRef(null);

  useEffect(() => {
    let id = sessionStorage.getItem("playerId");
    if (!id) {
      id = Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem("playerId", id);
    }
    setPlayerId(id);
  }, []);

useEffect(() => {
  if (!sessionId) return;

  const sessionRef = doc(db, "sessions", sessionId);
  const unsub = onSnapshot(sessionRef, async (snap) => {
    const session = snap.data();

    if (!session || !session.questionSetId) {
      console.warn("Session or questionSetId not ready yet.");
      return;
    }

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
  });

  return () => unsub();
}, [sessionId]);


  useEffect(() => {
    if (questions.length === 0 || quizEnded) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setQuizEnded(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [questions]);

  const currentQuestion = questions[currentQuestionIndex];

  const submitAnswer = async () => {
    if (!playerAnswer || !playerId || !currentQuestion) return;

    const isCorrect =
      playerAnswer.trim().toLowerCase() === currentQuestion.correctAnswer.trim().toLowerCase();

    setAnsweredCount((prev) => prev + 1);
    if (isCorrect) setCorrectCount((prev) => prev + 1);

    const playerRef = doc(db, "sessions", sessionId, "players", playerId);
    await setDoc(playerRef, { lastAnswer: playerAnswer }, { merge: true });

    // move to next random question
    setCurrentQuestionIndex((prev) => (prev + 1) % questions.length);
    setPlayerAnswer("");
  };

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
