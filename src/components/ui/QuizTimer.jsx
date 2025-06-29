export default function QuizTimer({ timeLeft }) {
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  return (
    <p>
      <strong>{`${mins}:${secs.toString().padStart(2, "0")}`}</strong>
    </p>
  );
}
