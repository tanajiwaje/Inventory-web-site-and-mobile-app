import { useEffect, useState } from 'react';
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

import { useNavigation } from '@react-navigation/native';

import { Screen } from '../components/Screen';
import { useAuth } from '../auth/useAuth';
import {
  adjustInventoryStock,
  createInventoryItem,
  deleteInventoryItem,
  getInventoryItems,
  updateInventoryItem
} from '../services/inventory';
import { InventoryItem, Location } from '../types';
import { getLocations } from '../services/entities';
import { colors, radius, spacing, typography } from '../theme/tokens';

const emptyForm = {
  name: '',
  sku: '',
  quantity: '0',
  cost: '',
  price: '',
  category: '',
  lowStockThreshold: '0',
  description: ''
};

export const AdminInventoryScreen = () => {
  const { token } = useAuth();
  const navigation = useNavigation<any>();
  const [activeSection, setActiveSection] = useState<'item' | 'stock'>('item');
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showItemForm, setShowItemForm] = useState(false);
  const [locations, setLocations] = useState<Location[]>([]);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [adjustForm, setAdjustForm] = useState({
    itemId: '',
    itemName: '',
    locationId: '',
    locationName: '',
    type: 'receive' as 'receive' | 'issue' | 'adjust',
    quantity: '',
    reason: ''
  });
  const formatMoney = (value: number) => `INR ${value.toFixed(2)}`;

  const loadItems = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [itemsRes, locationsRes] = await Promise.all([
        getInventoryItems(token, {
          page: pagination.page,
          limit: 10,
          search: search.trim() || undefined,
          category: category || undefined,
          lowStock: lowStockOnly || undefined
        }),
        getLocations(token, { page: 1, limit: 100 })
      ]);
      setItems(itemsRes.data);
      setPagination(itemsRes.pagination);
      setLocations(locationsRes.data);
    } catch (error) {
      Alert.alert('Error', String(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadItems();
  }, [token, pagination.page, search, category, lowStockOnly]);

  const handleCreate = async () => {
    if (!token) return;
    if (!form.name || !form.sku) {
      Alert.alert('Validation', 'Name and SKU are required.');
      return;
    }
    try {
      const payload = {
        name: form.name,
        sku: form.sku,
        quantity: Number(form.quantity || 0),
        cost: Number(form.cost || 0),
        price: Number(form.price || 0),
        category: form.category || undefined,
        lowStockThreshold: Number(form.lowStockThreshold || 0),
        description: form.description || undefined
      };
      if (editingId) {
        await updateInventoryItem(token, editingId, payload);
        setEditingId(null);
      } else {
        await createInventoryItem(token, payload);
      }
      setForm({ ...emptyForm });
      setShowItemForm(false);
      await loadItems();
    } catch (error) {
      Alert.alert('Error', String(error));
    }
  };

  const startEdit = (item: InventoryItem) => {
    setEditingId(item._id);
    setShowItemForm(true);
    setForm({
      name: item.name,
      sku: item.sku,
      quantity: String(item.quantity),
      cost: String(item.cost),
      price: String(item.price),
      category: item.category ?? '',
      lowStockThreshold: String(item.lowStockThreshold ?? 0),
      description: item.description ?? ''
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setShowItemForm(false);
    setForm({ ...emptyForm });
  };

  const resetAndSearch = () => {
    setPagination((prev) => ({ ...prev, page: 1 }));
    void loadItems();
  };

  const handleAdjust = async () => {
    if (!token) return;
    if (!adjustForm.itemId || !adjustForm.quantity) {
      Alert.alert('Validation', 'Select an item and quantity.');
      return;
    }
    try {
      await adjustInventoryStock(token, {
        itemId: adjustForm.itemId,
        locationId: adjustForm.locationId || undefined,
        type: adjustForm.type,
        quantity: Number(adjustForm.quantity),
        reason: adjustForm.reason || undefined
      });
      setAdjustForm({
        itemId: '',
        itemName: '',
        locationId: '',
        locationName: '',
        type: 'receive',
        quantity: '',
        reason: ''
      });
      await loadItems();
    } catch (error) {
      Alert.alert('Error', String(error));
    }
  };

  const handleDelete = async (id: string) => {
    if (!token) return;
    Alert.alert('Confirm', 'Delete this item?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteInventoryItem(token, id);
            await loadItems();
          } catch (error) {
            Alert.alert('Error', String(error));
          }
        }
      }
    ]);
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Inventory</Text>
        <Text style={styles.subtitle}>Professional stock control with cleaner search, item setup, and adjustment workflows.</Text>
        <View style={styles.sectionSwitch}>
          <TouchableOpacity
            style={[styles.sectionSwitchButton, activeSection === 'item' && styles.sectionSwitchButtonActive]}
            onPress={() => setActiveSection('item')}
          >
            <Text style={[styles.sectionSwitchText, activeSection === 'item' && styles.sectionSwitchTextActive]}>Item</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sectionSwitchButton, activeSection === 'stock' && styles.sectionSwitchButtonActive]}
            onPress={() => setActiveSection('stock')}
          >
            <Text style={[styles.sectionSwitchText, activeSection === 'stock' && styles.sectionSwitchTextActive]}>Stock</Text>
          </TouchableOpacity>
        </View>

        {activeSection === 'item' ? (
          <View style={styles.card}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionHeaderTextWrap}>
              <Text style={styles.sectionTitle}>Item Section</Text>
              <Text style={styles.sectionSub}>Add, edit, search and manage items in one place.</Text>
            </View>
            <TouchableOpacity
              style={styles.inlineAddButton}
              onPress={() => {
                setEditingId(null);
                setForm({ ...emptyForm });
                setShowItemForm((prev) => !prev);
              }}
            >
            <Text style={styles.inlineAddButtonText}>
                {showItemForm && !editingId ? 'Hide Form' : 'Add Item'}
              </Text>
            </TouchableOpacity>
          </View>

          {(showItemForm || !!editingId) ? (
            <View style={styles.formWrap}>
              <Text style={styles.formTitle}>{editingId ? 'Edit Item' : 'Add Item'}</Text>
              <View style={styles.fieldGroup}>
                <TextInput
                  placeholder="Name"
                  value={form.name}
                  onChangeText={(value) => setForm((prev) => ({ ...prev, name: value }))}
                  style={styles.input}
                />
                <TextInput
                  placeholder="SKU"
                  value={form.sku}
                  onChangeText={(value) => setForm((prev) => ({ ...prev, sku: value }))}
                  style={styles.input}
                />
                <TextInput
                  placeholder="Quantity"
                  keyboardType="numeric"
                  value={form.quantity}
                  onChangeText={(value) => setForm((prev) => ({ ...prev, quantity: value }))}
                  style={styles.input}
                />
                <TextInput
                  placeholder="Cost"
                  keyboardType="numeric"
                  value={form.cost}
                  onChangeText={(value) => setForm((prev) => ({ ...prev, cost: value }))}
                  style={styles.input}
                />
                <TextInput
                  placeholder="Price"
                  keyboardType="numeric"
                  value={form.price}
                  onChangeText={(value) => setForm((prev) => ({ ...prev, price: value }))}
                  style={styles.input}
                />
                <TextInput
                  placeholder="Category"
                  value={form.category}
                  onChangeText={(value) => setForm((prev) => ({ ...prev, category: value }))}
                  style={styles.input}
                />
                <TextInput
                  placeholder="Low stock threshold"
                  keyboardType="numeric"
                  value={form.lowStockThreshold}
                  onChangeText={(value) => setForm((prev) => ({ ...prev, lowStockThreshold: value }))}
                  style={styles.input}
                />
                <TextInput
                  placeholder="Description"
                  value={form.description}
                  onChangeText={(value) => setForm((prev) => ({ ...prev, description: value }))}
                  style={[styles.input, styles.textArea]}
                  multiline
                />
              </View>
              <TouchableOpacity style={styles.primaryButton} onPress={handleCreate}>
                <Text style={styles.primaryButtonText}>
                  {editingId ? 'Update Item' : 'Create Item'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryButton} onPress={cancelEdit}>
                <Text style={styles.secondaryButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          <Text style={styles.sectionTitle}>Search and Filter</Text>
          <Text style={styles.sectionSub}>Filter by SKU/name, category, and low stock risk.</Text>
          <TextInput
            placeholder="Search by name or SKU"
            value={search}
            onChangeText={setSearch}
            style={styles.input}
          />
          <TouchableOpacity style={styles.selector} onPress={() => setShowCategoryModal(true)}>
            <Text style={styles.selectorText}>
              {category ? `Category: ${category}` : 'Filter by category'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggle, lowStockOnly && styles.toggleActive]}
            onPress={() => setLowStockOnly((prev) => !prev)}
          >
            <Text style={[styles.toggleText, lowStockOnly && styles.toggleTextActive]}>
              {lowStockOnly ? 'Showing Low Stock Only' : 'Low Stock Only'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.primaryButton} onPress={resetAndSearch}>
            <Text style={styles.primaryButtonText}>Apply Filters</Text>
          </TouchableOpacity>
          <Text style={styles.sectionTitle}>Items List</Text>
          <Text style={styles.sectionSub}>Track stock health, pricing, and quick actions per item.</Text>
          {loading ? (
            <ActivityIndicator />
          ) : (
            items.map((item) => (
              <View key={item._id} style={styles.listItem}>
                <View style={styles.listText}>
                  <Text style={styles.itemTitle}>{item.name}</Text>
                  <Text style={styles.itemMeta}>
                    SKU {item.sku} | Qty {item.quantity}
                  </Text>
                  <Text style={styles.itemMeta}>
                    {item.category ? `Category ${item.category}` : 'No category'} |{' '}
                    {item.barcode ? `Barcode ${item.barcode}` : 'No barcode'}
                  </Text>
                  <Text style={styles.itemMeta}>
                    Price {formatMoney(item.price)} | Cost {formatMoney(item.cost)}
                  </Text>
                  <Text
                    style={[
                      styles.stockBadge,
                      item.quantity <= item.lowStockThreshold ? styles.stockLow : styles.stockOk
                    ]}
                  >
                    {item.quantity <= item.lowStockThreshold ? 'Low stock' : 'Stock ok'}
                  </Text>
                </View>
                <View style={styles.itemActions}>
                  <TouchableOpacity
                    onPress={() =>
                      setAdjustForm((prev) => ({
                        ...prev,
                        itemId: item._id,
                        itemName: item.name
                      }))
                    }
                  >
                    <Text style={styles.adjustText}>Adjust</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => startEdit(item)}>
                    <Text style={styles.editText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(item._id)}>
                    <Text style={styles.deleteText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
          <View style={styles.paginationRow}>
            <TouchableOpacity
              style={[styles.secondaryButton, pagination.page <= 1 && styles.disabledButton]}
              onPress={() =>
                setPagination((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))
              }
              disabled={pagination.page <= 1}
            >
              <Text style={styles.secondaryButtonText}>Prev</Text>
            </TouchableOpacity>
            <Text style={styles.paginationText}>
              Page {pagination.page} of {pagination.totalPages}
            </Text>
            <TouchableOpacity
              style={[
                styles.secondaryButton,
                pagination.page >= pagination.totalPages && styles.disabledButton
              ]}
              onPress={() =>
                setPagination((prev) => ({
                  ...prev,
                  page: Math.min(prev.totalPages, prev.page + 1)
                }))
              }
              disabled={pagination.page >= pagination.totalPages}
            >
              <Text style={styles.secondaryButtonText}>Next</Text>
            </TouchableOpacity>
          </View>
        </View>
        ) : null}

        {activeSection === 'stock' ? (
          <View style={styles.card}>
          <Text style={styles.sectionTitle}>Stock Section</Text>
          <Text style={styles.sectionSub}>Adjust stock and access transaction/location views quickly.</Text>
          <Text style={styles.helperText}>
            Selected: {adjustForm.itemName || 'None'}
          </Text>
          <TouchableOpacity
            style={styles.selector}
            onPress={() => setShowLocationModal(true)}
          >
            <Text style={styles.selectorText}>
              {adjustForm.locationName ? `Location: ${adjustForm.locationName}` : 'Default location'}
            </Text>
          </TouchableOpacity>
          <View style={styles.segmented}>
            {(['receive', 'issue', 'adjust'] as const).map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.segmentButton,
                  adjustForm.type === type && styles.segmentActive
                ]}
                onPress={() => setAdjustForm((prev) => ({ ...prev, type }))}
              >
                <Text
                  style={[
                    styles.segmentText,
                    adjustForm.type === type && styles.segmentTextActive
                  ]}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TextInput
            placeholder="Quantity"
            keyboardType="numeric"
            value={adjustForm.quantity}
            onChangeText={(value) => setAdjustForm((prev) => ({ ...prev, quantity: value }))}
            style={styles.input}
          />
          <TextInput
            placeholder="Reason (optional)"
            value={adjustForm.reason}
            onChangeText={(value) => setAdjustForm((prev) => ({ ...prev, reason: value }))}
            style={styles.input}
          />
          <TouchableOpacity style={styles.primaryButton} onPress={handleAdjust}>
            <Text style={styles.primaryButtonText}>Apply Adjustment</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('AdminInventoryTransactions')}
          >
            <Text style={styles.secondaryButtonText}>View Transactions</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('AdminInventoryStocks')}
          >
            <Text style={styles.secondaryButtonText}>Stock by Location</Text>
          </TouchableOpacity>
        </View>
        ) : null}
      </ScrollView>

      <Modal visible={showLocationModal} animationType="slide">
        <Screen>
          <Text style={styles.modalTitle}>Select Location</Text>
          <ScrollView>
            <TouchableOpacity
              style={styles.modalItem}
              onPress={() => {
                setAdjustForm((prev) => ({
                  ...prev,
                  locationId: '',
                  locationName: ''
                }));
                setShowLocationModal(false);
              }}
            >
              <Text style={styles.modalItemText}>Default location</Text>
            </TouchableOpacity>
            {locations.map((row) => (
              <TouchableOpacity
                key={row._id}
                style={styles.modalItem}
                onPress={() => {
                  setAdjustForm((prev) => ({
                    ...prev,
                    locationId: row._id,
                    locationName: row.name
                  }));
                  setShowLocationModal(false);
                }}
              >
                <Text style={styles.modalItemText}>{row.name}</Text>
                <Text style={styles.modalItemSub}>{row.code || row.address || ''}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => setShowLocationModal(false)}
          >
            <Text style={styles.secondaryButtonText}>Close</Text>
          </TouchableOpacity>
        </Screen>
      </Modal>

      <Modal visible={showCategoryModal} animationType="slide">
        <Screen>
          <Text style={styles.modalTitle}>Select Category</Text>
          <ScrollView>
            <TouchableOpacity
              style={styles.modalItem}
              onPress={() => {
                setCategory('');
                setShowCategoryModal(false);
              }}
            >
              <Text style={styles.modalItemText}>All categories</Text>
            </TouchableOpacity>
            {Array.from(new Set(items.map((item) => item.category).filter(Boolean))).map(
              (cat) => (
                <TouchableOpacity
                  key={cat as string}
                  style={styles.modalItem}
                  onPress={() => {
                    setCategory(cat as string);
                    setShowCategoryModal(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{cat as string}</Text>
                </TouchableOpacity>
              )
            )}
          </ScrollView>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => setShowCategoryModal(false)}
          >
            <Text style={styles.secondaryButtonText}>Close</Text>
          </TouchableOpacity>
        </Screen>
      </Modal>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: { paddingBottom: spacing.xl },
  title: { fontSize: typography.title, fontWeight: '700', color: colors.text, marginBottom: spacing.xs },
  subtitle: { color: colors.textMuted, marginBottom: spacing.md },
  sectionSwitch: {
    flexDirection: 'row',
    backgroundColor: '#e2e8f0',
    borderRadius: radius.md,
    padding: 4,
    marginBottom: spacing.md
  },
  sectionSwitchButton: {
    flex: 1,
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10
  },
  sectionSwitchButtonActive: {
    backgroundColor: colors.primary
  },
  sectionSwitchText: {
    color: colors.text,
    fontWeight: '700'
  },
  sectionSwitchTextActive: {
    color: '#fff'
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border
  },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: spacing.sm, marginBottom: spacing.sm },
  sectionHeaderTextWrap: { flex: 1, paddingRight: spacing.xs },
  inlineAddButton: {
    minHeight: 40,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#93c5fd',
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start'
  },
  inlineAddButtonText: { color: colors.primary, fontWeight: '700' },
  sectionTitle: { fontSize: typography.subtitle, fontWeight: '700', marginBottom: spacing.xs, color: colors.text },
  sectionSub: { color: colors.textMuted, marginBottom: spacing.sm },
  formWrap: {
    marginBottom: spacing.md,
    backgroundColor: '#f8fbff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: radius.md,
    padding: spacing.md
  },
  formTitle: { color: colors.text, fontWeight: '700', marginBottom: spacing.sm },
  fieldGroup: { gap: spacing.sm },
  input: {
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    color: colors.text
  },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  primaryButton: {
    marginTop: spacing.md,
    backgroundColor: colors.primary,
    minHeight: 44,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center'
  },
  primaryButtonText: { color: '#fff', fontWeight: '700' },
  secondaryButton: {
    marginTop: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 44,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center'
  },
  secondaryButtonText: { color: colors.text, fontWeight: '700' },
  disabledButton: { opacity: 0.5 },
  helperText: { color: colors.textMuted, marginBottom: spacing.xs },
  selector: {
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    marginBottom: spacing.sm
  },
  selectorText: { color: colors.text, fontWeight: '600' },
  toggle: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    minHeight: 44,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm
  },
  toggleActive: { backgroundColor: '#dbeafe', borderColor: '#93c5fd' },
  toggleText: { color: colors.text, fontWeight: '700' },
  toggleTextActive: { color: colors.primary },
  segmented: {
    flexDirection: 'row',
    backgroundColor: '#e2e8f0',
    borderRadius: radius.md,
    padding: 4,
    marginBottom: spacing.sm
  },
  segmentButton: { flex: 1, minHeight: 40, paddingVertical: 8, alignItems: 'center', justifyContent: 'center', borderRadius: 10 },
  segmentActive: { backgroundColor: colors.primary },
  segmentText: { color: colors.text, fontWeight: '700' },
  segmentTextActive: { color: '#ffffff' },
  listItem: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm
  },
  listText: { flex: 1, paddingRight: 12 },
  itemTitle: { fontWeight: '700', color: colors.text, fontSize: 15 },
  itemMeta: { color: colors.textMuted, fontSize: 12, marginTop: 4 },
  stockBadge: {
    marginTop: spacing.sm,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '700'
  },
  stockLow: { backgroundColor: '#fee2e2', color: '#b91c1c' },
  stockOk: { backgroundColor: '#dcfce7', color: '#15803d' },
  itemActions: { marginTop: spacing.sm, flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.md },
  editText: { color: colors.primary, fontWeight: '700' },
  adjustText: { color: '#0284c7', fontWeight: '700' },
  deleteText: { color: colors.danger, fontWeight: '700' },
  paginationRow: {
    marginTop: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  paginationText: { color: colors.textMuted },
  modalTitle: { fontSize: 20, fontWeight: '700', marginBottom: spacing.md, color: colors.text },
  modalItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  modalItemText: { fontWeight: '700', color: colors.text },
  modalItemSub: { color: colors.textMuted, marginTop: 4 }
});
