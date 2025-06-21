import { useState } from "react";
import { db } from "@/firebase/firebase.js";
import { collection, addDoc } from "firebase/firestore";
import { DEFAULT_KEYBOARD_LAYOUT } from "@/components/constants/keyboardLayouts";
import BackToHomeButton from "@/components/ui/BackToHomeButton.jsx";
import KeyboardEditor from "@/components/ui/KeyboardEditor";

export default function CreateQuestionSet({ goHome }) {
  const [title, setTitle] = useState("");

  const [question, setQuestion] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [acceptableAnswers, setAcceptableAnswers] = useState([]);
  const [tempAnswer, setTempAnswer] = useState("");
  const [tempMode, setTempMode] = useState("numeric");
  const [questions, setQuestions] = useState([]);

  const [useDefaultLayout, setUseDefaultLayout] = useState(true);
  const [customKeyboard, setCustomKeyboard] = useState({
    topRow: [...DEFAULT_KEYBOARD_LAYOUT.topRow],
    middleRow: [...DEFAULT_KEYBOARD_LAYOUT.middleRow],
    bottomRow: [...DEFAULT_KEYBOARD_LAYOUT.bottomRow],
  });

  async function finish() {
    if (!title || questions.length === 0) {
      alert("Add a title and at least one question");
      return;
    }

    const finalKeyboard = useDefaultLayout ? DEFAULT_KEYBOARD_LAYOUT : customKeyboard;

    const newQuestionSet = {
      title,
      questions,
      keyboardLayout: finalKeyboard,
      createdAt: Date.now(),
    };

    await addDoc(collection(db, "questionSets"), newQuestionSet);
    alert("Question Set Saved!");
    goHome();
  }

  return (
    <>
      <div className="min-h-screen w-full bg-gray-100 text-black p-6 flex flex-col items-center">

        {/* Title input big and centered */}
        <div className="w-full max-w-4xl mb-12">
          <input
            placeholder="Enter Question Set Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-center text-4xl font-bold p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-indigo-500"
          />
        </div>

        {/* Main content area: full width, justify-between */}
        <div className="flex w-full px-8 justify-between" style={{ minWidth: '100vw' }}>

          {/* Left side: question and answer inputs */}
          <div className="flex flex-col w-31/100 space-y-6">

            {/* Question input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Question
              </label>
              <input
                placeholder="Enter question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            {/* Correct Answer input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Acceptable Answers
                </label>
                  <div className="flex space-x-2 items-center">
                    <input
                      placeholder="Add an acceptable answer"
                      value={tempAnswer}
                      onChange={(e) => setTempAnswer(e.target.value)}
                      className="flex-1 p-3 border border-gray-300 rounded-lg"
                    />
                    <select
                      value={tempMode}
                      onChange={(e) => setTempMode(e.target.value)}
                      className="border border-gray-300 rounded-lg p-2"
                    >
                      <option value="exact">Exact</option>
                      <option value="numeric">Numeric</option>
                      <option value="algebra">Algebra</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => {
                        if (!tempAnswer.trim()) return;
                        setAcceptableAnswers([...acceptableAnswers, {
                          value: tempAnswer.trim(),
                          mode: tempMode
                        }]);
                        setTempAnswer("");
                      }}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-lg"
                    >
                      Add
                    </button>
                  </div>
                <ul className="mt-2 list-disc list-inside text-sm text-gray-700">
                  {acceptableAnswers.map((ans, idx) => (
                    <li
                      key={idx}
                      className="cursor-pointer hover:line-through"
                      onClick={() =>
                        setAcceptableAnswers(acceptableAnswers.filter((_, i) => i !== idx))
                      }
                    >
                      {ans.value}
                    </li>
                  ))}
                </ul>
              </div>
            {/* Add question button */}
            <button
              onClick={() => {
                if (!question || acceptableAnswers.length === 0) return;
                setQuestions([...questions, { question, acceptableAnswers }]);
                setQuestion("");
                setAcceptableAnswers([]);
                setTempAnswer("");
              }}
              className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-lg hover:bg-indigo-700 transition"
            >
              Add Question
            </button>

            {/* Question count */}
            <p className="text-sm text-gray-700">
              {questions.length} question{questions.length !== 1 ? "s" : ""} added
            </p>

            {/* Layout choice */}
            <div>
              <p className="font-medium text-gray-800 mb-2">Keyboard Layout:</p>
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    checked={useDefaultLayout}
                    onChange={() => setUseDefaultLayout(true)}
                    className="form-radio text-indigo-600"
                  />
                  <span>Use Default</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    checked={!useDefaultLayout}
                    onChange={() => setUseDefaultLayout(false)}
                    className="form-radio text-indigo-600"
                  />
                  <span>Customize</span>
                </label>
              </div>
            </div>
          </div>

          {/* Center: list of current questions */}
          <div className="w-1/4 max-h-[400px] overflow-y-auto bg-white border border-gray-300 rounded-lg px-4 py-3 mx-4">
            <h2 className="text-center font-semibold mb-4 text-lg">Questions</h2>
            {questions.length === 0 ? (
              <p className="text-center text-gray-500">No questions added yet.</p>
            ) : (
              <ul className="list-disc list-inside space-y-2">
                {questions.map((q, i) => (
                  <li
                    key={i}
                    title={q.question}
                    onClick={() => {
                      // Remove the clicked question by index
                      setQuestions((prev) => prev.filter((_, idx) => idx !== i));
                    }}
                    className="text-gray-700 truncate cursor-pointer hover:bg-red-100 px-2 py-1 rounded"
                  >
                    {q.question}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Right side: KeyboardEditor */}
          <div className="flex flex-col w-31/100">
            <KeyboardEditor
              keyboardRows={customKeyboard}
              setKeyboardRows={setCustomKeyboard}
            />
          </div>
        </div>
      </div>

      {/* Fixed bottom bar with Save and Back buttons side by side */}
      <div className="fixed bottom-6 left-0 right-0 flex justify-center space-x-8 px-6 z-50 bg-gray-100 bg-opacity-90 py-4 shadow-lg">
        <button
          onClick={finish}
          className="w-64 bg-green-600 text-white font-bold text-xl py-4 rounded-lg hover:bg-green-700 transition shadow"
        >
          Save Question Set
        </button>
        <div className="flex items-center">
          <BackToHomeButton goHome={goHome} />
        </div>
      </div>
    </>
  );
}
