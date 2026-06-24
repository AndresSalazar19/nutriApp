import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { COLORS } from '@/constants/colors';

function parseDisplayDate(display: string): Date {
  const parts = display.split('/');
  if (parts.length === 3) {
    const [dd, mm, yyyy] = parts.map(Number);
    const d = new Date(yyyy, mm - 1, dd);
    if (!isNaN(d.getTime())) return d;
  }
  return new Date();
}

function toDisplayDate(date: Date): string {
  const dd   = String(date.getDate()).padStart(2, '0');
  const mm   = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

const MAX_DATE = new Date();
const MIN_DATE = new Date(1900, 0, 1);

interface DatePickerFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export function DatePickerField({ value, onChange }: DatePickerFieldProps) {
  const currentDate = parseDisplayDate(value);
  const [showAndroid, setShowAndroid] = useState(false);

  function handleChange(_event: DateTimePickerEvent, selected?: Date) {
    if (Platform.OS === 'android') setShowAndroid(false);
    if (selected) onChange(toDisplayDate(selected));
  }

  if (Platform.OS === 'ios') {
    return (
      <View style={styles.iosWrapper}>
        <DateTimePicker
          value={currentDate}
          mode="date"
          display="spinner"
          onChange={handleChange}
          maximumDate={MAX_DATE}
          minimumDate={MIN_DATE}
          locale="es-EC"
          style={styles.iosPicker}
        />
      </View>
    );
  }

  return (
    <>
      <TouchableOpacity
        style={styles.androidRow}
        activeOpacity={0.7}
        onPress={() => setShowAndroid(true)}
      >
        <Text style={styles.androidIcon}>📅</Text>
        <Text style={styles.androidValue}>{value || 'Seleccionar fecha'}</Text>
        <Text style={styles.androidChevron}>›</Text>
      </TouchableOpacity>

      {showAndroid && (
        <DateTimePicker
          value={currentDate}
          mode="date"
          display="default"
          onChange={handleChange}
          maximumDate={MAX_DATE}
          minimumDate={MIN_DATE}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  iosWrapper: {
    alignItems: 'center',
    marginVertical: 4,
  },
  iosPicker: {
    width: '100%',
    height: 180,
  },
  androidRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 12,
    backgroundColor: COLORS.inputBg,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 8,
    gap: 10,
  },
  androidIcon: {
    fontSize: 20,
  },
  androidValue: {
    flex: 1,
    fontSize: 15,
    color: COLORS.primary,
    fontWeight: '600',
  },
  androidChevron: {
    fontSize: 22,
    color: COLORS.textMuted,
    fontWeight: '300',
  },
});
