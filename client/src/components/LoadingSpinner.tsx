import React from "react";

export const LoadingSpinner: React.FC = () => (
  <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
    <div
      className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"
      role="status"
      aria-label="Loading"
    />
    <p className="text-slate-600">Loading users...</p>
  </div>
);
