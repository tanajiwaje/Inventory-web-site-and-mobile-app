import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PrimaryButton } from './PrimaryButton';
import { colors, spacing } from '../theme/tokens';

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  actionLabel?: string;
  onAction?: () => void;
};

export const EmptyState = ({ icon, title, subtitle, actionLabel, onAction }: Props) => (
  <View style={styles.container}>
    <Ionicons name={icon} size={28} color={colors.textSubtle} />
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.subtitle}>{subtitle}</Text>
    {actionLabel && onAction ? (
      <PrimaryButton label={actionLabel} onPress={onAction} style={styles.button} />
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.xl
  },
  title: {
    marginTop: spacing.sm,
    color: colors.text,
    fontWeight: '700'
  },
  subtitle: {
    marginTop: spacing.xs,
    color: colors.textMuted,
    textAlign: 'center'
  },
  button: {
    marginTop: spacing.lg,
    minWidth: 160
  }
});
