import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { router } from 'expo-router';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // Front-end only: navigate to main app
    router.replace('/(tabs)/home');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.inner}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoIconWrapper}>
            <Text style={styles.logoIcon}>🎓</Text>
          </View>
          <Text style={styles.logoText}>Trackademic</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.title}>Sign In</Text>
          <Text style={styles.subtitle}>Sign in with your regular account.</Text>

          <TextInput
            style={styles.input}
            placeholder="Username"
            placeholderTextColor="#aaa"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#aaa"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity style={styles.forgotWrapper}>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>LOGIN</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 8,
  },
  logoIconWrapper: {
    width: 36,
    height: 36,
    backgroundColor: '#1a2e4a',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoIcon: {
    fontSize: 20,
  },
  logoText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a2e4a',
    letterSpacing: 0.3,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '400',
    color: '#333',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  forgotWrapper: {
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  forgotText: {
    fontSize: 13,
    color: '#666',
  },
  loginButton: {
    backgroundColor: '#17a2b8',
    borderRadius: 4,
    paddingVertical: 12,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
  },
});
