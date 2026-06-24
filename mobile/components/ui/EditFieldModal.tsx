import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { COLORS } from '@/constants/colors';
import { DatePickerField } from '@/components/ui/DatePickerField';

export type EditFieldType = 'text' | 'phone' | 'date' | 'numeric' | 'select';

interface EditFieldModalProps {
  visible: boolean;
  title: string;
  /** Raw value shown in the input (without prefix/suffix) */
  value: string;
  type?: EditFieldType;
  options?: string[];
  placeholder?: string;
  /** Helper text shown below the input */
  hint?: string;
  /** Label shown to the LEFT of the input (e.g. "+593 " for phone) */
  prefix?: string;
  /** Label shown to the RIGHT of the input (e.g. "cm" for height) */
  suffix?: string;
  maxLength?: number;
  /** Called on every keystroke to auto-format the text */
  onChangeFormat?: (text: string) => string;
  /** Returns an error string if invalid, or null if valid */
  validate?: (value: string) => string | null;
  onSave: (value: string) => void;
  onClose: () => void;
}

export function EditFieldModal({
  visible,
  title,
  value,
  type = 'text',
  options = [],
  placeholder,
  hint,
  prefix,
  suffix,
  maxLength,
  onChangeFormat,
  validate,
  onSave,
  onClose,
}: EditFieldModalProps) {
  const [draft, setDraft] = useState(value);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setDraft(value);
      setError(null);
    }
  }, [visible, value]);

  function handleChange(text: string) {
    const formatted = onChangeFormat ? onChangeFormat(text) : text;
    setDraft(formatted);
    if (error) setError(null);
  }

  function handleSave() {
    const trimmed = draft.trim();
    if (validate) {
      const err = validate(trimmed);
      if (err) { setError(err); return; }
    }
    onSave(trimmed);
    onClose();
  }

  const keyboardType =
    type === 'phone' || type === 'numeric' ? 'number-pad' : 'default';

  // ── Date type: no keyboard, taller sheet to fit the picker ────────────────
  const isDate = type === 'date';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose} />

      {/* Date picker doesn't need KeyboardAvoidingView */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.kvWrapper}
        enabled={!isDate}
      >
        <View style={[styles.sheet, isDate && styles.sheetDate]}>
          <View style={styles.handle} />

          <Text style={styles.title}>{title}</Text>

          {/* ── Date picker ── */}
          {isDate ? (
            <DatePickerField
              value={draft}
              onChange={(val) => { setDraft(val); setError(null); }}
            />
          ) : type === 'select' ? (
            /* ── Select ── */
            <View style={styles.optionList}>
              {options.map(opt => (
                <TouchableOpacity
                  key={opt}
                  style={[styles.optionRow, draft === opt && styles.optionRowActive]}
                  activeOpacity={0.7}
                  onPress={() => setDraft(opt)}
                >
                  <Text style={[styles.optionText, draft === opt && styles.optionTextActive]}>
                    {opt}
                  </Text>
                  {draft === opt && <Text style={styles.checkMark}>✓</Text>}
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            /* ── Text / phone / numeric ── */
            <>
              <View style={[styles.inputRow, error ? styles.inputRowError : null]}>
                {prefix ? (
                  <View style={styles.affix}>
                    <Text style={styles.affixText}>{prefix}</Text>
                  </View>
                ) : null}

                <TextInput
                  style={styles.input}
                  value={draft}
                  onChangeText={handleChange}
                  keyboardType={keyboardType}
                  placeholder={placeholder}
                  placeholderTextColor="#bbb"
                  maxLength={maxLength}
                  autoFocus
                  returnKeyType="done"
                  onSubmitEditing={handleSave}
                />

                {suffix ? (
                  <View style={styles.affix}>
                    <Text style={styles.affixText}>{suffix}</Text>
                  </View>
                ) : null}
              </View>

              {error ? (
                <Text style={styles.errorText}>⚠ {error}</Text>
              ) : hint ? (
                <Text style={styles.hintText}>{hint}</Text>
              ) : null}
            </>
          )}

          {/* Error for date type */}
          {isDate && error ? (
            <Text style={styles.errorText}>⚠ {error}</Text>
          ) : null}

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.btnCancel} activeOpacity={0.7} onPress={onClose}>
              <Text style={styles.btnCancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnSave} activeOpacity={0.8} onPress={handleSave}>
              <Text style={styles.btnSaveText}>Guardar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  kvWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 36,
    paddingTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 20,
  },
  // Extra padding for the date picker spinner on iOS
  sheetDate: {
    paddingBottom: Platform.OS === 'ios' ? 48 : 36,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ddd',
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 14,
  },

  // Input row
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    backgroundColor: '#fafafa',
    marginBottom: 8,
    overflow: 'hidden',
  },
  inputRowError: {
    borderColor: '#e53935',
  },
  affix: {
    paddingHorizontal: 12,
    paddingVertical: 14,
    backgroundColor: '#f0f0f0',
  },
  affixText: {
    fontSize: 15,
    color: '#555',
    fontWeight: '600',
  },
  input: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
    color: '#333',
  },

  // Hint / error
  hintText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 16,
    marginLeft: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#e53935',
    marginBottom: 16,
    marginLeft: 4,
  },

  // Select
  optionList: {
    marginBottom: 20,
    gap: 8,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    backgroundColor: '#fafafa',
  },
  optionRowActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  optionText: {
    fontSize: 15,
    color: '#555',
    fontWeight: '500',
  },
  optionTextActive: {
    color: COLORS.primaryDark,
    fontWeight: '700',
  },
  checkMark: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '700',
  },

  // Actions
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  btnCancel: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  btnCancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#888',
  },
  btnSave: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  btnSaveText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
});