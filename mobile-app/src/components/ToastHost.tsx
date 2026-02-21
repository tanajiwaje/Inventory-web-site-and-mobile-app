import { StyleSheet, Text, View } from 'react-native';
import { useUI } from '../ui/UIContext';
import { colors, radius, spacing } from '../theme/tokens';

export const ToastHost = () => {
  const { toast } = useUI();
  if (!toast) return null;

  const bg = toast.type === 'success' ? '#166534' : toast.type === 'error' ? colors.danger : colors.primary;

  return (
    <View pointerEvents="none" style={styles.wrap}>
      <View style={[styles.toast, { backgroundColor: bg }]}>
        <Text style={styles.text}>{toast.message}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    bottom: spacing.xl,
    zIndex: 50
  },
  toast: {
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md
  },
  text: {
    color: '#fff',
    fontWeight: '700'
  }
});
