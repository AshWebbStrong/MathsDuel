import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/firebase.js";

export async function generateUniqueSessionCode(length = 5) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  function generateCode() {
    let code = "";
    for (let i = 0; i < length; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  let code;
  let exists = true;

  while (exists) {
    code = generateCode();
    const sessionRef = doc(db, "sessions", code);
    const docSnap = await getDoc(sessionRef);
    exists = docSnap.exists();
  }

  return code;
}
