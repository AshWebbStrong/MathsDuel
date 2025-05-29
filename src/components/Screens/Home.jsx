import { useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase.js";
import HandleJoin from "@/utils/HandleJoin.js";


export default function Home({onLogin,onHost,onCreate, onJoined, user, onLogout}) {

    const [code, setCode] = useState("");


    // Check if code is an active code & join the quiz
    async function handleJoin() {

        const result = await HandleJoin(code);
        if (result) { 
            console.log(code + " accepted");
            onJoined(result);
        }
    }



    return (
        <div>
            <h1> Maths Duel</h1>
            <input placeholder="Session Code" value = {code} onChange={(e) => setCode(e.target.value)} />
            <button onClick={() => handleJoin(code)}>Join Quiz</button>
            {user ? (
            <>
                <h2>Admin Options</h2>
                <button onClick={() => onCreate()}>Create New Question Set</button>
                <button onClick={() => onHost()}>Host Saved Question Set</button>
                <button onClick={() => onLogout()}>Logout</button>
            </>
            ) : (
            <>
                <h2>Admins must log in</h2>
                <button onClick={() => onLogin()}>Login</button>
            </>
            )}
        </div>
    )
}