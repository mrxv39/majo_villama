"use client";

const colorMap: Record<string, string> = {
  activa: "bg-green-100 text-green-700",
  activo: "bg-green-100 text-green-700",
  pagado: "bg-green-100 text-green-700",
  pendiente: "bg-orange-100 text-orange-700",
  pausada: "bg-yellow-100 text-yellow-700",
  cancelada: "bg-red-100 text-red-500",
  cancelado: "bg-red-100 text-red-500",
  inactiva: "bg-gray-100 text-gray-500",
  inactivo: "bg-gray-100 text-gray-500",
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export default function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const colors = colorMap[status.toLowerCase()] || "bg-gray-100 text-gray-600";
  const label = status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${colors} ${className}`}>
      {label}
    </span>
  );
}
