import { Platform } from "react-native";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";

export const CHAT_CHANNEL = "messages";

// Show customer messages as banners even while the app is open
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/*
 * Asks for permission and returns this phone's Expo push token, or null when push isn't
 * available (emulator, permission denied, or the project isn't linked to EAS yet).
 */
export const registerForPush = async () => {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(CHAT_CHANNEL, {
      name: "Customer messages",
      // eslint-disable-next-line import/namespace -- exported at runtime via `export *`; the lint resolver misses it
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#8a6a24",
    });
  }
  if (!Device.isDevice) return null;

  const existing = await Notifications.getPermissionsAsync();
  let status = existing.status;
  if (status !== "granted") status = (await Notifications.requestPermissionsAsync()).status;
  if (status !== "granted") return null;

  const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
  if (!projectId) return null;

  try {
    return (await Notifications.getExpoPushTokenAsync({ projectId })).data;
  } catch (err) {
    console.warn("Push registration failed:", err.message);
    return null;
  }
};
