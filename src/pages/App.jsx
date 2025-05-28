import { useState } from "react";
import CreateQuestionSet from "../components/CreateQuestionSet";
import HostSession from "../components/HostSession";
import JoinQuiz from "../components/JoinQuiz";
import PlayQuiz from "../components/PlayQuiz";
import QuestionSetLibrary from "../components/QuestionSetLibrary";

export default function App() {
  const [mode, setMode] = useState(null);
  const [questionSetData, setQuestionSetData] = useState(null);
  const [sessionId, setSessionId] = useState("");

  return (
    <div style={{ padding: 20 }}>
      {!mode && (
        <>
          <h1>Welcome to Quiz App</h1>
          <button onClick={() => setMode("create")}>Create New Question Set</button>
          <button onClick={() => setMode("library")}>Host Saved Question Set</button>
          <button onClick={() => setMode("join")}>Join Quiz</button>
        </>
      )}

      {mode === "create" && !questionSetData && (
        <CreateQuestionSet onComplete={(data) => setQuestionSetData(data)} />
      )}

      {mode === "library" && !questionSetData && (
        <QuestionSetLibrary onSelect={(qs) => setQuestionSetData(qs)} />
      )}

      {(mode === "create" || mode === "library") && questionSetData && !sessionId && (
        <HostSession questionSetData={questionSetData} onSessionStarted={setSessionId} />
      )}

      {(mode === "create" || mode === "library") && sessionId && (
        <>
          <h2>Session Started</h2>
          <p>Session ID: <b>{sessionId}</b></p>
        </>
      )}

      {mode === "join" && !sessionId && (
        <JoinQuiz onJoined={(id) => setSessionId(id)} />
      )}

      {mode === "join" && sessionId && (
        <PlayQuiz sessionId={sessionId} />
      )}
    </div>
  );
}
