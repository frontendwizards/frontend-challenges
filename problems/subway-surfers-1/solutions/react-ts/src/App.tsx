import React, { useState } from "react";
import KaboomGame from "./components/KaboomGame";

export default function App() {
  const [useSprite, setUseSprite] = useState(true);

  return (
    <main style={{ padding: "20px", textAlign: "center" }}>
      <h1>2D Endless Runner Game</h1>
      <p>Use UP and DOWN arrow keys to move. Avoid the obstacles!</p>

      <div style={{ marginBottom: "20px" }}>
        <label>
          <input
            type="checkbox"
            checked={useSprite}
            onChange={(e) => setUseSprite(e.target.checked)}
          />
          Use character sprite (uncheck for simple circle)
        </label>
      </div>

      <KaboomGame useSprite={useSprite} />
    </main>
  );
}
