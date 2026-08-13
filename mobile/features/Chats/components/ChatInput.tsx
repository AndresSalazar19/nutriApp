import React, { useRef } from 'react';
import { Keyboard, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';

interface ChatInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  placeholder?: string;
}

export function ChatInput({
  value,
  onChangeText,
  onSend,
  placeholder = 'Escribe un mensaje...',
}: ChatInputProps) {
  const inputRef = useRef<TextInput>(null);

  const handleSend = () => {
    if (!value.trim()) return;
    onSend();
    // Fallback imperativo: en Android, si el teclado (IME) todavía tenía una
    // composición en curso, actualizar solo el estado controlado a veces no
    // vacía visualmente el TextInput. Forzamos el borrado nativo también.
    inputRef.current?.clear();
    // Cerramos el teclado explícitamente: blur() suelta el foco del input y
    // Keyboard.dismiss() garantiza que el teclado se oculte en ambas
    // plataformas, en vez de quedarse abierto como si se siguiera escribiendo.
    inputRef.current?.blur();
    Keyboard.dismiss();
  };

  return (
    <View style={styles.container}>
      <TextInput
        ref={inputRef}
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={COLORS.placeholder}
        value={value}
        onChangeText={onChangeText}
        multiline
      />

      <TouchableOpacity
        style={[styles.sendBtn, !value.trim() && styles.sendBtnDisabled]}
        onPress={handleSend}
        disabled={!value.trim()}
      >
        <MaterialCommunityIcons name="arrow-up" size={20} color={COLORS.textOnPrimary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: COLORS.surface,
  },
  attachBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    maxHeight: 100,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: COLORS.inputBg,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.5,
  },
});
