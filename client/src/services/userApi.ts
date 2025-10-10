import { ApiResponse } from "../types/user";
import { API_BASE_URL } from "../config";

export const userApi = {
  getUsers: async (page: number, size: number, sort?: string): Promise<ApiResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });

    if (sort) {
      params.append("sort", sort);
    }

    const response = await fetch(`${API_BASE_URL}/users?${params}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch users: ${response.statusText}`);
    }

    return response.json();
  },
};
