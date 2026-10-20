import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../lib/auth";
import { Button, Card, ErrorBanner, Field } from "../components/ui";
import { colors } from "../theme";

export default function Login() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const submit = async () => {
    setLoading(true);
    setError(null);
    try {
      await signIn(email, password);
    } catch (err) {
      setError(err.status === 400 ? "That email or password isn’t right." : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.brandMark}>
            <Text style={styles.brandMarkText}>G</Text>
          </View>
          <Text style={styles.eyebrow}>Govind Jewellers</Text>
          <Text style={styles.title}>Owner sign in.</Text>
          <Text style={styles.subtitle}>Manage your store, see who’s visiting and reply to customers.</Text>

          <Card style={styles.card}>
            <ErrorBanner message={error} />
            <Field label="Email address" value={email} onChangeText={setEmail} autoCapitalize="none" autoComplete="email" keyboardType="email-address" textContentType="emailAddress" />
            <Field label="Password" value={password} onChangeText={setPassword} secureTextEntry autoComplete="password" textContentType="password" style={{ marginTop: 14 }} onSubmitEditing={submit} returnKeyType="go" />
            <Button title="Sign in" onPress={submit} loading={loading} disabled={!email || !password} style={{ marginTop: 20 }} />
          </Card>
          <Text style={styles.footnote}>Only accounts with owner access can sign in.</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { flexGrow: 1, justifyContent: "center", padding: 24 },
  brandMark: { width: 56, height: 56, borderRadius: 16, backgroundColor: colors.ink, alignItems: "center", justifyContent: "center", alignSelf: "center" },
  brandMarkText: { color: colors.brandLight, fontSize: 26, fontWeight: "700" },
  eyebrow: { textAlign: "center", color: colors.brand, fontSize: 15, fontWeight: "600", marginTop: 20 },
  title: { textAlign: "center", color: colors.ink, fontSize: 34, fontWeight: "700", marginTop: 4 },
  subtitle: { textAlign: "center", color: colors.muted, fontSize: 16, marginTop: 8, marginBottom: 28 },
  card: { padding: 20 },
  footnote: { textAlign: "center", color: colors.muted, fontSize: 13, marginTop: 18 },
});
