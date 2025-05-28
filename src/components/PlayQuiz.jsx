// components/PlayQuiz.jsx
import { useQuizSession } from "../hooks/useQuizSession";
import QuizTimer from "./QuizTimer";
import QuestionCard from "./QuestionCard";
import QuizSummary from "./QuizSummary";

export default function PlayQuiz({ sessionId }) {
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
    </div>
  );
}
