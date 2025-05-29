import { useState } from "react";
import CreateQuestionSet from "@/components/Screens/CreateQuestionSet";
import HostSessionSetup from "@/components/Screens/HostSessionSetup";
import HostSessionActive from "@/components/Screens/HostSessionActive";
import JoinQuiz from "@/components/Screens/JoinQuiz";
import PlayQuiz from "@/components/Screens/PlayQuiz";
import QuestionSetLibrary from "@/components/QuestionSetLibrary";
import Home from "@/components/Screens/Home";


  const MODES = {
      HOME: "home",
      LOGIN: "login",
      PLAY: "play",
      HOSTSETUP: "hostSetUp",
      HOSTACTIVE: "hostActive",

      CREATE: "create",
      LIBRARY: "library",
      JOIN: "join",
     
  };

export default function App() {
  const [mode, setMode] = useState("home");
  const goHome = () => { setMode(MODES.HOME); setSessionId(""); setQuestionSetData(null); } // my return to the main menu button. Currently resets EVERYTHING like a refresh. Still  issue of holding onto these when quiz finishes
  const [questionSetData, setQuestionSetData] = useState(null);
  const [sessionId, setSessionId] = useState("");



  return (
    <div style={{ padding: 20 }}>

      {mode === MODES.HOME && (
        <Home 
          onLogin={() => 
            setMode(MODES.LOGIN)
          }
          onHost ={() =>
            setMode(MODES.HOSTSETUP)
          }
          onCreate = {() => 
              setMode(MODES.CREATE)
          } 
          onJoined={(id) => {
            setSessionId(id);
            setMode(MODES.PLAY);
          }}/>
      )}

      {mode === MODES.PLAY && (
        <PlayQuiz sessionId={sessionId}/>
      )}


      {mode === MODES.CREATE && (
        <CreateQuestionSet goHome={goHome}/>
      )}

      {mode === MODES.HOSTSETUP && (
        <HostSessionSetup 
          onSessionStarted={(id) => {
            setSessionId(id);
            setMode(MODES.HOSTACTIVE);
           }} 
          goHome={goHome}/>
      )}

      {mode === MODES.HOSTACTIVE && (
        <HostSessionActive sessionId={sessionId} goHome={goHome}/>
      )}
    </div>
  );
}
