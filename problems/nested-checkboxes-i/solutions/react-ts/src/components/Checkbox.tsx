import { KeyboardEvent } from "react";

export const Checkbox = ({
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
