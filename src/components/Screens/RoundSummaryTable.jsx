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

      // Create a map to store player info keyed by playerId
      const infoMap = {};

      // Fetch all players info in parallel
      await Promise.all(
        pairs.flatMap(pair => {
          const playerIds = [pair.playerAId, pair.playerBId].filter(Boolean);
          return playerIds.map(async (playerId) => {
            if (!playerId) return;
            const playerRef = doc(db, "sessions", sessionId, "players", playerId);
            const playerSnap = await getDoc(playerRef);
            if (playerSnap.exists()) {
              infoMap[playerId] = playerSnap.data();
            } else {
              infoMap[playerId] = { name: "Unknown player" };
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

    return (
    <div className="flex justify-center items-center min-h-screen bg-sky-100">
        <div className="overflow-x-auto w-full max-w-3xl">
        <table className="w-full text-black">
            <tbody>
            {pairs.map(({ playerAId, playerBId }, index) => (
                <tr
                key={index}
                className="text-center text-4xl py-6"
                style={{ borderBottom: "none" }}
                >
                <td className="px-8 py-6 align-middle text-3xl font-semibold">
                    {playersInfo[playerAId]?.name ?? "Loading..."}
                </td>
                <td className="px-4 py-6 align-middle text-3xl font-bold">VS</td>
                <td className="px-8 py-6 align-middle text-3xl font-semibold">
                    {playerBId ? playersInfo[playerBId]?.name ?? "Loading..." : "No Opponent"}
                </td>
                </tr>
            ))}
            </tbody>
        </table>
        </div>
    </div>
    );

}
