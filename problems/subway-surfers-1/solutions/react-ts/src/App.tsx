import React, { useState } from "react";
import "./styles.css";
import EndlessRunner from "./components/game/EndlessRunner";

export default function App() {
  const [useSprite, setUseSprite] = useState(true);

  return (
    <main className="p-5 text-center">
      <h1 className="text-3xl font-bold mb-2 text-red-500">
        2D Endless Runner Game
      </h1>
      <p className="mb-4">
        Use UP and DOWN arrow keys to move. Avoid the obstacles!
      </p>

      <div className="mb-5">
        <label className="flex items-center justify-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={useSprite}
            onChange={(e) => setUseSprite(e.target.checked)}
            className="w-4 h-4"
          />
          <span>Use character sprite (uncheck for simple circle)</span>
        </label>
      </div>

      <EndlessRunner useSprite={useSprite} />
    </main>
  );
}
