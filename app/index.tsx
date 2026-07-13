import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";

const NAVY = "#1a2e4a";
const NAVY_LIGHT = "#2c4468";

export default function LoginScreen() {
  const { login, user, loading } = useAuth();
  const [srCode, setSrCode] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [srFocused, setSrFocused] = useState(false);
  const [pwFocused, setPwFocused] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace("/(tabs)/home");
  }, [loading, user]);

  const handleLogin = async () => {
    if (!srCode.trim() || !password.trim()) {
      Alert.alert("Error", "Please enter your SR Code and password.");
      return;
    }
    setSubmitting(true);
    try {
      await login(srCode.trim(), password);
      router.replace("/(tabs)/home");
    } catch (e: any) {
      Alert.alert("Login Failed", e.message ?? "Invalid SR Code or password.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={S.centered}>
        <ActivityIndicator size="large" color={NAVY} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={S.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Top navy band gives it that institutional / portal feel */}
      <View style={S.topBand} />

      <ScrollView
        contentContainerStyle={S.scrollInner}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <View style={S.logoRow}>
          <View style={S.logoIconWrap}>
            <Text style={S.logoEmoji}>🎓</Text>
          </View>
          <View>
            <Text style={S.logoText}>Trackademic</Text>
            <Text style={S.logoSubtext}>Student Portal</Text>
          </View>
        </View>

        {/* Card */}
        <View style={S.card}>
          <Text style={S.title}>Welcome back</Text>
          <Text style={S.subtitle}>
            Sign in with your SR Code and password to continue.
          </Text>

          {/* SR Code */}
          <Text style={S.label}>SR Code</Text>
          <View style={[S.inputWrap, srFocused && S.inputWrapFocused]}>
            <Ionicons
              name="card-outline"
              size={18}
              color={srFocused ? NAVY : "#9aa5b1"}
              style={S.inputIcon}
            />
            <TextInput
              style={S.input}
              placeholder="e.g. 22-02395"
              placeholderTextColor="#b3bac2"
              value={srCode}
              onChangeText={setSrCode}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!submitting}
              onFocus={() => setSrFocused(true)}
              onBlur={() => setSrFocused(false)}
            />
          </View>

          {/* Password */}
          <Text style={S.label}>Password</Text>
          <View style={[S.inputWrap, pwFocused && S.inputWrapFocused]}>
            <Ionicons
              name="lock-closed-outline"
              size={18}
              color={pwFocused ? NAVY : "#9aa5b1"}
              style={S.inputIcon}
            />
            <TextInput
              style={S.input}
              placeholder="Password"
              placeholderTextColor="#b3bac2"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPass}
              autoCapitalize="none"
              editable={!submitting}
              onFocus={() => setPwFocused(true)}
              onBlur={() => setPwFocused(false)}
            />
            <TouchableOpacity
              onPress={() => setShowPass(!showPass)}
              style={S.eyeBtn}
              hitSlop={8}
            >
              <Ionicons
                name={showPass ? "eye-off-outline" : "eye-outline"}
                size={18}
                color="#9aa5b1"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={S.forgotRow}
            onPress={() => router.push("/forgot-password")}
            hitSlop={6}
          >
            <Text style={S.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[S.loginBtn, submitting && S.loginBtnDisabled]}
            onPress={handleLogin}
            disabled={submitting}
            activeOpacity={0.85}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={S.loginBtnText}>LOG IN</Text>
                <Ionicons
                  name="arrow-forward"
                  size={16}
                  color="#fff"
                  style={{ marginLeft: 6 }}
                />
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Sign up link */}
        <View style={S.signupRow}>
          <Text style={S.signupText}>Don't have an account? </Text>
          <TouchableOpacity
            onPress={() => router.push("/register")}
            hitSlop={6}
          >
            <Text style={S.signupLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const S = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f4f6f9",
  },
  container: { flex: 1, backgroundColor: "#f4f6f9" },

  topBand: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 220,
    backgroundColor: NAVY,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },

  scrollInner: {
    flexGrow: 1,
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 64,
    paddingBottom: 40,
  },

  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 28,
    gap: 12,
  },
  logoIconWrap: {
    width: 46,
    height: 46,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },
  logoEmoji: { fontSize: 24 },
  logoText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.3,
  },
  logoSubtext: {
    fontSize: 12,
    color: "rgba(255,255,255,0.75)",
    marginTop: 1,
    letterSpacing: 0.4,
  },

  card: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 28,
    shadowColor: "#0f1f33",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 6,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    color: NAVY,
    textAlign: "center",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: "#8a92a0",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 18,
  },

  label: {
    fontSize: 12,
    fontWeight: "600",
    color: "#5a6472",
    marginBottom: 6,
    marginLeft: 2,
    letterSpacing: 0.2,
  },

  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#e3e7ec",
    borderRadius: 10,
    backgroundColor: "#fafbfc",
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  inputWrapFocused: {
    borderColor: NAVY,
    backgroundColor: "#fff",
  },
  inputIcon: { marginRight: 8 },
  input: {
    flex: 1,
    fontSize: 14,
    color: "#1f2733",
    paddingVertical: Platform.OS === "ios" ? 13 : 11,
  },
  eyeBtn: { paddingLeft: 8, paddingVertical: 8 },

  forgotRow: { alignItems: "flex-end", marginBottom: 20, marginTop: -4 },
  forgotText: { fontSize: 13, color: NAVY_LIGHT, fontWeight: "600" },

  loginBtn: {
    flexDirection: "row",
    backgroundColor: NAVY,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: NAVY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  loginBtnDisabled: { opacity: 0.6 },
  loginBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 1.2,
  },

  signupRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
  },
  signupText: { fontSize: 13, color: "#8a92a0" },
  signupLink: { fontSize: 13, color: NAVY, fontWeight: "700" },

  footerText: {
    fontSize: 11,
    color: "#b0b7c1",
    marginTop: 32,
    textAlign: "center",
  },
});
