import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut,  signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth, db } from "@/firebase/firebase"; 
import { doc, getDoc } from "firebase/firestore";

import CreateQuestionSet from "@/components/screens/CreateQuestionSet";
import HostSessionSetup from "@/components/screens/HostSessionSetup";
import HostSessionActive from "@/components/screens/HostSessionActive";
import PlayQuiz from "@/components/wrappers/PlayQuiz.jsx";
import HostQuiz from "@/components/wrappers/HostQuiz.jsx";
import Home from "@/components/screens/Home";



  const MODES = {
      HOME: "home",
      PLAY: "play",
      HOSTSETUP: "hostSetUp",
      CREATE: "create",

     
  };

export default function App() {

  const [mode, setMode] = useState("home");
  const goHome = () => { setMode(MODES.HOME); setSessionId("");} // my return to the main menu button. Currently resets EVERYTHING like a refresh. Still  issue of holding onto these when quiz finishes
  const [sessionId, setSessionId] = useState("");
  const [playerId, setPlayerId] = useState("");

  const [user, setUser] = useState(null);


  //Function to handle logging in
  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      goHome();
    } catch (err) {
      console.error("Login error:", err);
    }
  };


  //Connects to the google authentication. Allows login if in approved list. Denies if not.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const isApproved = await checkUserApproved(firebaseUser.email);
        if (isApproved) {
          setUser(firebaseUser); // User allowed in
        } else {
          alert("Your account is not yet approved.");
          await signOut(auth);
          setUser(null);
        }
      } else {
        setUser(null); // No user logged in
      }
    });

    return () => unsubscribe();
  }, []);

    //Check if user is on approved list
  async function checkUserApproved(userEmail) {
    const docRef = doc(db, "approvedUsers", userEmail);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() && docSnap.data().approved === true;
  }

  
  // Function to handle logging out
  const handleLogout = () => {
    signOut(auth).then(() => {
      setUser(null);
      goHome();
    });
  };

  //Tell console when user logs in & out
  useEffect(() => {
  if (user === null) {
      console.log("User is logged out");
    } else {
      console.log("User is logged in:", user.displayName);
    }
  }, [user]);

  //Check user is approved
  async function checkUserApproved(userEmail) {
    const docRef = doc(db, "approvedUsers", userEmail);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() && docSnap.data().approved === true;
  }


  return (
    <div className="p-0 w-screen h-screen box-border bg-gray-400">

      {mode === MODES.HOME && (
        <Home 
          onLogin={() => 
            handleLogin()
          }
          onLogout={() =>
            handleLogout()
          }
          onHost ={() =>
            setMode(MODES.HOSTSETUP)
          }
          onCreate = {() => 
              setMode(MODES.CREATE)
          } 
          onJoined={(joinResult) => {
            setSessionId(joinResult.sessionCode);
            setPlayerId(joinResult.playerId)
            setMode(MODES.PLAY);
          }}
          user={user}

          />
      )}

      {mode === MODES.PLAY && (
        <PlayQuiz 
          sessionId={sessionId}
          playerId={playerId}                  
          goHome={goHome}/>
      )}


      {mode === MODES.CREATE &&  (
        user
        ?  <CreateQuestionSet goHome={goHome}/>
        : goHome()
      )}

      {mode === MODES.HOSTSETUP && (
        user
        ? (
            <HostQuiz 
              goHome={goHome}/>
          )
         : goHome() 
      )}

    </div>
  );
}
