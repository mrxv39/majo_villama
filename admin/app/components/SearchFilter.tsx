"use client";

interface FilterOption {
  value: string;
  label: string;
}

interface SearchFilterProps {
  search?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  filters?: {
    value: string;
    onChange: (value: string) => void;
    options: FilterOption[];
  }[];
}

export default function SearchFilter({
  search,
  onSearchChange,
  searchPlaceholder = "Buscar...",
  filters = [],
}: SearchFilterProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {onSearchChange !== undefined && (
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={search ?? ""}
          onChange={(e) => onSearchChange(e.target.value)}
          className="flex-1 px-4 py-2 border border-bg-warm rounded bg-white"
        />
      )}
      {filters.map((filter, i) => (
        <select
          key={i}
          value={filter.value}
          onChange={(e) => filter.onChange(e.target.value)}
          className="px-4 py-2 border border-bg-warm rounded bg-white"
        >
          {filter.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ))}
    </div>
  );
}
