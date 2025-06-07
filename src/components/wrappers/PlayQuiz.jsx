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

    opponentState,
    hitsReceived,

    localTimeLeft,
    quizStarted,
    quizFinished,

  } = useQuizSession({sessionId, playerId});


  return (
    
      <div style={{ padding: "0rem", color: "white" }}>
        {
          !quizStarted ? (
            <>
              <PlayerLobby />
              <h3>quiz not started</h3>
            </>
          ) : !quizFinished ? (
            trackShield && trackSpell ? (
              <PlayerQuizBattleScreen
                trackShield={trackShield}
                trackSpell={trackSpell}
                timeLeft={localTimeLeft}
                hitsReceived = {hitsReceived}
                opponentState = {opponentState}

              />
            ) : (
              <div>Loading quiz data...</div>
            )
          ) : (
            <>
              <PlayerQuizSummary
                correct={trackShield?.correctCount ?? 0}
                total={trackShield?.answeredCount ?? 0}
                title="Left Side"
              />
              <PlayerQuizSummary
                correct={trackSpell?.correctCount ?? 0}
                total={trackSpell?.answeredCount ?? 0}
                title="Right Side"
              />
            </>
          )
        }
        <BackToHomeButton goHome={goHome} />
      </div>
  );

}

