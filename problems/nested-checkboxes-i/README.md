# Nested Checkboxes I Challenge

## Problem Description

Create a Nested Checkboxes component that allows users to:

- Select multiple nested checkboxes in a hierarchical structure
- Display the selected items in a readable format below the checkboxes
- Show the current selection state clearly

## Requirements

- The component should display a hierarchical structure of items with checkboxes
- Visual indentation should clearly show the nesting level of each item
- The component should handle any depth of nesting
- Implement proper accessibility with ARIA roles and properties
- Visual styling should distinguish between parent and child items
- The selected items should be displayed in a readable format below the checkboxes

## Example

Here's an example of the checkbox structure and expected behavior:

```javascript
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
```

## Example Component Usage

Here's how to use the NestedCheckboxes component in your React application:

```tsx
import { useState } from "react";
import { NestedCheckboxes } from "./components/NestedCheckbox";

// Example data structure
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
];

function App() {
  const [selectedPaths, setSelectedPaths] = useState<Set<string>>(new Set());

  return (
    <div>
      <NestedCheckboxes
        items={mockData}
        selectedPaths={selectedPaths}
        onSelect={setSelectedPaths}
      />
    </div>
  );
}
```

### Props

- `items`: Array of items with nested structure
- `selectedPaths`: Set of selected paths (e.g., "Fruits/Apples")
- `onSelect`: Callback function that receives the updated set of selected paths

### Type Definitions

```tsx
interface Item {
  name: string;
  children?: Item[];
}

interface NestedCheckboxesProps {
  items: Item[];
  selectedPaths: Set<string>;
  onSelect: (paths: Set<string>) => void;
}
```

This is only an example of how the component could be implemented. Feel free to design it however you prefer as long as it meets the requirements.

## Steps to solve

1. Start with a single-level checkbox implementation and test it
2. Expand to handle two-level parent-child relationships and test the new behaviors
3. Scale to n-level nesting
4. Add final touches (accessibility, styling, selection display)
5. Verify against the example data
6. Test your solution against the provided unit tests or write your own!

<Callout type="info">
When running tests, You might need to adjust `getCheckboxContainer` and `expectProperIndentation` to how you made your component so the test passes
</Callout>

## Bonus

- When a parent is selected, all its children should be selected
- When some children are selected, the parent should show unchecked state
- When all children are selected, the parent should show a selected state
- Write unit tests covering:
  - Individual checkbox selection
  - Parent-child relationship behavior
  - Indeterminate state handling
  - Selection state propagation
