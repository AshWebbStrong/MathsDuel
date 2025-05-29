import { useEffect, useState } from "react";
import { db } from "@/firebase/firebase.js";
import { collection, getDocs } from "firebase/firestore";


export default function QuestionSetLibrary({ onSelect}) {
  const [questionSets, setQuestionSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  return (
    <div>
      <h2>Select a Question Set to Host</h2>
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
              <button onClick={() => onSelect(qs)}><strong>{qs.title}</strong></button>  {qs.questions.length} questions
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
