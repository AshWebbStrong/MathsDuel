import React from "react";

export default function HostSessionSummary() {
  return (
    <div className="w-screen h-screen bg-indigo-50 flex flex-col items-center justify-center text-center p-8">
      <h1 className="text-5xl font-bold text-indigo-800 mb-4">🎉 Quiz is Over!</h1>
      <p className="text-xl text-gray-700 mb-8">
        Thank you for hosting. You can return to the home screen or view results.
      </p>
      {/* Optional: Add buttons for navigation if needed later */}
    </div>
  );
}
