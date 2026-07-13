import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ActivityIndicator, Alert, SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { resetPassword } from '@/services/api';

type Step = 'srcode' | 'newpass' | 'done';

export default function ForgotPasswordScreen() {
  const [step,        setStep]        = useState<Step>('srcode');
  const [srCode,      setSrCode]      = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showNew,     setShowNew]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting,  setSubmitting]  = useState(false);

  // ── Step 1: verify SR Code exists ─────────────────────────────────────────
  const handleCheckSrCode = () => {
    if (!srCode.trim()) {
      Alert.alert('Required', 'Please enter your SR Code.');
      return;
    }
    setStep('newpass');
  };

  // ── Step 2: set new password ───────────────────────────────────────────────
  const handleReset = async () => {
    if (!newPassword.trim() || !confirmPass.trim()) {
      Alert.alert('Required', 'Please fill in both password fields.');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Too short', 'Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPass) {
      Alert.alert('Mismatch', 'Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      await resetPassword(srCode.trim(), newPassword);
      setStep('done');
    } catch (e: any) {
      Alert.alert('Failed', e.message ?? 'Could not reset password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={S.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Back button */}
        {step !== 'done' && (
          <TouchableOpacity
            style={S.backBtn}
            onPress={() => step === 'newpass' ? setStep('srcode') : router.back()}
          >
            <Ionicons name="arrow-back" size={22} color="#1a2e4a" />
          </TouchableOpacity>
        )}

        <View style={S.inner}>
          {/* Card */}
          <View style={S.card}>

            {/* ── Step indicator ── */}
            <View style={S.steps}>
              <View style={[S.stepDot, step !== 'srcode' && S.stepDotDone]} />
              <View style={S.stepLine} />
              <View style={[S.stepDot, step === 'done' && S.stepDotDone]} />
            </View>

            {step === 'srcode' && (
              <>
                <Text style={S.title}>Forgot Password</Text>
                <Text style={S.subtitle}>Enter your SR Code to continue.</Text>

                <View style={S.inputWrap}>
                  <Ionicons name="card-outline" size={18} color="#aaa" style={S.inputIcon} />
                  <TextInput
                    style={S.input}
                    placeholder="SR Code  (e.g. 22-02395)"
                    placeholderTextColor="#bbb"
                    value={srCode}
                    onChangeText={setSrCode}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>

                <TouchableOpacity style={S.primaryBtn} onPress={handleCheckSrCode}>
                  <Text style={S.primaryBtnText}>CONTINUE</Text>
                </TouchableOpacity>
              </>
            )}

            {step === 'newpass' && (
              <>
                <Text style={S.title}>New Password</Text>
                <Text style={S.subtitle}>Set a new password for {srCode}.</Text>

                <View style={S.inputWrap}>
                  <Ionicons name="lock-closed-outline" size={18} color="#aaa" style={S.inputIcon} />
                  <TextInput
                    style={S.input}
                    placeholder="New password"
                    placeholderTextColor="#bbb"
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry={!showNew}
                    autoCapitalize="none"
                    editable={!submitting}
                  />
                  <TouchableOpacity onPress={() => setShowNew(!showNew)} style={S.eyeBtn}>
                    <Ionicons name={showNew ? 'eye-off-outline' : 'eye-outline'} size={18} color="#aaa" />
                  </TouchableOpacity>
                </View>

                <View style={S.inputWrap}>
                  <Ionicons name="lock-closed-outline" size={18} color="#aaa" style={S.inputIcon} />
                  <TextInput
                    style={S.input}
                    placeholder="Confirm new password"
                    placeholderTextColor="#bbb"
                    value={confirmPass}
                    onChangeText={setConfirmPass}
                    secureTextEntry={!showConfirm}
                    autoCapitalize="none"
                    editable={!submitting}
                  />
                  <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} style={S.eyeBtn}>
                    <Ionicons name={showConfirm ? 'eye-off-outline' : 'eye-outline'} size={18} color="#aaa" />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={[S.primaryBtn, submitting && { opacity: 0.6 }]}
                  onPress={handleReset}
                  disabled={submitting}
                >
                  {submitting
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={S.primaryBtnText}>RESET PASSWORD</Text>
                  }
                </TouchableOpacity>
              </>
            )}

            {step === 'done' && (
              <View style={S.doneBox}>
                <View style={S.doneIcon}>
                  <Ionicons name="checkmark" size={36} color="#fff" />
                </View>
                <Text style={S.doneTitle}>Password Reset!</Text>
                <Text style={S.doneSub}>
                  Your password has been updated. You can now log in with your new password.
                </Text>
                <TouchableOpacity
                  style={S.primaryBtn}
                  onPress={() => router.replace('/')}
                >
                  <Text style={S.primaryBtnText}>BACK TO LOGIN</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const S = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f0f0' },
  inner: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },

  backBtn: {
    position: 'absolute', top: 16, left: 16, zIndex: 10,
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
  },

  card: {
    width: '100%', maxWidth: 390, backgroundColor: '#fff', borderRadius: 10, padding: 28,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1, shadowRadius: 10, elevation: 5,
  },

  // Step indicator
  steps:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 24, gap: 0 },
  stepDot:     { width: 12, height: 12, borderRadius: 6, backgroundColor: '#e2e8f0', borderWidth: 2, borderColor: '#cbd5e1' },
  stepDotDone: { backgroundColor: '#17a2b8', borderColor: '#17a2b8' },
  stepLine:    { flex: 1, height: 2, backgroundColor: '#e2e8f0', marginHorizontal: 6, maxWidth: 60 },

  title:    { fontSize: 22, fontWeight: '600', color: '#222', textAlign: 'center', marginBottom: 6 },
  subtitle: { fontSize: 13, color: '#999', textAlign: 'center', marginBottom: 22 },

  inputWrap: {
    flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#ddd',
    borderRadius: 6, backgroundColor: '#fff', marginBottom: 14, paddingHorizontal: 10,
  },
  inputIcon: { marginRight: 8 },
  input:     { flex: 1, fontSize: 14, color: '#333', paddingVertical: Platform.OS === 'ios' ? 12 : 10 },
  eyeBtn:    { paddingLeft: 8, paddingVertical: 8 },

  primaryBtn:     { backgroundColor: '#17a2b8', borderRadius: 6, paddingVertical: 13, alignItems: 'center', marginTop: 4 },
  primaryBtnText: { color: '#fff', fontSize: 14, fontWeight: '700', letterSpacing: 1 },

  // Done state
  doneBox:   { alignItems: 'center' },
  doneIcon:  { width: 68, height: 68, borderRadius: 34, backgroundColor: '#17a2b8', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  doneTitle: { fontSize: 20, fontWeight: '700', color: '#1a2e4a', marginBottom: 8 },
  doneSub:   { fontSize: 13, color: '#64748b', textAlign: 'center', lineHeight: 20, marginBottom: 24 },
});
