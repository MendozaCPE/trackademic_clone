import { useState } from "react";
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
import { register } from "@/services/api";
import { useAuth } from "@/context/AuthContext";

const NAVY = "#1a2e4a";
const NAVY_LIGHT = "#2c4468";

export default function RegisterScreen() {
  const { refreshUser } = useAuth();

  const [srCode, setSrCode] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Focus tracking (visual only)
  const [focusField, setFocusField] = useState<string | null>(null);

  // Parse "Firstname [Middle] Lastname" from a full name string
  const parseName = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return { first: parts[0], mi: "", last: "" };
    if (parts.length === 2) return { first: parts[0], mi: "", last: parts[1] };
    // 3+ words: first = first word, last = last word, middle initial = 2nd word's first char
    return {
      first: parts[0],
      mi: parts[1].charAt(0).toUpperCase(),
      last: parts[parts.length - 1],
    };
  };

  const handleRegister = async () => {
    if (
      !srCode.trim() ||
      !fullName.trim() ||
      !email.trim() ||
      !password.trim()
    ) {
      Alert.alert("Missing Fields", "Please fill in all required fields.");
      return;
    }
    if (password !== confirm) {
      Alert.alert("Password Mismatch", "Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Weak Password", "Password must be at least 6 characters.");
      return;
    }

    const { first, mi, last } = parseName(fullName);
    if (!last) {
      Alert.alert(
        "Invalid Name",
        "Please enter at least a first and last name.",
      );
      return;
    }

    setSubmitting(true);
    try {
      const data = await register({
        sr_code: srCode.trim(),
        first_name: first,
        middle_initial: mi,
        last_name: last,
        email: email.trim(),
        username: srCode.trim(), // SR code doubles as username
        password,
        section: "",
        year_level: 1,
      });
      refreshUser(data.user);
      router.replace("/(tabs)/home");
    } catch (e: any) {
      Alert.alert("Registration Failed", e.message ?? "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const passwordsMatch = confirm.length > 0 && password === confirm;
  const passwordsMismatch = confirm.length > 0 && password !== confirm;

  return (
    <KeyboardAvoidingView
      style={S.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={S.topBand} />

      <ScrollView
        contentContainerStyle={S.scroll}
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
          <Text style={S.title}>Create Account</Text>
          <Text style={S.subtitle}>Register using your student SR Code.</Text>

          {/* SR Code */}
          <Text style={S.label}>
            SR Code <Text style={S.req}>*</Text>
          </Text>
          <View
            style={[S.inputWrap, focusField === "srCode" && S.inputWrapFocused]}
          >
            <Ionicons
              name="card-outline"
              size={18}
              color={focusField === "srCode" ? NAVY : "#9aa5b1"}
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
              onFocus={() => setFocusField("srCode")}
              onBlur={() => setFocusField(null)}
            />
          </View>

          {/* Full Name */}
          <Text style={S.label}>
            Full Name <Text style={S.req}>*</Text>
          </Text>
          <View
            style={[
              S.inputWrap,
              focusField === "fullName" && S.inputWrapFocused,
            ]}
          >
            <Ionicons
              name="person-outline"
              size={18}
              color={focusField === "fullName" ? NAVY : "#9aa5b1"}
              style={S.inputIcon}
            />
            <TextInput
              style={S.input}
              placeholder="e.g. Christian Paul Mendoza"
              placeholderTextColor="#b3bac2"
              value={fullName}
              onChangeText={setFullName}
              autoCorrect={false}
              editable={!submitting}
              onFocus={() => setFocusField("fullName")}
              onBlur={() => setFocusField(null)}
            />
          </View>
          <Text style={S.hint}>
            Enter first name, middle name (optional), and last name.
          </Text>

          {/* Email */}
          <Text style={S.label}>
            Email Address <Text style={S.req}>*</Text>
          </Text>
          <View
            style={[S.inputWrap, focusField === "email" && S.inputWrapFocused]}
          >
            <Ionicons
              name="mail-outline"
              size={18}
              color={focusField === "email" ? NAVY : "#9aa5b1"}
              style={S.inputIcon}
            />
            <TextInput
              style={S.input}
              placeholder="e.g. 22-02395@g.batstate-u.edu.ph"
              placeholderTextColor="#b3bac2"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!submitting}
              onFocus={() => setFocusField("email")}
              onBlur={() => setFocusField(null)}
            />
          </View>

          {/* Password */}
          <Text style={S.label}>
            Password <Text style={S.req}>*</Text>
          </Text>
          <View
            style={[
              S.inputWrap,
              focusField === "password" && S.inputWrapFocused,
            ]}
          >
            <Ionicons
              name="lock-closed-outline"
              size={18}
              color={focusField === "password" ? NAVY : "#9aa5b1"}
              style={S.inputIcon}
            />
            <TextInput
              style={S.input}
              placeholder="Minimum 6 characters"
              placeholderTextColor="#b3bac2"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPass}
              autoCapitalize="none"
              editable={!submitting}
              onFocus={() => setFocusField("password")}
              onBlur={() => setFocusField(null)}
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

          {/* Confirm Password */}
          <Text style={S.label}>
            Confirm Password <Text style={S.req}>*</Text>
          </Text>
          <View
            style={[
              S.inputWrap,
              focusField === "confirm" && S.inputWrapFocused,
              passwordsMatch && S.inputWrapSuccess,
              passwordsMismatch && S.inputWrapError,
            ]}
          >
            <Ionicons
              name="lock-closed-outline"
              size={18}
              color={focusField === "confirm" ? NAVY : "#9aa5b1"}
              style={S.inputIcon}
            />
            <TextInput
              style={S.input}
              placeholder="Re-enter password"
              placeholderTextColor="#b3bac2"
              value={confirm}
              onChangeText={setConfirm}
              secureTextEntry={!showConfirm}
              autoCapitalize="none"
              editable={!submitting}
              onFocus={() => setFocusField("confirm")}
              onBlur={() => setFocusField(null)}
            />
            <TouchableOpacity
              onPress={() => setShowConfirm(!showConfirm)}
              style={S.eyeBtn}
              hitSlop={8}
            >
              <Ionicons
                name={showConfirm ? "eye-off-outline" : "eye-outline"}
                size={18}
                color="#9aa5b1"
              />
            </TouchableOpacity>
          </View>

          {/* Match indicator */}
          {confirm.length > 0 && (
            <View style={S.matchRow}>
              <Ionicons
                name={passwordsMatch ? "checkmark-circle" : "close-circle"}
                size={14}
                color={passwordsMatch ? "#27ae60" : "#e74c3c"}
              />
              <Text
                style={[
                  S.matchText,
                  { color: passwordsMatch ? "#27ae60" : "#e74c3c" },
                ]}
              >
                {passwordsMatch ? "Passwords match" : "Passwords do not match"}
              </Text>
            </View>
          )}

          {/* Submit */}
          <TouchableOpacity
            style={[S.registerBtn, submitting && S.registerBtnDisabled]}
            onPress={handleRegister}
            disabled={submitting}
            activeOpacity={0.85}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={S.registerBtnText}>CREATE ACCOUNT</Text>
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

        {/* Sign in link */}
        <View style={S.loginRow}>
          <Text style={S.loginText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.back()} hitSlop={6}>
            <Text style={S.loginLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const S = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f4f6f9" },

  topBand: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 200,
    backgroundColor: NAVY,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },

  scroll: {
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 40,
    alignItems: "center",
  },

  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 28,
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
    maxWidth: 420,
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
    marginBottom: 4,
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
    marginTop: 4,
    letterSpacing: 0.2,
  },
  req: { color: "#e74c3c" },
  hint: {
    fontSize: 11,
    color: "#aab1bb",
    marginTop: -8,
    marginBottom: 14,
    marginLeft: 2,
  },

  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#e3e7ec",
    borderRadius: 10,
    backgroundColor: "#fafbfc",
    marginBottom: 14,
    paddingHorizontal: 12,
  },
  inputWrapFocused: { borderColor: NAVY, backgroundColor: "#fff" },
  inputWrapSuccess: { borderColor: "#27ae60", backgroundColor: "#fff" },
  inputWrapError: { borderColor: "#e74c3c", backgroundColor: "#fff" },
  inputIcon: { marginRight: 8 },
  input: {
    flex: 1,
    fontSize: 14,
    color: "#1f2733",
    paddingVertical: Platform.OS === "ios" ? 13 : 11,
  },
  eyeBtn: { paddingLeft: 8, paddingVertical: 8 },

  matchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: -8,
    marginBottom: 14,
    marginLeft: 2,
  },
  matchText: { fontSize: 12, fontWeight: "500" },

  registerBtn: {
    flexDirection: "row",
    backgroundColor: NAVY,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    shadowColor: NAVY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  registerBtnDisabled: { opacity: 0.6 },
  registerBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 1,
  },

  loginRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 22,
  },
  loginText: { fontSize: 13, color: "#8a92a0" },
  loginLink: { fontSize: 13, color: NAVY, fontWeight: "700" },

  footerText: {
    fontSize: 11,
    color: "#b0b7c1",
    marginTop: 28,
    textAlign: "center",
  },
});
