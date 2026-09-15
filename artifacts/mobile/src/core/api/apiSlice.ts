import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "./axiosBaseQuery";
import type { Property, PropertyListResponse, Site, TouristSpot, Vendor } from "@workspace/api-zod";

export type ListPropertiesArgs = {
  wilaya?: string;
  type?: string;
  apartmentType?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: string;
  featured?: boolean;
  vendorId?: number;
  page?: number;
  limit?: number;
};

export type ListSitesArgs = {
  wilaya?: string;
  page?: number;
  limit?: number;
};

export type ListTouristSpotsArgs = {
  wilaya?: string;
  page?: number;
  limit?: number;
};

type Pagination = { page: number; limit: number; total: number; totalPages: number };

export type SiteListResponse = {
  data: Site[];
  pagination: Pagination;
};

export type SitePropertiesResponse = {
  data: Property[];
  pagination: Pagination;
};

export type TouristSpotListResponse = {
  data: TouristSpot[];
  pagination: Pagination;
};

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  role: "client" | "vendor" | "admin";
  userId: number;
  name: string | null;
};

export type VendorStats = {
  totalProperties: number;
  totalViews: number;
  totalSites: number;
  availableProperties: number;
  rentedProperties: number;
  viewsThisWeek: number;
  viewsThisMonth: number;
};

export type CreatePropertyInput = {
  type: "apartment" | "villa";
  apartmentType?: "F1" | "F2" | "F3" | "F4" | "F5";
  description: string;
  equipment?: string[];
  price: number;
  latitude?: number;
  longitude?: number;
  photos?: string[];
  status?: "available" | "rented";
  wilaya: string;
  siteId?: number;
};

export type VendorRegistrationInput = {
  firstName: string;
  lastName: string;
  address?: string;
  phone: string;
  email: string;
  propertyType: "apartment" | "villa" | "site";
  apartmentType?: "F1" | "F2" | "F3" | "F4" | "F5";
  latitude?: number;
  longitude?: number;
  price?: number;
  photos?: string[];
  description?: string;
  wilaya: string;
};

export type Favorite = {
  id: number;
  clientId: number;
  propertyId: number;
  createdAt: string;
  property: Property | null;
};

export type FavoriteListResponse = {
  data: Favorite[];
};

export type HistoryEntry = {
  id: number;
  clientId: number;
  propertyId: number | null;
  touristSpotId: number | null;
  entryType: "property" | "tourist_spot";
  viewedAt: string;
  property: Property | null;
  touristSpot: TouristSpot | null;
};

