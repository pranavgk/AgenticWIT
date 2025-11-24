'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

/**
 * Generic API hook for fetching data
 * @param key - Query key
 * @param url - API endpoint URL
 * @returns Query result
 */
export function useApi<T>(key: string | string[], url: string) {
  return useQuery({
    queryKey: Array.isArray(key) ? key : [key],
    queryFn: async () => {
      const response = await apiClient.get<T>(url);
      return response.data;
    },
  });
}

/**
 * Generic API mutation hook for POST/PUT/DELETE requests
 * @param url - API endpoint URL
 * @param method - HTTP method
 * @returns Mutation result
 */
export function useApiMutation<TData, TVariables>(
  url: string,
  method: 'post' | 'put' | 'delete' = 'post'
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: TVariables) => {
      const response = await apiClient[method]<TData>(url, data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate queries to refetch data
      queryClient.invalidateQueries();
    },
  });
}
