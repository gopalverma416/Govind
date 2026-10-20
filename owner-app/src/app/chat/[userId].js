import { useCallback, useEffect, useRef, useState } from "react";
import { FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../../lib/api";
import { useLiveMessages } from "../../lib/socket";
import { ErrorBanner, Loading } from "../../components/ui";
import { colors } from "../../theme";

const formatTime = (iso) => new Date(iso).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
const formatDay = (iso) => new Date(iso).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });

// Customer messages are addressed to "Admin"; anything else was sent by the store
const fromStore = (message) => message.receiver !== "Admin";

export default function ChatThread() {
  const { userId, name } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const [customer, setCustomer] = useState(name ? { name } : null);
  const [messages, setMessages] = useState(null);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const listRef = useRef(null);

  // Loading the thread also marks the customer's messages as read
  const load = useCallback(async () => {
    try {
      const data = await api(`/api/owner/conversations/${userId}`);
      setCustomer(data.user);
      setMessages(data.messages);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  }, [userId]);

  useEffect(() => {
    let active = true;
    api(`/api/owner/conversations/${userId}`)
      .then((data) => {
        if (!active) return;
        setCustomer(data.user);
        setMessages(data.messages);
      })
      .catch((err) => active && setError(err.message));
    return () => {
      active = false;
    };
  }, [userId]);

  useLiveMessages((message) => {
    if (String(message.userId) !== String(userId)) return;
    if (fromStore(message)) {
      // Our own reply echoed back, or one sent from another device
      setMessages((list) => (list?.some((m) => m._id === message._id) ? list : [...(list || []), message]));
    } else {
      load();
    }
  });

  const send = async () => {
    const text = draft.trim();
    if (!text) return;
    setSending(true);
    try {
      const reply = await api(`/api/owner/conversations/${userId}`, { method: "POST", body: { message: text } });
      setMessages((list) => (list?.some((m) => m._id === reply._id) ? list : [...(list || []), reply]));
      setDraft("");
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0} style={{ flex: 1 }}>
      <Stack.Screen options={{ title: customer?.name || "Chat" }} />
      {customer?.email ? <Text style={styles.email}>{customer.email}</Text> : null}
      <ErrorBanner message={error} />
      {!messages ? (
        <Loading />
      ) : (
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m, i) => m._id || String(i)}
          contentContainerStyle={styles.list}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          renderItem={({ item, index }) => {
            const mine = fromStore(item);
            const previous = messages[index - 1];
            const newDay = !previous || formatDay(previous.timestamp) !== formatDay(item.timestamp);
            return (
              <>
                {newDay && <Text style={styles.day}>{formatDay(item.timestamp)}</Text>}
                <View style={[styles.bubbleRow, { justifyContent: mine ? "flex-end" : "flex-start" }]}>
                  <View style={[styles.bubble, mine ? styles.mine : styles.theirs]}>
                    <Text style={[styles.text, mine && { color: "#fff" }]}>{item.message}</Text>
                    <Text style={[styles.time, mine && { color: "rgba(255,255,255,0.7)" }]}>{formatTime(item.timestamp)}</Text>
                  </View>
                </View>
              </>
            );
          }}
        />
      )}
      <View style={[styles.composer, { paddingBottom: Math.max(insets.bottom, 10) }]}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="Reply as Govind Jewellers"
          placeholderTextColor="#a1a1a6"
          style={styles.input}
          multiline
          maxLength={2000}
        />
        <Pressable onPress={send} disabled={!draft.trim() || sending} style={[styles.send, (!draft.trim() || sending) && { opacity: 0.35 }]} aria-label="Send reply">
          <Ionicons name="arrow-up" size={22} color="#fff" />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  email: { textAlign: "center", fontSize: 13, color: colors.muted, paddingBottom: 6 },
  list: { padding: 12, gap: 6 },
  day: { alignSelf: "center", fontSize: 12, color: colors.muted, marginVertical: 8 },
  bubbleRow: { flexDirection: "row" },
  bubble: { maxWidth: "80%", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 9 },
  mine: { backgroundColor: colors.brand, borderBottomRightRadius: 6 },
  theirs: { backgroundColor: colors.card, borderBottomLeftRadius: 6 },
  text: { fontSize: 16, color: colors.ink, lineHeight: 21 },
  time: { fontSize: 11, color: colors.muted, marginTop: 2, alignSelf: "flex-end" },
  composer: { flexDirection: "row", alignItems: "flex-end", gap: 8, paddingHorizontal: 12, paddingTop: 10, backgroundColor: colors.card, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line },
  input: { flex: 1, maxHeight: 120, backgroundColor: colors.bg, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 16, color: colors.ink },
  send: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.brand, alignItems: "center", justifyContent: "center" },
});
