import { useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, Modal, Pressable, RefreshControl, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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

type EditableLine = { itemId: string; name: string; quantity: number; cost: string };

const statusChips = [
  { key: 'all', label: 'All' },
  { key: 'requested', label: 'Requested' },
  { key: 'supplier_submitted', label: 'Submitted' },
  { key: 'approved', label: 'Approved' },
  { key: 'received', label: 'Received' }
];

const sortOptions = [
  { key: 'default', label: 'Default' },
  { key: 'supplier', label: 'Supplier Name' },
  { key: 'status', label: 'Status' },
  { key: 'items_desc', label: 'Items High to Low' }
];

export const SellerPurchaseOrdersScreen = () => {
  const { token } = useAuth();
  const { showToast, addNotification } = useUI();
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0, limit: 10 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('default');
  const [sortOpen, setSortOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [activeOrder, setActiveOrder] = useState<PurchaseOrder | null>(null);
  const [lineItems, setLineItems] = useState<EditableLine[]>([]);
  const [form, setForm] = useState({
    expectedDate: '',
    deliveryDate: '',
    paymentTerms: '',
    taxRate: '',
    shippingAddress: '',
    notes: ''
  });

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
      if (sortBy === 'supplier') return (a.supplier?.name || '').localeCompare(b.supplier?.name || '');
      if (sortBy === 'status') return a.status.localeCompare(b.status);
      if (sortBy === 'items_desc') return b.items.length - a.items.length;
      return 0;
    });
  }, [orders, search, statusFilter, sortBy]);

  const openPdf = async (orderId: string) => {
    if (!token) return;
    const url = `${API_BASE_URL}/api/purchase-orders/${orderId}/pdf?token=${encodeURIComponent(token)}`;
    await Linking.openURL(url);
  };

  const startEdit = (order: PurchaseOrder) => {
    setActiveOrder(order);
    setForm({
      expectedDate: order.expectedDate ?? '',
      deliveryDate: order.deliveryDate ?? '',
      paymentTerms: order.paymentTerms ?? '',
      taxRate: order.taxRate ? String(order.taxRate) : '',
      shippingAddress: order.shippingAddress ?? '',
      notes: order.notes ?? ''
    });
    setLineItems(
      order.items.map((line) => ({
        itemId: line.item._id,
        name: line.item.name,
        quantity: line.quantity,
        cost: String(line.cost)
      }))
    );
  };

  const saveEdit = async () => {
    if (!token || !activeOrder) return;
    try {
      await updatePurchaseOrder(token, activeOrder._id, {
        items: lineItems.map((line) => ({
          item: line.itemId,
          quantity: line.quantity,
          cost: Number(line.cost || 0)
        })),
        expectedDate: form.expectedDate || undefined,
        deliveryDate: form.deliveryDate || undefined,
        paymentTerms: form.paymentTerms || undefined,
        taxRate: form.taxRate ? Number(form.taxRate) : undefined,
        shippingAddress: form.shippingAddress || undefined,
        notes: form.notes || undefined
      });
      setActiveOrder(null);
      await loadOrders();
      showToast('Purchase order submitted.');
      addNotification('Order submitted', `Submitted response for ${activeOrder.supplier?.name || 'supplier'}.`);
    } catch (error) {
      Alert.alert('Error', String(error));
    }
  };

  return (
    <Screen>
      <View style={styles.container}>
        <Text style={styles.title}>Purchase Orders</Text>
        <Text style={styles.lastUpdated}>Last updated: {lastUpdated || '-'}</Text>

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
                icon="reader-outline"
                title="No purchase orders found"
                subtitle="Try a different filter to find purchase orders."
                actionLabel={search.trim() || statusFilter !== 'all' ? 'Reset Filters' : undefined}
                onAction={
                  search.trim() || statusFilter !== 'all'
                    ? () => {
                        setSearch('');
                        setStatusFilter('all');
                      }
                    : undefined
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
                    <Text style={styles.amount}>Expected: {item.expectedDate || '-'}</Text>
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
                        <Text style={styles.detailLabel}>Delivery date</Text>
                        <Text style={styles.detailValue}>{item.deliveryDate || '-'}</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Payment terms</Text>
                        <Text style={styles.detailValue}>{item.paymentTerms || '-'}</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Notes</Text>
                        <Text style={styles.detailValue}>{item.notes || '-'}</Text>
                      </View>
                    </View>
                  ) : null}

                  {item.status === 'requested' ? <PrimaryButton label="Respond / Submit" onPress={() => startEdit(item)} /> : null}
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

      <Modal visible={!!activeOrder} animationType="slide">
        <Screen>
          <FlatList
            data={lineItems}
            keyExtractor={(item) => item.itemId}
            ListHeaderComponent={<Text style={styles.title}>Submit Purchase Order</Text>}
            ListFooterComponent={
              <View>
                <DateInput label="Expected Date" value={form.expectedDate} onChange={(value) => setForm((prev) => ({ ...prev, expectedDate: value }))} />
                <DateInput label="Delivery Date" value={form.deliveryDate} onChange={(value) => setForm((prev) => ({ ...prev, deliveryDate: value }))} />
                <TextInput
                  placeholder="Payment Terms"
                  value={form.paymentTerms}
                  onChangeText={(value) => setForm((prev) => ({ ...prev, paymentTerms: value }))}
                  style={styles.input}
                />
                <TextInput
                  placeholder="Tax Rate (%)"
                  keyboardType="numeric"
                  value={form.taxRate}
                  onChangeText={(value) => setForm((prev) => ({ ...prev, taxRate: value }))}
                  style={styles.input}
                />
                <TextInput
                  placeholder="Shipping Address"
                  value={form.shippingAddress}
                  onChangeText={(value) => setForm((prev) => ({ ...prev, shippingAddress: value }))}
                  style={styles.input}
                />
                <TextInput
                  placeholder="Notes"
                  value={form.notes}
                  onChangeText={(value) => setForm((prev) => ({ ...prev, notes: value }))}
                  style={[styles.input, styles.textArea]}
                  multiline
                />

                <PrimaryButton label="Submit" onPress={saveEdit} />
                <TouchableOpacity style={styles.secondaryButton} onPress={() => setActiveOrder(null)}>
                  <Text style={styles.secondaryButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            }
            renderItem={({ item, index }) => (
              <View style={styles.lineRow}>
                <View style={styles.lineText}>
                  <Text style={styles.lineTitle}>{item.name}</Text>
                  <Text style={styles.lineMeta}>Qty {item.quantity}</Text>
                </View>
                <TextInput
                  placeholder="Cost"
                  keyboardType="numeric"
                  value={item.cost}
                  onChangeText={(value) => setLineItems((prev) => prev.map((row, idx) => (idx === index ? { ...row, cost: value } : row)))}
                  style={styles.inputSmall}
                />
              </View>
            )}
            contentContainerStyle={styles.listContent}
          />
        </Screen>
      </Modal>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: typography.title, fontWeight: '700', color: colors.text, marginBottom: spacing.md },
  lastUpdated: { color: colors.textMuted, marginTop: 2, marginBottom: spacing.xs },
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
  secondaryButton: {
    marginTop: spacing.sm,
    minHeight: 44,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center'
  },
  secondaryButtonText: { color: colors.text, fontWeight: '700' },
  lineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  lineText: { flex: 1, paddingRight: spacing.md },
  lineTitle: { fontWeight: '600', color: colors.text },
  lineMeta: { color: colors.textMuted, marginTop: spacing.xs },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md
  },
  inputSmall: {
    width: 110,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 8
  },
  textArea: { minHeight: 80, textAlignVertical: 'top' }
});
