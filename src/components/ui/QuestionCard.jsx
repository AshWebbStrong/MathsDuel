export default function QuestionCard({
  question,
  answer,
  onAnswerChange,
  onSubmit,
  onFocus,
  onBlur,
  inputRef,
  disabled = false,
  shieldActive = false,
  cooldown = false,
  spellName = "Submit",
}) {
  if (!question) return <p>Loading question...</p>;

  const containerClasses = `
    max-w-lg mx-4 p-2 rounded-none shadow-md backdrop-blur-md 
    ${cooldown ? "border-4 border-red-500 animate-pulse bg-red-100/30" : "bg-white/40"}
    ${shieldActive && !cooldown ? "border-4 border-blue-500 animate-pulse bg-blue-100/30" : ""}
  `;

  return (
    <div className={containerClasses}>
      {cooldown ? (
        <p className="text-red-700 text-lg text-center font-semibold">Cooldown active... ⏳</p>
      ) : shieldActive ? (
        <p className="text-blue-700 text-lg text-center font-semibold">Shield is active 🛡️</p>
      ) : (
        <>
          <h3 className="text-2xl font-bold mb-4 mx-2">{question.question}</h3>

          <input
            value={answer}
            onChange={(e) => onAnswerChange(e.target.value)}
            onFocus={(e) => {
              if (!shieldActive && onFocus) onFocus(e);
            }}
            onBlur={onBlur}
            readOnly
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
            {spellName}
          </button>
        </>
      )}
    </div>
  );
}
