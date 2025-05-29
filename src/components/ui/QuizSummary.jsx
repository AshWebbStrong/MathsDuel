// components/QuizSummary.jsx
export default function QuizSummary({ correct, total }) {
  return (
    <div>
      <h2>Quiz Finished!</h2>
      <p>
        You got <strong>{correct}</strong> out of <strong>{total}</strong> correct.
      </p>
    </div>
  );
}
