import { useState } from "react";

export interface Item {
  name: string;
  children?: Item[];
}

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

interface NestedCheckboxProps {
  items: Item[];
  onSelect?: (selectedPaths: Set<string>) => void;
  selectedPaths?: ReadonlySet<string>;
  depth?: Readonly<number>;
  parentName?: string;
}

export const NestedCheckboxes = ({
  items,
  depth = 0,
  onSelect,
  selectedPaths = new Set(),
  parentName = "",
}: NestedCheckboxProps) => {
  const makeTheItemChecked = (item: Item, isChecked: boolean) => {
    const updatedSelectedPaths = new Set(selectedPaths);
    const fullItemPath = getFullItemPath(item);

    if (isChecked) {
      updatedSelectedPaths.add(fullItemPath);
    } else {
      updatedSelectedPaths.delete(fullItemPath);
    }
    onSelect?.(updatedSelectedPaths);
  };

  const isItemChecked = (item: Item) => {
    console.log({ selectedPaths });
    if (selectedPaths.has(item.name)) {
      return true;
    }

    // check if parent is selected

    return false;
  };

  const getFullItemPath = (item: Item) => {
    return parentName ? `${parentName}/${item.name}` : item.name;
  };

  return (
    <div style={{ paddingLeft: `${depth * 20}px` }}>
      {items.map((item) => (
        <div key={item.name}>
          <Checkbox
            label={item.name}
            checked={isItemChecked(item)}
            onChange={(isChecked) => makeTheItemChecked(item, isChecked)}
          />
          {item.children && (
            <NestedCheckboxes
              items={item.children}
              depth={depth + 1}
              parentName={getFullItemPath(item)}
            />
          )}
        </div>
      ))}
    </div>
  );
};
