import React from "react";
import { AlertCircle } from "lucide-react";

interface ErrorMessageProps {
  message: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => (
  <div
    className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3"
    role="alert"
  >
    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" aria-hidden="true" />
    <div>
      <p className="text-red-800 font-medium">Error loading users</p>
      <p className="text-red-600 text-sm">{message}</p>
    </div>
  </div>
);
