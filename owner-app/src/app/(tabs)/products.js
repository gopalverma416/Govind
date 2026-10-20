import { useCallback, useMemo, useState } from "react";
import { FlatList, Image, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../../lib/api";
import { EmptyState, ErrorBanner, Loading } from "../../components/ui";
import { colors, formatPrice, titleCase } from "../../theme";

export default function Products() {
  const [items, setItems] = useState(null);
  const [query, setQuery] = useState("");
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await api("/api/items");
      setItems(data.slice().sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)));
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  // Reload whenever you come back from adding or editing a product
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!items || !q) return items;
    return items.filter((item) => `${item.name} ${item.category || ""}`.toLowerCase().includes(q));
  }, [items, query]);

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.searchWrap}>
        <Ionicons name="search" size={18} color={colors.muted} />
        <TextInput value={query} onChangeText={setQuery} placeholder="Search products" placeholderTextColor="#a1a1a6" style={styles.search} clearButtonMode="while-editing" />
      </View>
      <ErrorBanner message={error} />
      {!visible ? (
        <Loading />
      ) : (
        <FlatList
          data={visible}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} tintColor={colors.brand} />}
          ListHeaderComponent={<Text style={styles.count}>{visible.length} {visible.length === 1 ? "product" : "products"} on your website</Text>}
          ListEmptyComponent={<EmptyState title={query ? "No matches" : "No products yet"} detail={query ? "Try a different search." : "Tap + to add your first piece."} />}
          renderItem={({ item }) => (
            <Pressable onPress={() => router.push(`/product/${item._id}`)} style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}>
              {item.images?.[0] ? <Image source={{ uri: item.images[0] }} style={styles.thumb} /> : <View style={styles.thumb} />}
              <View style={{ flex: 1 }}>
                {item.category ? <Text style={styles.category}>{titleCase(item.category)}</Text> : null}
                <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.meta}>{formatPrice(item.price)}{item.weight ? ` · ${item.weight} g` : ""}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.muted} />
            </Pressable>
          )}
        />
      )}
      <Pressable onPress={() => router.push("/product/new")} style={styles.fab} aria-label="Add product">
        <Ionicons name="add" size={30} color="#fff" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  searchWrap: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "rgba(118,118,128,0.12)", borderRadius: 12, marginHorizontal: 16, marginTop: 8, marginBottom: 4, paddingHorizontal: 12 },
  search: { flex: 1, fontSize: 17, paddingVertical: 10, color: colors.ink },
  list: { padding: 16, paddingBottom: 100, gap: 10 },
  count: { fontSize: 13, color: colors.muted, marginBottom: 4 },
  row: { flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: colors.card, borderRadius: 16, padding: 10 },
  thumb: { width: 64, height: 64, borderRadius: 12, backgroundColor: colors.bg },
  category: { fontSize: 12, fontWeight: "600", color: colors.brand },
  name: { fontSize: 17, fontWeight: "600", color: colors.ink },
  meta: { fontSize: 14, color: colors.muted, marginTop: 2 },
  fab: { position: "absolute", right: 20, bottom: 24, width: 60, height: 60, borderRadius: 30, backgroundColor: colors.brand, alignItems: "center", justifyContent: "center", elevation: 6, shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
});
