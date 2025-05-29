// components/QuestionCard.jsx
export default function QuestionCard({ question, answer, onAnswerChange, onSubmit }) {
  if (!question) return <p>Loading question...</p>;

  return (
    <div>
      <h3>{question.question}</h3>
      <input
        value={answer}
        onChange={(e) => onAnswerChange(e.target.value)}
        placeholder="Type your answer"
      />
      <button onClick={onSubmit}>Submit</button>
    </div>
  );
}
