import { useCallback, KeyboardEvent } from "react";

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
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      onChange(!checked);
    }
  };

  return (
    <div className="flex items-center gap-1">
      <input
        id={label}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        onKeyDown={handleKeyDown}
        role="checkbox"
        aria-checked={checked}
        tabIndex={0}
      />
      <label htmlFor={label}>{label}</label>
    </div>
  );
};

interface NestedCheckboxProps {
  items: Item[];
  onSelect: (selectedPaths: Set<string>) => void;
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
  const makeTheItemChecked = (item: Item, isChecked: boolean = true) => {
    const updatedSelectedPaths = new Set(selectedPaths);
    const fullItemPath = getFullItemPath(item);

    console.log({ updatedSelectedPaths, selectedPaths });
    if (isChecked) {
      // else, add the item itself
      updatedSelectedPaths.add(fullItemPath);
    } else {
      updatedSelectedPaths.delete(fullItemPath);
    }

    console.log({ selectedPaths, updatedSelectedPaths });
    onSelect?.(updatedSelectedPaths);
  };

  const getFullItemPath = useCallback(
    (item: Item) => {
      return parentName ? `${parentName}/${item.name}` : item.name;
    },
    [parentName]
  );

  const isItemChecked = useCallback(
    (item: Item): boolean => {
      const fullItemPath = getFullItemPath(item);

      console.log({ fullItemPath, selectedPaths });

      if (selectedPaths.has(fullItemPath) || selectedPaths.has(parentName)) {
        return true;
      }

      // check if parent is selected
      const isParentSelected = Array.from(selectedPaths).some((path) =>
        fullItemPath.startsWith(path)
      );

      if (isParentSelected) return true;

      // check if all children are selected
      const isAllChildrenSelected =
        item.children?.every(isItemChecked) ?? false;

      if (item?.children?.length) {
        console.log({ children: item.children, isAllChildrenSelected });
      }

      return isAllChildrenSelected;
    },
    [selectedPaths, parentName, getFullItemPath]
  );

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
              selectedPaths={selectedPaths}
              onSelect={onSelect}
            />
          )}
        </div>
      ))}
    </div>
  );
};
