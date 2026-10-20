import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Image, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { Stack, router, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../../lib/api";
import { useAuth } from "../../lib/auth";
import { Card, ErrorBanner, Loading, SectionTitle } from "../../components/ui";
import { colors, formatPrice, timeAgo } from "../../theme";

const REFRESH_MS = 15000;

const DEVICE_ICONS = { mobile: "phone-portrait-outline", tablet: "tablet-portrait-outline", desktop: "desktop-outline" };

// Turns a storefront path into something readable
const describePath = (path, productNames) => {
  const product = path.match(/^\/product\/([a-f0-9]{24})/i);
  if (product) return productNames[product[1]] ? `Viewing ${productNames[product[1]]}` : "Viewing a product";
  if (path === "/") return "Home page";
  if (path.startsWith("/list")) return "Browsing the shop";
  const pages = { "/purchase": "In their bag", "/user-details": "Checking out", "/payment": "Checking out", "/thank-you": "Just ordered", "/wishlist": "Wishlist", "/gold-rate": "Gold rate page", "/chat": "Chat", "/login": "Signing in", "/signup": "Creating an account", "/account": "Their account" };
  return pages[path] || path;
};

const Stat = ({ label, value, sub }) => (
  <Card style={styles.stat}>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit>{value}</Text>
    {sub ? <Text style={styles.statSub}>{sub}</Text> : null}
  </Card>
);

const WeekChart = ({ series, loadedAt }) => {
  // Fill in days with no visits so the chart always shows 7 bars
  const days = useMemo(() => {
    const byDate = Object.fromEntries(series.map((d) => [d.date, d]));
    return Array.from({ length: 7 }).map((_, i) => {
      const date = new Date(loadedAt - (6 - i) * 86400000);
      const key = date.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
      return { key, label: date.toLocaleDateString("en-IN", { weekday: "narrow", timeZone: "Asia/Kolkata" }), visitors: byDate[key]?.visitors || 0 };
    });
  }, [series, loadedAt]);
  const max = Math.max(1, ...days.map((d) => d.visitors));
  return (
    <View style={styles.chart}>
      {days.map((day, i) => (
        <View key={day.key} style={styles.chartCol}>
          <Text style={styles.chartValue}>{day.visitors || ""}</Text>
          <View style={[styles.chartBar, { height: Math.max(4, (day.visitors / max) * 96), backgroundColor: i === 6 ? colors.brand : "#d9cdb3" }]} />
          <Text style={styles.chartLabel}>{day.label}</Text>
        </View>
      ))}
    </View>
  );
};

export default function Dashboard() {
  const { signOut, pushEnabled } = useAuth();
  const [data, setData] = useState(null);
  const [productNames, setProductNames] = useState({});
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const analytics = await api("/api/owner/analytics?days=7");
      setData({ ...analytics, loadedAt: Date.now() });
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    api("/api/items")
      .then((items) => setProductNames(Object.fromEntries(items.map((item) => [item._id, item.name]))))
      .catch(() => {});
  }, []);

  // Refresh while this tab is on screen
  useFocusEffect(
    useCallback(() => {
      load();
      const timer = setInterval(load, REFRESH_MS);
      return () => clearInterval(timer);
    }, [load])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const confirmSignOut = () =>
    Alert.alert("Sign out?", "You’ll stop getting message notifications on this phone.", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign out", style: "destructive", onPress: signOut },
    ]);

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Pressable onPress={confirmSignOut} hitSlop={12} style={{ marginRight: 16 }} aria-label="Sign out">
              <Ionicons name="log-out-outline" size={24} color={colors.brand} />
            </Pressable>
          ),
        }}
      />
      {!data && !error ? (
        <Loading />
      ) : (
        <ScrollView contentContainerStyle={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand} />}>
          <ErrorBanner message={error} />

          {!pushEnabled && (
            <Card style={styles.notice}>
              <Ionicons name="notifications-off-outline" size={20} color={colors.brand} />
              <Text style={styles.noticeText}>Message notifications are off on this phone. Install the app build (not Expo Go) and allow notifications to get alerts.</Text>
            </Card>
          )}

          {data && (
            <>
              <Card style={styles.liveCard}>
                <View style={styles.liveHeader}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveLabel}>On your website right now</Text>
                </View>
                <Text style={styles.liveCount}>{data.live.count}</Text>
                {data.live.sessions.slice(0, 8).map((session) => (
                  <View key={session.sessionId} style={styles.liveRow}>
                    <Ionicons name={DEVICE_ICONS[session.device] || DEVICE_ICONS.desktop} size={18} color="rgba(255,255,255,0.7)" />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.liveName}>{session.user?.name || "Visitor"}</Text>
                      <Text style={styles.livePage} numberOfLines={1}>{describePath(session.path, productNames)}</Text>
                    </View>
                    <Text style={styles.liveTime}>{timeAgo(session.lastSeen)}</Text>
                  </View>
                ))}
                {data.live.count === 0 && <Text style={styles.livePage}>No one is browsing at the moment.</Text>}
              </Card>

              <View style={styles.grid}>
                <Stat label="Visitors today" value={data.today.visitors} sub={`${data.today.views} page views`} />
                <Stat label="Unread messages" value={data.totals.unreadMessages} sub="in Chats" />
                <Stat label="Orders" value={data.totals.orders} sub={formatPrice(data.totals.revenue)} />
                <Stat label="Customers" value={data.totals.customers} sub={`${data.totals.products} products`} />
              </View>

              <SectionTitle>Visitors this week</SectionTitle>
              <Card>
                <WeekChart series={data.series} loadedAt={data.loadedAt} />
              </Card>

              <SectionTitle>Most viewed pieces</SectionTitle>
              <Card style={{ paddingVertical: 4 }}>
                {data.topProducts.length === 0 && <Text style={styles.muted}>No product views yet this week.</Text>}
                {data.topProducts.map((row, i) => (
                  <Pressable key={row.productId} onPress={() => router.push(`/product/${row.productId}`)} style={[styles.row, i > 0 && styles.rowBorder]}>
                    {row.item?.images?.[0] ? <Image source={{ uri: row.item.images[0] }} style={styles.thumb} /> : <View style={styles.thumb} />}
                    <View style={{ flex: 1 }}>
                      <Text style={styles.rowTitle} numberOfLines={1}>{row.item?.name || "Deleted product"}</Text>
                      <Text style={styles.muted}>{row.visitors} people · {row.views} views</Text>
                    </View>
                    {row.item?.price != null && <Text style={styles.rowValue}>{formatPrice(row.item.price)}</Text>}
                  </Pressable>
                ))}
              </Card>

              <SectionTitle>Signed-in customers</SectionTitle>
              <Card style={{ paddingVertical: 4 }}>
                {data.recentCustomers.length === 0 && <Text style={styles.muted}>No signed-in visits this week.</Text>}
                {data.recentCustomers.map((row, i) => (
                  <Pressable
                    key={row.userId}
                    onPress={() => router.push({ pathname: "/chat/[userId]", params: { userId: row.userId, name: row.user?.name || "" } })}
                    style={[styles.row, i > 0 && styles.rowBorder]}
                  >
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>{(row.user?.name || "?").charAt(0).toUpperCase()}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.rowTitle}>{row.user?.name || "Customer"}</Text>
                      <Text style={styles.muted} numberOfLines={1}>{describePath(row.lastPath, productNames)} · {timeAgo(row.lastSeen)}</Text>
                    </View>
                    <Ionicons name="chatbubble-outline" size={18} color={colors.brand} />
                  </Pressable>
                ))}
              </Card>

              <SectionTitle>Top pages</SectionTitle>
              <Card style={{ paddingVertical: 4 }}>
                {data.topPages.map((row, i) => (
                  <View key={row.path} style={[styles.row, i > 0 && styles.rowBorder]}>
                    <Text style={[styles.rowTitle, { flex: 1 }]} numberOfLines={1}>{describePath(row.path, productNames)}</Text>
                    <Text style={styles.rowValue}>{row.views}</Text>
                  </View>
                ))}
                {data.topPages.length === 0 && <Text style={styles.muted}>No visits recorded yet.</Text>}
              </Card>
            </>
          )}
        </ScrollView>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 40 },
  notice: { flexDirection: "row", gap: 10, alignItems: "flex-start", marginBottom: 12 },
  noticeText: { flex: 1, fontSize: 14, color: colors.ink },
  liveCard: { backgroundColor: colors.ink, padding: 20 },
  liveHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.live },
  liveLabel: { color: "rgba(255,255,255,0.75)", fontSize: 14, fontWeight: "600" },
  liveCount: { color: "#fff", fontSize: 56, fontWeight: "700", marginVertical: 4 },
  liveRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 8, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "rgba(255,255,255,0.15)" },
  liveName: { color: "#fff", fontSize: 15, fontWeight: "600" },
  livePage: { color: "rgba(255,255,255,0.65)", fontSize: 13 },
  liveTime: { color: "rgba(255,255,255,0.5)", fontSize: 12 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 12 },
  stat: { width: "48%", flexGrow: 1 },
  statLabel: { fontSize: 13, color: colors.muted, fontWeight: "600" },
  statValue: { fontSize: 30, fontWeight: "700", color: colors.ink, marginTop: 2 },
  statSub: { fontSize: 13, color: colors.muted },
  chart: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", height: 140 },
  chartCol: { flex: 1, alignItems: "center", justifyContent: "flex-end" },
  chartValue: { fontSize: 11, color: colors.muted, marginBottom: 4 },
  chartBar: { width: 22, borderRadius: 6 },
  chartLabel: { fontSize: 12, color: colors.muted, marginTop: 6 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12 },
  rowBorder: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line },
  rowTitle: { fontSize: 16, fontWeight: "600", color: colors.ink },
  rowValue: { fontSize: 15, color: colors.ink, fontVariant: ["tabular-nums"] },
  thumb: { width: 44, height: 44, borderRadius: 10, backgroundColor: colors.bg },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 17, fontWeight: "700", color: colors.brand },
  muted: { fontSize: 14, color: colors.muted, paddingVertical: 4 },
});
