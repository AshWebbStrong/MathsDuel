import { useEffect, useState } from "react";
import { getDoc, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase/firebase.js";
import HostSessionSetup from "@/components/screens/HostSessionSetup.jsx";
import HostSessionLobby from "@/components/screens/HostSessionLobby.jsx";
import HostSessionActive from "@/components/screens/HostSessionActive.jsx";
import HostSessionSummary from "@/components/screens/HostSessionSummary.jsx";

export default function HostQuiz({ goHome }) {

const [sessionId, setSessionId] = useState("");


const [quizSetup, setQuizSetup] = useState(false);    
const [quizStarted, setQuizStarted] = useState(false);
const [quizFinished, setQuizFinished] = useState(false);

useEffect(() => {
    if (!sessionId) return; 
    console.log("HostSessionActive mounted — setting hostActive = true");
    const sessionRef = doc(db, "sessions", sessionId);
    updateDoc(sessionRef, { hostActive: true });

    const handleBeforeUnload = async () => {
      console.log("Window unloading — setting hostActive = false");
      await updateDoc(sessionRef, { hostActive: false });
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      console.log("HostSessionActive unmounting — setting hostActive = false");
      window.removeEventListener("beforeunload", handleBeforeUnload);
      updateDoc(sessionRef, { hostActive: false });
    };
  }, [sessionId]);



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
                onStartQuiz ={ () =>
                    setQuizStarted(true)
                }

                />
            ) 
            :
                !quizFinished ? (
                    <HostSessionActive
                    goHome={goHome}
                    sessionId = {sessionId}
                    onFinishQuiz = { () =>
                        setQuizFinished(true)
                    }
                    
                    />
                )
                
                : ( <HostSessionSummary />                 
                )
        }
      </div>
  );








}