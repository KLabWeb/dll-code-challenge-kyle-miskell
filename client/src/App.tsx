import React, { useState, useEffect, useCallback } from "react";
import { Users } from "lucide-react";
import { User, PagingResponse } from "./types/user";
import { LoadingSpinner } from "./components/LoadingSpinner";
import { ErrorMessage } from "./components/ErrorMessage";
import { SortButton } from "./components/SortButton";
import { UsersTable } from "./components/UsersTable";
import { Pagination } from "./components/Pagination";
import { userApi } from "./services/userApi";
import { DEFAULT_PAGE, DEFAULT_SIZE, PAGE_SIZE_OPTIONS, SORT_FIELDS } from "./config";

export default function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [paging, setPaging] = useState<PagingResponse>({ totalResults: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(DEFAULT_PAGE);
  const [size, setSize] = useState(DEFAULT_SIZE);
  const [sort, setSort] = useState<string>("");

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await userApi.getUsers(page, size, sort);
      setUsers(data.data);
      setPaging(data.paging);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
      setUsers([]);
      setPaging({ totalResults: 0 });
    } finally {
      setLoading(false);
    }
  }, [page, size, sort]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSortChange = useCallback((field: string) => {
    setSort((prevSort) => (field === prevSort ? "" : field));
    setPage(DEFAULT_PAGE);
  }, []);

  const handlePageSizeChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    setSize(Number(event.target.value));
    setPage(DEFAULT_PAGE);
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const resetUserOrder = useCallback(() => {
    setSort("");
    setPage(DEFAULT_PAGE);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-8 h-8 text-blue-600" aria-hidden="true" />
            <h1 className="text-4xl font-bold text-slate-800">DLL User Management</h1>
          </div>
          <p className="text-slate-600">
            A sortable, paginated user directory browser, built by Kyle T Miskell
          </p>
        </header>

        <section className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-700" id="sort-label">
                Sort by:
              </span>
              <div className="flex gap-2" role="group" aria-labelledby="sort-label">
                {SORT_FIELDS.map((field) => (
                  <SortButton
                    key={field}
                    field={field}
                    currentSort={sort}
                    onClick={handleSortChange}
                  >
                    {field.charAt(0).toUpperCase() + field.slice(1)}
                  </SortButton>
                ))}
                {sort && (
                  <button
                    type="button"
                    onClick={resetUserOrder}
                    className="px-3 py-2 rounded-md text-sm font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all"
                  >
                    Reset User Order
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="page-size" className="text-sm font-medium text-slate-700">
                Show:
              </label>
              <select
                id="page-size"
                value={size}
                onChange={handlePageSizeChange}
                className="px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                {PAGE_SIZE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {error && <ErrorMessage message={error} />}

        {loading ? (
          <LoadingSpinner />
        ) : (
          !error && (
            <>
              <UsersTable users={users} />
              <Pagination
                currentPage={page}
                totalResults={paging.totalResults}
                pageSize={size}
                hasNext={Boolean(paging.next)}
                hasPrevious={Boolean(paging.previous)}
                onPageChange={handlePageChange}
              />
            </>
          )
        )}
      </div>
    </div>
  );
}
