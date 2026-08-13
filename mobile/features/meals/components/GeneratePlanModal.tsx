import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { NutritionPlan, NutritionPlanApiError, NutritionPlanService } from '../services/nutritionPlanService';

interface PantryPhoto {
  uri: string;
  mimeType?: string | null;
  fileName?: string | null;
}

interface GeneratePlanModalProps {
  visible: boolean;
  onClose: () => void;
  onGenerated: (plan: NutritionPlan) => void;
}

async function pickFromCamera(): Promise<PantryPhoto | null> {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Permiso requerido', 'Necesitamos acceso a tu cámara para tomar la foto.');
    return null;
  }
  const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });
  if (result.canceled) return null;
  const asset = result.assets[0];
  return { uri: asset.uri, mimeType: asset.mimeType, fileName: asset.fileName };
}

async function pickFromGallery(): Promise<PantryPhoto | null> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Permiso requerido', 'Necesitamos acceso a tu galería para elegir la foto.');
    return null;
  }
  const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7 });
  if (result.canceled) return null;
  const asset = result.assets[0];
  return { uri: asset.uri, mimeType: asset.mimeType, fileName: asset.fileName };
}

const BP_HINT_REGEX = /\b\d{2,3}\s*\/\s*\d{2,3}\b/;

export function GeneratePlanModal({ visible, onClose, onGenerated }: GeneratePlanModalProps) {
  const [photo, setPhoto] = useState<PantryPhoto | null>(null);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function reset() {
    setPhoto(null);
    setNote('');
    setSubmitting(false);
  }

  function handleClose() {
    if (submitting) return;
    reset();
    onClose();
  }

  function handlePickPhoto() {
    Alert.alert('Foto de tu despensa', '¿Cómo quieres agregar la foto?', [
      { text: 'Cámara', onPress: async () => setPhoto(await pickFromCamera()) },
      { text: 'Galería', onPress: async () => setPhoto(await pickFromGallery()) },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  }

  async function handleGenerate() {
    if (!photo) {
      Alert.alert('Falta la foto', 'Sube una foto de los alimentos que tienes en casa.');
      return;
    }
    if (!note.trim()) {
      Alert.alert('Falta la descripción', 'Cuéntanos qué alimentos tienes disponibles.');
      return;
    }

    setSubmitting(true);
    try {
      const plan = await NutritionPlanService.generate({
        text: note.trim(),
        imageUri: photo.uri,
        mimeType: photo.mimeType,
        fileName: photo.fileName,
      });

      const mentionsBp = BP_HINT_REGEX.test(note);
      reset();
      onGenerated(plan);
      onClose();

      setTimeout(() => {
        Alert.alert(
          'Plan generado',
          `En menos de 24 horas un nutricionista aceptará tu plan nutricional. Te avisaremos cuando esté listo.${
            mentionsBp
              ? '\n\nDetectamos una posible lectura de presión arterial en tu nota — si la IA la reconoció, ya quedó guardada en tu historial.'
              : ''
          }`
        );
      }, 300);
    } catch (error) {
      const apiError = error instanceof NutritionPlanApiError ? error : null;
      Alert.alert(
        'No se pudo generar el plan',
        apiError?.message ?? 'Ocurrió un error inesperado. Inténtalo nuevamente.',
        apiError?.retryable
          ? [{ text: 'Reintentar', onPress: handleGenerate }, { text: 'Cerrar', style: 'cancel' }]
          : undefined
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardView}
        >
          <View style={styles.container}>
            <View style={styles.header}>
              <MaterialCommunityIcons name="creation" size={22} color={COLORS.textOnPrimary} />
              <Text style={styles.headerTitle}>Generar plan con IA</Text>
              <TouchableOpacity onPress={handleClose} disabled={submitting} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                <MaterialCommunityIcons name="close" size={24} color={COLORS.textOnPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
              <View style={styles.introCard}>
                <MaterialCommunityIcons name="robot-outline" size={20} color={COLORS.primaryMedium} />
                <Text style={styles.introText}>
                  Nuestra IA arma tu plan semanal usando tu perfil médico (alergias, restricciones y
                  diagnóstico) y lo que tengas disponible en casa. Tu nutricionista lo revisará antes de
                  activarlo.
                </Text>
              </View>

              <Text style={styles.sectionLabel}>Foto de tu despensa o alimentos</Text>
              <TouchableOpacity
                style={styles.photoPicker}
                activeOpacity={0.85}
                onPress={handlePickPhoto}
                disabled={submitting}
              >
                {photo ? (
                  <Image source={{ uri: photo.uri }} style={styles.photoPreview} />
                ) : (
                  <View style={styles.photoPlaceholder}>
                    <MaterialCommunityIcons name="camera-plus-outline" size={30} color={COLORS.primaryMedium} />
                    <Text style={styles.photoPlaceholderText}>Tomar foto o elegir de galería</Text>
                  </View>
                )}
                {photo && (
                  <View style={styles.photoRetakeBadge}>
                    <MaterialCommunityIcons name="pencil" size={12} color={COLORS.textOnPrimary} />
                    <Text style={styles.photoRetakeText}>Cambiar</Text>
                  </View>
                )}
              </TouchableOpacity>

              <Text style={styles.sectionLabel}>¿Qué alimentos tienes disponibles?</Text>
              <View style={styles.notesWrap}>
                <TextInput
                  style={styles.notesInput}
                  placeholder="Ej: Tengo pollo, arroz integral, lentejas, tomate, plátano verde..."
                  placeholderTextColor={COLORS.placeholder}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  value={note}
                  onChangeText={setNote}
                  editable={!submitting}
                />
              </View>
            </ScrollView>

            <View style={styles.footer}>
              <TouchableOpacity style={styles.cancelBtn} onPress={handleClose} disabled={submitting}>
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.generateBtn, submitting && styles.generateBtnDisabled]}
                onPress={handleGenerate}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <ActivityIndicator color={COLORS.textOnPrimary} />
                    <Text style={styles.generateBtnText}>Generando...</Text>
                  </>
                ) : (
                  <>
                    <MaterialCommunityIcons name="creation" size={18} color={COLORS.textOnPrimary} />
                    <Text style={styles.generateBtnText}>Generar plan</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.backdrop,
    justifyContent: 'flex-end',
  },
  keyboardView: {
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '92%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 10,
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textOnPrimary,
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  introCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.primaryLight,
    borderRadius: 14,
    padding: 14,
    gap: 10,
    marginBottom: 20,
  },
  introText: {
    flex: 1,
    fontSize: 12.5,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  photoPicker: {
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
  },
  photoPreview: {
    width: '100%',
    height: 180,
    borderRadius: 16,
  },
  photoPlaceholder: {
    width: '100%',
    height: 150,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    backgroundColor: COLORS.inputBg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  photoPlaceholderText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primaryMedium,
  },
  photoRetakeBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.backdrop,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  photoRetakeText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textOnPrimary,
  },
  notesWrap: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    backgroundColor: COLORS.inputBg,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  notesInput: {
    fontSize: 14,
    color: COLORS.textPrimary,
    paddingVertical: 12,
    minHeight: 96,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 50,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  generateBtn: {
    flex: 1.4,
    flexDirection: 'row',
    paddingVertical: 14,
    borderRadius: 50,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  generateBtnDisabled: {
    opacity: 0.7,
  },
  generateBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textOnPrimary,
  },
});
