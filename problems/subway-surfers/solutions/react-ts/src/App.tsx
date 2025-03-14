import "./styles.css";
import EndlessRunner from "./components/game/EndlessRunner";
import { useEffect } from "react";

export default function App() {
  useEffect(() => {
    console.log = () => {};
  }, []);

  return (
    <main className="p-5 text-center min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <h1 className="text-5xl font-bold py-7 text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-600">
        Desert Runner Game
      </h1>
      <p className="mb-8 text-gray-300 max-w-md mx-auto">
        Use{" "}
        <span className="px-2 py-1 bg-gray-700 rounded text-amber-400 font-semibold">
          UP
        </span>{" "}
        and{" "}
        <span className="px-2 py-1 bg-gray-700 rounded text-amber-400 font-semibold">
          DOWN
        </span>{" "}
        arrow keys to move. Avoid the obstacles!
      </p>

      <EndlessRunner
        showHitboxes={false}
        difficulty="medium"
      />
    </main>
  );
}
