import "./styles.css";
import { KeyboardEventHandler, useState, useRef } from "react";
import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  onChange: (rating: number) => void;
  ariaLabel?: string;
  size?: number;
}

const StarRating = ({
  rating = 0,
  onChange,
  ariaLabel = "Rate your experience",
  size = 24,
}: StarRatingProps) => {
  const [hoverRating, setHoverRating] = useState<number>(0);
  const starRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Array of 5 stars
  const stars = Array.from({ length: 5 }, (_, index) => index + 1);

  // Determine if a star should be filled based on rating and hover state
  const isStarFilled = (starNumber: number) => {
    if (hoverRating > 0) {
      return starNumber <= hoverRating;
    }
    return starNumber <= rating;
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>
  ): void => {
    if (!event) return;

    let newRating = 0;

    if (event.key === "ArrowLeft") {
      // decrement rating
      newRating = Math.max(1, rating - 1);
      onChange(newRating);
    } else if (event.key === "ArrowRight") {
      // increment rating
      newRating = Math.min(5, rating + 1);
      onChange(newRating);
    }

    // Focus on the new star after state update
    starRefs.current[newRating - 1]?.focus();
  };

  return (
    <div role="group" aria-label={ariaLabel} className="flex gap-1">
      {stars.map((starNumber) => (
        <button
          key={starNumber}
          ref={(el) => (starRefs.current[starNumber - 1] = el)}
          aria-label={`Rate ${starNumber} star${starNumber === 1 ? "" : "s"}`}
          aria-pressed={rating === starNumber}
          className={`p-1 hover:scale-110 transition-transform rounded`}
          onMouseEnter={() => setHoverRating(starNumber)}
          onMouseLeave={() => setHoverRating(0)}
          onClick={() => onChange(starNumber)}
          onKeyDown={handleKeyDown}
        >
          <Star
            size={size}
            className={`transition-colors ${
              isStarFilled(starNumber)
                ? "fill-yellow-400 stroke-yellow-400"
                : "fill-transparent stroke-gray-400"
            }`}
          />
        </button>
      ))}
    </div>
  );
};

export default function App() {
  const [rating, setRating] = useState(3);

  return (
    <main className="h-screen flex flex-col items-center justify-center">
      <StarRating rating={rating} onChange={setRating} size={48} />
      <p className="mt-2 text-xl text-gray-300">Selected rating: {rating}</p>
      <p className="mt-2 text-gray-300 text-sm">
        (Try pressing left and right arrow keys to see if it works)
      </p>
    </main>
  );
}
