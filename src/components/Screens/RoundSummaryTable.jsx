import { useEffect, useState } from "react";
import { db } from "@/firebase/firebase.js";
import { doc, getDoc } from "firebase/firestore";

export default function RoundSummaryTable({ sessionId, pairs }) {
  const [playersInfo, setPlayersInfo] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPlayers() {
      if (!pairs || pairs.length === 0) {
        setPlayersInfo({});
        setLoading(false);
        return;
      }

      setLoading(true);
      const infoMap = {};

      await Promise.all(
        pairs.flatMap((pair) => {
          const playerIds = [pair.playerAId, pair.playerBId].filter(Boolean);
          return playerIds.map(async (playerId) => {
            if (!playerId) return;
            const playerRef = doc(db, "sessions", sessionId, "players", playerId);
            const playerSnap = await getDoc(playerRef);
            if (playerSnap.exists()) {
              infoMap[playerId] = playerSnap.data();
            } else {
              infoMap[playerId] = { name: "Unknown player", hitsReceived: 0 };
            }
          });
        })
      );

      setPlayersInfo(infoMap);
      setLoading(false);
    }

    fetchPlayers();
  }, [pairs, sessionId]);

  if (loading) {
    return <div>Loading player info...</div>;
  }

  if (!pairs || pairs.length === 0) {
    return <div>No pairs found for this round.</div>;
  }

  const renderPlayer = (player, result, side) => {
    return (
      <div className="relative flex flex-col items-center justify-center w-full">
        {/* Instead of crown on the whole container, move it inside name span */}
        <div className="flex items-center justify-between text-3xl font-semibold z-10 w-full min-w-[280px] relative">
          
          {side === "left" && player?.icon && (
            <img
              src={player.icon}
              alt={`${player.name} icon`}
              className="w-16 h-16 rounded-full object-cover"
            />
          )}

          <span className="mx-4 flex-1 text-center whitespace-nowrap relative">
            {player?.name ?? "Loading..."}
            {/* Crown positioned absolutely relative to the name span */}
            {result === "Winner" && (
              <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 text-5xl">
                👑
              </div>
            )}

            
            {/* Cross remains over the whole container */}
            {result === "Loser" && (
              <div className="absolute inset-0 flex items-center justify-center text-red-500 text-7xl pointer-events-none opacity-70">
                ❌
              </div>
            )}


            {result === "Draw" && (
              <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 text-2xl text-gray-700 select-none">
                🤝
              </div>
            )}

          </span>

          {side === "right" && player?.icon && (
            <img
              src={player.icon}
              alt={`${player.name} icon`}
              className="w-16 h-16 rounded-full object-cover"
            />
          )}
        </div>

      </div>
    );

  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-sky-100">
      <div className="overflow-visible w-full max-w-3xl">
        <table className="w-full text-black">
          <tbody>
            {pairs.map(({ playerAId, playerBId }, index) => {
              const playerA = playersInfo[playerAId];
              const playerB = playersInfo[playerBId];

              const hitsA = playerA?.hitsReceived ?? 0;
              const hitsB = playerB?.hitsReceived ?? 0;

              let resultA = "";
              let resultB = "";

              if (playerBId) {
                if (hitsA == hitsB) {
                  resultA = "Draw";
                  resultB = "Draw";
                }
                if (hitsA < hitsB) {
                  resultA = "Winner";
                  resultB = "Loser";
                } else if (hitsA > hitsB) {
                  resultA = "Loser";
                  resultB = "Winner";
                }
              }

              return (
                <tr
                  key={index}
                  className="text-center text-4xl py-6"
                  style={{ borderBottom: "none" }}
                >
                  <td className="px-8 py-6 align-middle overflow-visible">
                    {renderPlayer(playerA, resultA, "left")}
                  </td>

                  <td className="px-4 py-6 align-middle text-3xl font-bold">VS</td>

                  <td className="px-8 py-6 align-middle overflow-visible">
                    {playerB ? renderPlayer(playerB, resultB, "right") : "No Opponent"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
