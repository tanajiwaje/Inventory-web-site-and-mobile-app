import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

const toIsoDate = (date: Date) => date.toISOString().split('T')[0];

const parseDate = (value?: string) => {
  if (!value) return new Date();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
};

type DateInputProps = {
  label: string;
  value?: string;
  onChange: (value: string) => void;
};

export const DateInput = ({ label, value, onChange }: DateInputProps) => {
  const [show, setShow] = useState(false);
  const dateValue = parseDate(value);

  const handleChange = (_: unknown, selected?: Date) => {
    if (Platform.OS === 'android') {
      setShow(false);
    }
    if (selected) {
      onChange(toIsoDate(selected));
    }
  };

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <Pressable style={styles.input} onPress={() => setShow(true)}>
        <Text style={styles.valueText}>{value || 'Select date'}</Text>
      </Pressable>
      {show && (
        <DateTimePicker
          value={dateValue}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          onChange={handleChange}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { marginBottom: 12 },
  label: { color: '#0f172a', fontWeight: '600', marginBottom: 6 },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12
  },
  valueText: { color: '#0f172a' }
});
