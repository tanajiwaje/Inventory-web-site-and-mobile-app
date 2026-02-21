import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { Screen } from '../components/Screen';
import { PaginationControls } from '../components/PaginationControls';
import { useAuth } from '../auth/useAuth';
import { createSupplier, deleteSupplier, getSuppliers } from '../services/entities';
import { Supplier } from '../types';
import { colors, radius, spacing, typography } from '../theme/tokens';

const emptyForm = {
  name: '',
  contactName: '',
  email: '',
  phone: '',
  address: ''
};

export const AdminSuppliersScreen = () => {
  const { token } = useAuth();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0, limit: 10 });
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });

  const loadSuppliers = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await getSuppliers(token, { page: pagination.page, limit: pagination.limit });
      setSuppliers(res.data);
      setPagination({
        page: res.pagination.page,
        totalPages: res.pagination.totalPages,
        total: res.pagination.total,
        limit: res.pagination.limit
      });
    } catch (error) {
      Alert.alert('Error', String(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadSuppliers();
  }, [token, pagination.page]);

  const filteredSuppliers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return suppliers.filter((supplier) => {
      if (!q) return true;
      return (
        supplier.name.toLowerCase().includes(q) ||
        supplier.contactName?.toLowerCase().includes(q) ||
        supplier.email?.toLowerCase().includes(q) ||
        supplier.phone?.toLowerCase().includes(q) ||
        supplier.address?.toLowerCase().includes(q)
      );
    });
  }, [suppliers, search]);

  const handleCreate = async () => {
    if (!token) return;
    if (!form.name.trim()) {
      Alert.alert('Validation', 'Supplier name is required.');
      return;
    }
    try {
      await createSupplier(token, {
        name: form.name.trim(),
        contactName: form.contactName.trim() || undefined,
        email: form.email.trim() || undefined,
        phone: form.phone.trim() || undefined,
        address: form.address.trim() || undefined
      });
      setForm({ ...emptyForm });
      setShowForm(false);
      await loadSuppliers();
    } catch (error) {
      Alert.alert('Error', String(error));
    }
  };

  const handleDelete = async (id: string) => {
    if (!token) return;
    Alert.alert('Confirm', 'Delete supplier?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteSupplier(token, id);
            await loadSuppliers();
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
        <View style={styles.headerRow}>
          <View style={styles.headerTextWrap}>
            <Text style={styles.title}>Suppliers</Text>
            <Text style={styles.subtitle}>View supplier details and add new suppliers when needed.</Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              setShowForm((prev) => !prev);
              if (showForm) setForm({ ...emptyForm });
            }}
          >
            <Text style={styles.addButtonText}>{showForm ? 'Close' : 'Add Supplier'}</Text>
          </TouchableOpacity>
        </View>

        {showForm ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Add Supplier</Text>
            <TextInput
              placeholder="Supplier name"
              value={form.name}
              onChangeText={(value) => setForm((prev) => ({ ...prev, name: value }))}
              style={styles.input}
            />
            <TextInput
              placeholder="Contact name"
              value={form.contactName}
              onChangeText={(value) => setForm((prev) => ({ ...prev, contactName: value }))}
              style={styles.input}
            />
            <TextInput
              placeholder="Email"
              value={form.email}
              onChangeText={(value) => setForm((prev) => ({ ...prev, email: value }))}
              style={styles.input}
              autoCapitalize="none"
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
              style={[styles.input, styles.textArea]}
              multiline
            />
            <TouchableOpacity style={styles.primaryButton} onPress={handleCreate}>
              <Text style={styles.primaryButtonText}>Create Supplier</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Supplier List</Text>
          <TextInput placeholder="Search suppliers" value={search} onChangeText={setSearch} style={styles.input} />
          {loading ? (
            <ActivityIndicator />
          ) : filteredSuppliers.length ? (
            filteredSuppliers.map((supplier) => (
              <View key={supplier._id} style={styles.listCard}>
                <Text style={styles.itemTitle}>{supplier.name}</Text>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Contact</Text>
                  <Text style={styles.detailValue}>{supplier.contactName || '-'}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Email</Text>
                  <Text style={styles.detailValue}>{supplier.email || '-'}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Phone</Text>
                  <Text style={styles.detailValue}>{supplier.phone || '-'}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Address</Text>
                  <Text style={styles.detailValue}>{supplier.address || '-'}</Text>
                </View>
                <View style={styles.actions}>
                  <TouchableOpacity onPress={() => handleDelete(supplier._id)} style={styles.deleteBtn}>
                    <Text style={styles.deleteText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No suppliers found.</Text>
          )}
          <PaginationControls
            page={pagination.page}
            totalPages={pagination.totalPages}
            totalItems={pagination.total}
            pageSize={pagination.limit}
            onPrev={() => setPagination((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
            onNext={() => setPagination((prev) => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
          />
        </View>
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: { paddingBottom: spacing.xl },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.sm, marginBottom: spacing.md },
  headerTextWrap: { flex: 1, paddingRight: spacing.xs },
  title: { fontSize: typography.title, fontWeight: '700', color: colors.text, marginBottom: spacing.xs },
  subtitle: { color: colors.textMuted },
  addButton: {
    minHeight: 40,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#93c5fd',
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center'
  },
  addButtonText: { color: colors.primary, fontWeight: '700' },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border
  },
  sectionTitle: { fontSize: typography.subtitle, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
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
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  primaryButton: {
    minHeight: 44,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xs
  },
  primaryButtonText: { color: '#fff', fontWeight: '700' },
  listCard: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm
  },
  itemTitle: { color: colors.text, fontWeight: '700', marginBottom: spacing.sm },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: spacing.md, marginBottom: spacing.xs },
  detailLabel: { color: colors.textMuted, minWidth: 68 },
  detailValue: { color: colors.text, fontWeight: '600', flex: 1, textAlign: 'right' },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: spacing.xs },
  deleteBtn: { minHeight: 36, justifyContent: 'center' },
  deleteText: { color: colors.danger, fontWeight: '700' },
  emptyText: { color: colors.textMuted, textAlign: 'center', marginVertical: spacing.md }
});
