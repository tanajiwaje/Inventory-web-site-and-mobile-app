import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Screen } from '../components/Screen';
import { PaginationControls } from '../components/PaginationControls';
import { useAuth } from '../auth/useAuth';
import { getAuditLogs } from '../services/entities';
import { AuditLog } from '../types';
import { colors, radius, spacing, typography } from '../theme/tokens';

const actionTone = (action: string) => {
  const key = action.toLowerCase();
  if (key.includes('delete') || key.includes('reject')) {
    return { bg: '#fee2e2', text: '#991b1b', icon: 'trash-outline' as const };
  }
  if (key.includes('create') || key.includes('approve')) {
    return { bg: '#dcfce7', text: '#166534', icon: 'checkmark-done-outline' as const };
  }
  if (key.includes('update')) {
    return { bg: '#dbeafe', text: '#1d4ed8', icon: 'create-outline' as const };
  }
  return { bg: '#e2e8f0', text: '#334155', icon: 'document-text-outline' as const };
};

export const AdminAuditLogsScreen = () => {
  const { token } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0, limit: 10 });
  const [search, setSearch] = useState('');
  const [lastUpdated, setLastUpdated] = useState('');

  const loadLogs = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await getAuditLogs(token, { page: pagination.page, limit: 10 });
      setLogs(res.data);
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
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadLogs();
  }, [token, pagination.page]);

  const filteredLogs = useMemo(() => {
    const q = search.trim().toLowerCase();
    return logs.filter((log) => {
      if (!q) return true;
      return (
        log.entity.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        log.message?.toLowerCase().includes(q) ||
        log.entityId.toLowerCase().includes(q)
      );
    });
  }, [logs, search]);

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerIconWrap}>
            <Ionicons name="shield-checkmark-outline" size={18} color={colors.primary} />
          </View>
          <View style={styles.headerTextWrap}>
            <Text style={styles.title}>Audit Logs</Text>
            <Text style={styles.subtitle}>Track all major actions and entity changes.</Text>
          </View>
        </View>

        <Text style={styles.lastUpdated}>Last updated: {lastUpdated || '-'}</Text>

        <View style={styles.searchWrap}>
          <Ionicons name="search-outline" size={16} color={colors.textMuted} />
          <TextInput
            placeholder="Search entity, action, message, or entity ID"
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
            placeholderTextColor={colors.textMuted}
          />
        </View>

        {loading ? (
          <ActivityIndicator />
        ) : filteredLogs.length ? (
          filteredLogs.map((log) => {
            const tone = actionTone(log.action);
            return (
              <View key={log._id} style={styles.card}>
                <View style={styles.topRow}>
                  <View style={styles.entityWrap}>
                    <Ionicons name="layers-outline" size={14} color={colors.textMuted} />
                    <Text style={styles.entity}>{log.entity}</Text>
                  </View>
                  <View style={[styles.actionPill, { backgroundColor: tone.bg }]}>
                    <Ionicons name={tone.icon} size={12} color={tone.text} />
                    <Text style={[styles.actionText, { color: tone.text }]}>{log.action}</Text>
                  </View>
                </View>

                {log.message ? (
                  <View style={styles.messageBox}>
                    <Text style={styles.messageText}>{log.message}</Text>
                  </View>
                ) : null}

                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Entity ID</Text>
                  <Text style={styles.metaValue}>{log.entityId}</Text>
                </View>
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Time</Text>
                  <Text style={styles.metaValue}>{new Date(log.createdAt).toLocaleString()}</Text>
                </View>
              </View>
            );
          })
        ) : (
          <View style={styles.emptyCard}>
            <Ionicons name="file-tray-outline" size={18} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>No audit logs found</Text>
            <Text style={styles.emptyText}>Try changing your search term or refresh data.</Text>
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
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: { paddingBottom: spacing.xl },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  headerIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerTextWrap: { flex: 1 },
  title: { fontSize: typography.title, fontWeight: '700', color: colors.text },
  subtitle: { color: colors.textMuted, marginTop: 2 },
  lastUpdated: { color: colors.textMuted, marginBottom: spacing.sm },
  searchWrap: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    paddingVertical: 10,
    paddingLeft: spacing.sm
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border
  },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  entityWrap: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, flex: 1 },
  entity: { color: colors.text, fontWeight: '700', textTransform: 'capitalize' },
  actionPill: {
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  actionText: { fontWeight: '700', fontSize: 12, textTransform: 'uppercase' },
  messageBox: {
    marginTop: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: colors.border
  },
  messageText: { color: colors.textMuted },
  metaRow: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.md
  },
  metaLabel: { color: colors.textMuted, minWidth: 70 },
  metaValue: { color: colors.text, fontWeight: '600', flex: 1, textAlign: 'right' },
  emptyCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center'
  },
  emptyTitle: { color: colors.text, fontWeight: '700', marginTop: spacing.xs },
  emptyText: { color: colors.textMuted, marginTop: spacing.xs, textAlign: 'center' }
});
