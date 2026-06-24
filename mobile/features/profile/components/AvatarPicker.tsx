import React from 'react';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { COLORS } from '@/constants/colors';
import { isAllowedImageUri } from '../utils/validations';

interface AvatarPickerProps {
  imageUri: string | null;
  onImageSelected: (uri: string) => void;
}

async function pickFromCamera(): Promise<string | null> {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Permiso requerido', 'Necesitamos acceso a tu cámara para tomar una foto.');
    return null;
  }
  const result = await ImagePicker.launchCameraAsync({
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });
  return result.canceled ? null : result.assets[0].uri;
}

async function pickFromGallery(): Promise<string | null> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Permiso requerido', 'Necesitamos acceso a tu galería para elegir una foto.');
    return null;
  }
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });
  return result.canceled ? null : result.assets[0].uri;
}

export function AvatarPicker({ imageUri, onImageSelected }: AvatarPickerProps) {
  async function handleUri(uri: string | null) {
    if (!uri) return;
    if (!isAllowedImageUri(uri)) {
      Alert.alert('Formato no permitido', 'Solo se permiten imágenes en formato JPG o PNG.');
      return;
    }
    onImageSelected(uri);
  }

  function handlePickImage() {
    Alert.alert('Foto de perfil', '¿Cómo quieres subir tu foto?', [
      {
        text: 'Cámara',
        onPress: async () => handleUri(await pickFromCamera()),
      },
      {
        text: 'Galería',
        onPress: async () => handleUri(await pickFromGallery()),
      },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  }

  return (
    <View style={styles.avatarWrap}>
      <View style={styles.avatarCircle}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.avatarImage} />
        ) : (
          <Text style={styles.avatarEmoji}>👤</Text>
        )}
      </View>
      <TouchableOpacity style={styles.cameraBtn} activeOpacity={0.8} onPress={handlePickImage}>
        <Text style={styles.cameraEmoji}>📷</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  avatarWrap: {
    position: 'relative',
    marginBottom: 12,
  },
  avatarCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#e0e0e0',
    borderWidth: 3,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    overflow: 'hidden',
  },
  avatarImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  avatarEmoji: { fontSize: 40 },
  cameraBtn: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primaryDark,
    borderWidth: 2,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraEmoji: { fontSize: 13 },
});
