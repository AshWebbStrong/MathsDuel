import { useEffect, useState } from "react";
import { useQuizSession, } from "@/hooks/useQuizSession.js";
import QuizSummary from "@/components/ui/QuizSummary.jsx";
import BackToHomeButton from "@/components/ui/BackToHomeButton.jsx";
import PlayerLobby from "@/components/screens/PlayerLobby.jsx";
import QuizBattleScreen from "@/components/screens/QuizBattleScreen.jsx";

export default function PlayQuiz({ sessionId, goHome }) {
  
  const {
    trackShield,
    trackSpell,
    timeLeft,
    quizStarted,
    quizEnded,

  } = useQuizSession(sessionId);


  return (
    
      <div style={{ padding: "0rem", color: "white" }}>
        {!quizStarted ? ( 
          <>
          <PlayerLobby />
            <h3>quiz not started</h3>
          </>
        )
        :
          quizEnded ? (
            <>
              <QuizSummary correct={trackShield.correctCount} total={trackShield.answeredCount} title="Left Side" />
              <QuizSummary correct={trackSpell.correctCount} total={trackSpell.answeredCount} title="Right Side" />
            </>
          ) : (
               <QuizBattleScreen
                  trackShield={trackShield}
                  trackSpell={trackSpell}
                  timeLeft ={timeLeft}
                />
          )
        }
        <BackToHomeButton goHome={goHome} />
      </div>
  );
}

