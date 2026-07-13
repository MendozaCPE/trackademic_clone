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
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { resetPassword } from "@/services/api";

const NAVY = "#1a2e4a";

type Step = "srcode" | "newpass" | "done";

export default function ForgotPasswordScreen() {
  const insets = useSafeAreaInsets();

  const [step, setStep] = useState<Step>("srcode");
  const [srCode, setSrCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [focusField, setFocusField] = useState<string | null>(null);

  const handleCheckSrCode = () => {
    if (!srCode.trim()) {
      Alert.alert("Required", "Please enter your SR Code.");
      return;
    }
    setStep("newpass");
  };

  const handleReset = async () => {
    if (!newPassword.trim() || !confirmPass.trim()) {
      Alert.alert("Required", "Please fill in both password fields.");
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert("Too short", "Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPass) {
      Alert.alert("Mismatch", "Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      await resetPassword(srCode.trim(), newPassword);
      setStep("done");
    } catch (e: any) {
      Alert.alert("Failed", e.message ?? "Could not reset password.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={S.container}>
      <View style={S.topBand} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Back button */}
        {step !== "done" && (
          <TouchableOpacity
            style={[S.backBtn, { top: insets.top + 12 }]}
            onPress={() =>
              step === "newpass" ? setStep("srcode") : router.back()
            }
            hitSlop={6}
          >
            <Ionicons name="arrow-back" size={22} color={NAVY} />
          </TouchableOpacity>
        )}

        {/* Logo — pinned to the top of the navy band */}
        <View style={[S.logoRow, { marginTop: insets.top + 40 }]}>
          <View style={S.logoIconWrap}>
            <Text style={S.logoEmoji}>🎓</Text>
          </View>
          <View>
            <Text style={S.logoText}>Trackademic</Text>
            <Text style={S.logoSubtext}>Student Portal</Text>
          </View>
        </View>

        {/* Card fills the remaining space below the logo */}
        <View style={S.inner}>
          <View style={S.card}>
            <View style={S.steps}>
              <View style={[S.stepDot, step !== "srcode" && S.stepDotDone]} />
              <View style={[S.stepLine, step !== "srcode" && S.stepLineDone]} />
              <View style={[S.stepDot, step === "done" && S.stepDotDone]} />
            </View>

            {step === "srcode" && (
              <>
                <Text style={S.title}>Forgot Password</Text>
                <Text style={S.subtitle}>Enter your SR Code to continue.</Text>

                <Text style={S.label}>SR Code</Text>
                <View
                  style={[
                    S.inputWrap,
                    focusField === "srCode" && S.inputWrapFocused,
                  ]}
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
                    onFocus={() => setFocusField("srCode")}
                    onBlur={() => setFocusField(null)}
                  />
                </View>

                <TouchableOpacity
                  style={S.primaryBtn}
                  onPress={handleCheckSrCode}
                  activeOpacity={0.85}
                >
                  <Text style={S.primaryBtnText}>CONTINUE</Text>
                  <Ionicons
                    name="arrow-forward"
                    size={16}
                    color="#fff"
                    style={{ marginLeft: 6 }}
                  />
                </TouchableOpacity>
              </>
            )}

            {step === "newpass" && (
              <>
                <Text style={S.title}>New Password</Text>
                <Text style={S.subtitle}>Set a new password for {srCode}.</Text>

                <Text style={S.label}>New Password</Text>
                <View
                  style={[
                    S.inputWrap,
                    focusField === "newPass" && S.inputWrapFocused,
                  ]}
                >
                  <Ionicons
                    name="lock-closed-outline"
                    size={18}
                    color={focusField === "newPass" ? NAVY : "#9aa5b1"}
                    style={S.inputIcon}
                  />
                  <TextInput
                    style={S.input}
                    placeholder="New password"
                    placeholderTextColor="#b3bac2"
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry={!showNew}
                    autoCapitalize="none"
                    editable={!submitting}
                    onFocus={() => setFocusField("newPass")}
                    onBlur={() => setFocusField(null)}
                  />
                  <TouchableOpacity
                    onPress={() => setShowNew(!showNew)}
                    style={S.eyeBtn}
                    hitSlop={8}
                  >
                    <Ionicons
                      name={showNew ? "eye-off-outline" : "eye-outline"}
                      size={18}
                      color="#9aa5b1"
                    />
                  </TouchableOpacity>
                </View>

                <Text style={S.label}>Confirm New Password</Text>
                <View
                  style={[
                    S.inputWrap,
                    focusField === "confirmPass" && S.inputWrapFocused,
                  ]}
                >
                  <Ionicons
                    name="lock-closed-outline"
                    size={18}
                    color={focusField === "confirmPass" ? NAVY : "#9aa5b1"}
                    style={S.inputIcon}
                  />
                  <TextInput
                    style={S.input}
                    placeholder="Confirm new password"
                    placeholderTextColor="#b3bac2"
                    value={confirmPass}
                    onChangeText={setConfirmPass}
                    secureTextEntry={!showConfirm}
                    autoCapitalize="none"
                    editable={!submitting}
                    onFocus={() => setFocusField("confirmPass")}
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

                <TouchableOpacity
                  style={[S.primaryBtn, submitting && S.primaryBtnDisabled]}
                  onPress={handleReset}
                  disabled={submitting}
                  activeOpacity={0.85}
                >
                  {submitting ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <Text style={S.primaryBtnText}>RESET PASSWORD</Text>
                      <Ionicons
                        name="arrow-forward"
                        size={16}
                        color="#fff"
                        style={{ marginLeft: 6 }}
                      />
                    </>
                  )}
                </TouchableOpacity>
              </>
            )}

            {step === "done" && (
              <View style={S.doneBox}>
                <View style={S.doneIcon}>
                  <Ionicons name="checkmark" size={36} color="#fff" />
                </View>
                <Text style={S.doneTitle}>Password Reset!</Text>
                <Text style={S.doneSub}>
                  Your password has been updated. You can now log in with your
                  new password.
                </Text>
                <TouchableOpacity
                  style={S.primaryBtn}
                  onPress={() => router.replace("/")}
                  activeOpacity={0.85}
                >
                  <Text style={S.primaryBtnText}>BACK TO LOGIN</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <Text style={S.footerText}>
            © {new Date().getFullYear()} Trackademic. All rights reserved.
          </Text>
        </View>
      </KeyboardAvoidingView>
    </View>
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

  backBtn: {
    position: "absolute",
    left: 16,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },

  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    alignSelf: "center",
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

  inner: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },

  card: {
    width: "100%",
    maxWidth: 390,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 28,
    shadowColor: "#0f1f33",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 6,
  },

  steps: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#e2e8f0",
    borderWidth: 2,
    borderColor: "#cbd5e1",
  },
  stepDotDone: { backgroundColor: NAVY, borderColor: NAVY },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: "#e2e8f0",
    marginHorizontal: 6,
    maxWidth: 60,
  },
  stepLineDone: { backgroundColor: NAVY },

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
    marginBottom: 22,
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
  inputWrapFocused: { borderColor: NAVY, backgroundColor: "#fff" },
  inputIcon: { marginRight: 8 },
  input: {
    flex: 1,
    fontSize: 14,
    color: "#1f2733",
    paddingVertical: Platform.OS === "ios" ? 13 : 11,
  },
  eyeBtn: { paddingLeft: 8, paddingVertical: 8 },

  primaryBtn: {
    flexDirection: "row",
    backgroundColor: NAVY,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
    shadowColor: NAVY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryBtnDisabled: { opacity: 0.6 },
  primaryBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 1,
  },

  doneBox: { alignItems: "center" },
  doneIcon: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: NAVY,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: NAVY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  doneTitle: { fontSize: 20, fontWeight: "700", color: NAVY, marginBottom: 8 },
  doneSub: {
    fontSize: 13,
    color: "#8a92a0",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },

  footerText: {
    fontSize: 11,
    color: "#b0b7c1",
    marginTop: 24,
    textAlign: "center",
  },
});
