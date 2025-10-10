export interface User {
  name: string;
  id: number;
}

export interface PagingResponse {
  totalResults: number;
  previous?: string;
  next?: string;
}

export interface ApiResponse {
  data: User[];
  paging: PagingResponse;
}
