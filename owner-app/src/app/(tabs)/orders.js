import { useCallback, useState } from "react";
import { FlatList, Image, Linking, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../../lib/api";
import { Card, EmptyState, ErrorBanner, Loading } from "../../components/ui";
import { colors, formatPrice, timeAgo } from "../../theme";

const Order = ({ order }) => {
  const [open, setOpen] = useState(false);
  const reference = `GJ-${String(order._id).slice(-8).toUpperCase()}`;
  const pieces = order.cart?.reduce((sum, line) => sum + (line.quantity || 1), 0) || 0;

  return (
    <Card style={styles.order}>
      <Pressable onPress={() => setOpen((o) => !o)} style={styles.orderHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{order.firstName} {order.lastName}</Text>
          <Text style={styles.meta}>{reference} · {timeAgo(order.paymentDate)} · {pieces} {pieces === 1 ? "piece" : "pieces"}</Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={styles.total}>{formatPrice(order.totalPrice)}</Text>
          <Text style={styles.method}>{order.paymentMethod}</Text>
        </View>
        <Ionicons name={open ? "chevron-up" : "chevron-down"} size={18} color={colors.muted} style={{ marginLeft: 8 }} />
      </Pressable>

      {open && (
        <View style={styles.details}>
          {order.cart?.map((line, i) => (
            <View key={i} style={styles.line}>
              {line.itemId?.images?.[0] ? <Image source={{ uri: line.itemId.images[0] }} style={styles.thumb} /> : <View style={styles.thumb} />}
              <Text style={styles.lineName} numberOfLines={1}>{line.itemId?.name || "Removed product"}</Text>
              <Text style={styles.lineQty}>× {line.quantity}</Text>
            </View>
          ))}
          <View style={styles.contact}>
            <Pressable onPress={() => Linking.openURL(`tel:${order.phone}`)} style={styles.contactButton}>
              <Ionicons name="call" size={16} color="#fff" />
              <Text style={styles.contactText}>Call {order.phone}</Text>
            </Pressable>
            <Pressable onPress={() => Linking.openURL(`https://wa.me/91${String(order.phone).replace(/\D/g, "").slice(-10)}`)} style={[styles.contactButton, { backgroundColor: "#25D366" }]}>
              <Ionicons name="logo-whatsapp" size={16} color="#fff" />
              <Text style={styles.contactText}>WhatsApp</Text>
            </Pressable>
          </View>
          <Text style={styles.label}>Deliver to</Text>
          <Text style={styles.address}>{order.address?.street}, {order.address?.district} {order.address?.pincode}</Text>
          <Text style={styles.label}>Placed</Text>
          <Text style={styles.address}>{new Date(order.paymentDate).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</Text>
        </View>
      )}
    </Card>
  );
};

export default function Orders() {
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      setOrders(await api("/api/owner/orders"));
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

  if (!orders && !error) return <Loading />;

  return (
    <FlatList
      data={orders || []}
      keyExtractor={(order) => order._id}
      contentContainerStyle={styles.list}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} tintColor={colors.brand} />}
      ListHeaderComponent={<ErrorBanner message={error} />}
      ListEmptyComponent={<EmptyState title="No orders yet" detail="New orders from your website will appear here." />}
      renderItem={({ item }) => <Order order={item} />}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: 16, gap: 12, paddingBottom: 40 },
  order: { padding: 14 },
  orderHeader: { flexDirection: "row", alignItems: "center" },
  name: { fontSize: 17, fontWeight: "600", color: colors.ink },
  meta: { fontSize: 13, color: colors.muted, marginTop: 2 },
  total: { fontSize: 17, fontWeight: "700", color: colors.ink },
  method: { fontSize: 12, color: colors.muted, marginTop: 2 },
  details: { marginTop: 12, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line },
  line: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 4 },
  thumb: { width: 40, height: 40, borderRadius: 8, backgroundColor: colors.bg },
  lineName: { flex: 1, fontSize: 15, color: colors.ink },
  lineQty: { fontSize: 15, color: colors.muted },
  contact: { flexDirection: "row", gap: 10, marginTop: 12 },
  contactButton: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: colors.brand, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 },
  contactText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  label: { fontSize: 12, color: colors.muted, marginTop: 12 },
  address: { fontSize: 15, color: colors.ink, marginTop: 2 },
});
