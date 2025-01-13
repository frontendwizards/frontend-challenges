import { useEffect, useState } from "react";
import "./styles.css";
import { cn } from "./utils/cn";

const WORDS = Object.freeze([
  "APPLE",
  "BEAST",
  "FAINT",
  "FEAST",
  "FRUIT",
  "GAMES",
  "PAINT",
  "PASTE",
  "TOWER",
  "REACT",
]);

const WORD_LENGTH = 5;
const MAX_TRIES = 6;

enum CellColor {
  DEFAULT = "light-gray",
  ABSENT = "dark-gray",
  CORRECT = "green",
  PRESENT = "yellow",
}

enum GameStatus {
  WON,
  LOST,
  PLAYING,
}

type CellData = {
  value: string | null;
  bgColor: CellColor;
};

type Grid = CellData[][];

const generateInitialGridState = (): Grid =>
  Array.from({ length: MAX_TRIES }, () =>
    Array.from({ length: WORD_LENGTH }, () => ({
      value: null,
      bgColor: CellColor.DEFAULT,
    }))
  );

interface CellProps {
  value: string | null;
  backgroundClass: CellColor;
}

const Cell = ({ value, backgroundClass }: CellProps) => {
  return (
    <div
      className={cn(
        "aspect-square w-full border-2 border-[#3a3a3d] text-white text-lg md:text-2xl font-extrabold",
        "flex items-center justify-center uppercase",
        backgroundClass !== CellColor.DEFAULT && "cell-animating",
        value !== null && "cell-filled",
        backgroundClass
      )}
    >
      {value}
    </div>
  );
};

const getWordFromRow = (row: CellData[]): string =>
  row.reduce((word, cell) => word + (cell.value ?? ""), "");

const getRandomWord = () => WORDS[Math.floor(Math.random() * WORDS.length)];

const getGameStatusMessage = (
  currentGameStatus: GameStatus,
  currentWord: string
) => {
  const gameStatusMessage: Record<GameStatus, string> = {
    [GameStatus.WON]: "Congratulations! You won 🎉",
    [GameStatus.LOST]: `The word was ${currentWord}.`,
    [GameStatus.PLAYING]: "",
  };

  return gameStatusMessage[currentGameStatus];
};

export default function App() {
  const [currentRow, setCurrentRow] = useState(0);
  const [grid, setData] = useState<Grid>(generateInitialGridState());
  const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.PLAYING);
  const [isColoring, setIsColoring] = useState(false);
  const [wordToGuess, setWordToGuess] = useState(getRandomWord());

  const isGameOver = gameStatus !== GameStatus.PLAYING;

  const updateRowColors = (bgColorsList: CellColor[]): Promise<void> => {
    return new Promise((resolve) => {
      let index = 0;
      const interval = setInterval(() => {
        const newData = grid.slice();
        newData[currentRow][index].bgColor = bgColorsList[index];
        setData(newData);

        index++;

        if (index === WORD_LENGTH) {
          clearInterval(interval);
          resolve();
        }
      }, 100);
    });
  };

  const submitCurrentWord = async (currentWord: string): Promise<boolean> => {
    setIsColoring(true);
    let bgColorsList: CellColor[] = [];
    const isMatching = currentWord === wordToGuess;

    if (isMatching) {
      bgColorsList = Array(wordToGuess.length).fill(CellColor.CORRECT);
    } else {
      bgColorsList = currentWord.split("").map((character, index) => {
        if (wordToGuess[index] === character) return CellColor.CORRECT;
        if (wordToGuess.includes(character)) return CellColor.PRESENT;
        return CellColor.ABSENT;
      });
    }

    await updateRowColors(bgColorsList);
    setIsColoring(false);
    return isMatching;
  };

  const endGame = (isWon = true) => {
    setGameStatus(isWon ? GameStatus.WON : GameStatus.LOST);
  };

  const removeLastCharacter = () => {
    const newData = grid.slice();
    const currentWord = getWordFromRow(newData[currentRow]);
    if (currentWord.length > 0) {
      newData[currentRow][currentWord.length - 1].value = null;
    }
    setData(newData);
  };

  const addCharacter = (char: string) => {
    const newData = grid.slice();
    const currentWord = getWordFromRow(newData[currentRow]);

    if (currentWord.length < WORD_LENGTH) {
      newData[currentRow][currentWord.length].value = char.toUpperCase();
    }

    setData(newData);
  };

  const handleEnterKey = async () => {
    const currentWord = getWordFromRow(grid[currentRow]);
    if (currentWord.length !== WORD_LENGTH) {
      return;
    }

    const isMatching = await submitCurrentWord(currentWord);

    if (isMatching) {
      endGame(true);
    } else if (currentRow === MAX_TRIES - 1) {
      endGame(false);
    } else {
      setCurrentRow((prevRow) => prevRow + 1);
    }
  };

  const reset = () => {
    setCurrentRow(0);
    setData(generateInitialGridState());
    setGameStatus(GameStatus.PLAYING);
    setIsColoring(false);
    setWordToGuess(getRandomWord());
  };

  useEffect(() => {
    const handleKeyPress = async (event: KeyboardEvent) => {
      if (isGameOver || isColoring) return;

      const typedKey = event.key;

      if (typedKey === "Backspace") {
        removeLastCharacter();
      } else if (typedKey === "Enter") {
        await handleEnterKey();
      } else if (typedKey.length === 1 && /[a-zA-Z]/.test(typedKey)) {
        addCharacter(typedKey);
      }
    };

    window.addEventListener("keydown", handleKeyPress, false);
    return () => window.removeEventListener("keydown", handleKeyPress, false);
  }, [currentRow, grid, gameStatus, isColoring]);

  const gameStatusMessage = getGameStatusMessage(gameStatus, wordToGuess);

  return (
    <main className="min-h-screen">
      <div role="status" aria-live="polite" className="sr-only">
        {gameStatusMessage}
      </div>
      <div className="px-2 py-6 md:py-12 max-w-xl mx-auto flex flex-col items-center">
        <h1 className="text-3xl md:text-5xl mb-4 md:mb-6">WORDLE</h1>
        <div
          className={cn(
            "flex justify-between items-center w-full max-w-xs mb-4 md:mb-6 h-8",
            !isGameOver && "invisible"
          )}
        >
          <span className="mr-4 text-sm">{gameStatusMessage}</span>
          <button
            onClick={reset}
            className="bg-white rounded-md text-black px-3 py-1 text-sm"
          >
            Reset
          </button>
        </div>

        <div
          className="grid gap-1 md:gap-2 grid-cols-5 w-full max-w-xs"
          role="group"
          aria-label="Wordle game grid"
          aria-describedby="wordle-instructions"
        >
          {grid.map((row, rowIndex) =>
            row.map(({ value, bgColor }, cellIndex) => (
              <Cell
                key={`cell-${rowIndex}-${cellIndex}`}
                value={value}
                backgroundClass={bgColor}
              />
            ))
          )}
        </div>

        <div id="wordle-instructions" className="sr-only">
          Grid for the Wordle game. Each row represents a guess, and each cell
          represents a letter.
        </div>
      </div>
    </main>
  );
}
