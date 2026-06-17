import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { COLORS } from '@/constants/colors';
import { BottomTabBar } from '@/components/ui/BottomTabBar';
import { EditFieldModal, EditFieldType } from '@/components/ui/EditFieldModal';
import { InfoRow } from './InfoRow';
import { AvatarPicker } from './AvatarPicker';
import { useProfileForm } from '../hooks/useProfileForm';
import { useCurrentUser } from '../../auth/hooks/useAuth';
import {
  formatPhoneInput,
  validatePhoneInput,
  validateHeightInput,
} from '../utils/validations';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface FieldConfig {
  title: string;
  type: EditFieldType;
  options?: string[];
  placeholder?: string;
  hint?: string;
  prefix?: string;
  suffix?: string;
  maxLength?: number;
  onChangeFormat?: (text: string) => string;
  validate?: (value: string) => string | null;
}

const FIELD_CONFIG: Record<string, FieldConfig> = {
  cedula: {
    title: 'Cédula',
    type: 'text',
    placeholder: '1234567890',
    maxLength: 10,
    hint: 'Ingresa los 10 dígitos de tu cédula',
  },
  phone: {
    title: 'Teléfono',
    type: 'phone',
    prefix: '+593 ',
    placeholder: 'XXX XXX XXX',
    maxLength: 11,
    onChangeFormat: formatPhoneInput,
    validate: validatePhoneInput,
  },
  birthDate: {
    title: 'Fecha de Nacimiento',
    type: 'date',
  },
  height: {
    title: 'Altura',
    type: 'numeric',
    suffix: ' cm',
    placeholder: '175',
    maxLength: 3,
    hint: 'Ingresa solo el número en centímetros',
    validate: validateHeightInput,
  },
  gender: {
    title: 'Género',
    type: 'select',
    options: ['Masculino', 'Femenino', 'Otro', 'Prefiero no decirlo'],
  },
  medicalCondition: {
    title: 'Condición Médica',
    type: 'text',
    placeholder: 'Ej: Hipertensión, Diabetes...',
  },
  allergies: {
    title: 'Alergias',
    type: 'text',
    placeholder: 'Ej: Lactosa, Gluten... o Ninguna',
  },
};

function SectionTitle({ title }: { title: string }) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

function Separator() {
  return <View style={styles.separator} />;
}

