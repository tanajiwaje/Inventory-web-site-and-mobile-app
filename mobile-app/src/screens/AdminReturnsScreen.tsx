import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Screen } from '../components/Screen';
import { PaginationControls } from '../components/PaginationControls';
import { SummaryStrip } from '../components/SummaryStrip';
import { useAuth } from '../auth/useAuth';
import { getInventoryItems } from '../services/inventory';
import { createReturn, deleteReturn, getReturns, updateReturn } from '../services/entities';
import { InventoryItem, ReturnEntry } from '../types';
import { colors, radius, spacing, typography } from '../theme/tokens';

type LineItem = {
  itemId: string;
  name: string;
  sku: string;
  quantity: string;
  reason: string;
};

const emptyForm = {
  type: 'customer' as 'customer' | 'supplier',
  notes: ''
};

const typeTone = (type: ReturnEntry['type']) =>
  type === 'customer'
    ? { bg: '#dbeafe', text: '#1d4ed8', icon: 'person-outline' as const }
    : { bg: '#dcfce7', text: '#166534', icon: 'business-outline' as const };

const statusTone = (status: ReturnEntry['status']) => {
  if (status === 'requested') return { bg: '#fef3c7', text: '#92400e' };
  if (status === 'received') return { bg: '#dbeafe', text: '#1d4ed8' };
  return { bg: '#dcfce7', text: '#166534' };
};

