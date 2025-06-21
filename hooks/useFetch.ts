import { useEffect, useState } from "preact/hooks";

interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface FetchOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  headers?: Record<string, string>;
  body?: unknown;
  dependencies?: unknown[];
}

/**
 * 数据获取Hook
 * @param url 请求URL
 * @param options 请求选项
 * @returns { data, loading, error, refetch }
 */
export function useFetch<T = unknown>(
  url: string | null,
  options: FetchOptions = {},
): FetchState<T> & { refetch: () => void } {
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const {
    method = "GET",
    headers = {},
    body,
    dependencies = [],
  } = options;

  const fetchData = async () => {
    if (!url) return;

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const fetchOptions: RequestInit = {
        method,
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
      };

      if (body && method !== "GET") {
        fetchOptions.body = JSON.stringify(body);
      }

      const response = await fetch(url, fetchOptions);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setState({ data, loading: false, error: null });
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : "An error occurred",
      });
    }
  };

  useEffect(() => {
    fetchData();
  }, [
    url,
    method,
    JSON.stringify(body),
    JSON.stringify(headers),
    ...dependencies,
  ]);

  return {
    ...state,
    refetch: fetchData,
  };
}
