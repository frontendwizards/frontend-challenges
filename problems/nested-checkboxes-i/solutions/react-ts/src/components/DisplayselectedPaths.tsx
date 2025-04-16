import { FC } from "react";

interface DisplaySelectedPathsProps {
  selectedPaths: ReadonlySet<string>;
}

export const DisplaySelectedPaths = ({
  selectedPaths,
}: DisplaySelectedPathsProps) => {
  if (selectedPaths.size === 0) {
    return <p className="text-gray-200">No items selected</p>;
  }

  return (
    <div className="space-y-2">
      <h3 className="font-semibold">Selected Items:</h3>
      <ul className="list-disc list-inside space-y-1">
        {Array.from(selectedPaths).map((path) => (
          <li key={path} className="text-gray-300">
            {path}
          </li>
        ))}
      </ul>
    </div>
  );
};
