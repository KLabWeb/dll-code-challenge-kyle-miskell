export const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3001/api";
export const DEFAULT_PAGE = 1;
export const DEFAULT_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [5, 10, 25, 50] as const;
export const SORT_FIELDS = ["name", "id"] as const;
export const MAX_VISIBLE_PAGES = 5;
