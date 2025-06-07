import { useState, useEffect } from "react";
import { getDoc, doc } from "firebase/firestore";
import { db } from "@/firebase/firebase.js";

export function usePracticeQuizSession(session, playerId) {
  const [shieldQuestions, setShieldQuestions] = useState([]);
  const [spellQuestions, setSpellQuestions] = useState([]);

  const [shieldIndex, setShieldIndex] = useState(0);
  const [spellIndex, setSpellIndex] = useState(0);

  const [shieldUserAnswer, setShieldUserAnswer] = useState("");
  const [spellUserAnswer, setSpellUserAnswer] = useState("");

  const [shieldCorrectCount, setShieldCorrectCount] = useState(0);
  const [spellCorrectCount, setSpellCorrectCount] = useState(0);

  const [shieldAnsweredCount, setShieldAnsweredCount] = useState(0);
  const [spellAnsweredCount, setSpellAnsweredCount] = useState(0);

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

  // Submit answer for shield track
  const submitShieldAnswer = () => {
    const question = shieldQuestions[shieldIndex];
    if (!shieldUserAnswer || !playerId || !question) return;

    const isCorrect =
      shieldUserAnswer.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase();

    setShieldAnsweredCount((prev) => prev + 1);
    if (isCorrect) setShieldCorrectCount((prev) => prev + 1);

    setShieldIndex((prev) => (prev + 1) % shieldQuestions.length);
    setShieldUserAnswer("");
  };

  // Submit answer for spell track
  const submitSpellAnswer = () => {
    const question = spellQuestions[spellIndex];
    if (!spellUserAnswer || !playerId || !question) return;

    const isCorrect =
      spellUserAnswer.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase();

    setSpellAnsweredCount((prev) => prev + 1);
    if (isCorrect) setSpellCorrectCount((prev) => prev + 1);

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
  };
}
