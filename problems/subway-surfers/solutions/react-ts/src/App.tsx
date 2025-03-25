import "./styles.css";
import EndlessRunner from "./components/game/EndlessRunner";
import Controls from "./components/game/ui/Controls";
import { useEffect } from "react";

// this is a hack to prevent the console from being spammed with logs
// normally we would use a logger library or remove the logs altogether
console.log = () => {};

export default function App() {
  useScrollToTop();

  return (
    <main className="p-5 min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="max-w-6xl mx-auto">
        {/* Centered Game Header */}
        <h1 className="text-5xl font-bold py-2 text-center text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-600 mb-8">
          Desert Runner Game
        </h1>

        {/* Game Container */}
        <div className="flex flex-col items-center gap-8">
          {/* Game Canvas */}
          <div className="relative">
            <EndlessRunner showHitboxes={false} difficulty="hard" />
          </div>

          {/* Instructions Row */}
          <div className="flex flex-col md:flex-row gap-6 justify-center w-full max-w-4xl">
            {/* Controls Block */}
            <Controls />

            {/* How to Play Block */}
            <div className="flex-1 bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
              <h2 className="text-xl font-bold text-amber-400 mb-4 text-center">
                How to Play
              </h2>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-center gap-2">
                  <span className="text-amber-400 min-w-[12px]">•</span>
                  <span>Dodge obstacles to survive</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-amber-400 min-w-[12px]">•</span>
                  <span>Collect coins to increase score</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-amber-400 min-w-[12px]">•</span>
                  <span>Stay alive as long as possible</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

// (never mind this) this is unreleated to the game
const useScrollToTop = () => {
  useEffect(() => {
    const scrollToTop = () => {
      document.documentElement.style.scrollBehavior = "auto";
      window.scrollTo(0, 0);
      if (history.scrollRestoration) {
        history.scrollRestoration = "manual";
      }
    };

    window.addEventListener("load", scrollToTop);

    return () => {
      window.removeEventListener("load", scrollToTop);
    };
  }, []);
};
