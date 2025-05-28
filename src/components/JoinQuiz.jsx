import { useState } from "react";

export default function JoinQuiz({ onJoined }) {
  const [code, setCode] = useState("");

  function handleJoin() {
    if (!code) return;
    onJoined(code);
  }

  return (
    <div>
      <h2>Join a Quiz</h2>
      <input placeholder="Enter session code" value={code} onChange={(e) => setCode(e.target.value)} />
      <button onClick={handleJoin}>Join</button>
    </div>
  );
}
