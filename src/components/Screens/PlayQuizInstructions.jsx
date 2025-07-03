import { useEffect, useState } from "react";

const instructionImages = [
  "/instructions/instruction1.png",
  "/instructions/instruction2.png",
  "/instructions/instruction3.png",
  "/instructions/instruction4.png",
];

export default function PlayQuizInstructions() {
  const [index, setIndex] = useState(0);

  // Cycle through images every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % instructionImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
<div
    className="h-screen w-full bg-contain bg-center bg-no-repeat transition-opacity duration-550"
    style={{ backgroundImage: `url(${instructionImages[index]})` }}
>
  <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-white text-3xl font-bold drop-shadow-lg">
    Instructions for the duel
  </div>
</div>

  );
}
