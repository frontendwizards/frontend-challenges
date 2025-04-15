import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { NestedCheckbox, Item } from "../NestedCheckbox";

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

describe("NestedCheckbox", () => {
  it("renders the checkbox with correct label", () => {
    render(<NestedCheckbox items={mockData} />);
    expect(screen.getByLabelText("Fruits")).toBeInTheDocument();
  });

  it("renders child checkboxes when parent has children", () => {
    render(<NestedCheckbox items={mockData} />);
    expect(screen.getByLabelText("Apples")).toBeInTheDocument();
    expect(screen.getByLabelText("Bananas")).toBeInTheDocument();
    expect(screen.getByLabelText("Oranges")).toBeInTheDocument();
  });

  it("calls onSelect when a checkbox is clicked", () => {
    const handleSelect = vi.fn();
    render(<NestedCheckbox items={mockData} onSelect={handleSelect} />);

    fireEvent.click(screen.getByLabelText("Fruits"));
    expect(handleSelect).toHaveBeenCalledWith(mockData);
  });

  it("applies correct indentation based on level", () => {
    render(<NestedCheckbox items={mockData} level={1} />);
    const parentDiv = screen.getByLabelText("Fruits").closest("div");
    expect(parentDiv).toHaveStyle({ marginLeft: "20px" });
  });

  it("shows checkbox as checked when item is selected", () => {
    const selectedItems = new Set(["Fruits"]);
    render(<NestedCheckbox items={mockData} selectedItems={selectedItems} />);
    expect(screen.getByLabelText("Fruits")).toBeChecked();
  });
});
