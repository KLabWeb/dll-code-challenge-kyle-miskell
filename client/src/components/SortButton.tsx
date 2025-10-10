import React from "react";
import { ArrowUpDown } from "lucide-react";

interface SortButtonProps {
  field: string;
  currentSort: string;
  onClick: (field: string) => void;
  children: React.ReactNode;
}

export const SortButton: React.FC<SortButtonProps> = ({
  field,
  currentSort,
  onClick,
  children,
}) => {
  const isActive = currentSort === field;

  return (
    <button
      type="button"
      onClick={() => onClick(field)}
      className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
        isActive
          ? "bg-blue-600 text-white shadow-sm"
          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
      }`}
      aria-pressed={isActive}
    >
      {children}
      {isActive && <ArrowUpDown className="w-4 h-4" aria-hidden="true" />}
    </button>
  );
};
