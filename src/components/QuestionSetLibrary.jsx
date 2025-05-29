import { useEffect, useState } from "react";
import { db } from "@/firebase/firebase.js";
import { collection, getDocs } from "firebase/firestore";
import BackToHomeButton from "@/components/BackToHomeButton";

export default function QuestionSetLibrary({ onSelect, goHome }) {
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
              <strong>{qs.title}</strong> {qs.questions.length} questions
              <br />
              <button onClick={() => onSelect(qs)}>Host This</button>
            </li>
          ))}
          <BackToHomeButton goHome={goHome} />
        </ul>
      )}
    </div>
  );
}
