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
import { useNavigation } from '@react-navigation/native';

import { Screen } from '../components/Screen';
import { DateInput } from '../components/DateInput';
import { useAuth } from '../auth/useAuth';
import { getInventoryItems } from '../services/inventory';
import { getCustomers } from '../services/entities';
import { createSalesOrder } from '../services/orders';
import { Customer, InventoryItem } from '../types';

type LineItem = {
  itemId: string;
  name: string;
  sku: string;
  quantity: string;
  price: string;
};

export const AdminSalesOrderCreateScreen = () => {
  const { token } = useAuth();
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [lineQuantity, setLineQuantity] = useState('');
  const [linePrice, setLinePrice] = useState('');
  const [form, setForm] = useState({
    deliveryDate: '',
    paymentTerms: '',
    taxRate: '',
    shippingAddress: '',
    notes: ''
  });

  const totalAmount = useMemo(
    () =>
      lineItems.reduce(
        (sum, line) => sum + Number(line.quantity || 0) * Number(line.price || 0),
        0
      ),
    [lineItems]
  );

  const loadData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [customersRes, itemsRes] = await Promise.all([
        getCustomers(token, { page: 1, limit: 100 }),
        getInventoryItems(token, { page: 1, limit: 200 })
      ]);
      setCustomers(customersRes.data);
      setItems(itemsRes.data);
    } catch (error) {
      Alert.alert('Error', String(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [token]);

  const handleSelectItem = (item: InventoryItem) => {
    setSelectedItem(item);
    setLinePrice(String(item.price));
    setLineQuantity('1');
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
    const line: LineItem = {
      itemId: selectedItem._id,
      name: selectedItem.name,
      sku: selectedItem.sku,
      quantity: lineQuantity,
      price: linePrice || String(selectedItem.price)
    };
    setLineItems((prev) => [...prev, line]);
    setSelectedItem(null);
    setLineQuantity('');
    setLinePrice('');
  };

  const removeLineItem = (itemId: string) => {
    setLineItems((prev) => prev.filter((line) => line.itemId !== itemId));
  };

  const handleCreate = async () => {
    if (!token) return;
    if (!customer) {
      Alert.alert('Validation', 'Select customer.');
      return;
    }
    if (!lineItems.length) {
      Alert.alert('Validation', 'Add at least one line item.');
      return;
    }
    try {
      await createSalesOrder(token, {
        customer: customer._id,
        status: 'requested',
        items: lineItems.map((line) => ({
          item: line.itemId,
          quantity: Number(line.quantity || 0),
          price: Number(line.price || 0)
        })),
        deliveryDate: form.deliveryDate || undefined,
        paymentTerms: form.paymentTerms || undefined,
        taxRate: form.taxRate ? Number(form.taxRate) : undefined,
        shippingAddress: form.shippingAddress || undefined,
        notes: form.notes || undefined
      });
      Alert.alert('Success', 'Sales order created.');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', String(error));
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Create Sales Order</Text>

        {loading ? (
          <ActivityIndicator />
        ) : (
          <>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Customer</Text>
              <TouchableOpacity
                style={styles.selector}
                onPress={() => setShowCustomerModal(true)}
              >
                <Text style={styles.selectorText}>
                  {customer ? customer.name : 'Select Customer'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Order Details</Text>
              <DateInput
                label="Delivery Date"
                value={form.deliveryDate}
                onChange={(value) => setForm((prev) => ({ ...prev, deliveryDate: value }))}
              />
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
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Line Items</Text>
              <TouchableOpacity style={styles.selector} onPress={() => setShowItemModal(true)}>
                <Text style={styles.selectorText}>
                  {selectedItem ? selectedItem.name : 'Select Item'}
                </Text>
              </TouchableOpacity>
              <TextInput
                placeholder="Quantity"
                keyboardType="numeric"
                value={lineQuantity}
                onChangeText={setLineQuantity}
                style={styles.input}
              />
              <TextInput
                placeholder="Price"
                keyboardType="numeric"
                value={linePrice}
                onChangeText={setLinePrice}
                style={styles.input}
              />
              <TouchableOpacity style={styles.primaryButton} onPress={addLineItem}>
                <Text style={styles.primaryButtonText}>Add Line Item</Text>
              </TouchableOpacity>

              {lineItems.map((line) => (
                <View key={line.itemId} style={styles.lineRow}>
                  <View style={styles.lineText}>
                    <Text style={styles.lineTitle}>{line.name}</Text>
                    <Text style={styles.lineMeta}>
                      Qty {line.quantity} · ₹{Number(line.price || 0).toFixed(2)}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => removeLineItem(line.itemId)}>
                    <Text style={styles.deleteText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              ))}

              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Subtotal</Text>
                <Text style={styles.totalValue}>₹{totalAmount.toFixed(2)}</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.primaryButton} onPress={handleCreate}>
              <Text style={styles.primaryButtonText}>Create Sales Order</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      <Modal visible={showCustomerModal} animationType="slide">
        <Screen>
          <Text style={styles.modalTitle}>Select Customer</Text>
          <ScrollView>
            {customers.map((row) => (
              <TouchableOpacity
                key={row._id}
                style={styles.modalItem}
                onPress={() => {
                  setCustomer(row);
                  setShowCustomerModal(false);
                }}
              >
                <Text style={styles.modalItemText}>{row.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => setShowCustomerModal(false)}
          >
            <Text style={styles.secondaryButtonText}>Close</Text>
          </TouchableOpacity>
        </Screen>
      </Modal>

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
                <Text style={styles.modalItemText}>{row.name}</Text>
                <Text style={styles.modalItemSub}>SKU {row.sku}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => setShowItemModal(false)}
          >
            <Text style={styles.secondaryButtonText}>Close</Text>
          </TouchableOpacity>
        </Screen>
      </Modal>
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
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#0f172a', marginBottom: 12 },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12
  },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  selector: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 12
  },
  selectorText: { color: '#0f172a' },
  primaryButton: {
    marginTop: 6,
    backgroundColor: '#0f172a',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center'
  },
  primaryButtonText: { color: '#fff', fontWeight: '600' },
  secondaryButton: {
    marginTop: 12,
    backgroundColor: '#e2e8f0',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center'
  },
  secondaryButtonText: { color: '#0f172a', fontWeight: '600' },
  lineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0'
  },
  lineText: { flex: 1, paddingRight: 12 },
  lineTitle: { fontWeight: '600', color: '#0f172a' },
  lineMeta: { color: '#64748b', marginTop: 4 },
  deleteText: { color: '#ef4444', fontWeight: '600' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  totalLabel: { fontWeight: '600', color: '#0f172a' },
  totalValue: { fontWeight: '700', color: '#0f172a' },
  modalTitle: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  modalItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0'
  },
  modalItemText: { fontWeight: '600', color: '#0f172a' },
  modalItemSub: { color: '#64748b', marginTop: 4 }
});
