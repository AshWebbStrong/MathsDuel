import { useEffect, useState } from "react";
import { db } from "@/firebase/firebase.js";
import { collection, getDocs } from "firebase/firestore";


export default function QuestionSetLibrary({ onSelectA, onSelectB}) {
  const [questionSets, setQuestionSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectionCount, setSelectionCount] = useState(0);
  const [selectedA, setSelectedA] = useState(null);

//error checking
useEffect(() => {
  console.log("✅ QuestionSetLibrary mounted");
  return () => {
    console.log("🧹 QuestionSetLibrary unmounted");
  };
}, []);


useEffect(() => {
  async function loadQuestionSets() {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "questionSets"));
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setQuestionSets(data);
    } catch (e) {
      setError("Failed to load question sets");
    } finally {
      setLoading(false);
    }
  }

  loadQuestionSets();
}, []);

  const handleSelect = (qs) => {
    if (selectionCount === 0) {
      onSelectA(qs);
      setSelectedA(qs);
      setSelectionCount(1);
    } else if (selectionCount === 1) {
      if (qs.id === selectedA?.id) {
        alert("Please choose a different question set.");
        return;
      }
      onSelectB(qs);
      setSelectionCount(2);
    }
  };

return (
  <div className="space-y-6">
    <div>
      <h2 className="text-xl font-semibold text-gray-800">
        {selectionCount === 0
          ? "Select the first question set"
          : selectionCount === 1
          ? "Select the second question set"
          : "✅ Both sets selected"}
      </h2>
    </div>

    {loading ? (
      <p className="text-gray-600 italic">Loading question sets...</p>
    ) : error ? (
      <p className="text-red-600 font-semibold">{error}</p>
    ) : questionSets.length === 0 ? (
      <p className="text-gray-600 italic">No question sets found.</p>
    ) : (
      <ul className="space-y-3">
        {questionSets.map((qs) => (
          <li key={qs.id} className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm border hover:shadow-md transition">
            <button
              onClick={() => handleSelect(qs)}
              disabled={selectionCount === 2}
              className={`
                text-left font-semibold w-full
                ${
                  selectionCount === 2
                    ? "text-gray-400 cursor-not-allowed"
                    : "hover:text-indigo-700 transition"
                }
              `}
            >
              {qs.title}
            </button>
            <span className="text-sm text-gray-500 ml-4 whitespace-nowrap">
              {qs.questions.length} questions
            </span>
          </li>
        ))}
      </ul>
    )}

    {selectionCount === 2 && (
      <div className="pt-4">
        <button
          onClick={() => setSelectionCount(0)}
          className="w-full px-4 py-2 bg-yellow-400 text-gray-800 font-semibold rounded-md hover:bg-yellow-500 transition"
        >
          🔄 Reset Selection
        </button>
      </div>
    )}
  </div>
);


  // return (
  //   <div>
  //     <h2>Select a Question Set to Host</h2>
  //       {loading ? (
  //         <p>Loading question sets...</p>
  //       ) : error ? (
  //         <p style={{ color: "red" }}>{error}</p>
  //       ) : questionSets.length === 0 ? (
  //         <p>No question sets found.</p>
  //       ) : (        
  //       <ul>
  //         {questionSets.map((qs) => (
  //           <li key={qs.id} style={{ marginBottom: 10 }}>
  //             <button onClick={() => onSelect(qs)}><strong>{qs.title}</strong></button>  {qs.questions.length} questions
  //           </li>
  //         ))}
  //       </ul>
  //     )}
  //   </div>
  // );
}
