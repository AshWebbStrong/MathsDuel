import { useEffect, useState } from "react";
import { useQuizSession, } from "@/hooks/useQuizSession.js";
import BackToHomeButton from "@/components/ui/BackToHomeButton.jsx";
import PlayerLobby from "@/components/screens/PlayerLobby.jsx";
import PlayerQuizBattleScreen from "@/components/screens/PlayerQuizBattleScreen.jsx";
import PlayerQuizSummary from "@/components/screens/PlayerQuizSummary.jsx";
import RoundSummaryTable from "@/components/screens/RoundSummaryTable.jsx";

export default function PlayQuiz({ sessionId, playerId, goHome }) {
  
  const {
    trackShield,
    trackSpell,
    opponentState,
    hitsReceived,

    localRoundTimeLeft,
    quizStarted,
    quizFinished,

    // duel-specific
    roundState,      // 'prepare', 'active', 'summary', 'finished' (or null)
    currentRound,
    roundDuration,
    pairs,
    opponentId,

  } = useQuizSession({sessionId, playerId});


return (
    <div style={{ padding: "0rem", color: "white" }}>
      {!quizStarted ? (
        <PlayerLobby sessionId={sessionId} playerId={playerId} />
      ) : !quizFinished ? (
        <>

          {roundState === "prepare" && (
            <div>Get ready! Round starting soon...</div>
          )}

          {roundState === "active" && trackShield && trackSpell ? (
            <PlayerQuizBattleScreen
              trackShield={trackShield}
              trackSpell={trackSpell}
              timeLeft={localRoundTimeLeft}
              hitsReceived={hitsReceived}
              opponentState={opponentState}
            />
          ) : roundState === "summary" ? (
            <RoundSummaryTable sessionId={sessionId} pairs={pairs} />
          ) : (
            <div>Loading round data...</div>
          )}
        </>
      ) : (
        <>
          {/* Final summary */}
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
      )}
    </div>
  );

}