export default function ProfileScreen() {
  const { user: sessionUser, loading: sessionLoading } = useCurrentUser();

  const {
    profile,
    loading,
    error,
    reload,
    imageUri,
    setImageUri,
    activeModal,
    activeValue,
    openModal,
    closeModal,
    saveField,
  } = useProfileForm(sessionUser?.id ?? '');

  const { personalInfo: pi, healthInfo: hi } = profile;

  const inputValue = useMemo(() => {
    if (!activeModal) return '';
    const config = FIELD_CONFIG[activeModal.field];
    if (config?.type === 'date') return activeValue;
    let val = activeValue;
    if (config?.prefix && val.startsWith(config.prefix)) {
      val = val.slice(config.prefix.length);
    }
    if (config?.suffix && val.endsWith(config.suffix)) {
      val = val.slice(0, -config.suffix.length);
    }
    return val;
  }, [activeModal, activeValue]);

  function handleSave(value: string) {
    const config = activeModal ? FIELD_CONFIG[activeModal.field] : null;
    if (config?.type === 'date') {
      saveField(value);
      return;
    }
    const stored = `${config?.prefix ?? ''}${value}${config?.suffix ?? ''}`;
    saveField(stored);
  }

  const modalConfig = activeModal ? FIELD_CONFIG[activeModal.field] : null;

  if (sessionLoading || loading) {
    return (
      <SafeAreaView style={styles.root} edges={['top']}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!sessionUser) {
    return (
      <SafeAreaView style={styles.root} edges={['top']}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>No hay sesión activa. Por favor inicia sesión.</Text>
          <TouchableOpacity
            style={styles.retryBtn}
            activeOpacity={0.8}
            onPress={() => router.replace('/login')}
          >
            <Text style={styles.retryBtnText}>Ir al login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.root} edges={['top']}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} activeOpacity={0.8} onPress={reload}>
            <Text style={styles.retryBtnText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>

      {/* ── Header verde ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} activeOpacity={0.8} onPress={() => router.back()}>
          <MaterialCommunityIcons
            name="arrow-left"
            size={22}
            color="#fff"
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mi Perfil</Text>
        <TouchableOpacity style={styles.headerBtn} activeOpacity={0.8}>
          <MaterialCommunityIcons
            name="map-marker-outline"
            size={22}
            color="#fff"
          />
        </TouchableOpacity>
      </View>

      {/* ── Avatar ── */}
      <View style={styles.avatarSection}>
        <AvatarPicker imageUri={imageUri} onImageSelected={setImageUri} />
        <Text style={styles.userName}>{profile.name}</Text>
        <Text style={styles.userEmail}>{profile.email}</Text>
        <View style={styles.planBadge}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MaterialCommunityIcons
              name="star-four-points-outline"
              size={14}
              color="#fff"
            />
            <Text style={styles.planBadgeText}>
              {' '}Plan {profile.plan}
            </Text>
          </View>
        </View>
      </View>

      {/* ── Contenido scrolleable ── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Información Personal */}
        <SectionTitle title="Información Personal" />
        <View style={styles.card}>
          <InfoRow
            icon="card-account-details-outline" label="Cédula" value={pi.cedula}
            onPress={() => openModal('cedula', 'personal')}
          />
          <Separator />
          <InfoRow
            icon="phone-outline" label="Teléfono" value={pi.phone}
            onPress={() => openModal('phone', 'personal')}
          />
          <Separator />
          <InfoRow
            icon="cake-variant-outline" label="Fecha de Nacimiento" value={pi.birthDate}
            onPress={() => openModal('birthDate', 'personal')}
          />
          <Separator />
          <InfoRow
            icon="human-male-height" label="Altura" value={pi.height}
            onPress={() => openModal('height', 'personal')}
          />
          <Separator />
          <InfoRow
            icon="account-outline" label="Género" value={pi.gender}
            onPress={() => openModal('gender', 'personal')}
          />
        </View>

        {/* Información de Salud */}
        <SectionTitle title="Información de Salud" />
        <View style={styles.card}>
          <InfoRow
            icon="heart-pulse" label="Condición Médica" value={hi.medicalCondition}
            onPress={() => openModal('medicalCondition', 'health')}
          />
          <Separator />
          <InfoRow
            icon="alert-circle-outline" label="Alergias" value={hi.allergies}
            onPress={() => openModal('allergies', 'health')}
          />
        </View>

        {/* Mi Nutricionista */}
        <SectionTitle title="Mi Nutricionista" />
        <View style={[styles.card, styles.doctorCard]}>
          <View style={styles.doctorIconWrap}>
            <MaterialCommunityIcons
              name="stethoscope"
              size={28}
              color={COLORS.primary}
            />
          </View>
          <View style={styles.doctorInfo}>
            <Text style={styles.doctorName}>{profile.nutritionist.name || '—'}</Text>
            <Text style={styles.doctorSpecialty}>{profile.nutritionist.specialty || 'Sin asignar'}</Text>
          </View>
          <TouchableOpacity style={styles.contactBtn} activeOpacity={0.8}>
            <Text style={styles.contactBtnText}>Contactar</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>

      {/* ── Edit Field Modal ── */}
      {modalConfig && (
        <EditFieldModal
          visible={activeModal !== null}
          title={modalConfig.title}
          value={inputValue}
          type={modalConfig.type}
          options={modalConfig.options ? [...modalConfig.options] : []}
          placeholder={modalConfig.placeholder}
          hint={modalConfig.hint}
          prefix={modalConfig.prefix}
          suffix={modalConfig.suffix}
          maxLength={modalConfig.maxLength}
          onChangeFormat={modalConfig.onChangeFormat}
          validate={modalConfig.validate}
          onSave={handleSave}
          onClose={closeModal}
        />
      )}

      {/* ── Bottom Tab Bar ── */}
      <BottomTabBar activeTab="perfil" />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f5f6fa' },

  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  errorText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  retryBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },

  header: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 52,
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBtnIcon: { fontSize: 16, color: '#fff', fontWeight: '700' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#fff' },

  avatarSection: {
    alignItems: 'center',
    marginTop: -36,
    paddingBottom: 20,
    backgroundColor: COLORS.primary,
  },
  userName: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  userEmail: { fontSize: 13, color: 'rgba(255,255,255,0.85)', marginBottom: 10 },
  planBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  planBadgeText: { color: '#fff', fontSize: 12, fontWeight: '600' },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 20 },

  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1a1a2e',
    marginBottom: 10,
    marginTop: 4,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  separator: { height: 1, backgroundColor: '#f5f6fa', marginHorizontal: 16 },

  doctorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  doctorIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  doctorInfo: { flex: 1 },
  doctorName: { fontSize: 14, fontWeight: '700', color: '#222', marginBottom: 2 },
  doctorSpecialty: { fontSize: 12, color: '#888' },
  contactBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  contactBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
});