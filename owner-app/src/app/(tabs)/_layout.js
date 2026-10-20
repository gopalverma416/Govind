import { useCallback, useEffect, useState } from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../../lib/api";
import { useLiveMessages } from "../../lib/socket";
import { colors } from "../../theme";

// Unread customer messages, kept fresh by polling and live socket events
const useUnreadCount = () => {
  const [unread, setUnread] = useState(0);
  const refresh = useCallback(() => {
    api("/api/owner/conversations")
      .then((rows) => setUnread(rows.reduce((sum, row) => sum + row.unread, 0)))
      .catch(() => {});
  }, []);
  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, 30000);
    return () => clearInterval(timer);
  }, [refresh]);
  useLiveMessages((message) => {
    if (message.receiver === "Admin") setUnread((n) => n + 1);
  });
  return unread;
};

const TabIcon = ({ name, color, focused }) => <Ionicons name={focused ? name : `${name}-outline`} size={24} color={color} />;

export default function TabsLayout() {
  const unread = useUnreadCount();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.brand,
        tabBarInactiveTintColor: colors.muted,
        headerStyle: { backgroundColor: colors.bg },
        headerShadowVisible: false,
        headerTitleStyle: { fontSize: 20, fontWeight: "700", color: colors.ink },
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Dashboard", tabBarIcon: ({ color, focused }) => <TabIcon name="analytics" color={color} focused={focused} /> }} />
      <Tabs.Screen name="products" options={{ title: "Products", tabBarIcon: ({ color, focused }) => <TabIcon name="diamond" color={color} focused={focused} /> }} />
      <Tabs.Screen name="orders" options={{ title: "Orders", tabBarIcon: ({ color, focused }) => <TabIcon name="receipt" color={color} focused={focused} /> }} />
      <Tabs.Screen
        name="chats"
        options={{ title: "Chats", tabBarIcon: ({ color, focused }) => <TabIcon name="chatbubbles" color={color} focused={focused} />, tabBarBadge: unread > 0 ? unread : undefined, tabBarBadgeStyle: { backgroundColor: colors.danger } }}
      />
    </Tabs>
  );
}
