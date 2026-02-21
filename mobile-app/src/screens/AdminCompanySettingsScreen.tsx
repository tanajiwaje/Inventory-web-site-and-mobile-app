import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

import { Screen } from '../components/Screen';
import { useAuth } from '../auth/useAuth';
import { getCompanySettings, updateCompanySettings } from '../services/admin';

export const AdminCompanySettingsScreen = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    logoUrl: '',
    websiteUrl: '',
    tagline: '',
    description: ''
  });

  const loadSettings = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await getCompanySettings(token);
      setForm({
        name: res.name ?? '',
        logoUrl: res.logoUrl ?? '',
        websiteUrl: res.websiteUrl ?? '',
        tagline: res.tagline ?? '',
        description: res.description ?? ''
      });
    } catch (error) {
      Alert.alert('Error', String(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadSettings();
  }, [token]);

  const handleSave = async () => {
    if (!token) return;
    if (!form.name) {
      Alert.alert('Validation', 'Company name is required.');
      return;
    }
    try {
      await updateCompanySettings(token, {
        name: form.name,
        logoUrl: form.logoUrl || undefined,
        websiteUrl: form.websiteUrl || undefined,
        tagline: form.tagline || undefined,
        description: form.description || undefined
      });
      Alert.alert('Saved', 'Company settings updated.');
    } catch (error) {
      Alert.alert('Error', String(error));
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Company Settings</Text>

        {loading ? (
          <ActivityIndicator />
        ) : (
          <View style={styles.card}>
            <TextInput
              placeholder="Company name"
              value={form.name}
              onChangeText={(value) => setForm((prev) => ({ ...prev, name: value }))}
              style={styles.input}
            />
            <TextInput
              placeholder="Logo URL"
              value={form.logoUrl}
              onChangeText={(value) => setForm((prev) => ({ ...prev, logoUrl: value }))}
              style={styles.input}
            />
            <TextInput
              placeholder="Website URL"
              value={form.websiteUrl}
              onChangeText={(value) => setForm((prev) => ({ ...prev, websiteUrl: value }))}
              style={styles.input}
            />
            <TextInput
              placeholder="Tagline"
              value={form.tagline}
              onChangeText={(value) => setForm((prev) => ({ ...prev, tagline: value }))}
              style={styles.input}
            />
            <TextInput
              placeholder="Description"
              value={form.description}
              onChangeText={(value) => setForm((prev) => ({ ...prev, description: value }))}
              style={[styles.input, styles.textArea]}
              multiline
            />
            <TouchableOpacity style={styles.primaryButton} onPress={handleSave}>
              <Text style={styles.primaryButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: { paddingBottom: 24 },
  title: { fontSize: 22, fontWeight: '700', color: '#0f172a', marginBottom: 16 },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12
  },
  textArea: { minHeight: 90, textAlignVertical: 'top' },
  primaryButton: {
    backgroundColor: '#0f172a',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center'
  },
  primaryButtonText: { color: '#fff', fontWeight: '600' }
});
