import { useState } from "react";
import { db } from "@/firebase/firebase.js";
import { collection, addDoc } from "firebase/firestore";
import BackToHomeButton from "@/components/ui/BackToHomeButton.jsx";

export default function CreateQuestionSet({goHome}) {
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
    
  }

  return (
    <div className="p-0 w-screen h-screen box-border bg-gray-400 flex items-start justify-center">
      {/* Outer full-screen container */}

      <div className="max-w-xl w-full mt-12 p-6 bg-white/80 rounded-xl shadow-md backdrop-blur-sm mx-4">
        {/* Inner card container */}
        <input 
          className=" text-2xl font-bold text-gray-800 mb-6 mx-auto block " 
          placeholder="Name of Problem Set"
        />

        <div className="space-y-4">
          <input
            className="w-full p-3 rounded-lg border border-gray-300 bg-white/80 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            placeholder="Question Set Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <input
            className="w-full p-3 rounded-lg border border-gray-300 bg-white/80 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            placeholder="Question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />

          <input
            className="w-full p-3 rounded-lg border border-gray-300 bg-white/80 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            placeholder="Correct Answer"
            value={correctAnswer}
            onChange={(e) => setCorrectAnswer(e.target.value)}
          />

          <button
            onClick={addQuestion}
            className="w-full bg-indigo-600 text-white font-semibold py-2 rounded-md hover:bg-indigo-700 transition duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            Add Question
          </button>

          <p className="text-sm text-gray-700">{questions.length} question{questions.length !== 1 ? "s" : ""} added</p>

          <button
            onClick={finish}
            className="w-full bg-green-600 text-white font-semibold py-2 rounded-md hover:bg-green-700 transition duration-200 focus:outline-none focus:ring-2 focus:ring-green-400"
          >
            Save Question Set
          </button>

          <div className="pt-4">
            <BackToHomeButton goHome={goHome} />
          </div>
        </div>
      </div>
    </div>
  );

}
