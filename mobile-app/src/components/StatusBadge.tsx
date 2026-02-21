import { StyleSheet, Text, View } from 'react-native';
import { radius, spacing } from '../theme/tokens';

const statusStyle = (status: string) => {
  const key = status.toLowerCase();
  if (key === 'approved') return { bg: '#dcfce7', text: '#166534' };
  if (key === 'received') return { bg: '#dbeafe', text: '#1d4ed8' };
  if (key === 'requested' || key === 'supplier_submitted') return { bg: '#fef3c7', text: '#92400e' };
  if (key === 'rejected') return { bg: '#fee2e2', text: '#991b1b' };
  return { bg: '#e2e8f0', text: '#334155' };
};

const formatLabel = (status: string) => status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

export const StatusBadge = ({ status }: { status: string }) => {
  const tone = statusStyle(status);
  return (
    <View style={[styles.badge, { backgroundColor: tone.bg }]}>
      <Text style={[styles.text, { color: tone.text }]}>{formatLabel(status)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: radius.md,
    minHeight: 24,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center'
  },
  text: {
    fontWeight: '700',
    fontSize: 12
  }
});
