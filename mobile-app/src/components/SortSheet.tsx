import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../theme/tokens';

export type SortOption = { key: string; label: string };

type Props = {
  visible: boolean;
  onClose: () => void;
  options: SortOption[];
  value: string;
  onChange: (value: string) => void;
};

export const SortSheet = ({ visible, onClose, options, value, onChange }: Props) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
    <Pressable style={styles.backdrop} onPress={onClose}>
      <Pressable style={styles.sheet} onPress={() => undefined}>
        <Text style={styles.title}>Sort By</Text>
        {options.map((option) => {
          const active = option.key === value;
          return (
            <Pressable
              key={option.key}
              style={[styles.row, active && styles.rowActive]}
              onPress={() => {
                onChange(option.key);
                onClose();
              }}
            >
              <Text style={[styles.label, active && styles.labelActive]}>{option.label}</Text>
            </Pressable>
          );
        })}
      </Pressable>
    </Pressable>
  </Modal>
);

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.3)',
    justifyContent: 'flex-end'
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm
  },
  title: {
    color: colors.text,
    fontWeight: '700',
    marginBottom: spacing.xs
  },
  row: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    justifyContent: 'center'
  },
  rowActive: {
    backgroundColor: '#dbeafe',
    borderColor: '#93c5fd'
  },
  label: { color: colors.text, fontWeight: '600' },
  labelActive: { color: colors.primary }
});
