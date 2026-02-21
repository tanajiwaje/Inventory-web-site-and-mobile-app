import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, RefreshControl, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Screen } from '../components/Screen';
import { PaginationControls } from '../components/PaginationControls';
import { useAuth } from '../auth/useAuth';
import { getInventoryStocks } from '../services/inventory';
import { InventoryStock } from '../types';
import { colors, radius, spacing, typography } from '../theme/tokens';

export const AdminInventoryStocksScreen = () => {
  const { token } = useAuth();
  const [stocks, setStocks] = useState<InventoryStock[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0, limit: 10 });
  const [search, setSearch] = useState('');
  const [lastUpdated, setLastUpdated] = useState('');

  const loadStocks = async (isRefresh = false) => {
    if (!token) return;
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await getInventoryStocks(token, { page: pagination.page, limit: pagination.limit });
      setStocks(res.data);
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
    void loadStocks();
  }, [token, pagination.page]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return stocks.filter((row) => {
      if (!q) return true;
      return (
        row.item?.name?.toLowerCase().includes(q) ||
        row.item?.sku?.toLowerCase().includes(q) ||
        row.location?.name?.toLowerCase().includes(q) ||
        row.location?.code?.toLowerCase().includes(q)
      );
    });
  }, [stocks, search]);

  const totalQuantity = useMemo(() => filtered.reduce((sum, row) => sum + (row.quantity || 0), 0), [filtered]);

  return (
    <Screen>
      <View style={styles.container}>
        <Text style={styles.title}>Stock by Location</Text>
        <Text style={styles.subtitle}>Total quantity: {totalQuantity} | Last updated: {lastUpdated || '-'}</Text>

        <View style={styles.searchWrap}>
          <Ionicons name="search-outline" size={16} color={colors.textMuted} />
          <TextInput
            placeholder="Search item, SKU, location"
            value={search}
            onChangeText={setSearch}
            style={styles.input}
            placeholderTextColor={colors.textMuted}
          />
        </View>

        {loading && !stocks.length ? (
          <ActivityIndicator />
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item._id}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadStocks(true)} />}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <View style={styles.topRow}>
                  <View style={styles.titleWrap}>
                    <Text style={styles.itemTitle}>{item.item?.name ?? '-'}</Text>
                    <Text style={styles.meta}>SKU {item.item?.sku ?? '-'}</Text>
                  </View>
                  <View style={styles.qtyPill}>
                    <Text style={styles.qtyText}>Qty {item.quantity}</Text>
                  </View>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Location</Text>
                  <Text style={styles.detailValue}>{item.location?.name ?? '-'}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Code</Text>
                  <Text style={styles.detailValue}>{item.location?.code || '-'}</Text>
                </View>
              </View>
            )}
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
  qtyPill: { borderRadius: radius.md, backgroundColor: '#dbeafe', paddingHorizontal: spacing.sm, paddingVertical: 4 },
  qtyText: { color: colors.primary, fontWeight: '700' },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.sm },
  detailLabel: { color: colors.textMuted },
  detailValue: { color: colors.text, fontWeight: '700' }
});
