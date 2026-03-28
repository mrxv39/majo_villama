"use client";

interface EmptyStateProps {
  icon?: string;
  message: string;
}

export default function EmptyState({ icon = "📋", message }: EmptyStateProps) {
  return (
    <div className="bg-white rounded-lg p-8 border border-bg-warm text-center">
      <div className="text-4xl mb-3">{icon}</div>
      <p className="text-gray-500">{message}</p>
    </div>
  );
}
