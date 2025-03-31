import { useState, useCallback } from "react";
import "./styles.css";
import { useTimeout } from "./useTimeout";

type Difficulty = "easy" | "medium" | "hard";

const DIFFICULTY_SETTINGS = {
  easy: { time: 2000, points: 100 },
  medium: { time: 1000, points: 250 },
  hard: { time: 500, points: 500 },
};

export default function App() {
  const [isExploded, setIsExploded] = useState(false);
  const [isDefused, setIsDefused] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  const handleExplode = useCallback(() => {
    if (!isDefused) {
      setIsExploded(true);
      setHighScore((prev) => Math.max(prev, score));
    }
  }, [isDefused, score]);

  const cancelTimeout = useTimeout(
    handleExplode,
    gameStarted ? DIFFICULTY_SETTINGS[difficulty].time : 0
  );

  const handleDefuse = () => {
    setIsDefused(true);
    setScore((prev) => prev + DIFFICULTY_SETTINGS[difficulty].points);
    cancelTimeout();
  };

  const handleRestart = () => {
    setIsExploded(false);
    setIsDefused(false);
    setGameStarted(false);
  };

  const handleNewGame = () => {
    if (isExploded) {
      setScore(0);
    }
    handleRestart();
  };

  return (
    <main className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
      <div className="text-center p-8 rounded-lg bg-gray-800 shadow-xl max-w-md w-full">
        <h1 className="text-4xl font-bold mb-4">BOMB DEFUSAL</h1>

        <div className="mb-6">
          <p className="text-xl mb-2">Score: {score}</p>
          <p className="text-sm text-gray-400">High Score: {highScore}</p>
        </div>

        {!gameStarted ? (
          <div className="space-y-4">
            <div className="flex justify-center gap-2 mb-4">
              {(Object.keys(DIFFICULTY_SETTINGS) as Difficulty[]).map(
                (level) => (
                  <button
                    key={level}
                    onClick={() => setDifficulty(level)}
                    className={`px-4 py-2 rounded capitalize ${
                      difficulty === level
                        ? "bg-blue-500 text-white"
                        : "bg-gray-700 text-gray-300"
                    }`}
                  >
                    {level}
                  </button>
                )
              )}
            </div>
            <div className="text-sm text-gray-400 mb-4">
              Time: {DIFFICULTY_SETTINGS[difficulty].time}ms
              <br />
              Points: {DIFFICULTY_SETTINGS[difficulty].points}
            </div>
            <button
              onClick={() => setGameStarted(true)}
              className="bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded-lg text-lg font-semibold w-full transform hover:scale-105 transition-transform"
            >
              Start Game
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {!isExploded && !isDefused && (
              <div className="space-y-4">
                <div className="text-xl">
                  Defuse in{" "}
                  <span className="text-red-500 font-bold">
                    {DIFFICULTY_SETTINGS[difficulty].time / 1000}s
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute inset-0 bg-red-500/20 animate-ping rounded-full" />
                  <button
                    onClick={handleDefuse}
                    className="relative bg-red-500 hover:bg-red-600 w-32 h-32 rounded-full text-xl font-bold animate-pulse transform hover:scale-105 transition-all"
                  >
                    DEFUSE!
                  </button>
                </div>
              </div>
            )}

            {isExploded && (
              <div className="space-y-4">
                <div className="text-8xl animate-bounce">💥</div>
                <p className="text-red-500 text-2xl font-bold">Game Over!</p>
                <div className="space-y-2">
                  <button
                    onClick={handleNewGame}
                    className="bg-blue-500 hover:bg-blue-600 px-6 py-2 rounded-lg w-full transform hover:scale-105 transition-transform"
                  >
                    New Game
                  </button>
                </div>
              </div>
            )}

            {isDefused && (
              <div className="space-y-4">
                <div className="text-8xl animate-bounce">🎉</div>
                <p className="text-green-500 text-2xl font-bold">
                  +{DIFFICULTY_SETTINGS[difficulty].points} Points!
                </p>
                <div className="space-y-2">
                  <button
                    onClick={() => setGameStarted(true)}
                    className="bg-green-500 hover:bg-green-600 px-6 py-2 rounded-lg w-full transform hover:scale-105 transition-transform"
                  >
                    Next Round
                  </button>
                  <button
                    onClick={handleNewGame}
                    className="bg-blue-500 hover:bg-blue-600 px-6 py-2 rounded-lg w-full transform hover:scale-105 transition-transform"
                  >
                    New Game
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
