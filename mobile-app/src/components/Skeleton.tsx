import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { colors, radius, spacing } from '../theme/tokens';

type SkeletonWidth = number | 'auto' | `${number}%`;

export const SkeletonBlock = ({ height = 14, width = '100%' as SkeletonWidth }) => {
  const opacity = useRef(new Animated.Value(0.45)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.95, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.45, duration: 700, useNativeDriver: true })
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return <Animated.View style={[styles.block, { height, width, opacity }]} />;
};

export const OrderListSkeleton = () => (
  <View style={styles.stack}>
    {[1, 2, 3].map((key) => (
      <View key={key} style={styles.card}>
        <SkeletonBlock height={16} width="52%" />
        <SkeletonBlock height={12} width="38%" />
        <SkeletonBlock height={12} width="45%" />
        <SkeletonBlock height={38} width="100%" />
      </View>
    ))}
  </View>
);

export const DashboardSkeleton = () => (
  <View style={styles.stack}>
    {[1, 2, 3, 4].map((key) => (
      <View key={key} style={styles.card}>
        <SkeletonBlock height={12} width="32%" />
        <SkeletonBlock height={22} width="54%" />
      </View>
    ))}
  </View>
);

const styles = StyleSheet.create({
  stack: { gap: spacing.md },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm
  },
  block: {
    backgroundColor: '#cbd5e1',
    borderRadius: 8
  }
});
