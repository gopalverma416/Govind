import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import { Stack, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as Notifications from "expo-notifications";
import { AuthProvider, useAuth } from "../lib/auth";
import { SocketProvider } from "../lib/socket";
import { Loading } from "../components/ui";
import { colors } from "../theme";

// Tapping a "new message" notification opens that customer's chat
const useOpenChatFromNotificationNative = (signedIn) => {
  const response = Notifications.useLastNotificationResponse();
  const handled = useRef(null);
  useEffect(() => {
    if (!signedIn || !response) return;
    const id = response.notification.request.identifier;
    const data = response.notification.request.content.data || {};
    if (handled.current === id || response.actionIdentifier !== Notifications.DEFAULT_ACTION_IDENTIFIER) return;
    handled.current = id;
    if (data.type === "chat" && data.userId) {
      router.push({ pathname: "/chat/[userId]", params: { userId: data.userId, name: data.name || "" } });
    }
  }, [response, signedIn]);
};

// Notification responses only exist on phones; the web preview skips this
const useOpenChatFromNotification = Platform.OS === "web" ? () => {} : useOpenChatFromNotificationNative;

const RootStack = () => {
  const { ready, token } = useAuth();
  useOpenChatFromNotification(Boolean(token));
  if (!ready) return <Loading />;

  return (
    <Stack
      screenOptions={{
        headerTintColor: colors.brand,
        headerTitleStyle: { color: colors.ink },
        headerStyle: { backgroundColor: colors.bg },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      <Stack.Protected guard={!token}>
        <Stack.Screen name="login" options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Protected guard={Boolean(token)}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="product/[id]" options={{ title: "Product" }} />
        <Stack.Screen name="chat/[userId]" options={{ title: "Chat" }} />
      </Stack.Protected>
    </Stack>
  );
};

export default function RootLayout() {
  return (
    <AuthProvider>
      <SocketProvider>
        <StatusBar style="dark" />
        <RootStack />
      </SocketProvider>
    </AuthProvider>
  );
}
