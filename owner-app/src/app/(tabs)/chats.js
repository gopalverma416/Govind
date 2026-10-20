import { useCallback, useState } from "react";
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { api } from "../../lib/api";
import { useLiveMessages, useSocket } from "../../lib/socket";
import { EmptyState, ErrorBanner, Loading } from "../../components/ui";
import { colors, timeAgo } from "../../theme";

export default function Chats() {
  const { connected } = useSocket();
  const [rows, setRows] = useState(null);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      setRows(await api("/api/owner/conversations"));
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  // A new message from anyone: refresh the inbox so it moves to the top
  useLiveMessages(() => load());

  if (!rows && !error) return <Loading />;

  return (
    <FlatList
      data={rows || []}
      keyExtractor={(row) => String(row.userId)}
      contentContainerStyle={styles.list}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} tintColor={colors.brand} />}
      ListHeaderComponent={
        <>
          <ErrorBanner message={error} />
          <View style={styles.status}>
            <View style={[styles.dot, { backgroundColor: connected ? colors.live : "#c7c7cc" }]} />
            <Text style={styles.statusText}>{connected ? "Live: new messages appear instantly" : "Connecting…"}</Text>
          </View>
        </>
      }
      ListEmptyComponent={<EmptyState title="No conversations yet" detail="When a customer messages you from the website, it shows up here." />}
      renderItem={({ item }) => (
        <Pressable
          onPress={() => router.push({ pathname: "/chat/[userId]", params: { userId: String(item.userId), name: item.user?.name || "" } })}
          style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{(item.user?.name || "?").charAt(0).toUpperCase()}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.topLine}>
              <Text style={[styles.name, item.unread > 0 && { fontWeight: "700" }]} numberOfLines={1}>{item.user?.name || "Customer"}</Text>
              <Text style={styles.time}>{timeAgo(item.lastAt)}</Text>
            </View>
            <View style={styles.topLine}>
              <Text style={[styles.preview, item.unread > 0 && { color: colors.ink }]} numberOfLines={1}>
                {item.lastFromOwner ? "You: " : ""}{item.lastMessage}
              </Text>
              {item.unread > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.unread}</Text>
                </View>
              )}
            </View>
          </View>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { paddingBottom: 40 },
  status: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 16, paddingVertical: 10 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 13, color: colors.muted },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: colors.card, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 19, fontWeight: "700", color: colors.brand },
  topLine: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  name: { flex: 1, fontSize: 17, fontWeight: "600", color: colors.ink },
  time: { fontSize: 13, color: colors.muted },
  preview: { flex: 1, fontSize: 15, color: colors.muted, marginTop: 2 },
  badge: { minWidth: 22, height: 22, borderRadius: 11, backgroundColor: colors.brand, alignItems: "center", justifyContent: "center", paddingHorizontal: 6 },
  badgeText: { color: "#fff", fontSize: 12, fontWeight: "700" },
});
