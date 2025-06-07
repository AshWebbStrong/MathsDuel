import { doc, getDoc, collection, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase/firebase.js";

let lastJoinAttempt = 0; // Global cache (in memory) to throttle

export default async function HandleJoin(code) {
  const now = Date.now();

  // 🛡️ 1. Throttle join attempts (5 sec buffer)
  if (now - lastJoinAttempt < 5000) {
    alert("Please wait a few seconds before trying again.");
    return;
  }
  lastJoinAttempt = now;

  if (!code) return;

  const upperCode = code.toUpperCase();
  const sessionRef = doc(db, "sessions", upperCode);

  let snap;
  try {
    snap = await getDoc(sessionRef);
  } catch (err) {
    console.error("Error reading session:", err);
    alert("Failed to connect to session. Try again later.");
    return;
  }

  if (!snap.exists()) {
    alert("Session not found. Check the code and try again.");
    return;
  }

  const sessionData = snap.data();

  // ❌ Prevent join if quiz already started
  if (sessionData.sessionStarted) {
    alert("The quiz has already started. You can no longer join.");
    return;
  }

  // ❌ Prevent join if host is inactive
  if (!sessionData.hostActive) {
    alert("The host is not active. Please try again later.");
    return;
  }

  // ✅ Create player if everything is valid
  let playerId = sessionStorage.getItem("playerId");
  if (!playerId) {
    playerId = Math.random().toString(36).substr(2, 9);
    sessionStorage.setItem("playerId", playerId);
  }

  const randomName = "Player_" + Math.random().toString(36).substr(2, 5);
  const playerRef = doc(db, "sessions", upperCode, "players", playerId);

  try {
    await setDoc(playerRef, {
      name: randomName,
      joinedAt: serverTimestamp(),
    });
  } catch (err) {
    console.error("Error creating player:", err);
    alert("Failed to join session.");
    return;
  }

  return {
    sessionCode: upperCode,
    playerId,
    name: randomName,
  };
}

