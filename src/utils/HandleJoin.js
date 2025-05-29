
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/firebase.js";

export default async function HandleJoin(code) {

  console.log("checking " + code);

    if (!code) return;

    const sessionRef = doc(db, "sessions", code.toUpperCase());
    const snap = await getDoc(sessionRef);

    if (!snap.exists()) {
      alert("Session not found. Check the code and try again.");
      return;
    }

    return  code.toUpperCase();

}
