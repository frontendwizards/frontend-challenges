import React, { forwardRef } from "react";

interface GameCanvasProps {
  width: number;
  height: number;
}

const GameCanvas = forwardRef<HTMLCanvasElement, GameCanvasProps>(
  ({ width, height }, ref) => {
    return (
      <div className="game-frame relative">
        {/* Inner glow effect */}
        <div
          className="absolute inset-0 rounded-md"
          style={{
            boxShadow: "inset 0 0 15px rgba(245, 158, 11, 0.3)",
            zIndex: 20,
            pointerEvents: "none",
          }}
        ></div>

        <canvas
          ref={ref}
          width={width}
          height={height}
          className="border-4 border-amber-500 rounded-md relative z-10"
          aria-label="Game Canvas"
        />

        {/* Outer glow effects - layered for more dimension */}
        <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-amber-500 rounded-md blur-[3px] -z-10 transform scale-[1.02] opacity-60"></div>
      </div>
    );
  }
);

GameCanvas.displayName = "GameCanvas";

export default GameCanvas;
