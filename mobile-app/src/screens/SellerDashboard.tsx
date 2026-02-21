import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { Screen } from '../components/Screen';
import { Card } from '../components/Card';
import { useAuth } from '../auth/useAuth';
import { useEffect, useMemo, useState } from 'react';
import { getPurchaseOrders } from '../services/orders';

export const SellerDashboard = () => {
  const { user, logout, token } = useAuth();
  const navigation = useNavigation<any>();
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const load = async () => {
      if (!token) return;
      const res = await getPurchaseOrders(token, { page: 1, limit: 200 });
      const counts = res.data.reduce<Record<string, number>>((acc, order) => {
        acc[order.status] = (acc[order.status] ?? 0) + 1;
        return acc;
      }, {});
      setStatusCounts(counts);
    };
    void load();
  }, [token]);

  const totalOrders = useMemo(
    () => Object.values(statusCounts).reduce((sum, value) => sum + value, 0),
    [statusCounts]
  );

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>Seller Dashboard</Text>
        <Text style={styles.subtitle}>{user?.name}</Text>
      </View>

      <View style={styles.grid}>
        <Card>
          <Text style={styles.cardLabel}>Total Orders</Text>
          <Text style={styles.cardValue}>{totalOrders}</Text>
        </Card>
        <Card>
          <Text style={styles.cardLabel}>Requested</Text>
          <Text style={styles.cardValue}>{statusCounts.requested ?? 0}</Text>
        </Card>
        <Card>
          <Text style={styles.cardLabel}>Submitted</Text>
          <Text style={styles.cardValue}>{statusCounts.supplier_submitted ?? 0}</Text>
        </Card>
        <Card>
          <Text style={styles.cardLabel}>Approved</Text>
          <Text style={styles.cardValue}>{statusCounts.approved ?? 0}</Text>
        </Card>
        <TouchableOpacity onPress={() => navigation.navigate('SellerPurchaseOrders')}>
          <Card>
            <Text style={styles.cardLabel}>Purchase Orders</Text>
            <Text style={styles.cardValue}>Respond to requests</Text>
          </Card>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('SellerProfile')}>
          <Card>
            <Text style={styles.cardLabel}>Profile</Text>
            <Text style={styles.cardValue}>Manage your details</Text>
          </Card>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.button} onPress={logout}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </Screen>
  );
};

const styles = StyleSheet.create({
  header: { marginBottom: 16 },
  title: { fontSize: 22, fontWeight: '700', color: '#0f172a' },
  subtitle: { color: '#64748b', marginTop: 4 },
  grid: { gap: 12 },
  cardLabel: { fontWeight: '600', color: '#0f172a' },
  cardValue: { color: '#64748b', marginTop: 4 },
  button: {
    marginTop: 16,
    backgroundColor: '#0f172a',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center'
  },
  buttonText: { color: '#fff', fontWeight: '600' }
});
