export default function QuestionCard({
  question,
  answer,
  onAnswerChange,
  onSubmit,
  onFocus,
  onBlur,
  inputRef,
  disabled = false,
}) {
  if (!question) return <p>Loading question...</p>;
  
  return (
    <div className="max-w-lg mx-4 bg-white/40 text-gray-900 p-2 rounded-none shadow-md backdrop-blur-md">
      <h3 className="text-2xl font-bold mb-4 mx-2">{question.question}</h3>

      <input
        value={answer}
        onChange={(e) => onAnswerChange(e.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        readOnly // manual typing disabled, input via keyboard only
        placeholder="Tap keys below"
        disabled={disabled}
        ref={inputRef}
        className={`w-full p-3 rounded-md text-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 mb-4 ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        }`}
      />

      <button
        onClick={onSubmit}
        disabled={disabled}
        className={`w-full py-3 px-4 mt-4 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-md text-lg font-medium shadow hover:from-blue-600 hover:to-blue-800 transition-all duration-200 ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        Protego!
      </button>
    </div>
  );
}



