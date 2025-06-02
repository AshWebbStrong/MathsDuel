import { useEffect, useState } from "react";
import { db } from "@/firebase/firebase";
import { doc, collection, onSnapshot, updateDoc } from "firebase/firestore";
import BackToHomeButton from "@/components/ui/BackToHomeButton.jsx";

export default function HostSessionLobby({ sessionId, onStartQuiz, goHome }) {
    const [players, setPlayers] = useState([]);
    const [questionSets, setQuestionSets] = useState({ 
        shieldQuestions: null, 
        spellQuestions: null,
    });

    useEffect(() => {
        if (!sessionId) return;

        const sessionRef = doc(db, "sessions", sessionId);
        const playersRef = collection(db, "sessions", sessionId, "players");

        // Listen for session updates (question set names)
        const unsubscribeSession = onSnapshot(sessionRef, (snap) => {
        if (!snap.exists()) return;
        const data = snap.data();

        setQuestionSets({
            shieldQuestions: { title: data.questionSetNameShield },
            spellQuestions: { title: data.questionSetNameSpell },
        });
        });

        // Listen for players updates
        const unsubscribePlayers = onSnapshot(playersRef, (snap) => {
        const playersList = snap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
        setPlayers(playersList);
        });

    // Cleanup both listeners
    return () => {
      unsubscribeSession();
      unsubscribePlayers();
    };
  }, [sessionId]);

    const handleStartQuiz = async () => {
        await updateDoc(doc(db, "sessions", sessionId), {
        sessionStarted: true,
        startTime: serverTimestamp(),
        });
        onStartQuiz();
    };

    return (
        <div className="w-screen h-screen bg-sky-100 p-10 flex flex-col justify-between">
        <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-6">Lobby Code: {sessionId}</h1>

            <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">Question Sets</h2>
            <ul className="space-y-2 text-lg text-gray-800">
                <li>🛡️ Shield Set: {questionSets.shieldQuestions?.title || "Loading..."}</li>
                <li>🧙 Spell Set: {questionSets.spellQuestions?.title || "Loading..."}</li>
            </ul>
            </div>

            <div>
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">Players Joined</h2>
            <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-4">
                {players.length === 0 ? (
                <p className="text-gray-500">Waiting for players to join...</p>
                ) : (
                players.map((player, index) => (
                    <li
                    key={index}
                    className="bg-white shadow rounded-lg p-4 text-center text-gray-800 font-medium"
                    >
                    {player.name}
                    </li>
                ))
                )}
            </ul>
            </div>
        </div>

        <div className="w-full flex justify-center mt-10">
            <button
            onClick={handleStartQuiz}
            className="px-10 py-4 bg-green-600 hover:bg-green-700 text-white text-xl rounded-lg shadow transition"
            >
            🚀 Start Quiz
            </button>
        </div>
        <BackToHomeButton goHome={goHome} />
        </div>
    );
}
