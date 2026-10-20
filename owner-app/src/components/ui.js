import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { colors, radius } from "../theme";

export const Card = ({ style, children }) => <View style={[styles.card, style]}>{children}</View>;

export const SectionTitle = ({ children, right }) => (
  <View style={styles.sectionRow}>
    <Text style={styles.sectionTitle}>{children}</Text>
    {right}
  </View>
);

export const Button = ({ title, onPress, variant = "primary", loading, disabled, style }) => {
  const isPrimary = variant === "primary";
  const isDanger = variant === "danger";
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        isPrimary && { backgroundColor: colors.brand },
        variant === "secondary" && styles.buttonSecondary,
        isDanger && styles.buttonSecondary,
        (disabled || loading) && { opacity: 0.5 },
        pressed && { opacity: 0.8 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? "#fff" : colors.brand} />
      ) : (
        <Text style={[styles.buttonText, { color: isPrimary ? "#fff" : isDanger ? colors.danger : colors.ink }]}>{title}</Text>
      )}
    </Pressable>
  );
};

export const Field = ({ label, hint, style, ...inputProps }) => (
  <View style={style}>
    {label ? <Text style={styles.label}>{label}</Text> : null}
    <TextInput placeholderTextColor="#a1a1a6" style={[styles.input, inputProps.multiline && styles.multiline]} {...inputProps} />
    {hint ? <Text style={styles.hint}>{hint}</Text> : null}
  </View>
);

export const ErrorBanner = ({ message }) =>
  message ? (
    <View style={styles.error}>
      <Text style={styles.errorText}>{message}</Text>
    </View>
  ) : null;

export const EmptyState = ({ title, detail }) => (
  <View style={styles.empty}>
    <Text style={styles.emptyTitle}>{title}</Text>
    {detail ? <Text style={styles.emptyDetail}>{detail}</Text> : null}
  </View>
);

export const Loading = () => (
  <View style={styles.loading}>
    <ActivityIndicator color={colors.muted} />
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.card,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  sectionRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 24, marginBottom: 10 },
  sectionTitle: { fontSize: 20, fontWeight: "600", color: colors.ink },
  button: { minHeight: 48, borderRadius: radius.field, paddingHorizontal: 18, alignItems: "center", justifyContent: "center" },
  buttonSecondary: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line },
  buttonText: { fontSize: 17, fontWeight: "600" },
  label: { fontSize: 13, fontWeight: "600", color: "#3a3a3c", marginBottom: 6 },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.15)",
    borderRadius: radius.field,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 17,
    color: colors.ink,
  },
  multiline: { minHeight: 96, textAlignVertical: "top" },
  hint: { fontSize: 12, color: colors.muted, marginTop: 4 },
  error: { backgroundColor: "#fdecee", borderRadius: radius.field, padding: 12, marginBottom: 12 },
  errorText: { color: "#a1000f", fontSize: 14 },
  empty: { alignItems: "center", paddingVertical: 48, paddingHorizontal: 24 },
  emptyTitle: { fontSize: 18, fontWeight: "600", color: colors.ink, textAlign: "center" },
  emptyDetail: { fontSize: 15, color: colors.muted, textAlign: "center", marginTop: 6 },
  loading: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 48 },
});
