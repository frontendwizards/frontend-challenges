import { useState } from "react";
import "./styles.css";
import { NestedCheckboxes } from "./components/NestedCheckbox";
import { DisplaySelectedPaths } from "./components/DisplaySelectedPaths";

const mockData = [
  {
    name: "Fruits",
    children: [{ name: "Apples" }, { name: "Bananas" }, { name: "Oranges" }],
  },
  {
    name: "Vegetables",
    children: [
      { name: "Carrots" },
      { name: "Broccoli" },
      {
        name: "Leafy Greens",
        children: [{ name: "Spinach" }, { name: "Kale" }],
      },
    ],
  },
  {
    name: "Dairy",
    children: [{ name: "Milk" }, { name: "Yogurt" }, { name: "Cheese" }],
  },
  { name: "Bread" },
];

export default function App() {
  const [selectedPaths, setSelectedPaths] = useState<Set<string>>(
    new Set([
      "Fruits/Apples",
      "Fruits/Bananas",
      "Fruits/Oranges",
      "Vegetables/Carrots",
      "Vegetables/Broccoli",
      "Vegetables/Leafy Greens/Spinach",
    ])
  );

  return (
    <main className="container mx-auto pt-12 px-4 max-w-2xl">
      <h1 className="text-2xl font-bold mb-4">Nested Checkboxes</h1>
      <div className="space-y-4">
        <NestedCheckboxes
          items={mockData}
          selectedPaths={selectedPaths}
          onSelect={setSelectedPaths}
        />
        <hr className="border-gray-700" />
        <DisplaySelectedPaths selectedPaths={selectedPaths} />
      </div>
    </main>
  );
}
