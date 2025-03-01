import "./styles.css";
import EndlessRunner from "./components/game/EndlessRunner";

export default function App() {
  return (
    <main className="p-5 text-center">
      <h1 className="text-3xl font-bold mb-10 pt-10">Desert Runner Game</h1>
      <p className="mb-8">
        Use UP and DOWN arrow keys to move. Avoid the obstacles!
      </p>

      <EndlessRunner
        width={1000}
        height={600}
        showHitboxes={false}
        showBorders={false}
        difficulty="medium"
        backgroundColor="#d8b483" // Desert sand color for the background
      />
    </main>
  );
}
