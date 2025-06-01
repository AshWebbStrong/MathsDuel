import { useEffect, useState } from "react";
import { useQuizSession, } from "@/hooks/useQuizSession.js";
import HostSetup from "@/components/screens/HostSessionSetup.jsx";
import HostLobby from "@/components/screens/HostSessionLobby.jsx";
import HostActive from "@/components/screens/HostSessionActive.jsx";

export default function HostQuiz({ sessionId, goHome }) {


const [quizSetup, setQuizSetup] = useState(false);    
const [quizStarted, setQuizStarted] = useState(false);
const [quizEnded, setQuizEnded] = useState(false);

  return (
    
      <div style={{ padding: "0rem", color: "yellow" }}>
        {!quizSetup ? ( 
            <HostSetup />
        )
        :
            !quizStarted ? (
                <HostSessionLobby />
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