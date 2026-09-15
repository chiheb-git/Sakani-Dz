import type { BaseQueryFn } from "@reduxjs/toolkit/query";
import type { AxiosError, AxiosRequestConfig } from "axios";
import { axiosInstance } from "./axiosInstance";
import { getCacheEntry, saveCacheEntry } from "../database/localCache";

export type AxiosBaseQueryArgs = {
  url: string;
  method?: AxiosRequestConfig["method"];
  data?: AxiosRequestConfig["data"];
  params?: AxiosRequestConfig["params"];
};

export type AxiosBaseQueryError = {
  status?: number;
  data: unknown;
};

export const axiosBaseQuery = (): BaseQueryFn<AxiosBaseQueryArgs, unknown, AxiosBaseQueryError> => {
  return async ({ url, method = "GET", data, params }) => {
    const cacheKey = `GET:${url}:${JSON.stringify(params ?? {})}`;
    try {
      const result = await axiosInstance({ url, method, data, params });
      if (method.toUpperCase() === "GET") await saveCacheEntry(cacheKey, result.data);
      return { data: result.data };
    } catch (err) {
      const error = err as AxiosError;
      if (method.toUpperCase() === "GET") {
        const cached = await getCacheEntry<unknown>(cacheKey);
        if (cached !== null) return { data: cached };
      }
      return {
        error: {
          status: error.response?.status,
          data: error.response?.data ?? error.message,
        },
      };
    }
  };
};