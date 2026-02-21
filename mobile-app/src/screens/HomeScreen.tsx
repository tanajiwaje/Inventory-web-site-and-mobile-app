import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';

import { Screen } from '../components/Screen';
import type { AuthStackParamList } from '../navigation/AuthNavigator';
import { getPublicCompany } from '../services/public';
import { CompanySettings } from '../types';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Home'>;

export const HomeScreen = () => {
  const navigation = useNavigation<Nav>();
  const [company, setCompany] = useState<CompanySettings | null>(null);
  const brandColor = '#2563eb';

  useEffect(() => {
    const load = async () => {
      const res = await getPublicCompany();
      if (res) setCompany(res);
    };
    void load();
  }, []);

  return (
    <Screen>
      <View style={styles.container}>
        <View style={styles.hero}>
          <View style={[styles.logoCircle, { backgroundColor: brandColor }]}>
            {company?.logoUrl ? (
              <Image source={{ uri: company.logoUrl }} style={styles.logoImage} />
            ) : (
              <Text style={styles.logoText}>
                {(company?.name || 'INV').slice(0, 3).toUpperCase()}
              </Text>
            )}
          </View>
          <Text style={styles.title}>{company?.name || 'Inventory Pro'}</Text>
          <Text style={styles.subtitle}>
            {company?.tagline || 'Manage purchase, sales, stock, and partners in one place.'}
          </Text>
          {company?.description ? (
            <Text style={styles.description}>{company.description}</Text>
          ) : null}
          {company?.websiteUrl ? (
            <Text style={styles.website}>{company.websiteUrl}</Text>
          ) : null}
        </View>

        <View style={styles.card}>
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: brandColor }]}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.primaryButtonText}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.secondaryButtonText}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center' },
  hero: { alignItems: 'center', marginBottom: 24 },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12
  },
  logoText: { color: '#ffffff', fontWeight: '700' },
  logoImage: { width: 56, height: 56, borderRadius: 28 },
  title: { fontSize: 26, fontWeight: '700', color: '#0f172a' },
  subtitle: { color: '#64748b', marginTop: 8, textAlign: 'center' },
  description: { color: '#64748b', marginTop: 6, textAlign: 'center' },
  website: { color: '#2563eb', marginTop: 6, fontWeight: '600' },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10
  },
  primaryButtonText: { color: '#fff', fontWeight: '600' },
  secondaryButton: {
    backgroundColor: '#e2e8f0',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center'
  },
  secondaryButtonText: { color: '#0f172a', fontWeight: '600' }
});
