import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Screen } from '../components/Screen';
import { PaginationControls } from '../components/PaginationControls';
import { useAuth } from '../auth/useAuth';
import { approveUser, getPendingUsers, rejectUser } from '../services/admin';
import { PendingUser } from '../types';
import { colors, radius, spacing, typography } from '../theme/tokens';

const PAGE_SIZE = 8;

export const AdminUsersScreen = () => {
  const { token } = useAuth();
  const [users, setUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  const loadUsers = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await getPendingUsers(token);
      setUsers(res);
      setPage(1);
    } catch (error) {
      Alert.alert('Error', String(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, [token]);

  const totalPages = Math.max(1, Math.ceil(users.length / PAGE_SIZE));

  const pagedUsers = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return users.slice(start, start + PAGE_SIZE);
  }, [users, page]);

  const handleApprove = async (id: string) => {
    if (!token) return;
    try {
      await approveUser(token, id);
      await loadUsers();
    } catch (error) {
      Alert.alert('Error', String(error));
    }
  };

  const handleReject = async (id: string) => {
    if (!token) return;
    try {
      await rejectUser(token, id);
      await loadUsers();
    } catch (error) {
      Alert.alert('Error', String(error));
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>User Onboarding</Text>
        <Text style={styles.subtitle}>Review pending registrations and approve or reject users.</Text>

        {loading ? (
          <ActivityIndicator />
        ) : pagedUsers.length ? (
          pagedUsers.map((user) => (
            <View key={user._id} style={styles.card}>
              <Text style={styles.cardTitle}>{user.name}</Text>
              <View style={styles.metaGrid}>
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Email</Text>
                  <Text style={styles.metaValue}>{user.email}</Text>
                </View>
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Role</Text>
                  <Text style={styles.metaValue}>{user.role}</Text>
                </View>
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Phone</Text>
                  <Text style={styles.metaValue}>{user.phone || '-'}</Text>
                </View>
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Company</Text>
                  <Text style={styles.metaValue}>{user.companyName || '-'}</Text>
                </View>
              </View>

              <View style={styles.actions}>
                <TouchableOpacity style={[styles.button, styles.approveButton]} onPress={() => handleApprove(user._id)}>
                  <Text style={styles.buttonText}>Approve</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, styles.rejectButton]} onPress={() => handleReject(user._id)}>
                  <Text style={styles.buttonText}>Reject</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No pending users</Text>
            <Text style={styles.emptyText}>All onboarding requests are already processed.</Text>
          </View>
        )}

        <PaginationControls
          page={page}
          totalPages={totalPages}
          totalItems={users.length}
          pageSize={PAGE_SIZE}
          onPrev={() => setPage((prev) => Math.max(1, prev - 1))}
          onNext={() => setPage((prev) => Math.min(totalPages, prev + 1))}
        />
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: { paddingBottom: spacing.xl },
  title: { fontSize: typography.title, fontWeight: '700', color: colors.text, marginBottom: spacing.xs },
  subtitle: { color: colors.textMuted, marginBottom: spacing.md },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  metaGrid: { gap: spacing.xs },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: spacing.md },
  metaLabel: { color: colors.textMuted, minWidth: 72 },
  metaValue: { color: colors.text, fontWeight: '600', flex: 1, textAlign: 'right' },
  actions: { flexDirection: 'row', marginTop: spacing.md, gap: spacing.sm },
  button: {
    flex: 1,
    minHeight: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center'
  },
  approveButton: { backgroundColor: '#16a34a' },
  rejectButton: { backgroundColor: colors.danger },
  buttonText: { color: '#fff', fontWeight: '700' },
  emptyCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center'
  },
  emptyTitle: { color: colors.text, fontWeight: '700' },
  emptyText: { color: colors.textMuted, marginTop: spacing.xs, textAlign: 'center' }
});
