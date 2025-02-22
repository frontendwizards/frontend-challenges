import { useState, useEffect, useCallback } from "react";
import "./styles.css";
import { cn } from "./utils/cn";

type GridCard = {
  value: string;
  isFlipped: boolean;
  index: number;
};

const GAME_DURATION = 40;
const animals = ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼"];

const Card = ({
  value,
  onClick,
  isFlipped,
  disabled,
}: {
  value: string;
  onClick: () => void;
  isFlipped: boolean;
  disabled: boolean;
}) => {
  return (
    <div className={cn("card h-32", isFlipped && "flipped")} onClick={onClick}>
      <div className="card-inner">
        <div
          className={cn(
            "card-front rounded-3xl p-2 flex items-center justify-center text-5xl bg-gray-700 shadow-lg",
            !disabled && "cursor-pointer"
          )}
        >
          ⚡
        </div>
        <div className="card-back">{value}</div>
      </div>
    </div>
  );
};

const initializeGrid = () => {
  const animalsGrid = [...animals, ...animals].map((animal, index) => ({
    value: animal,
    isFlipped: false,
    index,
  }));

  return animalsGrid.sort(() => Math.random() - 0.5);
};

export default function App() {
  const [grid, setGrid] = useState<GridCard[]>(initializeGrid());
  const [flippedCards, setFlippedCards] = useState<GridCard[]>([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [timer, setTimer] = useState(GAME_DURATION);

  const handleCardClick = (index: number) => {
    if (flippedCards.length === 2 || isGameOver) {
      return;
    }

    setGrid((prevGrid) => {
      const newGrid = [...prevGrid];
      newGrid[index].isFlipped = true;
      return newGrid;
    });

    setFlippedCards((prevFlippedCards) => [...prevFlippedCards, grid[index]]);
  };

  const isAllCardsFlipped = useCallback(
    () => grid.every((card) => card.isFlipped),
    [grid]
  );

  useEffect(() => {
    if (isGameOver) {
      return;
    }

    const timerInterval = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer === 1) {
          setIsGameOver(true);
          clearInterval(timerInterval);
        }
        return prevTimer - 1;
      });
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [isGameOver]);

  useEffect(() => {
    if (flippedCards.length !== 2 || isGameOver) {
      return;
    }

    const timer = setTimeout(() => {
      const [card1, card2] = flippedCards;
      if (card1.value !== card2.value) {
        setGrid((prevGrid) => {
          return prevGrid.map((card) => {
            if (card.index === card1.index || card.index === card2.index) {
              return { ...card, isFlipped: false };
            }
            return card;
          });
        });
      }
      // if all cards are flipped, set the game over state
      else if (isAllCardsFlipped()) {
        setIsGameOver(true);
      }

      setFlippedCards([]);
    }, 1000);

    return () => clearTimeout(timer);
  }, [flippedCards]);

  // better UI, more distance...
  // make sure it works
  // the naming of everything is good? is it accessible? combinasie btw tailwind and css was good?

  return (
    <main className="h-full flex flex-col items-center justify-center">
      <h1 className="text-3xl md:text-5xl mb-4 md:mb-10">MEMORY GAME</h1>
      <div className="flex text-2xl justify-between max-w-4xl">
        <div className={cn("h-8 mb-4 md:mb-5", isGameOver && "invisible")}>
          {isAllCardsFlipped() ? "Congratulations! You won!" : "You lost! "}
        </div>
        <div className="mb-4 md:mb-14">Time left : {timer}</div>
      </div>
      <div
        className="grid gap-1 md:gap-8 grid-cols-4 w-full max-w-xl"
        role="group"
        aria-label="Pokemon game grid"
        aria-describedby="pokemon-instructions"
      >
        {grid.map(({ value, isFlipped }, index) => (
          <Card
            key={`cell-${index}`}
            value={value}
            isFlipped={isFlipped}
            onClick={() => handleCardClick(index)}
            disabled={isGameOver || flippedCards.length === 2}
          />
        ))}
      </div>
    </main>
  );
}
