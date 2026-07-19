import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { COLORS } from '@/constants/colors';
import { ChatHeader } from './components/ChatHeader';
import { MessageBubble } from './components/MessageBubble';
import { ChatInput } from './components/ChatInput';

type Tab = 'ingesta' | 'plan';

interface AIMessage {
  id: string;
  sender: 'me' | 'other';
  time: string;
  kind: 'text' | 'actions' | 'form';
  text?: string;
}

const INITIAL_MESSAGES: AIMessage[] = [
  {
    id: '1',
    sender: 'other',
    time: '10:15 AM',
    kind: 'text',
    text: '¡Hola! 👋 Soy tu asistente de salud de NutrIA. Estoy aquí para ayudarte a registrar tus comidas, presión arterial, hidratación y más.\n¿Qué te gustaría hacer hoy?',
  },
  { id: '2', sender: 'other', time: '10:15 AM', kind: 'actions' },
  {
    id: '3',
    sender: 'me',
    time: '10:16 AM',
    kind: 'text',
    text: 'Quiero registrar mi presión arterial de esta mañana',
  },
  {
    id: '4',
    sender: 'other',
    time: '',
    kind: 'text',
    text: 'Perfecto! Voy a registrar tu presión arterial. Por favor ingresa los valores:',
  },
  { id: '5', sender: 'other', time: '', kind: 'form' },
];

const QUICK_ACTIONS = [
  { id: 'presion', label: 'Registrar presión arterial', icon: 'heart-pulse' },
  { id: 'hidratacion', label: 'Registrar hidratación', icon: 'cup-water' },
];

export default function AIChatScreen({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('ingesta');
  const [messages, setMessages] = useState<AIMessage[]>(INITIAL_MESSAGES);
  const [draft, setDraft] = useState('');
  const [systolic, setSystolic] = useState('128');
  const [diastolic, setDiastolic] = useState('82');

  const handleSend = () => {
    if (!draft.trim()) return;
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), sender: 'me', time: 'Ahora', kind: 'text', text: draft.trim() },
    ]);
    setDraft('');
  };

  return (
    <Modal visible animationType="slide" onRequestClose={onClose} statusBarTranslucent>
    <SafeAreaView style={styles.container} edges={['top']}>
      <ChatHeader
        title="Asistente NutrIA"
        subtitle="IA • En línea"
        avatarIcon="robot-happy-outline"
        onBack={() => onClose()}
      />

      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={[styles.tab, tab === 'ingesta' && styles.tabActive]}
          onPress={() => setTab('ingesta')}
        >
          <Text style={[styles.tabText, tab === 'ingesta' && styles.tabTextActive]}>
            Registro de Ingesta
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'plan' && styles.tabActive]}
          onPress={() => setTab('plan')}
        >
          <Text style={[styles.tabText, tab === 'plan' && styles.tabTextActive]}>
            Crear Plan Alimenticio
          </Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView style={styles.list} contentContainerStyle={{ paddingVertical: 14 }}>
          {messages.map((msg) => (
            <MessageBubble key={msg.id} sender={msg.sender} timestamp={msg.time}>
              {msg.kind === 'text' && (
                <Text style={msg.sender === 'me' ? styles.textMe : styles.textOther}>
                  {msg.text}
                </Text>
              )}

              {msg.kind === 'actions' && (
                <View style={styles.actionsWrap}>
                  {QUICK_ACTIONS.map((action) => (
                    <TouchableOpacity key={action.id} style={styles.actionChip}>
                      <MaterialCommunityIcons
                        name={action.icon as any}
                        size={16}
                        color={COLORS.primary}
                      />
                      <Text style={styles.actionText}>{action.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {msg.kind === 'form' && (
                <View style={styles.formCard}>
                  <View style={styles.formRow}>
                    <View style={styles.formField}>
                      <Text style={styles.formLabel}>Presión Sistólica (mmHg)</Text>
                      <TextInput
                        style={styles.formInput}
                        value={systolic}
                        onChangeText={setSystolic}
                        keyboardType="numeric"
                      />
                    </View>
                    <View style={styles.formField}>
                      <Text style={styles.formLabel}>Diastólica (mmHg)</Text>
                      <TextInput
                        style={styles.formInput}
                        value={diastolic}
                        onChangeText={setDiastolic}
                        keyboardType="numeric"
                      />
                    </View>
                  </View>
                  <TouchableOpacity style={styles.formConfirmBtn}>
                    <MaterialCommunityIcons name="check" size={16} color={COLORS.textOnPrimary} />
                    <Text style={styles.formConfirmText}>Confirmar Registro</Text>
                  </TouchableOpacity>
                </View>
              )}
            </MessageBubble>
          ))}
        </ScrollView>

        <ChatInput value={draft} onChangeText={setDraft} onSend={handleSend} />
      </KeyboardAvoidingView>
    </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: COLORS.surface,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
  },
  tabActive: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  tabTextActive: {
    color: COLORS.textOnPrimary,
  },
  list: {
    flex: 1,
    backgroundColor: COLORS.background ?? COLORS.surface,
  },
  textMe: {
    color: COLORS.textOnPrimary,
    fontSize: 14,
  },
  textOther: {
    color: COLORS.textPrimary,
    fontSize: 14,
  },
  actionsWrap: {
    gap: 8,
  },
  actionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  actionText: {
    fontSize: 13,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  formCard: {
    gap: 12,
  },
  formRow: {
    flexDirection: 'row',
    gap: 10,
  },
  formField: {
    flex: 1,
  },
  formLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  formInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  formConfirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    paddingVertical: 10,
  },
  formConfirmText: {
    color: COLORS.textOnPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
});