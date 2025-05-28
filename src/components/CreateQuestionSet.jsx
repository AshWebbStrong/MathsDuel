import { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";

export default function CreateQuestionSet({ onComplete }) {
  const [title, setTitle] = useState("");
  const [question, setQuestion] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [questions, setQuestions] = useState([]);

  function addQuestion() {
    if (!question || !correctAnswer) return;
    setQuestions([...questions, { question, correctAnswer }]);
    setQuestion("");
    setCorrectAnswer("");
  }

  async function finish() {
    if (!title || questions.length === 0) {
      alert("Add a title and at least one question.");
      return;
    }

    const newQuestionSet = {
      title,
      questions,
      createdAt: Date.now(),
    };

    const docRef = await addDoc(collection(db, "questionSets"), newQuestionSet);
    onComplete({ ...newQuestionSet, id: docRef.id });
  }

  return (
    <div>
      <h2>Create Question Set</h2>
      <input placeholder="Question Set Title" value={title} onChange={(e) => setTitle(e.target.value)} />
      <input placeholder="Question" value={question} onChange={(e) => setQuestion(e.target.value)} />
      <input placeholder="Correct Answer" value={correctAnswer} onChange={(e) => setCorrectAnswer(e.target.value)} />
      <button onClick={addQuestion}>Add Question</button>
      <p>{questions.length} questions added</p>
      <button onClick={finish}>Save Question Set</button>
    </div>
  );
}
