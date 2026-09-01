import axios from "axios";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AUTH_TOKEN_KEY = "sakani_auth_token";
const isWeb = Platform.OS === "web";

async function getStoredToken(): Promise<string | null> {
  return isWeb ? AsyncStorage.getItem(AUTH_TOKEN_KEY) : SecureStore.getItemAsync(AUTH_TOKEN_KEY);
}

async function setStoredToken(token: string): Promise<void> {
  if (isWeb) {
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
  } else {
    await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
  }
}

async function removeStoredToken(): Promise<void> {
  if (isWeb) {
    await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
  } else {
    await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
  }
}

export const axiosInstance = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:4000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach the bearer token (vendor or admin) to every outgoing request.
axiosInstance.interceptors.request.use(async (config) => {
  const token = await getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function saveAuthToken(token: string): Promise<void> {
  await setStoredToken(token);
}

export async function clearAuthToken(): Promise<void> {
  await removeStoredToken();
}

export async function getAuthToken(): Promise<string | null> {
  return getStoredToken();
}