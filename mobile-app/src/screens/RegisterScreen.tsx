import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Screen } from '../components/Screen';
import { useAuth } from '../auth/useAuth';
import type { AuthStackParamList } from '../navigation/AuthNavigator';
import { getPublicCompany } from '../services/public';
import { CompanySettings } from '../types';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Register'>;

export const RegisterScreen = () => {
  const navigation = useNavigation<Nav>();
  const { register } = useAuth();
  const [company, setCompany] = useState<CompanySettings | null>(null);
  const brandColor = '#2563eb';
  const [name, setName] = useState('');
  const [role, setRole] = useState('buyer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleRegister = async () => {
    setError(null);
    setBusy(true);
    try {
      await register({
        name,
        email,
        password,
        role,
        phone: phone || undefined,
        address: address || undefined,
        companyName: companyName || undefined,
        gstNumber: gstNumber || undefined
      });
      navigation.navigate('Login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
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
            <Text style={styles.title}>Create account</Text>
            <Text style={styles.subtitle}>Get started with your role</Text>
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              value={name}
              onChangeText={setName}
            />
            <View style={styles.roleGroup}>
              {(['buyer', 'seller', 'admin', 'super_admin'] as const).map((value) => (
                <TouchableOpacity
                  key={value}
                  style={[styles.roleChip, role === value && styles.roleChipActive]}
                  onPress={() => setRole(value)}
                >
                  <Text style={[styles.roleText, role === value && styles.roleTextActive]}>
                    {value}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={styles.input}
              placeholder="Company Name"
              value={companyName}
              onChangeText={setCompanyName}
            />
            <TextInput
              style={styles.input}
              placeholder="GST Number"
              value={gstNumber}
              onChangeText={setGstNumber}
            />
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
            <TextInput
              style={styles.input}
              placeholder="Phone"
              value={phone}
              onChangeText={setPhone}
            />
            <TextInput
              style={styles.input}
              placeholder="Address"
              value={address}
              onChangeText={setAddress}
            />
            <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={busy}>
              <Text style={styles.buttonText}>{busy ? 'Registering...' : 'Register'}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.muted}>Already have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.link}>Login</Text>
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
  error: { color: '#dc2626', marginBottom: 8 },
  roleGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  roleChip: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#f8fafc'
  },
  roleChipActive: {
    backgroundColor: '#0f172a',
    borderColor: '#0f172a'
  },
  roleText: { color: '#0f172a', fontWeight: '600' },
  roleTextActive: { color: '#ffffff' }
});
