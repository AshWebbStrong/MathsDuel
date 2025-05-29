export default function BackToHomeButton({ goHome }) {
  return (
    <button onClick={goHome} style={{ marginTop: 20 }}>
       Back to Home!
    </button>
  );
}