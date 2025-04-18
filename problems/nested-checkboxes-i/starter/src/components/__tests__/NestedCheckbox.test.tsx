import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { NestedCheckboxes, Item } from "../NestedCheckbox";
import userEvent from "@testing-library/user-event";

const mockData: Item[] = [
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

/**
 * Helper function to get the container div of a checkbox element.
 * Note: This helper assumes a specific DOM structure where the checkbox is wrapped in a div.
 * If your component's structure is different, you'll need to adjust the parentElement chain.
 *
 * @param labelText - The label text of the checkbox
 * @returns The container div element
 */
const getCheckboxContainer = (labelText: string) => {
  return screen.getByLabelText(labelText).closest("div")?.parentElement
    ?.parentElement;
};

/**
 * Helper function to check if a checkbox is properly indented.
 * Note: This test assumes indentation is applied through paddingLeft style.
 * If your component uses a different method for indentation, adjust accordingly.
 *
 * @param labelText - The label text of the checkbox
 * @param expectedPadding - The expected padding in pixels
 */
const expectProperIndentation = (
  labelText: string,
  expectedPadding: number
) => {
  const container = getCheckboxContainer(labelText);
  expect(container).toHaveStyle({ paddingLeft: `${expectedPadding}px` });
};

describe("NestedCheckboxes", () => {
  it("renders the checkbox with correct label", () => {
    render(<NestedCheckboxes items={mockData} onSelect={vi.fn()} />);
    expect(screen.getByLabelText("Fruits")).toBeInTheDocument();
  });

  it("renders child checkboxes when parent has children", () => {
    render(<NestedCheckboxes items={mockData} onSelect={vi.fn()} />);
    expect(screen.getByLabelText("Apples")).toBeInTheDocument();
    expect(screen.getByLabelText("Bananas")).toBeInTheDocument();
    expect(screen.getByLabelText("Oranges")).toBeInTheDocument();
  });

  it("calls onSelect with correct path when a checkbox is clicked", () => {
    const handleSelect = vi.fn();
    render(<NestedCheckboxes items={mockData} onSelect={handleSelect} />);

    fireEvent.click(screen.getByLabelText("Fruits"));
    expect(handleSelect).toHaveBeenCalledWith(new Set(["Fruits"]));
  });

  it("applies correct indentation based on level", () => {
    render(<NestedCheckboxes items={mockData} onSelect={vi.fn()} />);
    expectProperIndentation("Fruits", 0);
  });

  it("applies correct indentation for nested items", () => {
    render(<NestedCheckboxes items={mockData} onSelect={vi.fn()} />);

    // First level children
    expectProperIndentation("Apples", 20);

    // Second level children
    expectProperIndentation("Spinach", 40);
  });

  it("shows checkbox as checked when item is selected", () => {
    const selectedItems = new Set(["Fruits"]);
    render(
      <NestedCheckboxes
        items={mockData}
        selectedPaths={selectedItems}
        onSelect={vi.fn()}
      />
    );
    expect(screen.getByLabelText("Fruits")).toBeChecked();
  });

  it("handles nested selections correctly", () => {
    const handleSelect = vi.fn();
    render(
      <NestedCheckboxes
        items={mockData}
        onSelect={handleSelect}
        selectedPaths={new Set(["Vegetables/Leafy Greens"])}
      />
    );

    expect(screen.getByLabelText("Leafy Greens")).toBeChecked();
    expect(screen.getByLabelText("Spinach")).toBeChecked();
    expect(screen.getByLabelText("Kale")).toBeChecked();
    expect(screen.getByLabelText("Carrots")).not.toBeChecked();
    expect(screen.getByLabelText("Broccoli")).not.toBeChecked();
  });

  it("selects/deselects all children when parent is selected", () => {
    const handleSelect = vi.fn();
    const { rerender } = render(
      <NestedCheckboxes
        items={mockData}
        onSelect={handleSelect}
        selectedPaths={new Set(["Vegetables"])}
      />
    );

    const childrens = [
      "Leafy Greens",
      "Spinach",
      "Kale",
      "Carrots",
      "Broccoli",
    ];

    childrens.forEach((child) => {
      expect(screen.getByLabelText(child)).toBeChecked();
    });

    // deselect the parent
    // Simulate the state update by rerendering with empty selectedPaths
    rerender(
      <NestedCheckboxes
        items={mockData}
        onSelect={handleSelect}
        selectedPaths={new Set()}
      />
    );

    childrens.forEach((child) => {
      expect(screen.getByLabelText(child)).not.toBeChecked();
    });
  });

  it("updates selectedPaths when unselecting an item", () => {
    const handleSelect = vi.fn();
    const selectedPaths = new Set(["Fruits"]);

    render(
      <NestedCheckboxes
        items={mockData}
        onSelect={handleSelect}
        selectedPaths={selectedPaths}
      />
    );

    fireEvent.click(screen.getByLabelText("Apples"));
    expect(handleSelect).toHaveBeenCalledWith(
      new Set(["Fruits/Bananas", "Fruits/Oranges"])
    );
  });

  it("handles selection of items without children", () => {
    const handleSelect = vi.fn();
    render(
      <NestedCheckboxes
        items={mockData}
        onSelect={handleSelect}
        selectedPaths={new Set(["Bread"])}
      />
    );

    expect(screen.getByLabelText("Bread")).toBeChecked();
  });

  it("maintains correct state when selecting and deselecting nested items", () => {
    const handleSelect = vi.fn();
    render(
      <NestedCheckboxes
        items={mockData}
        onSelect={handleSelect}
        selectedPaths={new Set(["Vegetables/Leafy Greens/Spinach"])}
      />
    );

    fireEvent.click(screen.getByLabelText("Leafy Greens"));
    expect(handleSelect).toHaveBeenCalledWith(
      new Set(["Vegetables/Leafy Greens", "Vegetables/Leafy Greens/Spinach"])
    );
  });

  it("handles selection of all children and parent correctly", () => {
    const handleSelect = vi.fn();
    render(
      <NestedCheckboxes
        items={mockData}
        onSelect={handleSelect}
        selectedPaths={
          new Set([
            "Vegetables/Broccoli",
            "Vegetables/Carrots",
            "Vegetables/Leafy Greens",
          ])
        }
      />
    );

    // Parent should be checked
    expect(screen.getByLabelText("Vegetables")).toBeChecked();

    // All children should be checked
    expect(screen.getByLabelText("Broccoli")).toBeChecked();
    expect(screen.getByLabelText("Carrots")).toBeChecked();
    expect(screen.getByLabelText("Leafy Greens")).toBeChecked();

    // All children of leafy greens should be checked
    expect(screen.getByLabelText("Spinach")).toBeChecked();
    expect(screen.getByLabelText("Kale")).toBeChecked();
  });

  it("supports keyboard navigation", async () => {
    render(<NestedCheckboxes items={mockData} onSelect={vi.fn()} />);

    // Focus should start with the first checkbox
    const firstCheckbox = screen.getByLabelText("Fruits");
    const user = userEvent.setup();

    firstCheckbox.focus();
    expect(document.activeElement).toBe(firstCheckbox);

    await user.tab();
    // Tab should move to next checkbox
    expect(document.activeElement).toBe(screen.getByLabelText("Apples"));
  });

  it("has proper accessibility attributes", () => {
    render(<NestedCheckboxes items={mockData} onSelect={vi.fn()} />);

    // Check for proper ARIA attributes
    const fruitsCheckbox = screen.getByLabelText("Fruits");
    expect(fruitsCheckbox).toHaveAttribute("role", "checkbox");
    expect(fruitsCheckbox).toHaveAttribute("aria-checked", "false");

    // Check for proper labels
    expect(screen.getByLabelText("Fruits")).toBeInTheDocument();
    expect(screen.getByLabelText("Apples")).toBeInTheDocument();
  });

  it("handles keyboard selection", () => {
    const handleSelect = vi.fn();
    render(<NestedCheckboxes items={mockData} onSelect={handleSelect} />);

    const fruitsCheckbox = screen.getByLabelText("Fruits");
    fruitsCheckbox.focus();

    // Space key should toggle selection
    fireEvent.keyDown(fruitsCheckbox, { key: " " });
    expect(handleSelect).toHaveBeenCalledWith(new Set(["Fruits"]));
  });
});
