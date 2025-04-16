import { Checkbox } from "./Checkbox";

export interface Item {
  name: string;
  children?: Item[];
}

interface NestedCheckboxProps {
  items: Item[];
  onSelect: (selectedPaths: Set<string>) => void;
  selectedPaths?: ReadonlySet<string>;
}

export const NestedCheckboxes = ({
  items,
  onSelect,
  selectedPaths = new Set(),
}: NestedCheckboxProps) => {
  return <div></div>;
};
