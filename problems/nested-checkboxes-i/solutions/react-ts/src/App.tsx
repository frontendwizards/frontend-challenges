import { useState } from "react";
import "./styles.css";

type Item = {
  name: string;
  children?: Item[];
  checked?: boolean;
};

const Checkbox = ({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked?: boolean;
  onChange: (isChecked: boolean) => void;
}) => {
  return (
    <div className="flex items-center gap-1">
      <input
        id={label}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <label htmlFor={label}>{label}</label>
    </div>
  );
};

export const NestedCheckboxes = ({
  items,
  depth = 0,
  setItems,
  parent,
}: {
  items: Item[];
  depth?: number;
  setItems: (items: Item[]) => void;
  parent: Item[];
}) => {
  const makeTheItemChecked = (item: Item, isChecked: boolean) => {
    item.checked = isChecked;
    setItems([...items]);
    
    console.log(item, isChecked);
    item.children?.forEach((child) => {
      makeTheItemChecked(child, isChecked);
    });
  };

  const setNestedItems = (items: Item[]) => {

  };

  return (
    <div style={{ paddingLeft: `${depth * 20}px` }}>
      {items.map((item) => (
        <div key={item.name}>
          <Checkbox
            label={item.name}
            checked={item?.checked || false}
            onChange={(isChecked) => makeTheItemChecked(item, isChecked)}
          />
          {item.children && (
            <NestedCheckboxes
              items={item.children}
              depth={depth + 1}
              setItems={setNestedItems}
              parent={items}
            />
          )}
        </div>
      ))}
    </div>
  );
};

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
  const [items, setItems] = useState(categoryData);
  return (
    <main className="h-full">
      <NestedCheckboxes items={items} setItems={setItems} parent={items}/>
    </main>
  );
}
