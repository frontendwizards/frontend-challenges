import { useState, useCallback } from "react";
import "./styles.css";
import { useTimeout } from "./useTimeout";

export default function App() {
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isExploded, setIsExploded] = useState(false);

  // Dynamic delay that gets shorter as score increases
  const currentDelay = Math.max(200, 1000 - score * 50);

  const handleExplode = useCallback(() => {
    setIsExploded(true);
    setHighScore((prev) => Math.max(prev, score));
  }, [score]);

  const cancelTimeout = useTimeout(
    handleExplode,
    isExploded ? 0 : currentDelay
  );

  const handleClick = () => {
    if (isExploded) {
      setIsExploded(false);
      setScore(0);
      return;
    }

    cancelTimeout();
    setScore((prev) => prev + 1);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-900 to-blue-900 text-white flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-red-600">
          HOT POTATO
        </h1>

        <div className="mb-8 space-y-2">
          <p className="text-2xl">Score: {score}</p>
          <p className="text-sm text-gray-300">High Score: {highScore}</p>
        </div>

        <button
          onClick={handleClick}
          className={`
            relative w-40 h-40 rounded-full text-2xl font-bold
            transform hover:scale-105 transition-all duration-200
            ${
              isExploded
                ? "bg-blue-500 hover:bg-blue-600"
                : "bg-gradient-to-br from-orange-400 to-red-600 hover:from-orange-500 hover:to-red-700"
            }
          `}
        >
          {!isExploded && (
            <div className="absolute inset-0 bg-white/20 rounded-full animate-ping" />
          )}
          <div className="relative">
            {isExploded ? (
              <>
                <div className="text-5xl mb-2">🔥</div>
                <div className="text-sm">Play Again</div>
              </>
            ) : (
              <>
                <div className="text-5xl mb-2">🥔</div>
                <div className="text-sm">Click!</div>
              </>
            )}
          </div>
        </button>

        {!isExploded && (
          <p className="mt-8 text-gray-300 animate-pulse">
            Keep clicking before it explodes!
          </p>
        )}
      </div>
    </main>
  );
}
