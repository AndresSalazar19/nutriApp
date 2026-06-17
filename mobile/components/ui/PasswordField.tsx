import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  TextInputProps,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';

export function PasswordField(props: TextInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <View style={styles.container}>
      <TextInput
        {...props}
        secureTextEntry={!visible}
        autoCapitalize="none"
        autoCorrect={false}
        style={styles.input}
      />

      <TouchableOpacity
        onPress={() => setVisible(v => !v)}
        hitSlop={10}
      >
        <MaterialCommunityIcons
          name={visible ? 'eye-off-outline' : 'eye-outline'}
          size={22}
          color="#999"
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: '#fafafa',
  },

  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 14,
    color: '#333',
  },
});