import { useEffect, useState } from "react";
import { useQuizSession, } from "@/hooks/useQuizSession.js";
import BackToHomeButton from "@/components/ui/BackToHomeButton.jsx";
import PlayerLobby from "@/components/screens/PlayerLobby.jsx";
import PlayerQuizBattleScreen from "@/components/screens/PlayerQuizBattleScreen.jsx";
import PlayerQuizSummary from "@/components/screens/PlayerQuizSummary.jsx";

export default function PlayQuiz({ sessionId, playerId, goHome }) {
  
  const {
    trackShield,
    trackSpell,
    timeLeft,
    quizStarted,
    quizEnded,

  } = useQuizSession(sessionId, playerId);


  return (
    
      <div style={{ padding: "0rem", color: "white" }}>
        {!quizStarted ? ( 
          <>
          <PlayerLobby />
            <h3>quiz not started</h3>
          </>
        )
        :
          !quizEnded ? (
              <PlayerQuizBattleScreen
                trackShield={trackShield}
                trackSpell={trackSpell}
                timeLeft ={timeLeft}
              />           
          ) : (
              <>
              <PlayerQuizSummary correct={trackShield.correctCount} total={trackShield.answeredCount} title="Left Side" />
              <PlayerQuizSummary correct={trackSpell.correctCount} total={trackSpell.answeredCount} title="Right Side" />
            </>            
          )
        }
        <BackToHomeButton goHome={goHome} />
      </div>
  );

}