export const AdminReturnsScreen = () => {
  const { token } = useAuth();
  const [returns, setReturns] = useState<ReturnEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0, limit: 10 });
  const [search, setSearch] = useState('');
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [showItemModal, setShowItemModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [lineQuantity, setLineQuantity] = useState('');
  const [lineReason, setLineReason] = useState('');
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [form, setForm] = useState({ ...emptyForm });
  const [lastUpdated, setLastUpdated] = useState('');

  const loadAll = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [returnsRes, itemsRes] = await Promise.all([
        getReturns(token, { page: pagination.page, limit: pagination.limit }),
        getInventoryItems(token, { page: 1, limit: 200 })
      ]);
      setReturns(returnsRes.data);
      setPagination({
        page: returnsRes.pagination.page,
        totalPages: returnsRes.pagination.totalPages,
        total: returnsRes.pagination.total,
        limit: returnsRes.pagination.limit
      });
      setItems(itemsRes.data);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (error) {
      Alert.alert('Error', String(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAll();
  }, [token, pagination.page]);

  const handleSelectItem = (item: InventoryItem) => {
    setSelectedItem(item);
    setLineQuantity('1');
    setLineReason('');
    setShowItemModal(false);
  };

  const addLineItem = () => {
    if (!selectedItem) {
      Alert.alert('Validation', 'Select an item.');
      return;
    }
    if (lineItems.some((line) => line.itemId === selectedItem._id)) {
      Alert.alert('Validation', 'Item already added.');
      return;
    }
    if (!lineQuantity || Number(lineQuantity) <= 0) {
      Alert.alert('Validation', 'Enter quantity.');
      return;
    }
    setLineItems((prev) => [
      ...prev,
      {
        itemId: selectedItem._id,
        name: selectedItem.name,
        sku: selectedItem.sku,
        quantity: lineQuantity,
        reason: lineReason.trim()
      }
    ]);
    setSelectedItem(null);
    setLineQuantity('');
    setLineReason('');
  };

  const removeLineItem = (itemId: string) => {
    setLineItems((prev) => prev.filter((line) => line.itemId !== itemId));
  };

  const handleCreate = async () => {
    if (!token) return;
    if (!lineItems.length) {
      Alert.alert('Validation', 'Add at least one line item.');
      return;
    }
    try {
      await createReturn(token, {
        type: form.type,
        status: 'requested',
        notes: form.notes.trim() || undefined,
        items: lineItems.map((line) => ({
          item: line.itemId,
          quantity: Number(line.quantity || 0),
          reason: line.reason || undefined
        }))
      });
      setLineItems([]);
      setForm({ ...emptyForm });
      await loadAll();
      Alert.alert('Success', 'Return entry created.');
    } catch (error) {
      Alert.alert('Error', String(error));
    }
  };

  const handleUpdateStatus = async (entry: ReturnEntry, status: ReturnEntry['status']) => {
    if (!token) return;
    try {
      await updateReturn(token, entry._id, { status });
      await loadAll();
    } catch (error) {
      Alert.alert('Error', String(error));
    }
  };

  const handleDelete = async (id: string) => {
    if (!token) return;
    Alert.alert('Confirm', 'Delete return entry?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteReturn(token, id);
            await loadAll();
          } catch (error) {
            Alert.alert('Error', String(error));
          }
        }
      }
    ]);
  };

  const filteredReturns = useMemo(() => {
    const q = search.trim().toLowerCase();
    return returns.filter((entry) => {
      if (!q) return true;
      return (
        entry.status.toLowerCase().includes(q) ||
        entry.type.toLowerCase().includes(q) ||
        entry.notes?.toLowerCase().includes(q) ||
        entry.items.some(
          (line) =>
            line.item?.name?.toLowerCase().includes(q) ||
            line.item?.sku?.toLowerCase().includes(q) ||
            line.reason?.toLowerCase().includes(q)
        )
      );
    });
  }, [returns, search]);

  const summaryItems = useMemo(() => {
    const requested = filteredReturns.filter((r) => r.status === 'requested').length;
    const received = filteredReturns.filter((r) => r.status === 'received').length;
    const closed = filteredReturns.filter((r) => r.status === 'closed').length;
    const totalLines = filteredReturns.reduce((sum, entry) => sum + entry.items.length, 0);
    return [
      { label: 'Requested', value: requested },
      { label: 'Received', value: received },
      { label: 'Closed', value: closed },
      { label: 'Line Items', value: totalLines }
    ];
  }, [filteredReturns]);

  const selectedTypeTone = typeTone(form.type);

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Ionicons name="refresh-circle-outline" size={20} color={colors.primary} />
          </View>
          <View style={styles.headerTextWrap}>
            <Text style={styles.title}>Returns</Text>
            <Text style={styles.subtitle}>Manage customer and supplier return workflows in one place.</Text>
          </View>
        </View>

        <Text style={styles.lastUpdated}>Last updated: {lastUpdated || '-'}</Text>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Create Return</Text>

          <View style={styles.segmented}>
            {(['customer', 'supplier'] as const).map((type) => {
              const active = form.type === type;
              const tone = typeTone(type);
              return (
                <TouchableOpacity
                  key={type}
                  style={[styles.segmentBtn, active && styles.segmentBtnActive]}
                  onPress={() => setForm((prev) => ({ ...prev, type }))}
                >
                  <Ionicons name={tone.icon} size={14} color={active ? '#fff' : tone.text} />
                  <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={[styles.typeHint, { backgroundColor: selectedTypeTone.bg }]}>
            <Ionicons name={selectedTypeTone.icon} size={14} color={selectedTypeTone.text} />
            <Text style={[styles.typeHintText, { color: selectedTypeTone.text }]}>
              {form.type === 'customer' ? 'Customer return flow' : 'Supplier return flow'}
            </Text>
          </View>

          <TouchableOpacity style={styles.selector} onPress={() => setShowItemModal(true)}>
            <Ionicons name="cube-outline" size={16} color={colors.textMuted} />
            <Text style={styles.selectorText}>{selectedItem ? selectedItem.name : 'Select item'}</Text>
          </TouchableOpacity>

          <TextInput
            placeholder="Quantity"
            keyboardType="numeric"
            value={lineQuantity}
            onChangeText={setLineQuantity}
            style={styles.input}
          />
          <TextInput
            placeholder="Reason (optional)"
            value={lineReason}
            onChangeText={setLineReason}
            style={styles.input}
          />

          <TouchableOpacity style={styles.primaryButton} onPress={addLineItem}>
            <Ionicons name="add-circle-outline" size={16} color="#fff" />
            <Text style={styles.primaryButtonText}>Add Line Item</Text>
          </TouchableOpacity>

          {lineItems.length ? (
            <View style={styles.lineItemsWrap}>
              {lineItems.map((line) => (
                <View key={line.itemId} style={styles.lineCard}>
                  <View style={styles.lineHead}>
                    <View style={styles.lineTitleWrap}>
                      <Text style={styles.lineTitle}>{line.name}</Text>
                      <Text style={styles.lineMeta}>SKU {line.sku}</Text>
                    </View>
                    <TouchableOpacity onPress={() => removeLineItem(line.itemId)}>
                      <Text style={styles.deleteText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.lineMetaRow}>
                    <Text style={styles.metaLabel}>Quantity</Text>
                    <Text style={styles.metaValue}>{line.quantity}</Text>
                  </View>
                  <View style={styles.lineMetaRow}>
                    <Text style={styles.metaLabel}>Reason</Text>
                    <Text style={styles.metaValue}>{line.reason || '-'}</Text>
                  </View>
                </View>
              ))}
            </View>
          ) : null}

          <TextInput
            placeholder="Notes"
            value={form.notes}
            onChangeText={(value) => setForm((prev) => ({ ...prev, notes: value }))}
            style={[styles.input, styles.textArea]}
            multiline
          />
          <TouchableOpacity style={styles.primaryButton} onPress={handleCreate}>
            <Ionicons name="send-outline" size={16} color="#fff" />
            <Text style={styles.primaryButtonText}>Create Return</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Return Entries</Text>
          <SummaryStrip items={summaryItems} />

          <View style={styles.searchWrap}>
            <Ionicons name="search-outline" size={16} color={colors.textMuted} />
            <TextInput
              placeholder="Search status, type, notes, item, or SKU"
              value={search}
              onChangeText={setSearch}
              style={styles.searchInput}
              placeholderTextColor={colors.textMuted}
            />
          </View>

          {loading ? (
            <ActivityIndicator />
          ) : filteredReturns.length ? (
            filteredReturns.map((entry) => {
              const tone = typeTone(entry.type);
              const st = statusTone(entry.status);
              return (
                <View key={entry._id} style={styles.entryCard}>
                  <View style={styles.entryHead}>
                    <View style={[styles.typePill, { backgroundColor: tone.bg }]}>
                      <Ionicons name={tone.icon} size={12} color={tone.text} />
                      <Text style={[styles.typePillText, { color: tone.text }]}>{entry.type.toUpperCase()}</Text>
                    </View>
                    <View style={[styles.statusPill, { backgroundColor: st.bg }]}>
                      <Text style={[styles.statusPillText, { color: st.text }]}>{entry.status.toUpperCase()}</Text>
                    </View>
                  </View>

                  <Text style={styles.entryLineCount}>Items: {entry.items.length}</Text>

                  {entry.items.map((line, index) => (
                    <View key={`${entry._id}-${line.item._id}-${index}`} style={styles.entryLine}>
                      <View style={styles.entryLineTitleWrap}>
                        <Text style={styles.entryItem}>{line.item.name}</Text>
                        <Text style={styles.entrySku}>SKU {line.item.sku}</Text>
                      </View>
                      <Text style={styles.entryQty}>x{line.quantity}</Text>
                    </View>
                  ))}

                  {entry.notes ? (
                    <View style={styles.notesBox}>
                      <Text style={styles.notesLabel}>Notes</Text>
                      <Text style={styles.notesText}>{entry.notes}</Text>
                    </View>
                  ) : null}

                  <View style={styles.actionRow}>
                    {entry.status === 'requested' ? (
                      <TouchableOpacity
                        style={[styles.actionButton, styles.receiveButton]}
                        onPress={() => handleUpdateStatus(entry, 'received')}
                      >
                        <Ionicons name="checkmark-circle-outline" size={14} color="#1d4ed8" />
                        <Text style={[styles.actionButtonText, styles.receiveText]}>Mark Received</Text>
                      </TouchableOpacity>
                    ) : null}
                    {entry.status !== 'closed' ? (
                      <TouchableOpacity
                        style={[styles.actionButton, styles.closeButton]}
                        onPress={() => handleUpdateStatus(entry, 'closed')}
                      >
                        <Ionicons name="lock-closed-outline" size={14} color="#166534" />
                        <Text style={[styles.actionButtonText, styles.closeText]}>Close</Text>
                      </TouchableOpacity>
                    ) : null}
                    <TouchableOpacity
                      style={[styles.actionButton, styles.deleteButton]}
                      onPress={() => handleDelete(entry._id)}
                    >
                      <Ionicons name="trash-outline" size={14} color={colors.danger} />
                      <Text style={[styles.actionButtonText, styles.deleteActionText]}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          ) : (
            <View style={styles.emptyCard}>
              <Ionicons name="file-tray-outline" size={18} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>No returns found</Text>
              <Text style={styles.emptyText}>Create a return or adjust your search term.</Text>
            </View>
          )}

          <PaginationControls
            page={pagination.page}
            totalPages={pagination.totalPages}
            totalItems={pagination.total}
            pageSize={pagination.limit}
            onPrev={() => setPagination((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
            onNext={() =>
              setPagination((prev) => ({
                ...prev,
                page: Math.min(prev.totalPages, prev.page + 1)
              }))
            }
          />
        </View>
      </ScrollView>

      <Modal visible={showItemModal} animationType="slide">
        <Screen>
          <Text style={styles.modalTitle}>Select Item</Text>
          <ScrollView>
            {items.map((row) => (
              <TouchableOpacity
                key={row._id}
                style={styles.modalItem}
                onPress={() => handleSelectItem(row)}
              >
                <View style={styles.modalItemTop}>
                  <Text style={styles.modalItemText}>{row.name}</Text>
                  <Text style={styles.modalQty}>Qty {row.quantity}</Text>
                </View>
                <Text style={styles.modalItemSub}>
                  SKU {row.sku} {row.category ? `| ${row.category}` : ''}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity style={styles.secondaryButton} onPress={() => setShowItemModal(false)}>
            <Text style={styles.secondaryButtonText}>Close</Text>
          </TouchableOpacity>
        </Screen>
      </Modal>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: { paddingBottom: spacing.xl },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerTextWrap: { flex: 1 },
  title: { fontSize: typography.title, fontWeight: '700', color: colors.text },
  subtitle: { color: colors.textMuted, marginTop: 2 },
  lastUpdated: { color: colors.textMuted, marginBottom: spacing.md },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border
  },
  sectionTitle: { fontSize: typography.subtitle, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  segmented: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: radius.md,
    padding: 4,
    marginBottom: spacing.sm
  },
  segmentBtn: {
    flex: 1,
    minHeight: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.xs
  },
  segmentBtnActive: { backgroundColor: colors.primary },
  segmentText: { color: colors.text, fontWeight: '700', textTransform: 'capitalize' },
  segmentTextActive: { color: '#fff' },
  typeHint: {
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm
  },
  typeHintText: { fontWeight: '700' },
  selector: {
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm
  },
  selectorText: { color: colors.text, fontWeight: '600' },
  input: {
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    marginBottom: spacing.sm,
    color: colors.text
  },
  textArea: { minHeight: 84, textAlignVertical: 'top' },
  primaryButton: {
    minHeight: 44,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.xs
  },
  primaryButtonText: { color: '#fff', fontWeight: '700' },
  lineItemsWrap: { marginTop: spacing.sm, marginBottom: spacing.xs, gap: spacing.sm },
  lineCard: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md
  },
  lineHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: spacing.sm },
  lineTitleWrap: { flex: 1, paddingRight: spacing.xs },
  lineTitle: { color: colors.text, fontWeight: '700' },
  lineMeta: { color: colors.textMuted, marginTop: 2 },
  lineMetaRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xs, gap: spacing.md },
  metaLabel: { color: colors.textMuted, minWidth: 70 },
  metaValue: { color: colors.text, fontWeight: '600', flex: 1, textAlign: 'right' },
  deleteText: { color: colors.danger, fontWeight: '700' },
  searchWrap: {
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center'
  },
  searchInput: { flex: 1, color: colors.text, paddingVertical: 10, paddingLeft: spacing.sm },
  entryCard: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm
  },
  entryHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  typePill: {
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  typePillText: { fontWeight: '700', fontSize: 12 },
  statusPill: { borderRadius: radius.md, paddingHorizontal: spacing.sm, paddingVertical: 5 },
  statusPillText: { fontWeight: '700', fontSize: 12 },
  entryLineCount: { color: colors.textMuted, marginTop: spacing.xs, fontWeight: '600' },
  entryLine: {
    marginTop: spacing.xs,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm
  },
  entryLineTitleWrap: { flex: 1, paddingRight: spacing.xs },
  entryItem: { color: colors.text, fontWeight: '600' },
  entrySku: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  entryQty: { color: colors.text, fontWeight: '700' },
  notesBox: {
    marginTop: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.sm
  },
  notesLabel: { color: colors.text, fontWeight: '700', marginBottom: 2 },
  notesText: { color: colors.textMuted },
  actionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.sm },
  actionButton: {
    minHeight: 38,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  actionButtonText: { fontWeight: '700', fontSize: 12 },
  receiveButton: { backgroundColor: '#eff6ff', borderColor: '#bfdbfe' },
  receiveText: { color: '#1d4ed8' },
  closeButton: { backgroundColor: '#ecfdf5', borderColor: '#86efac' },
  closeText: { color: '#166534' },
  deleteButton: { backgroundColor: '#fef2f2', borderColor: '#fecaca' },
  deleteActionText: { color: colors.danger },
  emptyCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.sm
  },
  emptyTitle: { color: colors.text, fontWeight: '700', marginTop: spacing.xs },
  emptyText: { color: colors.textMuted, marginTop: spacing.xs, textAlign: 'center' },
  modalTitle: { fontSize: typography.title, fontWeight: '700', color: colors.text, marginBottom: spacing.md },
  modalItem: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  modalItemTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.sm },
  modalItemText: { color: colors.text, fontWeight: '700', flex: 1 },
  modalQty: {
    color: colors.primary,
    fontWeight: '700',
    backgroundColor: '#dbeafe',
    borderRadius: radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 2
  },
  modalItemSub: { color: colors.textMuted, marginTop: 4 },
  secondaryButton: {
    marginTop: spacing.md,
    minHeight: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center'
  },
  secondaryButtonText: { color: colors.text, fontWeight: '700' }
});
