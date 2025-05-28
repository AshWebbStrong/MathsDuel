import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

export default function QuestionSetLibrary({ onSelect }) {
  const [questionSets, setQuestionSets] = useState([]);

  useEffect(() => {
    async function loadQuestionSets() {
      const snap = await getDocs(collection(db, "questionSets"));
      const data = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setQuestionSets(data);
    }

    loadQuestionSets();
  }, []);

  return (
    <div>
      <h2>Select a Question Set to Host</h2>
      {questionSets.length === 0 ? (
        <p>No question sets found.</p>
      ) : (
        <ul>
          {questionSets.map((qs) => (
            <li key={qs.id} style={{ marginBottom: 10 }}>
              <strong>{qs.title}</strong> — {qs.questions.length} questions
              <br />
              <button onClick={() => onSelect(qs)}>Host This</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
