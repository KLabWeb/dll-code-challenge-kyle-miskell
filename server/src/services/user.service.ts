import { users } from "../data/users";
import logger from "../config/winstonLogger";

interface User {
  name: string;
  id: number;
}

type SortableUserField = "name" | "id";

interface GetUsersParams {
  sort?: SortableUserField;
  page: number;
  size: number;
}

interface PagingUrlParams {
  page: number;
  size: number;
  sort?: SortableUserField;
  totalResults: number;
  baseUrl: string;
}

interface PagingResponse {
  totalResults: number;
  previous?: string;
  next?: string;
}

interface GetUsersResult {
  users: User[];
  totalResults: number;
}

export const getUsers = (params: GetUsersParams): GetUsersResult => {
  const { sort, page, size } = params;

  // Log service entry
  logger.info("UserService.getUsers called", {
    page,
    size,
    sort: sort || "none",
  });

  // Sort
  const sortedUsers: User[] = [...users];
  if (sort) {
    logger.debug("Sorting users", { field: sort, totalUsers: users.length });

    sortedUsers.sort((a, b) => {
      const aVal = a[sort];
      const bVal = b[sort];
      return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    });

    logger.debug("Sorting completed", { firstUser: sortedUsers[0] });
  }

  // Paginate
  const totalResults: number = sortedUsers.length;
  const startIndex: number = (page - 1) * size;
  const endIndex: number = startIndex + size;
  const paginatedUsers: User[] = sortedUsers.slice(startIndex, endIndex);

  // Log pagination details
  logger.debug("Pagination applied", {
    startIndex,
    endIndex,
    returnedCount: paginatedUsers.length,
    totalResults,
  });

  // Warn if requesting beyond available data
  if (startIndex >= totalResults && totalResults > 0) {
    logger.warn("Requested page beyond available data", {
      page,
      size,
      totalResults,
      startIndex,
    });
  }

  // Log service completion
  logger.info("UserService.getUsers completed", {
    returned: paginatedUsers.length,
    total: totalResults,
  });

  return { users: paginatedUsers, totalResults };
};

export const buildPagingUrls = (params: PagingUrlParams): PagingResponse => {
  const { page, size, sort, totalResults, baseUrl } = params;
  const totalPages: number = Math.ceil(totalResults / size);

  logger.debug("Building paging URLs", {
    page,
    size,
    totalPages,
    totalResults,
  });

  const buildUrl = (pageNum: number): string => {
    const urlParams = new URLSearchParams({
      page: pageNum.toString(),
      size: size.toString(),
    });
    if (sort) {
      urlParams.append("sort", sort);
    }
    return `${baseUrl}?${urlParams}`;
  };

  const paging: PagingResponse = { totalResults };

  if (page > 1) {
    paging.previous = buildUrl(page - 1);
    logger.debug("Previous page URL generated", { url: paging.previous });
  }

  if (page < totalPages) {
    paging.next = buildUrl(page + 1);
    logger.debug("Next page URL generated", { url: paging.next });
  }

  return paging;
};
