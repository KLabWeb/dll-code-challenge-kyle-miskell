import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MAX_VISIBLE_PAGES } from "../config";

interface PaginationProps {
  currentPage: number;
  totalResults: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalResults,
  pageSize,
  hasNext,
  hasPrevious,
  onPageChange,
}) => {
  const totalPages = Math.ceil(totalResults / pageSize);
  const startResult = (currentPage - 1) * pageSize + 1;
  const endResult = Math.min(currentPage * pageSize, totalResults);

  const getPageNumbers = (): number[] => {
    if (totalPages <= MAX_VISIBLE_PAGES) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage <= 3) {
      return Array.from({ length: MAX_VISIBLE_PAGES }, (_, i) => i + 1);
    }

    if (currentPage >= totalPages - 2) {
      return Array.from(
        { length: MAX_VISIBLE_PAGES },
        (_, i) => totalPages - MAX_VISIBLE_PAGES + i + 1
      );
    }

    return Array.from({ length: MAX_VISIBLE_PAGES }, (_, i) => currentPage - 2 + i);
  };

  return (
    <nav
      className="bg-white rounded-lg shadow-sm border border-slate-200 p-4"
      aria-label="Pagination"
    >
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="text-sm text-slate-600" role="status" aria-live="polite">
          Showing <span className="font-medium text-slate-800">{startResult}</span> to{" "}
          <span className="font-medium text-slate-800">{endResult}</span> of{" "}
          <span className="font-medium text-slate-800">{totalResults}</span> users
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={!hasPrevious}
            className="px-3 py-2 rounded-md border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1"
            aria-label="Go to previous page"
          >
            <ChevronLeft className="w-4 h-4" aria-hidden="true" />
            Previous
          </button>

          <div className="flex items-center gap-1" role="group" aria-label="Pagination pages">
            {getPageNumbers().map((pageNum) => (
              <button
                key={pageNum}
                type="button"
                onClick={() => onPageChange(pageNum)}
                className={`w-10 h-10 rounded-md text-sm font-medium transition-all ${
                  currentPage === pageNum
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
                aria-label={`Go to page ${pageNum}`}
                aria-current={currentPage === pageNum ? "page" : undefined}
              >
                {pageNum}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={!hasNext}
            className="px-3 py-2 rounded-md border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1"
            aria-label="Go to next page"
          >
            Next
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </nav>
  );
};
