import { useCallback } from "react";
import { Checkbox } from "./Checkbox";

export interface Item {
  name: string;
  children?: Item[];
}

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
    const fullItemPath = getFullItemPath(item, parentName);

    if (isChecked) {
      // else, add the item itself
      updatedSelectedPaths.add(fullItemPath);
    } else {
      updatedSelectedPaths.delete(fullItemPath);
      // look for all selected paths that starts with the fullItemPath and remove them
      Array.from(selectedPaths).forEach((path) => {
        if (path.startsWith(fullItemPath)) {
          updatedSelectedPaths.delete(path);
        }
      });
      // look for all parent paths and remove them
      for (const path of selectedPaths) {
        if (path === parentName) {
          updatedSelectedPaths.delete(path);

          // look for all elements at same level and add them to the updatedSelectedPaths
          items.forEach((child) => {
            if (child.name !== item.name) {
              updatedSelectedPaths.add(getFullItemPath(child, parentName));
            }
          });
        }
      }
    }

    onSelect?.(updatedSelectedPaths);
  };

  const getFullItemPath = useCallback((item: Item, parentName: string = "") => {
    return parentName ? `${parentName}/${item.name}` : item.name;
  }, []);

  const isItemChecked = useCallback(
    (item: Item, parentName: string = ""): boolean => {
      const fullItemPath = getFullItemPath(item, parentName);

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
        item.children?.every((child) => isItemChecked(child, fullItemPath)) ??
        false;

      return isAllChildrenSelected;
    },
    [selectedPaths, getFullItemPath]
  );

  return (
    <div style={{ paddingLeft: `${depth * 20}px` }}>
      {items.map((item) => (
        <div key={item.name}>
          <Checkbox
            label={item.name}
            checked={isItemChecked(item, parentName)}
            onChange={(isChecked) => makeTheItemChecked(item, isChecked)}
          />
          {item.children && (
            <NestedCheckboxes
              items={item.children}
              depth={depth + 1}
              parentName={getFullItemPath(item, parentName)}
              selectedPaths={selectedPaths}
              onSelect={onSelect}
            />
          )}
        </div>
      ))}
    </div>
  );
};
