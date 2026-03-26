export interface ApiResponse<T> {
  operation: number;
  status: {
    isSuccessfully: boolean;
    messages: string[];
  };
  statusCode: number;
  count: number;
  data: T;
  listData: T[] | null;
}