/**
 * DatePickerField
 *
 * Renders a native date picker adapted per platform:
 *  - iOS   → inline spinner inside the modal sheet (no extra tap needed)
 *  - Android → opens the system date picker dialog on press
 *
 * Output format: "DD/MM/AAAA" (matches the existing app convention)
 */

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

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** "DD/MM/AAAA" → Date  (returns today if parsing fails) */
function parseDisplayDate(display: string): Date {
  const parts = display.split('/');
  if (parts.length === 3) {
    const [dd, mm, yyyy] = parts.map(Number);
    const d = new Date(yyyy, mm - 1, dd);
    if (!isNaN(d.getTime())) return d;
  }
  return new Date();
}

/** Date → "DD/MM/AAAA" */
function toDisplayDate(date: Date): string {
  const dd   = String(date.getDate()).padStart(2, '0');
  const mm   = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

const MAX_DATE = new Date(); // today — no future birth dates
const MIN_DATE = new Date(1900, 0, 1);

// ─── Props ────────────────────────────────────────────────────────────────────

interface DatePickerFieldProps {
  /** Current value in "DD/MM/AAAA" format */
  value: string;
  /** Called with the new value in "DD/MM/AAAA" format whenever the date changes */
  onChange: (value: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DatePickerField({ value, onChange }: DatePickerFieldProps) {
  const currentDate = parseDisplayDate(value);

  // Android only: controls whether the system dialog is open
  const [showAndroid, setShowAndroid] = useState(false);

  function handleChange(_event: DateTimePickerEvent, selected?: Date) {
    // Android closes automatically after selection; iOS stays open
    if (Platform.OS === 'android') setShowAndroid(false);
    if (selected) onChange(toDisplayDate(selected));
  }

  // ── iOS: always-visible inline spinner ────────────────────────────────────
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

  // ── Android: pressable row that opens the system dialog ───────────────────
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

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // iOS
  iosWrapper: {
    alignItems: 'center',
    marginVertical: 4,
  },
  iosPicker: {
    width: '100%',
    height: 180,
  },

  // Android
  androidRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    backgroundColor: '#fafafa',
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
    color: '#bbb',
    fontWeight: '300',
  },
});