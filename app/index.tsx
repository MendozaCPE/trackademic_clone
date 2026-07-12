import { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ActivityIndicator, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';

export default function LoginScreen() {
  const { login, user, loading } = useAuth();
  const [srCode,     setSrCode]   = useState('');
  const [password,   setPassword] = useState('');
  const [showPass,   setShowPass] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace('/(tabs)/home');
  }, [loading, user]);

  const handleLogin = async () => {
    if (!srCode.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter your SR Code and password.');
      return;
    }
    setSubmitting(true);
    try {
      await login(srCode.trim(), password);
      router.replace('/(tabs)/home');
    } catch (e: any) {
      Alert.alert('Login Failed', e.message ?? 'Invalid SR Code or password.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={S.centered}>
        <ActivityIndicator size="large" color="#17a2b8" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={S.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={S.inner}>
        {/* Logo */}
        <View style={S.logoRow}>
          <View style={S.logoIconWrap}>
            <Text style={S.logoEmoji}>🎓</Text>
          </View>
          <Text style={S.logoText}>Trackademic</Text>
        </View>

        {/* Card */}
        <View style={S.card}>
          <Text style={S.title}>Sign In</Text>
          <Text style={S.subtitle}>Sign in with your SR Code and password.</Text>

          {/* SR Code */}
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
              editable={!submitting}
            />
          </View>

          {/* Password */}
          <View style={S.inputWrap}>
            <Ionicons name="lock-closed-outline" size={18} color="#aaa" style={S.inputIcon} />
            <TextInput
              style={S.input}
              placeholder="Password"
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
                size={18}
                color="#aaa"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={S.forgotRow}>
            <Text style={S.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[S.loginBtn, submitting && S.loginBtnDisabled]}
            onPress={handleLogin}
            disabled={submitting}
          >
            {submitting
              ? <ActivityIndicator color="#fff" />
              : <Text style={S.loginBtnText}>LOGIN</Text>}
          </TouchableOpacity>
        </View>

        {/* Sign up link */}
        <View style={S.signupRow}>
          <Text style={S.signupText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/register')}>
            <Text style={S.signupLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const S = StyleSheet.create({
  centered:    { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0' },
  container:   { flex: 1, backgroundColor: '#f0f0f0' },
  inner:       { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  logoRow:     { flexDirection: 'row', alignItems: 'center', marginBottom: 24, gap: 10 },
  logoIconWrap:{ width: 38, height: 38, backgroundColor: '#1a2e4a', borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  logoEmoji:   { fontSize: 22 },
  logoText:    { fontSize: 22, fontWeight: '700', color: '#1a2e4a', letterSpacing: 0.3 },
  card: {
    width: '100%', maxWidth: 390, backgroundColor: '#fff', borderRadius: 10, padding: 28,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1, shadowRadius: 10, elevation: 5,
  },
  title:    { fontSize: 24, fontWeight: '500', color: '#222', textAlign: 'center', marginBottom: 6 },
  subtitle: { fontSize: 13, color: '#999', textAlign: 'center', marginBottom: 22 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#ddd',
    borderRadius: 6, backgroundColor: '#fff', marginBottom: 14, paddingHorizontal: 10,
  },
  inputIcon:        { marginRight: 8 },
  input:            { flex: 1, fontSize: 14, color: '#333', paddingVertical: Platform.OS === 'ios' ? 12 : 10 },
  eyeBtn:           { paddingLeft: 8, paddingVertical: 8 },
  forgotRow:        { alignItems: 'flex-end', marginBottom: 18 },
  forgotText:       { fontSize: 13, color: '#666' },
  loginBtn:         { backgroundColor: '#17a2b8', borderRadius: 6, paddingVertical: 13, alignItems: 'center' },
  loginBtnDisabled: { opacity: 0.6 },
  loginBtnText:     { color: '#fff', fontSize: 14, fontWeight: '700', letterSpacing: 1 },
  signupRow:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 22 },
  signupText:       { fontSize: 13, color: '#888' },
  signupLink:       { fontSize: 13, color: '#17a2b8', fontWeight: '700' },
});