export type HistoryListResponse = {
  data: HistoryEntry[];
};

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Property", "TouristSpot", "Site", "Favorite", "History", "Vendor"],
  endpoints: (builder) => ({
    listProperties: builder.query<PropertyListResponse, ListPropertiesArgs | void>({
      query: (params) => ({ url: "/api/properties", method: "GET", params: params ?? {} }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map((p: Property) => ({ type: "Property" as const, id: p.id })),
              { type: "Property" as const, id: "LIST" },
            ]
          : [{ type: "Property" as const, id: "LIST" }],
    }),
    getProperty: builder.query<Property, number>({
      query: (id) => ({ url: `/api/properties/${id}`, method: "GET" }),
      providesTags: (_result, _error, id) => [{ type: "Property" as const, id }],
    }),

    listSites: builder.query<SiteListResponse, ListSitesArgs | void>({
      query: (params) => ({ url: "/api/sites", method: "GET", params: params ?? {} }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map((s: Site) => ({ type: "Site" as const, id: s.id })),
              { type: "Site" as const, id: "LIST" },
            ]
          : [{ type: "Site" as const, id: "LIST" }],
    }),
    getSite: builder.query<Site, number>({
      query: (id) => ({ url: `/api/sites/${id}`, method: "GET" }),
      providesTags: (_result, _error, id) => [{ type: "Site" as const, id }],
    }),
    listSiteProperties: builder.query<SitePropertiesResponse, number>({
      query: (siteId) => ({ url: `/api/sites/${siteId}/properties`, method: "GET" }),
      providesTags: (_result, _error, siteId) => [{ type: "Property" as const, id: `SITE_${siteId}` }],
    }),

    listTouristSpots: builder.query<TouristSpotListResponse, ListTouristSpotsArgs | void>({
      query: (params) => ({ url: "/api/tourist-spots", method: "GET", params: params ?? {} }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map((s: TouristSpot) => ({ type: "TouristSpot" as const, id: s.id })),
              { type: "TouristSpot" as const, id: "LIST" },
            ]
          : [{ type: "TouristSpot" as const, id: "LIST" }],
    }),
    getTouristSpot: builder.query<TouristSpot, number>({
      query: (id) => ({ url: `/api/tourist-spots/${id}`, method: "GET" }),
      providesTags: (_result, _error, id) => [{ type: "TouristSpot" as const, id }],
    }),

    loginAnonymousClient: builder.mutation<AuthResponse, { deviceId: string }>({
      query: (body) => ({ url: "/api/auth/client/anonymous", method: "POST", data: body }),
    }),
    registerVendor: builder.mutation<Vendor, VendorRegistrationInput>({
      query: (body) => ({ url: "/api/vendors/register", method: "POST", data: body }),
    }),
    loginVendor: builder.mutation<AuthResponse, { code: string; password: string }>({
      query: (body) => ({ url: "/api/auth/vendor/login", method: "POST", data: body }),
    }),
    vendorForgotPassword: builder.mutation<{ message: string }, { code: string }>({
      query: (body) => ({ url: "/api/auth/vendor/forgot-password", method: "POST", data: body }),
    }),
    getVendorProfile: builder.query<Vendor, void>({
      query: () => ({ url: "/api/vendors/me", method: "GET" }),
      providesTags: [{ type: "Vendor", id: "ME" }],
    }),
    listVendorProperties: builder.query<PropertyListResponse, void>({
      query: () => ({ url: "/api/vendors/me/properties", method: "GET" }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map((p: Property) => ({ type: "Property" as const, id: p.id })),
              { type: "Property" as const, id: "VENDOR_LIST" },
            ]
          : [{ type: "Property" as const, id: "VENDOR_LIST" }],
    }),
    getVendorStats: builder.query<VendorStats, void>({
      query: () => ({ url: "/api/vendors/me/stats", method: "GET" }),
    }),
    registerVendorPushToken: builder.mutation<void, { token: string }>({
      query: (body) => ({ url: "/api/vendors/me/push-token", method: "POST", data: body }),
    }),
    createProperty: builder.mutation<Property, CreatePropertyInput>({
      query: (body) => ({ url: "/api/properties", method: "POST", data: body }),
      invalidatesTags: [
        { type: "Property", id: "VENDOR_LIST" },
        { type: "Property", id: "LIST" },
      ],
    }),
    updateProperty: builder.mutation<Property, { id: number; body: Partial<CreatePropertyInput> }>({
      query: ({ id, body }) => ({ url: `/api/properties/${id}`, method: "PATCH", data: body }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "Property", id: arg.id },
        { type: "Property", id: "VENDOR_LIST" },
        { type: "Property", id: "LIST" },
      ],
    }),
    deleteProperty: builder.mutation<void, number>({
      query: (id) => ({ url: `/api/properties/${id}`, method: "DELETE" }),
      invalidatesTags: [
        { type: "Property", id: "VENDOR_LIST" },
        { type: "Property", id: "LIST" },
      ],
    }),

    listFavorites: builder.query<FavoriteListResponse, void>({
      query: () => ({ url: "/api/clients/me/favorites", method: "GET" }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map((f) => ({ type: "Favorite" as const, id: f.propertyId })),
              { type: "Favorite" as const, id: "LIST" },
            ]
          : [{ type: "Favorite" as const, id: "LIST" }],
    }),
    addFavorite: builder.mutation<Favorite, { propertyId: number }>({
      query: (body) => ({ url: "/api/clients/me/favorites", method: "POST", data: body }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "Favorite", id: "LIST" },
        { type: "Favorite", id: arg.propertyId },
      ],
    }),
    removeFavorite: builder.mutation<void, number>({
      query: (propertyId) => ({ url: `/api/clients/me/favorites/${propertyId}`, method: "DELETE" }),
      invalidatesTags: (_result, _error, propertyId) => [
        { type: "Favorite", id: "LIST" },
        { type: "Favorite", id: propertyId },
      ],
    }),

    listHistory: builder.query<HistoryListResponse, void>({
      query: () => ({ url: "/api/clients/me/history", method: "GET" }),
      providesTags: [{ type: "History", id: "LIST" }],
    }),
    addHistoryEntry: builder.mutation<
      HistoryEntry,
      { entryType: "property" | "tourist_spot"; propertyId?: number; touristSpotId?: number }
    >({
      query: (body) => ({ url: "/api/clients/me/history", method: "POST", data: body }),
      invalidatesTags: [{ type: "History", id: "LIST" }],
    }),
    removeHistoryEntry: builder.mutation<void, number>({
      query: (id) => ({ url: `/api/clients/me/history/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "History", id: "LIST" }],
    }),
  }),
});

export const {
  useListPropertiesQuery,
  useGetPropertyQuery,
  useListSitesQuery,
  useGetSiteQuery,
  useListSitePropertiesQuery,
  useListTouristSpotsQuery,
  useGetTouristSpotQuery,
  useLoginAnonymousClientMutation,
  useRegisterVendorMutation,
  useLoginVendorMutation,
  useVendorForgotPasswordMutation,
  useGetVendorProfileQuery,
  useListVendorPropertiesQuery,
  useGetVendorStatsQuery,
  useRegisterVendorPushTokenMutation,
  useCreatePropertyMutation,
  useUpdatePropertyMutation,
  useDeletePropertyMutation,
  useListFavoritesQuery,
  useAddFavoriteMutation,
  useRemoveFavoriteMutation,
  useListHistoryQuery,
  useAddHistoryEntryMutation,
  useRemoveHistoryEntryMutation,
} = apiSlice;