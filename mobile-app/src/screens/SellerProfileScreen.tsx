import { useState } from 'react';
import {
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

export const SellerProfileScreen = () => {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({
    name: user?.name ?? '',
    phone: user?.phone ?? '',
    address: user?.address ?? '',
    companyName: user?.companyName ?? '',
    gstNumber: user?.gstNumber ?? ''
  });

  const handleSave = async () => {
    try {
      await updateProfile({
        name: form.name || undefined,
        phone: form.phone || undefined,
        address: form.address || undefined,
        companyName: form.companyName || undefined,
        gstNumber: form.gstNumber || undefined
      });
      Alert.alert('Saved', 'Profile updated.');
    } catch (error) {
      Alert.alert('Error', String(error));
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Profile</Text>
        <View style={styles.card}>
          <TextInput
            placeholder="Name"
            value={form.name}
            onChangeText={(value) => setForm((prev) => ({ ...prev, name: value }))}
            style={styles.input}
          />
          <TextInput
            placeholder="Phone"
            value={form.phone}
            onChangeText={(value) => setForm((prev) => ({ ...prev, phone: value }))}
            style={styles.input}
          />
          <TextInput
            placeholder="Address"
            value={form.address}
            onChangeText={(value) => setForm((prev) => ({ ...prev, address: value }))}
            style={styles.input}
          />
          <TextInput
            placeholder="Company Name"
            value={form.companyName}
            onChangeText={(value) => setForm((prev) => ({ ...prev, companyName: value }))}
            style={styles.input}
          />
          <TextInput
            placeholder="GST Number"
            value={form.gstNumber}
            onChangeText={(value) => setForm((prev) => ({ ...prev, gstNumber: value }))}
            style={styles.input}
          />
          <TouchableOpacity style={styles.primaryButton} onPress={handleSave}>
            <Text style={styles.primaryButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
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
  primaryButton: {
    marginTop: 6,
    backgroundColor: '#0f172a',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center'
  },
  primaryButtonText: { color: '#fff', fontWeight: '600' }
});
