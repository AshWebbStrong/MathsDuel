import { addDoc, collection } from "firebase/firestore";
import { db } from "../firebase";

export default function HostSession({ questionSetData, onSessionStarted }) {
  async function startSession() {
    const sessionRef = await addDoc(collection(db, "sessions"), {
      questionSetId: questionSetData.id,
      currentQuestionIndex: 0,
    });
    onSessionStarted(sessionRef.id);
  }

  return (
    <div>
      <h2>Ready to host question set: {questionSetData.title}</h2>
      <button onClick={startSession}>Start Session</button>
    </div>
  );
}
