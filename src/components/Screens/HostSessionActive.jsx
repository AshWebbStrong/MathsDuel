import { useEffect } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase/firebase.js";
import BackToHomeButton from "@/components/ui/BackToHomeButton.jsx";

export default function HostSessionActive({ sessionId, goHome }) {
  useEffect(() => {
    // Update hostActive to true when component mounts
    const sessionRef = doc(db, "sessions", sessionId);
    updateDoc(sessionRef, { hostActive: true });

    const handleBeforeUnload = async () => {
      await updateDoc(sessionRef, { hostActive: false });
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    // Cleanup on unmount
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      // Also update hostActive = false when component unmounts (host leaves normally)
      updateDoc(sessionRef, { hostActive: false });
    };
  }, [sessionId]);

  return (
    <div>
      <h2>Hosting session! {sessionId}</h2>
      <BackToHomeButton goHome={goHome} />
    </div>
  );
}
