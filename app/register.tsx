import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator,
  Alert, ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { register } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

export default function RegisterScreen() {
  const { refreshUser } = useAuth();

  const [srCode,      setSrCode]      = useState('');
  const [fullName,    setFullName]    = useState('');
  const [email,       setEmail]       = useState('');
  const [password,    setPassword]    = useState('');
  const [confirm,     setConfirm]     = useState('');
  const [showPass,    setShowPass]    = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting,  setSubmitting]  = useState(false);

  // Parse "Firstname [Middle] Lastname" from a full name string
  const parseName = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return { first: parts[0], mi: '', last: '' };
    if (parts.length === 2) return { first: parts[0], mi: '', last: parts[1] };
    // 3+ words: first = first word, last = last word, middle initial = 2nd word's first char
    return {
      first: parts[0],
      mi:    parts[1].charAt(0).toUpperCase(),
      last:  parts[parts.length - 1],
    };
  };

  const handleRegister = async () => {
    if (!srCode.trim() || !fullName.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Missing Fields', 'Please fill in all required fields.');
      return;
    }
    if (password !== confirm) {
      Alert.alert('Password Mismatch', 'Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters.');
      return;
    }

    const { first, mi, last } = parseName(fullName);
    if (!last) {
      Alert.alert('Invalid Name', 'Please enter at least a first and last name.');
      return;
    }

    setSubmitting(true);
    try {
      const data = await register({
        sr_code:        srCode.trim(),
        first_name:     first,
        middle_initial: mi,
        last_name:      last,
        email:          email.trim(),
        username:       srCode.trim(),   // SR code doubles as username
        password,
        section:        '',
        year_level:     1,
      });
      refreshUser(data.user);
      router.replace('/(tabs)/home');
    } catch (e: any) {
      Alert.alert('Registration Failed', e.message ?? 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  const passwordsMatch = confirm.length > 0 && password === confirm;
  const passwordsMismatch = confirm.length > 0 && password !== confirm;

  return (
    <KeyboardAvoidingView
      style={S.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
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
          <Text style={S.logoText}>Trackademic</Text>
        </View>

        {/* Card */}
        <View style={S.card}>
          <Text style={S.title}>Create Account</Text>
          <Text style={S.subtitle}>Register using your student SR Code.</Text>

          {/* SR Code */}
          <Text style={S.label}>SR Code <Text style={S.req}>*</Text></Text>
          <View style={S.inputWrap}>
            <Ionicons name="card-outline" size={18} color="#aaa" style={S.inputIcon} />
            <TextInput
              style={S.input}
              placeholder="e.g. 22-02395"
              placeholderTextColor="#bbb"
              value={srCode}
              onChangeText={setSrCode}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!submitting}
            />
          </View>

          {/* Full Name */}
          <Text style={S.label}>Full Name <Text style={S.req}>*</Text></Text>
          <View style={S.inputWrap}>
            <Ionicons name="person-outline" size={18} color="#aaa" style={S.inputIcon} />
            <TextInput
              style={S.input}
              placeholder="e.g. Christian Paul Mendoza"
              placeholderTextColor="#bbb"
              value={fullName}
              onChangeText={setFullName}
              autoCorrect={false}
              editable={!submitting}
            />
          </View>
          <Text style={S.hint}>Enter first name, middle name (optional), and last name.</Text>

          {/* Email */}
          <Text style={S.label}>Email Address <Text style={S.req}>*</Text></Text>
          <View style={S.inputWrap}>
            <Ionicons name="mail-outline" size={18} color="#aaa" style={S.inputIcon} />
            <TextInput
              style={S.input}
              placeholder="e.g. 22-02395@g.batstate-u.edu.ph"
              placeholderTextColor="#bbb"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!submitting}
            />
          </View>

          {/* Password */}
          <Text style={S.label}>Password <Text style={S.req}>*</Text></Text>
          <View style={S.inputWrap}>
            <Ionicons name="lock-closed-outline" size={18} color="#aaa" style={S.inputIcon} />
            <TextInput
              style={S.input}
              placeholder="Minimum 6 characters"
              placeholderTextColor="#bbb"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPass}
              autoCapitalize="none"
              editable={!submitting}
            />
            <TouchableOpacity onPress={() => setShowPass(!showPass)} style={S.eyeBtn}>
              <Ionicons
                name={showPass ? 'eye-off-outline' : 'eye-outline'}
                size={18} color="#aaa"
              />
            </TouchableOpacity>
          </View>

          {/* Confirm Password */}
          <Text style={S.label}>Confirm Password <Text style={S.req}>*</Text></Text>
          <View style={[
            S.inputWrap,
            passwordsMatch    && S.inputWrapSuccess,
            passwordsMismatch && S.inputWrapError,
          ]}>
            <Ionicons name="lock-closed-outline" size={18} color="#aaa" style={S.inputIcon} />
            <TextInput
              style={S.input}
              placeholder="Re-enter password"
              placeholderTextColor="#bbb"
              value={confirm}
              onChangeText={setConfirm}
              secureTextEntry={!showConfirm}
              autoCapitalize="none"
              editable={!submitting}
            />
            <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} style={S.eyeBtn}>
              <Ionicons
                name={showConfirm ? 'eye-off-outline' : 'eye-outline'}
                size={18} color="#aaa"
              />
            </TouchableOpacity>
          </View>

          {/* Match indicator */}
          {confirm.length > 0 && (
            <View style={S.matchRow}>
              <Ionicons
                name={passwordsMatch ? 'checkmark-circle' : 'close-circle'}
                size={14}
                color={passwordsMatch ? '#27ae60' : '#e74c3c'}
              />
              <Text style={[S.matchText, { color: passwordsMatch ? '#27ae60' : '#e74c3c' }]}>
                {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
              </Text>
            </View>
          )}

          {/* Submit */}
          <TouchableOpacity
            style={[S.registerBtn, submitting && S.registerBtnDisabled]}
            onPress={handleRegister}
            disabled={submitting}
          >
            {submitting
              ? <ActivityIndicator color="#fff" />
              : <Text style={S.registerBtnText}>CREATE ACCOUNT</Text>}
          </TouchableOpacity>
        </View>

        {/* Sign in link */}
        <View style={S.loginRow}>
          <Text style={S.loginText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={S.loginLink}>Sign In</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const S = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f0f0' },
  scroll:    { paddingHorizontal: 24, paddingTop: 56, alignItems: 'center' },

  logoRow:     { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 24 },
  logoIconWrap:{ width: 38, height: 38, backgroundColor: '#1a2e4a', borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  logoEmoji:   { fontSize: 22 },
  logoText:    { fontSize: 22, fontWeight: '700', color: '#1a2e4a', letterSpacing: 0.3 },

  card: {
    width: '100%', maxWidth: 420, backgroundColor: '#fff', borderRadius: 10, padding: 26,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1, shadowRadius: 10, elevation: 5,
  },
  title:    { fontSize: 22, fontWeight: '600', color: '#222', textAlign: 'center', marginBottom: 4 },
  subtitle: { fontSize: 13, color: '#999', textAlign: 'center', marginBottom: 22 },

  label: { fontSize: 12, fontWeight: '600', color: '#555', marginBottom: 6, marginTop: 4 },
  req:   { color: '#e74c3c' },
  hint:  { fontSize: 11, color: '#aaa', marginTop: -8, marginBottom: 14 },

  inputWrap: {
    flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#ddd',
    borderRadius: 6, backgroundColor: '#fff', marginBottom: 14, paddingHorizontal: 10,
  },
  inputWrapSuccess: { borderColor: '#27ae60' },
  inputWrapError:   { borderColor: '#e74c3c' },
  inputIcon: { marginRight: 8 },
  input:     { flex: 1, fontSize: 14, color: '#333', paddingVertical: Platform.OS === 'ios' ? 12 : 10 },
  eyeBtn:    { paddingLeft: 8, paddingVertical: 8 },

  matchRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: -8, marginBottom: 14 },
  matchText: { fontSize: 12 },

  registerBtn:         { backgroundColor: '#17a2b8', borderRadius: 6, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  registerBtnDisabled: { opacity: 0.6 },
  registerBtnText:     { color: '#fff', fontSize: 14, fontWeight: '700', letterSpacing: 0.8 },

  loginRow:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 22 },
  loginText: { fontSize: 13, color: '#888' },
  loginLink: { fontSize: 13, color: '#17a2b8', fontWeight: '700' },
});
