import * as Crypto from "expo-crypto";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";

const DEVICE_ID_KEY = "sakani_device_id";
const isWeb = Platform.OS === "web";

export async function getOrCreateDeviceId(): Promise<string> {
  const existing = isWeb
    ? await AsyncStorage.getItem(DEVICE_ID_KEY)
    : await SecureStore.getItemAsync(DEVICE_ID_KEY);

  if (existing) return existing;

  const newId = Crypto.randomUUID();
  if (isWeb) {
    await AsyncStorage.setItem(DEVICE_ID_KEY, newId);
  } else {
    await SecureStore.setItemAsync(DEVICE_ID_KEY, newId);
  }
  return newId;
}