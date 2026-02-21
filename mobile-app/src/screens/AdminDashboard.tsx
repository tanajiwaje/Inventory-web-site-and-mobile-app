import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { Screen } from '../components/Screen';
import { Card } from '../components/Card';
import { EmptyState } from '../components/EmptyState';
import { PrimaryButton } from '../components/PrimaryButton';
import { DashboardSkeleton } from '../components/Skeleton';
import { useAuth } from '../auth/useAuth';
import { getAdminDashboard } from '../services/admin';
import { AdminDashboard as AdminDashboardType } from '../types';
import { colors, radius, spacing, typography } from '../theme/tokens';

export const AdminDashboard = () => {
  const { user, logout, token } = useAuth();
  const navigation = useNavigation<any>();
  const [dashboard, setDashboard] = useState<AdminDashboardType | null>(null);
  const [loading, setLoading] = useState(false);
  const formatCurrency = (value?: number) => `INR ${(value ?? 0).toFixed(2)}`;

  const loadDashboard = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await getAdminDashboard(token);
      setDashboard(res);
    } catch (error) {
      Alert.alert('Error', String(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadDashboard();
  }, [token]);

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Admin Dashboard</Text>
            <Text style={styles.subtitle}>{user?.name || 'Admin'}</Text>
          </View>
          <View style={styles.headerBadge}>
            <Ionicons name="stats-chart-outline" size={16} color={colors.primary} />
            <Text style={styles.headerBadgeText}>Live KPI</Text>
          </View>
        </View>

        {loading ? (
          <DashboardSkeleton />
        ) : (
          <>
            <Text style={styles.sectionTitle}>At a glance</Text>
            <View style={styles.kpiGrid}>
              <View style={styles.kpiCell}>
                <Card>
                  <View style={styles.kpiBody}>
                    <Text style={styles.cardLabel} numberOfLines={1}>
                      Net Profit
                    </Text>
                    <Text style={styles.cardValue} numberOfLines={1}>
                      {formatCurrency(dashboard?.profit.net)}
                    </Text>
                  </View>
                </Card>
              </View>
              <View style={styles.kpiCell}>
                <Card>
                  <View style={styles.kpiBody}>
                    <Text style={styles.cardLabel} numberOfLines={1}>
                      Profit Margin
                    </Text>
                    <Text style={styles.cardValue} numberOfLines={1}>
                      {dashboard?.profit.margin ? `${(dashboard.profit.margin * 100).toFixed(1)}%` : '0%'}
                    </Text>
                  </View>
                </Card>
              </View>
              <View style={styles.kpiCell}>
                <Card>
                  <View style={styles.kpiBody}>
                    <Text style={styles.cardLabel} numberOfLines={1}>
                      Purchase Total
                    </Text>
                    <Text style={styles.cardValue} numberOfLines={1}>
                      {formatCurrency(dashboard?.purchaseOrders.total)}
                    </Text>
                  </View>
                </Card>
              </View>
              <View style={styles.kpiCell}>
                <Card>
                  <View style={styles.kpiBody}>
                    <Text style={styles.cardLabel} numberOfLines={1}>
                      Sales Total
                    </Text>
                    <Text style={styles.cardValue} numberOfLines={1}>
                      {formatCurrency(dashboard?.salesOrders.total)}
                    </Text>
                  </View>
                </Card>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Quick actions</Text>
            <View style={styles.actionGrid}>
              <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('AdminInventory')}>
                <Ionicons name="cube-outline" size={16} color={colors.primary} />
                <Text style={styles.actionText}>Inventory</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('AdminPurchaseOrders')}>
                <Ionicons name="cart-outline" size={16} color={colors.primary} />
                <Text style={styles.actionText}>Purchase</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('AdminSalesOrders')}>
                <Ionicons name="trending-up-outline" size={16} color={colors.primary} />
                <Text style={styles.actionText}>Sales</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('AdminMore')}>
                <Ionicons name="grid-outline" size={16} color={colors.primary} />
                <Text style={styles.actionText}>More Tools</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>Details</Text>

            <View style={styles.listCard}>
              <Text style={styles.groupTitle}>Purchase Order Status</Text>
              {Object.entries(dashboard?.purchaseOrders.statusCounts ?? {}).map(([status, value]) => (
                <View key={status} style={styles.listRow}>
                  <Text style={styles.listLabel}>{status}</Text>
                  <Text style={styles.listValue}>{value}</Text>
                </View>
              ))}
            </View>

            <View style={styles.listCard}>
              <Text style={styles.groupTitle}>Sales Order Status</Text>
              {Object.entries(dashboard?.salesOrders.statusCounts ?? {}).map(([status, value]) => (
                <View key={status} style={styles.listRow}>
                  <Text style={styles.listLabel}>{status}</Text>
                  <Text style={styles.listValue}>{value}</Text>
                </View>
              ))}
            </View>

            <View style={styles.listCard}>
              <Text style={styles.groupTitle}>User Onboarding</Text>
              <View style={styles.listRow}>
                <Text style={styles.listLabel}>Total</Text>
                <Text style={styles.listValue}>{dashboard?.users.total ?? 0}</Text>
              </View>
              <View style={styles.listRow}>
                <Text style={styles.listLabel}>Pending</Text>
                <Text style={styles.listValue}>{dashboard?.users.pending ?? 0}</Text>
              </View>
              <View style={styles.listRow}>
                <Text style={styles.listLabel}>Approved</Text>
                <Text style={styles.listValue}>{dashboard?.users.approved ?? 0}</Text>
              </View>
              <View style={styles.listRow}>
                <Text style={styles.listLabel}>Rejected</Text>
                <Text style={styles.listValue}>{dashboard?.users.rejected ?? 0}</Text>
              </View>
            </View>

            <View style={styles.listCard}>
              <Text style={styles.groupTitle}>Stock by Location</Text>
              {dashboard?.locations?.length ? (
                dashboard.locations.map((row) => (
                  <View key={row.locationId} style={styles.listRow}>
                    <Text style={styles.listLabel}>{row.locationName}</Text>
                    <Text style={styles.listValue}>{row.totalQuantity}</Text>
                  </View>
                ))
              ) : (
                <EmptyState icon="business-outline" title="No locations yet" subtitle="Add locations to see stock split by warehouse." />
              )}
            </View>
          </>
        )}

        <PrimaryButton label="Logout" onPress={logout} />
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: { paddingBottom: spacing.xl },
  header: {
    marginBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  title: { fontSize: typography.title, fontWeight: '700', color: colors.text },
  subtitle: { color: colors.textMuted, marginTop: spacing.xs },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: '#dbeafe',
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 8
  },
  headerBadgeText: { color: colors.primary, fontWeight: '700' },
  sectionTitle: {
    fontSize: typography.subtitle,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.sm,
    marginBottom: spacing.sm
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: spacing.md
  },
  kpiCell: { width: '48%' },
  kpiBody: { minHeight: 56, justifyContent: 'space-between' },
  cardLabel: { fontWeight: '600', color: colors.text, flexShrink: 1 },
  cardValue: { color: colors.textMuted, marginTop: spacing.xs, fontWeight: '700', flexShrink: 1 },
  actionGrid: { gap: spacing.sm, marginBottom: spacing.sm },
  actionButton: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.xs
  },
  actionText: { fontWeight: '700', color: colors.text },
  listCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md
  },
  groupTitle: { color: colors.text, fontWeight: '700', marginBottom: spacing.xs },
  listRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  listLabel: { color: colors.text, fontWeight: '500' },
  listValue: { color: colors.primary, fontWeight: '700' }
});
