import { useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Linking } from 'react-native';

import { Screen } from '../components/Screen';
import { DateInput } from '../components/DateInput';
import { PaginationControls } from '../components/PaginationControls';
import { EmptyState } from '../components/EmptyState';
import { PrimaryButton } from '../components/PrimaryButton';
import { OrderListSkeleton } from '../components/Skeleton';
import { FilterChips } from '../components/FilterChips';
import { SortSheet } from '../components/SortSheet';
import { StatusBadge } from '../components/StatusBadge';
import { useAuth } from '../auth/useAuth';
import { useUI } from '../ui/UIContext';
import { getPurchaseOrders, updatePurchaseOrder } from '../services/orders';
import { PurchaseOrder } from '../types';
import { API_BASE_URL } from '../config';
import { colors, radius, spacing, typography } from '../theme/tokens';

const statusChips = [
  { key: 'all', label: 'All' },
  { key: 'requested', label: 'Requested' },
  { key: 'supplier_submitted', label: 'Submitted' },
  { key: 'approved', label: 'Approved' },
  { key: 'received', label: 'Received' }
];

const sortOptions = [
  { key: 'default', label: 'Default' },
  { key: 'total_desc', label: 'Total High to Low' },
  { key: 'total_asc', label: 'Total Low to High' },
  { key: 'supplier', label: 'Supplier Name' },
  { key: 'status', label: 'Status' }
];

const getTotal = (order: PurchaseOrder) => order.items.reduce((sum, line) => sum + line.quantity * line.cost, 0);

