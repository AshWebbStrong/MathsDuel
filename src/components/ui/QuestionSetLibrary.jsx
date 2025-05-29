import { useEffect, useState } from "react";
import { db } from "@/firebase/firebase.js";
import { collection, getDocs } from "firebase/firestore";


export default function QuestionSetLibrary({ onSelectA, onSelectB}) {
  const [questionSets, setQuestionSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectionCount, setSelectionCount] = useState(0);

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
      setSelectionCount(1);
    } else if (selectionCount === 1) {
      if (qs.id === questionSets[0]?.id) {
        alert("Please choose a different question set.");
        return;
      }
      onSelectB(qs);
      setSelectionCount(2);
    }
  };

  return (
    <div>
      <h2>
        {selectionCount === 0
          ? "Select the first question set"
          : selectionCount === 1
          ? "Select the second question set"
          : "✅ Both sets selected"}
      </h2>
      {loading ? (
        <p>Loading question sets...</p>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : questionSets.length === 0 ? (
        <p>No question sets found.</p>
      ) : (
        <ul>
          {questionSets.map((qs) => (
            <li key={qs.id} style={{ marginBottom: 10 }}>
              <button
                onClick={() => handleSelect(qs)}
                disabled={selectionCount === 2}
              >
                <strong>{qs.title}</strong>
              </button>{" "}
              {qs.questions.length} questions
            </li>
          ))}
        </ul>
      )}
      {selectionCount === 2 && (
          <button onClick={() => setSelectionCount(0)}>🔄 Reset Selection</button>
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
