import { doc, getDoc, collection, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase/firebase.js";

export default async function HandleJoin(code) {
  console.log("checking " + code);

  if (!code) return;

  const upperCode = code.toUpperCase();
  const sessionRef = doc(db, "sessions", upperCode);
  const snap = await getDoc(sessionRef);

  if (!snap.exists()) {
    alert("Session not found. Check the code and try again.");
    return;
  }

  // Generate or retrieve player ID
  let playerId = sessionStorage.getItem("playerId");
  if (!playerId) {
    playerId = Math.random().toString(36).substr(2, 9);
    sessionStorage.setItem("playerId", playerId);
  }

  // Generate a random player name
  const randomName = "Player_" + Math.random().toString(36).substr(2, 5);

  // Create player reference in Firestore
  const playerRef = doc(db, "sessions", upperCode, "players", playerId);
  await setDoc(playerRef, {
    name: randomName,
    joinedAt: serverTimestamp(),
  });

  // Return session code and maybe player data if needed
  return {
  sessionCode: upperCode,
  playerId,
  name: randomName
};
}
