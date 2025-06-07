export default function QuestionCard({ question, answer, onAnswerChange, onSubmit, disabled = false }) {
  if (!question) return <p>Loading question...</p>;

  return (
    <div>
      <h3>{question.question}</h3>
      <input
        value={answer}
        onChange={(e) => onAnswerChange(e.target.value)}
        placeholder="Type your answer"
        disabled={disabled}            // Disable input if disabled is true
        style={{ opacity: disabled ? 0.5 : 1, cursor: disabled ? "not-allowed" : "text" }}
      />
      <button 
        onClick={onSubmit} 
        disabled={disabled}           // Disable button if disabled is true
        style={{ opacity: disabled ? 0.5 : 1, cursor: disabled ? "not-allowed" : "pointer" }}
      >
        Submit
      </button>
    </div>
  );
}
