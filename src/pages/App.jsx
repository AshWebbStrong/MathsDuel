import { useState } from "react";
import CreateQuestionSet from "@/components/Screens/CreateQuestionSet";
import HostSessionSetup from "@/components/Screens/HostSessionSetup";
import HostSessionActive from "@/components/Screens/HostSessionActive";
import JoinQuiz from "@/components/Screens/JoinQuiz";
import PlayQuiz from "@/components/Screens/PlayQuiz";
import QuestionSetLibrary from "@/components/QuestionSetLibrary";


  const MODES = {
      HOME: "home",
      CREATE: "create",
      LIBRARY: "library",
      JOIN: "join",
      HOSTSETUP: "hostSetUp",
      HOSTACTIVE: "hostActive",
  };

export default function App() {
  const [mode, setMode] = useState("home");
  const goHome = () => { setMode(MODES.HOME); setSessionId(""); setQuestionSetData(null); } // my return to the main menu button. Currently resets EVERYTHING like a refresh. Still  issue of holding onto these when quiz finishes
  const [questionSetData, setQuestionSetData] = useState(null);
  const [sessionId, setSessionId] = useState("");



  return (
    <div style={{ padding: 20 }}>
      {!mode || mode === MODES.HOME && (
        <>
          <h1>Welcome to Quiz App</h1>
          <button onClick={() => setMode(MODES.CREATE)}>Create New Question Set</button>
          <button onClick={() => setMode(MODES.LIBRARY)}>Host Saved Question Set</button>
          <button onClick={() => setMode(MODES.JOIN)}>Join Quiz</button>
        </>
      )}

      {mode === MODES.CREATE && (
        <CreateQuestionSet goHome={goHome}/>
      )}


      
      {mode === MODES.LIBRARY && (
        <>
        {!questionSetData && ( 
          <QuestionSetLibrary onSelect={(qs) => setQuestionSetData(qs)} goHome={goHome}
          />
        )}
        {questionSetData && !sessionId && (
          <HostSessionSetup questionSetData={questionSetData} onSessionStarted={setSessionId} goHome={goHome}/>
        )} 
        {sessionId && (
          <HostSessionActive sessionId={sessionId} goHome={goHome}/>
         )}
      </>
      )}


      {mode === MODES.JOIN && !sessionId && (
        <JoinQuiz onJoined={(id) => setSessionId(id)} goHome={goHome}/>
      )}

      {mode === MODES.JOIN && sessionId && (
        <PlayQuiz sessionId={sessionId} goHome={goHome}/>
      )}
    </div>
  );
}
