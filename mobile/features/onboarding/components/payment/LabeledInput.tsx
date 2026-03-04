import React from 'react';
import { View, Text, TextInput, StyleSheet, ViewStyle } from 'react-native';

interface LabeledInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  keyboardType?: 'default' | 'numeric' | 'decimal-pad';
  maxLength?: number;
  secureTextEntry?: boolean;
  rightIcon?: string;
  style?: ViewStyle;
}

export const LabeledInput: React.FC<LabeledInputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  maxLength,
  secureTextEntry,
  rightIcon,
  style,
}) => (
  <View style={[styles.container, style]}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <View style={styles.inputWrapper}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#AAAAAA"
        keyboardType={keyboardType}
        maxLength={maxLength}
        secureTextEntry={secureTextEntry}
      />
      {rightIcon && <Text style={styles.inputIcon}>{rightIcon}</Text>}
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { marginBottom: 14 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#333', marginBottom: 6 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#DDD',
    borderRadius: 10,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    height: 48,
  },
  input: { flex: 1, fontSize: 15, color: '#1A1A1A' },
  inputIcon: { fontSize: 18, marginLeft: 8 },
});
