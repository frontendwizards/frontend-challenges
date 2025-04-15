import { useState } from "react";
import "./styles.css";
import { Item } from "./components/NestedCheckbox";
import { NestedCheckboxes } from "./components/NestedCheckbox";
import { DisplayselectedPaths } from "./components/DisplayselectedPaths";

const categoryData: Item[] = [
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
  const [selectedPaths, setselectedPaths] = useState<Set<string>>(
    new Set([
      "Fruits",
      "Vegetables/Carrots",
      "Vegetables/Broccoli",
      "Vegetables/Leafy Greens",
      "Dairy/Milk",
      "Dairy/Cheese",
      "Dairy/Yogurt",
    ])
  );

  return (
    <main className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Nested Checkboxes</h1>
      <NestedCheckboxes
        items={categoryData}
        selectedPaths={selectedPaths}
        onSelect={setselectedPaths}
      />
      <DisplayselectedPaths selectedPaths={selectedPaths} />
    </main>
  );
}
