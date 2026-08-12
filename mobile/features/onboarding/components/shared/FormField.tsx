import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { COLORS } from '@/constants/colors';

/** Label con asterisco rojo para campos obligatorios del wizard de
 *  onboarding (mismo criterio visual que RegisterScreen). */
export function FieldLabel({
  text,
  required = true,
  style,
}: {
  text: string;
  required?: boolean;
  style?: object;
}) {
  return (
    <Text style={[styles.label, style]}>
      {text} {required && <Text style={styles.asterisk}>*</Text>}
    </Text>
  );
}

/** Mensaje de error en rojo debajo del campo. Nunca un Alert -- el usuario
 *  ve de inmediato qué falta sin perder el contexto del formulario. */
export function FieldError({ message }: { message?: string | null }) {
  if (!message) return null;
  return <Text style={styles.errorText}>{message}</Text>;
}

const styles = StyleSheet.create({
  label: { fontSize: 13, fontWeight: '600', color: '#333', marginBottom: 6 },
  asterisk: { color: COLORS.error },
  errorText: { fontSize: 12, color: COLORS.error, marginTop: -2, marginBottom: 8, fontWeight: '500' },
});
