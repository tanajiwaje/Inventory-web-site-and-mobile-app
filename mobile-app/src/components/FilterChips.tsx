import { ScrollView, Pressable, StyleSheet, Text } from 'react-native';
import { colors, radius, spacing } from '../theme/tokens';

export type FilterChip = { key: string; label: string };

type Props = {
  chips: FilterChip[];
  value: string;
  onChange: (key: string) => void;
};

export const FilterChips = ({ chips, value, onChange }: Props) => (
  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
    {chips.map((chip) => {
      const active = value === chip.key;
      return (
        <Pressable
          key={chip.key}
          style={[styles.chip, active && styles.chipActive]}
          onPress={() => onChange(chip.key)}
          accessibilityRole="button"
          accessibilityLabel={`Filter ${chip.label}`}
        >
          <Text style={[styles.text, active && styles.textActive]}>{chip.label}</Text>
        </Pressable>
      );
    })}
  </ScrollView>
);

const styles = StyleSheet.create({
  row: {
    paddingVertical: spacing.xs,
    gap: spacing.xs
  },
  chip: {
    minHeight: 44,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center'
  },
  chipActive: {
    backgroundColor: '#dbeafe',
    borderColor: '#93c5fd'
  },
  text: {
    color: colors.text,
    fontWeight: '600'
  },
  textActive: {
    color: colors.primary
  }
});
