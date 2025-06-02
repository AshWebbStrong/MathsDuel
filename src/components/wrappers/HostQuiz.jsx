import { useEffect, useState } from "react";
import { useQuizSession, } from "@/hooks/useQuizSession.js";
import BackToHomeButton from "@/components/ui/BackToHomeButton.jsx";
import HostSessionSetup from "@/components/screens/HostSessionSetup.jsx";
import HostSessionLobby from "@/components/screens/HostSessionLobby.jsx";
import HostSessionActive from "@/components/screens/HostSessionActive.jsx";
import HostSessionSummary from "@/components/screens/HostSessionActive.jsx";

export default function HostQuiz({ goHome }) {

const [sessionId, setSessionId] = useState("");


const [quizSetup, setQuizSetup] = useState(false);    
const [quizStarted, setQuizStarted] = useState(false);
const [quizEnded, setQuizEnded] = useState(false);

  return (
    
      <div style={{ padding: "0rem", color: "black" }}>
        {!quizSetup ? ( 
            <HostSessionSetup 
            goHome={goHome}
            onSessionStarted ={(id) => {
            setSessionId(id)
            setQuizSetup(true)     
            }} 
            />
        )
        :
            !quizStarted ? (
                <HostSessionLobby
                goHome={goHome}
                sessionId = {sessionId}

                />
            ) 
            :
                !quizEnded ? (
                    <HostSessionActive />
                )
                
                : ( <HostSessionSummary />                 
                )
        }
        <BackToHomeButton goHome={goHome} />
      </div>
  );








}