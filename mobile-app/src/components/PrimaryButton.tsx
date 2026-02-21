import { Pressable, StyleProp, StyleSheet, Text, TextStyle, ViewStyle } from 'react-native';
import { colors, radius, spacing } from '../theme/tokens';

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

export const PrimaryButton = ({ label, onPress, disabled, style, textStyle }: Props) => (
  <Pressable
    onPress={onPress}
    disabled={disabled}
    style={({ pressed }) => [
      styles.button,
      pressed && !disabled && styles.buttonPressed,
      disabled && styles.buttonDisabled,
      style
    ]}
  >
    <Text style={[styles.label, textStyle]}>{label}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  button: {
    marginTop: spacing.md,
    backgroundColor: colors.primary,
    minHeight: 44,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonPressed: {
    backgroundColor: colors.primaryDark
  },
  buttonDisabled: {
    opacity: 0.6
  },
  label: {
    color: '#fff',
    fontWeight: '700'
  }
});
