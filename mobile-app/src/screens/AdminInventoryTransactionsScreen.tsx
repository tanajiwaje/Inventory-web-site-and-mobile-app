import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, RefreshControl, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Screen } from '../components/Screen';
import { PaginationControls } from '../components/PaginationControls';
import { useAuth } from '../auth/useAuth';
import { getInventoryTransactions } from '../services/inventory';
import { InventoryTransaction } from '../types';
import { colors, radius, spacing, typography } from '../theme/tokens';

const typeTone = (type: InventoryTransaction['type']) => {
  if (type === 'receive') return { bg: '#dcfce7', text: '#166534' };
  if (type === 'issue') return { bg: '#fee2e2', text: '#991b1b' };
  return { bg: '#dbeafe', text: '#1d4ed8' };
};

export const AdminInventoryTransactionsScreen = () => {
  const { token } = useAuth();
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0, limit: 10 });
  const [search, setSearch] = useState('');
  const [lastUpdated, setLastUpdated] = useState('');

  const loadTransactions = async (isRefresh = false) => {
    if (!token) return;
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await getInventoryTransactions(token, { page: pagination.page, limit: pagination.limit });
      setTransactions(res.data);
      setPagination({
        page: res.pagination.page,
        totalPages: res.pagination.totalPages,
        total: res.pagination.total,
        limit: res.pagination.limit
      });
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (error) {
      Alert.alert('Error', String(error));
    } finally {
      if (isRefresh) setRefreshing(false);
      else setLoading(false);
    }
  };

  useEffect(() => {
    void loadTransactions();
  }, [token, pagination.page]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return transactions.filter((tx) => {
      if (!q) return true;
      return (
        tx.item?.name?.toLowerCase().includes(q) ||
        tx.item?.sku?.toLowerCase().includes(q) ||
        tx.reason?.toLowerCase().includes(q) ||
        tx.type.toLowerCase().includes(q)
      );
    });
  }, [transactions, search]);

  return (
    <Screen>
      <View style={styles.container}>
        <Text style={styles.title}>Inventory Transactions</Text>
        <Text style={styles.subtitle}>Last updated: {lastUpdated || '-'}</Text>

        <View style={styles.searchWrap}>
          <Ionicons name="search-outline" size={16} color={colors.textMuted} />
          <TextInput
            placeholder="Search item, SKU, reason, type"
            value={search}
            onChangeText={setSearch}
            style={styles.input}
            placeholderTextColor={colors.textMuted}
          />
        </View>

        {loading && !transactions.length ? (
          <ActivityIndicator />
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item._id}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadTransactions(true)} />}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => {
              const tone = typeTone(item.type);
              const qtyPositive = item.quantityChange >= 0;
              return (
                <View style={styles.card}>
                  <View style={styles.topRow}>
                    <View style={styles.titleWrap}>
                      <Text style={styles.itemTitle}>{item.item.name}</Text>
                      <Text style={styles.meta}>SKU {item.item.sku}</Text>
                    </View>
                    <View style={[styles.typePill, { backgroundColor: tone.bg }]}>
                      <Text style={[styles.typeText, { color: tone.text }]}>{item.type.toUpperCase()}</Text>
                    </View>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Quantity Change</Text>
                    <Text style={[styles.detailValue, qtyPositive ? styles.qtyPositive : styles.qtyNegative]}>
                      {qtyPositive ? '+' : ''}
                      {item.quantityChange}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Time</Text>
                    <Text style={styles.detailValue}>{new Date(item.createdAt).toLocaleString()}</Text>
                  </View>
                  {item.reason ? (
                    <View style={styles.reasonBox}>
                      <Text style={styles.reasonTitle}>Reason</Text>
                      <Text style={styles.reasonText}>{item.reason}</Text>
                    </View>
                  ) : null}
                </View>
              );
            }}
            ListFooterComponent={
              <PaginationControls
                page={pagination.page}
                totalPages={pagination.totalPages}
                totalItems={pagination.total}
                pageSize={pagination.limit}
                onPrev={() => setPagination((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                onNext={() => setPagination((prev) => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
              />
            }
          />
        )}
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: typography.title, fontWeight: '700', color: colors.text },
  subtitle: { color: colors.textMuted, marginTop: 2, marginBottom: spacing.md },
  searchWrap: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center'
  },
  input: { flex: 1, paddingVertical: 12, paddingLeft: spacing.sm, color: colors.text },
  listContent: { paddingTop: spacing.md, paddingBottom: spacing.xl },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md
  },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: spacing.sm },
  titleWrap: { flex: 1 },
  itemTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  meta: { color: colors.textMuted, marginTop: 4 },
  typePill: { borderRadius: radius.md, paddingHorizontal: spacing.sm, paddingVertical: 4 },
  typeText: { fontWeight: '700', fontSize: 12 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.sm },
  detailLabel: { color: colors.textMuted },
  detailValue: { color: colors.text, fontWeight: '700' },
  qtyPositive: { color: '#15803d' },
  qtyNegative: { color: '#b91c1c' },
  reasonBox: {
    marginTop: spacing.md,
    backgroundColor: '#f8fafc',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm
  },
  reasonTitle: { color: colors.text, fontWeight: '700', marginBottom: 2 },
  reasonText: { color: colors.textMuted }
});
