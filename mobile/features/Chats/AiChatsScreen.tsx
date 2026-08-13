import React, { useEffect, useRef, useState } from 'react';
import {
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { ChatHeader } from './components/ChatHeader';
import { MessageBubble } from './components/MessageBubble';
import { ChatInput } from './components/ChatInput';
import { useAssistant } from './hooks/UseAssistant';
import { stripMarkdown } from '@/utils/stripMarkdown';

export default function AIChatScreen({ onClose }: { onClose: () => void }) {
  const { messages, sendMessage, loading, error } = useAssistant();
  const [draft, setDraft] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose();
      return true;
    });

    return () => subscription.remove();
  }, [onClose]);

  const handleSend = async () => {
    if (!draft.trim() || loading) return;
    const text = draft;
    setDraft('');
    await sendMessage(text);
  };

  return (
    <View style={styles.overlay}>
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
        <ChatHeader
          title="Asistente NutrIA"
          subtitle="Siempre disponible"
          avatarIcon="robot-happy-outline"
          onBack={onClose}
        />

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          <ScrollView
            ref={scrollRef}
            style={styles.list}
            contentContainerStyle={{ paddingVertical: 14 }}
            onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
          >
            {messages.length === 0 && (
              <View style={styles.hintCard}>
                <View style={styles.hintIcon}>
                  <MaterialCommunityIcons name="robot-happy-outline" size={22} color={COLORS.primary} />
                </View>
                <Text style={styles.hintText}>
                  Puedes preguntarme lo que quieras sobre nutrición: tus comidas, tu plan
                  alimenticio o cualquier duda que tengas. ¡Estoy aquí para ayudarte!
                </Text>
              </View>
            )}

            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                sender={msg.sender_role === 'patient' ? 'me' : 'other'}
                timestamp={new Date(msg.sent_at).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              >
                <Text style={msg.sender_role === 'patient' ? styles.textMe : styles.textOther}>
                  {msg.sender_role === 'patient' ? msg.content : stripMarkdown(msg.content)}
                </Text>
              </MessageBubble>
            ))}
          </ScrollView>

          {loading && <Text style={styles.statusText}>El asistente está escribiendo...</Text>}
          {error && <Text style={styles.errorText}>{error}</Text>}

          <ChatInput value={draft} onChangeText={setDraft} onSend={handleSend} />
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 20,
    elevation: 20,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  list: {
    flex: 1,
    backgroundColor: COLORS.background ?? COLORS.surface,
  },
  hintCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 16,
    marginHorizontal: 12,
    marginBottom: 14,
    padding: 14,
  },
  hintIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hintText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.textPrimary,
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
});
