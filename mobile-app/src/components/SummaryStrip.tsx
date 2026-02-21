import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../theme/tokens';

export type SummaryItem = {
  label: string;
  value: string | number;
};

export const SummaryStrip = ({ items }: { items: SummaryItem[] }) => (
  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
    {items.map((item) => (
      <View key={item.label} style={styles.card}>
        <Text style={styles.value} numberOfLines={1}>
          {item.value}
        </Text>
        <Text style={styles.label} numberOfLines={1}>
          {item.label}
        </Text>
      </View>
    ))}
  </ScrollView>
);

const styles = StyleSheet.create({
  row: {
    gap: spacing.sm,
    paddingVertical: spacing.xs
  },
  card: {
    width: 116,
    minHeight: 66,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    justifyContent: 'center',
    overflow: 'hidden'
  },
  value: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 16,
    textAlign: 'center'
  },
  label: {
    marginTop: 2,
    color: colors.textMuted,
    fontSize: 12,
    textAlign: 'center'
  }
});
