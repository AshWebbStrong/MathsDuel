import { useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase.js";


export default function Home({onLogin,onHost,onCreate, onJoined}) {

    const [code, setCode] = useState("");


    // Check if code is an active code & join the quiz
    async function handleJoin() {
        if (!code) return;

        const sessionRef = doc(db, "sessions", code.toUpperCase());
        const snap = await getDoc(sessionRef);

        if (!snap.exists()) {
        alert("Session not found. Check the code and try again.");
        return;
        }
        onJoined(code.toUpperCase());
    }



    return (
        <div>
            <h1> Maths Duel</h1>
            <input placeholder="Session Code" value = {code} onChange={(e) => setCode(e.target.value)} />
            <button onClick={handleJoin}>Join Quiz</button>
            <h2> If you are the admin</h2>
            <button onClick={() => onCreate()}>Create New Question Set</button>
            <button onClick={() => onHost()}>Host Saved Question Set</button>
        </div>
    )
}