export const AdminPurchaseOrdersScreen = () => {
  const { token } = useAuth();
  const { showToast, addNotification } = useUI();
  const navigation = useNavigation<any>();
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [receivedDates, setReceivedDates] = useState<Record<string, string>>({});
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0, limit: 10 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('default');
  const [sortOpen, setSortOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const loadOrders = async (isRefresh = false) => {
    if (!token) return;
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await getPurchaseOrders(token, { page: pagination.page, limit: pagination.limit });
      setOrders(res.data);
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
    void loadOrders();
  }, [token, pagination.page]);

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filtered = orders.filter((order) => {
      const matchesSearch =
        !query ||
        order.supplier?.name?.toLowerCase().includes(query) ||
        order.status.toLowerCase().includes(query) ||
        order._id.toLowerCase().includes(query);
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === 'total_desc') return getTotal(b) - getTotal(a);
      if (sortBy === 'total_asc') return getTotal(a) - getTotal(b);
      if (sortBy === 'supplier') return (a.supplier?.name || '').localeCompare(b.supplier?.name || '');
      if (sortBy === 'status') return a.status.localeCompare(b.status);
      return 0;
    });
  }, [orders, search, statusFilter, sortBy]);

  const handleApprove = async (order: PurchaseOrder) => {
    if (!token) return;
    try {
      await updatePurchaseOrder(token, order._id, { status: 'approved' });
      await loadOrders();
      showToast('Purchase order approved.');
      addNotification('Approval completed', `Order for ${order.supplier?.name || 'supplier'} was approved.`);
    } catch (error) {
      Alert.alert('Error', String(error));
    }
  };

  const handleReceive = async (order: PurchaseOrder) => {
    if (!token) return;
    const receivedDate = receivedDates[order._id];
    if (!receivedDate) {
      Alert.alert('Validation', 'Received date is required.');
      return;
    }
    try {
      await updatePurchaseOrder(token, order._id, { status: 'received', receivedDate });
      await loadOrders();
      showToast('Purchase order marked as received.');
      addNotification('Order received', `Received goods from ${order.supplier?.name || 'supplier'}.`);
    } catch (error) {
      Alert.alert('Error', String(error));
    }
  };

  const openPdf = async (orderId: string) => {
    if (!token) return;
    const url = `${API_BASE_URL}/api/purchase-orders/${orderId}/pdf?token=${encodeURIComponent(token)}`;
    await Linking.openURL(url);
  };

  return (
    <Screen>
      <View style={styles.container}>
        <Text style={styles.title}>Purchase Orders</Text>
        <Text style={styles.lastUpdated}>Last updated: {lastUpdated || '-'}</Text>
        <PrimaryButton label="New Purchase Order" onPress={() => navigation.navigate('AdminPurchaseOrderCreate')} style={styles.createBtn} />

        <View style={styles.searchWrap}>
          <Ionicons name="search-outline" size={16} color={colors.textMuted} />
          <TextInput
            placeholder="Search supplier, status, or order ID"
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
          />
        </View>

        <View style={styles.toolbarRow}>
          <FilterChips chips={statusChips} value={statusFilter} onChange={setStatusFilter} />
          <Pressable style={styles.sortBtn} onPress={() => setSortOpen(true)}>
            <Ionicons name="swap-vertical-outline" size={16} color={colors.text} />
            <Text style={styles.sortBtnText}>Sort</Text>
          </Pressable>
        </View>

        {loading && !orders.length ? (
          <OrderListSkeleton />
        ) : (
          <FlatList
            data={filteredOrders}
            keyExtractor={(item) => item._id}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadOrders(true)} />}
            ListEmptyComponent={
              <EmptyState
                icon="cube-outline"
                title="No purchase orders found"
                subtitle="Try a different filter or create a new purchase order."
                actionLabel={search.trim() || statusFilter !== 'all' ? 'Reset Filters' : 'Create Order'}
                onAction={
                  search.trim() || statusFilter !== 'all'
                    ? () => {
                        setSearch('');
                        setStatusFilter('all');
                      }
                    : () => navigation.navigate('AdminPurchaseOrderCreate')
                }
              />
            }
            renderItem={({ item }) => {
              const expanded = expandedId === item._id;
              return (
                <View style={styles.card}>
                  <View style={styles.row}>
                    <Text style={styles.cardTitle}>{item.supplier?.name ?? 'Supplier'}</Text>
                    <StatusBadge status={item.status} />
                  </View>
                  <View style={styles.metricRow}>
                    <Text style={styles.meta}>Items: {item.items.length}</Text>
                    <Text style={styles.amount}>INR {getTotal(item).toFixed(2)}</Text>
                  </View>
                  <TouchableOpacity style={styles.linkButton} onPress={() => openPdf(item._id)}>
                    <Text style={styles.linkText}>View PDF</Text>
                  </TouchableOpacity>

                  <Pressable style={styles.expandBtn} onPress={() => setExpandedId(expanded ? null : item._id)}>
                    <Text style={styles.expandText}>{expanded ? 'Hide details' : 'More details'}</Text>
                  </Pressable>

                  {expanded ? (
                    <View style={styles.details}>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Expected date</Text>
                        <Text style={styles.detailValue}>{item.expectedDate || '-'}</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Delivery date</Text>
                        <Text style={styles.detailValue}>{item.deliveryDate || '-'}</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Notes</Text>
                        <Text style={styles.detailValue}>{item.notes || '-'}</Text>
                      </View>
                    </View>
                  ) : null}

                  {item.status === 'supplier_submitted' ? <PrimaryButton label="Approve" onPress={() => handleApprove(item)} /> : null}

                  {item.status === 'approved' ? (
                    <View style={styles.receiveRow}>
                      <View style={styles.dateField}>
                        <DateInput
                          label="Received date"
                          value={receivedDates[item._id] ?? ''}
                          onChange={(value) => setReceivedDates((prev) => ({ ...prev, [item._id]: value }))}
                        />
                      </View>
                      <PrimaryButton label="Mark Received" onPress={() => handleReceive(item)} style={styles.receiveButton} />
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
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>

      <SortSheet visible={sortOpen} onClose={() => setSortOpen(false)} options={sortOptions} value={sortBy} onChange={setSortBy} />
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: typography.title, fontWeight: '700', color: colors.text },
  lastUpdated: { color: colors.textMuted, marginTop: 2, marginBottom: spacing.xs },
  createBtn: { marginTop: spacing.sm },
  searchWrap: {
    marginTop: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center'
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    paddingVertical: 10,
    paddingLeft: spacing.sm
  },
  toolbarRow: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm
  },
  sortBtn: {
    minHeight: 44,
    minWidth: 88,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs
  },
  sortBtnText: { color: colors.text, fontWeight: '600' },
  listContent: { paddingBottom: spacing.xl, paddingTop: spacing.sm },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.sm },
  cardTitle: { flex: 1, fontSize: typography.subtitle, fontWeight: '600', color: colors.text },
  metricRow: { marginTop: spacing.xs, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  meta: { color: colors.textMuted },
  amount: { color: colors.text, fontWeight: '700' },
  linkButton: { marginTop: spacing.sm, minHeight: 44, justifyContent: 'center' },
  linkText: { color: colors.primary, fontWeight: '700' },
  expandBtn: { minHeight: 44, justifyContent: 'center', marginTop: spacing.xs },
  expandText: { color: colors.textMuted, fontWeight: '600' },
  details: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: spacing.xs,
    paddingTop: spacing.sm,
    gap: spacing.xs
  },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.md },
  detailLabel: { color: colors.textMuted },
  detailValue: { color: colors.text, fontWeight: '600', flexShrink: 1, textAlign: 'right' },
  dateField: { flex: 1, marginRight: spacing.sm },
  receiveButton: { marginTop: 0, paddingHorizontal: spacing.md },
  receiveRow: { marginTop: spacing.md, flexDirection: 'row', alignItems: 'center' }
});
