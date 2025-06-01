import { useEffect, useState } from "react";
import { db } from "@/firebase/firebase.js";
import { collection, getDocs } from "firebase/firestore";
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

      // Trigger join on Enter key press inside input
    function onKeyDown(e) {
        if (e.key === 'Enter') {
        e.preventDefault(); // prevent form submit reload
        handleJoin(code);
        }
    }

        // Load some questions to preview
        function shuffleArray(array) {
    return array
        .map((value) => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value);
    }

    const [suggestedSets, setSuggestedSets] = useState([]);

        useEffect(() => {
        async function fetchQuestionSets() {
            const snapshot = await getDocs(collection(db, "questionSets"));
            const allSets = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
            }));
            
            const randomFive = shuffleArray(allSets).slice(0, 5);
            setSuggestedSets(randomFive);
        }

        fetchQuestionSets();
        }, []);



   return (
    <div 
        className="grid grid-rows-[auto_1fr_auto] grid-cols-[1fr_auto_1fr] w-full h-full bg-cover bg-center text-black"
        style={{ backgroundImage: "url('/images/homeBackground.png')" }}
    >

        <div className="row-start-1 col-start-1 flex items-start px-5 scale-80">
            <img src="/images/piLogo2.png" alt="Description" className="w-48 h-auto" />

        </div>
      {/* Top Center: single big input that acts like a button */}
      <form 
        onSubmit={e => {
          e.preventDefault();
          handleJoin(code);
        }}
        className="row-start-1 col-start-2 flex justify-center items-center p-4"
      >
        <input 
          type="text" 
          placeholder="JOIN CODE" 
          value={code} 
          maxLength={5}
          onChange={(e) => setCode(e.target.value.toUpperCase())} 
          onKeyDown={onKeyDown}
          className="w-150 h-30 text-7xl font-extrabold text-center 
                    text-red-600 placeholder-gray-600 caret-gray-600
                    bg-white/30 rounded-full
                    border-4 border-indigo-300
                    focus:outline-none focus:ring-4 focus:ring-indigo-400"
        />
      </form>

      {/* Left Middle: Create New Question Set (only if logged in) */}
      {user && (
        <div className="row-start-2 col-start-1 flex items-start mt-20 p-6">
            <div
                className="
                w-65 h-105
                px-4 py-2
                flex flex-col justify-between
                text-indigo-200
                bg-gray-800/70 rounded-md
                border border-indigo-400 shadow-md
                "
            >
                {/* Title */}
                <h2 className="text-[1.5rem] font-semibold mb-2">
                Quiz Library
                </h2>

                {/* List of data (example content) */}
                <ul className="flex-1 space-y-2 text-sm overflow-y-auto">
                  {suggestedSets.map(set => (
                    <li key={set.id} className="bg-white/10 rounded p-2">
                    <div className="font-bold">{set.title}</div>
                    <div className="text-xs text-gray-300">
                        {set.questions.length || 0} questions
                    </div>
                    </li>
                ))}
                </ul>

                {/* Action Button */}
                <button
                onClick={onCreate}
                className="
                    mt-4 px-4 py-2
                    bg-indigo-600 text-white rounded-md
                    hover:bg-indigo-700
                    focus:outline-none focus:ring-4 focus:ring-indigo-500
                    transition duration-200 ease-in-out
                "
                >
                Create
                </button>
            </div>
        </div>

      )}

      {/* Right Middle: Host Saved Question Set (only if logged in) */}
      {user && (
        <div className="row-start-2 col-start-3 flex items-start justify-end mt-20 p-4">
          <button 
            onClick={onHost} 
            className="
                w-65 h-14
                px-4 py-2 text-[1.2rem] font-semibold text-centre
                text-indigo-200       
                bg-gray-800/70 rounded-md          
                border-1 border-indigo-400 shadow-md             
                hover:bg-indigo-700 hover:text-white
                focus:outline-none focus:ring-4 focus:ring-indigo-500
                transition duration-200 ease-in-out
            "
          >
            Host a quiz
          </button>
        </div>
      )}

      {/* Bottom Center: Login or Logout button */}
      <div className="row-start-3 col-start-2 flex justify-center p-4">
        {user ? (
          <button 
            onClick={onLogout} 
            className="px-6 py-3 rounded-xl 
                        bg-white/50 text-blue-900 font-semibold 
                        shadow-inner shadow-white border border-white/30 backdrop-blur-md 
                        hover:bg-white/70 hover:shadow-[inset_0_0_10px_rgba(255,255,255,0.6),0_0_15px_rgba(0,255,255,0.3)] 
                        hover:scale-125 active:scale-105 transform transition-all duration-200 ease-out"
          >
            Logout
          </button>
        ) : (
          <button 
            onClick={onLogin}
                        className="px-6 py-3 rounded-xl 
                        bg-white/50 text-blue-900 font-semibold 
                        shadow-inner shadow-white border border-white/30 backdrop-blur-md 
                        hover:bg-white/70 hover:shadow-[inset_0_0_10px_rgba(255,255,255,0.6),0_0_15px_rgba(0,255,255,0.3)] 
                        hover:scale-145 active:scale-100 transform transition-all duration-200 ease-out"
          > 
            
            Teachers - to create & host quizzes
          </button>
        )}
      </div>

    </div>
  );


}