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
  value: string;
  type?: EditFieldType;
  options?: string[];
  placeholder?: string;
  hint?: string;
  prefix?: string;
  suffix?: string;
  maxLength?: number;
  onChangeFormat?: (text: string) => string;
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

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.kvWrapper}
        enabled={!isDate}
      >
        <View style={[styles.sheet, isDate && styles.sheetDate]}>
          <View style={styles.handle} />

          <Text style={styles.title}>{title}</Text>

          {isDate ? (
            <DatePickerField
              value={draft}
              onChange={(val) => { setDraft(val); setError(null); }}
            />
          ) : type === 'select' ? (
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
                  placeholderTextColor={COLORS.placeholder}
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

          {isDate && error ? (
            <Text style={styles.errorText}>⚠ {error}</Text>
          ) : null}

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

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: COLORS.backdrop,
  },
  kvWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  sheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 36,
    paddingTop: 12,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 20,
  },
  sheetDate: {
    paddingBottom: Platform.OS === 'ios' ? 48 : 36,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 14,
  },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 12,
    backgroundColor: COLORS.inputBg,
    marginBottom: 8,
    overflow: 'hidden',
  },
  inputRowError: {
    borderColor: COLORS.error,
  },
  affix: {
    paddingHorizontal: 12,
    paddingVertical: 14,
    backgroundColor: COLORS.divider,
  },
  affixText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  input: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
    color: COLORS.textPrimary,
  },

  hintText: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 16,
    marginLeft: 4,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    marginBottom: 16,
    marginLeft: 4,
  },

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
    borderColor: COLORS.border,
    backgroundColor: COLORS.inputBg,
  },
  optionRowActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  optionText: {
    fontSize: 15,
    color: COLORS.textSecondary,
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
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  btnCancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textMuted,
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
    color: COLORS.textOnPrimary,
  },
});
