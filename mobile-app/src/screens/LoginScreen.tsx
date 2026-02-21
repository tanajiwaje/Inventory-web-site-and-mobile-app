import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';

import { Screen } from '../components/Screen';
import { useAuth } from '../auth/useAuth';
import type { AuthStackParamList } from '../navigation/AuthNavigator';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getPublicCompany } from '../services/public';
import { CompanySettings } from '../types';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

export const LoginScreen = () => {
  const navigation = useNavigation<Nav>();
  const { login } = useAuth();
  const [company, setCompany] = useState<CompanySettings | null>(null);
  const brandColor = '#2563eb';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleLogin = async () => {
    setError(null);
    setBusy(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      const res = await getPublicCompany();
      if (res) setCompany(res);
    };
    void load();
  }, []);

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <View style={[styles.logoCircle, { backgroundColor: brandColor }]}>
            {company?.logoUrl ? (
              <Image source={{ uri: company.logoUrl }} style={styles.logoImage} />
            ) : (
              <Text style={styles.logoText}>
                {(company?.name || 'INV').slice(0, 3).toUpperCase()}
              </Text>
            )}
          </View>
          <View style={styles.header}>
            <Text style={styles.title}>{company?.name || 'Welcome back'}</Text>
            <Text style={styles.subtitle}>Login to continue</Text>
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              autoCapitalize="none"
              keyboardType="email-address"
              onChangeText={setEmail}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              secureTextEntry
              onChangeText={setPassword}
            />
            <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={busy}>
              <Text style={styles.buttonText}>{busy ? 'Logging in...' : 'Login'}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.muted}>No account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.link}>Register</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center' },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12
  },
  logoText: { color: '#ffffff', fontWeight: '700' },
  logoImage: { width: 50, height: 50, borderRadius: 25 },
  header: { marginBottom: 16 },
  title: { fontSize: 24, fontWeight: '700', color: '#0f172a' },
  subtitle: { color: '#64748b', marginTop: 4 },
  form: { gap: 12 },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12
  },
  button: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center'
  },
  buttonText: { color: '#fff', fontWeight: '600' },
  footer: { marginTop: 16, flexDirection: 'row', gap: 6, justifyContent: 'center' },
  muted: { color: '#64748b' },
  link: { color: '#2563eb', fontWeight: '600' },
  error: { color: '#dc2626', marginBottom: 8 }
});
