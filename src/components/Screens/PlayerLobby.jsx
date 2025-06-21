import { useEffect, useState } from "react";
import { db } from "@/firebase/firebase";
import { collection, doc, onSnapshot, updateDoc } from "firebase/firestore";
import BackToHomeButton from "@/components/ui/BackToHomeButton.jsx";

export default function PlayerLobby({ sessionId, playerId, goHome }) {
  const [players, setPlayers] = useState([]);
  const [selectedIcon, setSelectedIcon] = useState(null);
  const [currentName, setCurrentName] = useState("");
  const [originalName, setOriginalName] = useState("");

  const availableIcons = [
    "🐱", "🐶", "🦊", "🐼", "🐸", "🐵", "🐰", "🐻", "🐯", "🦄",
  ];

  useEffect(() => {
    if (!sessionId) return;

    const playersRef = collection(db, "sessions", sessionId, "players");
    const unsubscribe = onSnapshot(playersRef, (snapshot) => {
      const playersData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPlayers(playersData);

      // Find current player data
      const me = playersData.find((p) => p.id === playerId);
      if (me) {
        if (me.icon !== selectedIcon) setSelectedIcon(me.icon || null);
        if (me.name !== originalName) {
          setOriginalName(me.name || "");
          setCurrentName(""); // reset input on external name changes
        }
      }
    });

    return () => unsubscribe();
  }, [sessionId, playerId, selectedIcon, originalName]);

  const handleIconSelect = async (icon) => {
    setSelectedIcon(icon);
    if (!sessionId || !playerId) return;
    const playerRef = doc(db, "sessions", sessionId, "players", playerId);
    try {
      await updateDoc(playerRef, { icon });
    } catch (error) {
      console.error("Failed to update icon:", error);
    }
  };

  // Update name in Firestore on Enter key
  const handleNameKeyDown = async (e) => {
    if (e.key === "Enter" && currentName.trim() !== "" && currentName !== originalName) {
      if (!sessionId || !playerId) return;
      const playerRef = doc(db, "sessions", sessionId, "players", playerId);
      try {
        await updateDoc(playerRef, { name: currentName.trim() });
        setOriginalName(currentName.trim());
        setCurrentName("");
      } catch (error) {
        console.error("Failed to update name:", error);
      }
    }
  };

  return (
    <div className="relative min-h-screen bg-sky-200 text-black p-4 flex flex-col">

      {/* Top bar with input and back button */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex-grow max-w-xl mx-auto">
          <input
            type="text"
            value={currentName}
            onChange={(e) => setCurrentName(e.target.value)}
            onKeyDown={handleNameKeyDown}
            placeholder={originalName || "Your name"}
            className="w-full text-center text-2xl md:text-3xl bg-gray-800 rounded-lg py-3 px-6 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            maxLength={30}
          />
          <p className="text-center text-sm text-gray-400 mt-1">Press Enter to save your name</p>
        </div>

        <div className="absolute top-4 right-4">
          <BackToHomeButton goHome={goHome} />
        </div>
      </div>

      {/* Players list */}
      <div className="flex-grow overflow-auto">
        <h2 className="text-2xl font-semibold mb-6 text-center">Players in Lobby</h2>
        {players.length === 0 ? (
          <p className="text-center text-gray-400">No players in lobby yet...</p>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-8 px-4">
            {players.map(({ id, name, icon }) => (
              <div key={id} className="flex flex-col items-center">
                <div className="text-6xl">{icon || "❓"}</div>
                <div className="mt-4 text-lg font-semibold truncate max-w-[120px] text-center">
                  {name || "Unknown"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Icon selection bar fixed at bottom */}
      <div className="mt-8 border-t border-gray-700 pt-4">
        <h2 className="text-xl font-semibold mb-4 text-center">Choose Your Icon</h2>
        <div className="flex justify-center space-x-6 overflow-x-auto px-4 pb-4">
          {availableIcons.map((icon) => (
            <button
              key={icon}
              onClick={() => handleIconSelect(icon)}
              className={`text-6xl rounded-full cursor-pointer 
                ${selectedIcon === icon ? "bg-blue-600" : "bg-gray-800"} 
                p-3 flex-shrink-0`}
              aria-label={`Select icon ${icon}`}
            >
              {icon}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
