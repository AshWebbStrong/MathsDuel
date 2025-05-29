import { useQuizSession } from "@/hooks/useQuizSession";
import QuizTimer from "@/components/ui/QuizTimer";
import QuestionCard from "@/components/ui/QuestionCard";
import QuizSummary from "@/components/ui/QuizSummary";
import BackToHomeButton from "@/components/ui/BackToHomeButton.jsx";

export default function PlayQuiz({ sessionId, goHome }) {
  const {
    trackShield,
    trackSpell,
    timeLeft,
    quizEnded,
  } = useQuizSession(sessionId);

  return (
    <div style={{ padding: "1rem" }}>
      <QuizTimer timeLeft={timeLeft} />

      {quizEnded ? (
        <>
          <QuizSummary correct={trackShield.correctCount} total={trackShield.answeredCount} title="Left Side" />
          <QuizSummary correct={trackSpell.correctCount} total={trackSpell.answeredCount} title="Right Side" />
        </>
      ) : (
        <div style={{ display: "flex", gap: "2rem" }}>
          {/* Left Side (Track A) */}
          <div style={{ flex: 1, borderRight: "1px solid #ccc", paddingRight: "1rem" }}>
            <h3>Track A</h3>
            <QuestionCard
              question={trackShield.currentQuestion}
              answer={trackShield.playerAnswer}
              onAnswerChange={trackShield.setPlayerAnswer}
              onSubmit={trackShield.submitAnswer}
            />
            <p>{trackShield.correctCount} correct of {trackShield.answeredCount}</p>
          </div>

          {/* Right Side (Track B) */}
          <div style={{ flex: 1, paddingLeft: "1rem" }}>
            <h3>Track B</h3>
            <QuestionCard
              question={trackSpell.currentQuestion}
              answer={trackSpell.playerAnswer}
              onAnswerChange={trackSpell.setPlayerAnswer}
              onSubmit={trackSpell.submitAnswer}
            />
            <p>{trackSpell.correctCount} correct of {trackSpell.answeredCount}</p>
          </div>
        </div>
      )}

      <BackToHomeButton goHome={goHome} />
    </div>
  );

  // return (
  //   <div>
  //     {quizEnded ? (
  //       <QuizSummary correct={correctCount} total={answeredCount} />
  //     ) : (
  //       <>
  //         <QuizTimer timeLeft={timeLeft} />
  //         <QuestionCard
  //           question={currentQuestion}
  //           answer={playerAnswer}
  //           onAnswerChange={setPlayerAnswer}
  //           onSubmit={submitAnswer}
  //         />
  //         <p>
  //           {correctCount} correct out of {answeredCount}
  //         </p>
  //       </>
  //     )}
  //     <BackToHomeButton goHome={goHome} />
  //   </div>
  // );
}
