import { useQuizSession } from "@/hooks/useQuizSession";
import QuizTimer from "@/components/QuizTimer";
import QuestionCard from "@/components/QuestionCard";
import QuizSummary from "@/components/QuizSummary";
import BackToHomeButton from "@/components/BackToHomeButton";

export default function PlayQuiz({ sessionId, goHome }) {
  const {
    currentQuestion,
    playerAnswer,
    setPlayerAnswer,
    submitAnswer,
    answeredCount,
    correctCount,
    timeLeft,
    quizEnded,
  } = useQuizSession(sessionId);

  return (
    <div>
      {quizEnded ? (
        <QuizSummary correct={correctCount} total={answeredCount} />
      ) : (
        <>
          <QuizTimer timeLeft={timeLeft} />
          <QuestionCard
            question={currentQuestion}
            answer={playerAnswer}
            onAnswerChange={setPlayerAnswer}
            onSubmit={submitAnswer}
          />
          <p>
            {correctCount} correct out of {answeredCount}
          </p>
        </>
      )}
      <BackToHomeButton goHome={goHome} />
    </div>
  );
}
