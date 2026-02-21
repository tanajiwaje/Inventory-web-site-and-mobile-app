import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, radius, spacing } from '../theme/tokens';

type Props = {
  page: number;
  totalPages: number;
  totalItems?: number;
  pageSize?: number;
  onPrev: () => void;
  onNext: () => void;
};

export const PaginationControls = ({ page, totalPages, totalItems, pageSize = 10, onPrev, onNext }: Props) => (
  <View style={styles.row}>
    <TouchableOpacity
      style={[styles.button, page <= 1 && styles.disabled]}
      onPress={onPrev}
      disabled={page <= 1}
    >
      <Text style={styles.buttonText}>Prev</Text>
    </TouchableOpacity>
    <View style={styles.center}>
      <Text style={styles.label}>Page {page} of {totalPages}</Text>
      {typeof totalItems === 'number' ? (
        <Text style={styles.subLabel}>
          Showing {Math.min(totalItems, (page - 1) * pageSize + 1)}-{Math.min(totalItems, page * pageSize)} of {totalItems}
        </Text>
      ) : null}
    </View>
    <TouchableOpacity
      style={[styles.button, page >= totalPages && styles.disabled]}
      onPress={onNext}
      disabled={page >= totalPages}
    >
      <Text style={styles.buttonText}>Next</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  row: {
    marginTop: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  button: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 44,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonText: { color: colors.text, fontWeight: '600' },
  center: { alignItems: 'center' },
  label: { color: colors.textMuted },
  subLabel: { color: colors.textSubtle, fontSize: 12, marginTop: 2 },
  disabled: { opacity: 0.5 }
});
