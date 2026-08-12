import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '@/constants/colors';
import { ChatHeader } from './components/ChatHeader';
import { MessageBubble } from './components/MessageBubble';
import { ChatInput } from './components/ChatInput';
import { useAssistant } from './hooks/UseAssistant';

type Tab = 'ingesta' | 'plan';

export default function AIChatScreen({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('ingesta');
  const { messages, sendMessage, loading, error } = useAssistant();
  const [draft, setDraft] = useState('');

  const handleSend = async () => {
    if (!draft.trim() || loading) return;
    const text = draft;
    setDraft('');
    await sendMessage(text);
  };

  return (
    <Modal visible animationType="slide" onRequestClose={onClose} statusBarTranslucent>
    <SafeAreaView style={styles.container} edges={['top']}>
      <ChatHeader
        title="Asistente NutrIA"
        subtitle="IA"
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
            <MessageBubble key={msg.id} sender={msg.sender_role === "patient" ? "me" : "other" } timestamp={
              new Date(msg.sent_at).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}>
              <Text
                style={
                  msg.sender_role === 'patient'
                    ? styles.textMe
                    : styles.textOther
                }
              >
                {msg.content}
              </Text>
            </MessageBubble>
          ))}
        </ScrollView>

        {loading && <Text style={styles.statusText}>El asistente está escribiendo...</Text>}
        {error && <Text style={styles.errorText}>{error}</Text>}

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
  statusText: {
    fontSize: 12,
    color: COLORS.textMuted,
    paddingHorizontal: 16,
    paddingBottom: 6,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    paddingHorizontal: 16,
    paddingBottom: 6,
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