import { useState, useRef } from "react";
import "./styles.css";

function Input({
  value,
  index,
  inputRef,
  tabIndex,
}: {
  value: string;
  index: number;
  inputRef: (el: HTMLInputElement) => void;
  tabIndex: number;
}) {
  return (
    <input
      type="number"
      className="w-10 h-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-white text-white text-2xl text-center bg-transparent border-2 border-white"
      defaultValue={value}
      data-index={index}
      ref={inputRef}
      aria-label={`Input ${index}`}
      tabIndex={tabIndex}
    />
  );
}

function InputOTP({
  maxLength,
  onComplete,
}: {
  maxLength: number;
  onComplete: (inputValue: string) => void;
}) {
  const [value, setValue] = useState("");
  const inputRefs = useRef<HTMLInputElement[]>([]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      setValue(value.slice(0, -1));
      const previousInput = inputRefs.current[value.length - 1];
      if (previousInput) {
        previousInput.focus();
      }
      return;
    }

    if (e.key === "Enter" && value.length === maxLength) {
      onComplete(value);
      return;
    }

    if (!/^\d$/.test(e.key) || value.length >= maxLength) {
      e.preventDefault();
      return;
    }

    setValue((oldValue) => oldValue + e.key);

    // switch focus to next input (using react way)
    const nextIndex = value.length;
    if (nextIndex < maxLength) {
      const nextInput = inputRefs.current[nextIndex];
      if (nextInput) {
        nextInput.focus();
      }
    }
  };

  return (
    <div className="flex flex-row gap-4 shadow-lg" onKeyDown={handleKeyDown}>
      {[...Array(maxLength)].map((_, index) => {
        const isActiveInput =
          index === value.length ||
          (index === maxLength - 1 && value.length === maxLength);

        return (
          <Input
            key={index}
            value={index < value.length ? value[index] : ""}
            index={index}
            inputRef={(el: HTMLInputElement) => {
              inputRefs.current[index] = el;
            }}
            tabIndex={isActiveInput ? 0 : -1}
          />
        );
      })}
    </div>
  );
}

export default function App() {
  const [result, setResult] = useState("");

  const onComplete = (inputValue: string) => {
    if (inputValue === "123456") {
      setResult("Correct");
    } else {
      setResult("Incorrect");
    }
  };

  return (
    <main className="h-full flex flex-col items-center justify-center gap-10">
      <h1 className="text-white text-2xl">Enter your OTP</h1>
      <p className="text-white text-sm">(press enter to submit)</p>
      <InputOTP maxLength={6} onComplete={onComplete} />
      <p className="text-white text-2xl h-8">{result}</p>
    </main>
  );
}
