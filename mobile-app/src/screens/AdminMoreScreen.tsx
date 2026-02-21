import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { Screen } from '../components/Screen';

export const AdminMoreScreen = () => {
  const navigation = useNavigation<any>();

  const items = [
    { label: 'User Onboarding', route: 'AdminUsers' },
    { label: 'Company Settings', route: 'AdminCompanySettings' },
    { label: 'Suppliers', route: 'AdminSuppliers' },
    { label: 'Customers', route: 'AdminCustomers' },
    { label: 'Locations', route: 'AdminLocations' },
    { label: 'Returns', route: 'AdminReturns' },
    { label: 'Audit Logs', route: 'AdminAuditLogs' }
  ];

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Admin Tools</Text>
        <View style={styles.card}>
          {items.map((item) => (
            <TouchableOpacity
              key={item.route}
              style={styles.row}
              onPress={() => navigation.navigate(item.route)}
            >
              <Text style={styles.rowText}>{item.label}</Text>
              <Text style={styles.rowArrow}>›</Text>
            </TouchableOpacity>
          ))}
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0'
  },
  rowText: { fontWeight: '600', color: '#0f172a' },
  rowArrow: { color: '#94a3b8', fontSize: 18 }
});
