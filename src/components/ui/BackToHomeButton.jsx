export default function BackToHomeButton({ goHome }) {
  return (
    <button
      onClick={goHome}
      className="mt-4 px-5 py-3 bg-blue-600 text-white font-semibold rounded-md shadow-md
                 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300
                 transition duration-200"
    >
      Back to Home
    </button>
  );
}
