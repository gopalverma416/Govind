import { useEffect, useState } from "react";
import { Alert, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { api, imagePart } from "../../lib/api";
import { Button, Card, ErrorBanner, Field, Loading } from "../../components/ui";
import { colors, titleCase } from "../../theme";

const MAX_PHOTOS = 6;

export default function ProductEditor() {
  const { id } = useLocalSearchParams();
  const isNew = id === "new";
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [existing, setExisting] = useState([]); // photo URLs already on the website
  const [added, setAdded] = useState([]); // newly picked photos (local assets)
  const [form, setForm] = useState({ name: "", price: "", weight: "", category: "", description: "" });
  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  useEffect(() => {
    api("/api/items")
      .then((items) => {
        setCategories([...new Set(items.map((i) => i.category).filter(Boolean))]);
        if (isNew) return;
        const item = items.find((i) => i._id === id);
        if (!item) {
          setError("This product no longer exists.");
          return;
        }
        setForm({ name: item.name, price: String(item.price), weight: String(item.weight ?? ""), category: item.category || "", description: item.description || "" });
        setExisting(item.images || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, isNew]);

  const photoCount = existing.length + added.length;

  const pick = async (source) => {
    const options = { mediaTypes: ["images"], quality: 0.85 };
    let result;
    if (source === "camera") {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) return Alert.alert("Camera access needed", "Allow camera access in Settings to take product photos.");
      result = await ImagePicker.launchCameraAsync(options);
    } else {
      result = await ImagePicker.launchImageLibraryAsync({ ...options, allowsMultipleSelection: true, selectionLimit: MAX_PHOTOS - photoCount });
    }
    if (!result.canceled) setAdded((list) => [...list, ...result.assets].slice(0, MAX_PHOTOS - existing.length));
  };

  const save = async () => {
    setError(null);
    if (!form.name.trim()) return setError("Add a product name.");
    if (!(Number(form.price) >= 0) || form.price === "") return setError("Add a price in rupees.");
    if (!(Number(form.weight) > 0)) return setError("Add the weight in grams.");
    if (photoCount === 0) return setError("Add at least one photo.");

    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => data.append(key, value.trim()));
    added.forEach((asset, i) => data.append("images", imagePart(asset, i)));
    if (!isNew) data.append("keepImages", JSON.stringify(existing));

    setSaving(true);
    try {
      await api(isNew ? "/api/owner/items" : `/api/owner/items/${id}`, { method: isNew ? "POST" : "PUT", form: data });
      router.back();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = () =>
    Alert.alert("Delete this product?", "It will be removed from your website straight away.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await api(`/api/owner/items/${id}`, { method: "DELETE" });
            router.back();
          } catch (err) {
            setError(err.message);
          }
        },
      },
    ]);

  if (loading) return <Loading />;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
      <Stack.Screen options={{ title: isNew ? "New product" : "Edit product" }} />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <ErrorBanner message={error} />

        <Text style={styles.heading}>Photos</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photos}>
          {existing.map((url) => (
            <View key={url}>
              <Image source={{ uri: url }} style={styles.photo} />
              <Pressable onPress={() => setExisting((list) => list.filter((u) => u !== url))} style={styles.removePhoto} hitSlop={8} aria-label="Remove photo">
                <Ionicons name="close" size={16} color="#fff" />
              </Pressable>
            </View>
          ))}
          {added.map((asset) => (
            <View key={asset.uri}>
              <Image source={{ uri: asset.uri }} style={styles.photo} />
              <Text style={styles.newBadge}>New</Text>
              <Pressable onPress={() => setAdded((list) => list.filter((a) => a.uri !== asset.uri))} style={styles.removePhoto} hitSlop={8} aria-label="Remove photo">
                <Ionicons name="close" size={16} color="#fff" />
              </Pressable>
            </View>
          ))}
          {photoCount < MAX_PHOTOS && (
            <>
              <Pressable onPress={() => pick("library")} style={[styles.photo, styles.addPhoto]}>
                <Ionicons name="images-outline" size={26} color={colors.brand} />
                <Text style={styles.addPhotoText}>Gallery</Text>
              </Pressable>
              <Pressable onPress={() => pick("camera")} style={[styles.photo, styles.addPhoto]}>
                <Ionicons name="camera-outline" size={26} color={colors.brand} />
                <Text style={styles.addPhotoText}>Camera</Text>
              </Pressable>
            </>
          )}
        </ScrollView>
        <Text style={styles.hint}>The first photo is the one shoppers see first. Up to {MAX_PHOTOS} photos.</Text>

        <Card style={styles.card}>
          <Field label="Name" value={form.name} onChangeText={set("name")} placeholder="e.g. Peacock Chandbali Earrings" />
          <View style={styles.twoCol}>
            <Field label="Price (₹)" value={form.price} onChangeText={set("price")} keyboardType="numeric" placeholder="0" style={{ flex: 1 }} />
            <Field label="Weight (g)" value={form.weight} onChangeText={set("weight")} keyboardType="decimal-pad" placeholder="0" style={{ flex: 1 }} />
          </View>
          <Field label="Category" value={form.category} onChangeText={set("category")} autoCapitalize="none" placeholder="e.g. rings" style={{ marginTop: 14 }} />
          {categories.length > 0 && (
            <View style={styles.chips}>
              {categories.map((category) => (
                <Pressable key={category} onPress={() => set("category")(category)} style={[styles.chip, form.category === category && styles.chipActive]}>
                  <Text style={[styles.chipText, form.category === category && { color: "#fff" }]}>{titleCase(category)}</Text>
                </Pressable>
              ))}
            </View>
          )}
          <Field label="Description" value={form.description} onChangeText={set("description")} multiline placeholder="What makes this piece special?" style={{ marginTop: 14 }} />
        </Card>

        <Button title={isNew ? "Add to website" : "Save changes"} onPress={save} loading={saving} style={{ marginTop: 20 }} />
        {!isNew && <Button title="Delete product" variant="danger" onPress={remove} style={{ marginTop: 12 }} />}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 48 },
  heading: { fontSize: 20, fontWeight: "600", color: colors.ink, marginBottom: 10 },
  photos: { gap: 10, paddingRight: 16 },
  photo: { width: 104, height: 104, borderRadius: 14, backgroundColor: colors.card },
  addPhoto: { alignItems: "center", justifyContent: "center", borderWidth: 1.5, borderStyle: "dashed", borderColor: "rgba(138,106,36,0.5)" },
  addPhotoText: { fontSize: 13, color: colors.brand, marginTop: 4, fontWeight: "600" },
  removePhoto: { position: "absolute", top: 6, right: 6, width: 24, height: 24, borderRadius: 12, backgroundColor: "rgba(0,0,0,0.6)", alignItems: "center", justifyContent: "center" },
  newBadge: { position: "absolute", left: 6, bottom: 6, backgroundColor: colors.brand, color: "#fff", fontSize: 11, fontWeight: "700", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, overflow: "hidden" },
  hint: { fontSize: 12, color: colors.muted, marginTop: 8, marginBottom: 16 },
  card: { padding: 16 },
  twoCol: { flexDirection: "row", gap: 12, marginTop: 14 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: colors.bg },
  chipActive: { backgroundColor: colors.brand },
  chipText: { fontSize: 14, color: colors.ink },
});
