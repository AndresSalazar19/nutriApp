import React, { useState, useRef, useEffect } from 'react';
import {
  ActivityIndicator,
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

import { COLORS } from '@/constants/colors';
import { ChatHeader } from './components/ChatHeader';
import { MessageBubble } from './components/MessageBubble';
import { ChatInput } from './components/ChatInput';
import { useDoctorChat } from './hooks/UseDoctorChat';

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

interface DoctorChatScreenProps {
  onClose: () => void;
  nutritionist: any | null;
}

export default function DoctorChatScreen({ onClose, nutritionist }: DoctorChatScreenProps) {
  const {
    messages,
    loading,
    error,
    otherTyping,
    otherOnline,
    sendMessage,
    notifyTyping,
    notifyStopTyping,
    notifyRead
  } = useDoctorChat({ nutritionistId: nutritionist?.id });

  const [draft, setDraft] = useState('');
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);
  const lastReadMessageRef = useRef<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    const lastUnread = [...messages]
      .reverse()
      .find(
        (m) =>
          m.sender_role === 'nutritionist' &&
          !m.read_at
      );

    if (!lastUnread) return;

    if (lastReadMessageRef.current === lastUnread.id) return;

    lastReadMessageRef.current = lastUnread.id;

    notifyRead();
  }, [messages, notifyRead]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose();
      return true;
    });

    return () => subscription.remove();
  }, [onClose]);

  const handleChangeDraft = (text: string) => {
    setDraft(text);
    if (!text.trim()) {
        if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        }

        if (isTypingRef.current) {
        notifyStopTyping();
        isTypingRef.current = false;
        }

        return;
    }
    if (!isTypingRef.current) {
        notifyTyping();
        isTypingRef.current = true;
    }
    if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
        notifyStopTyping();
        isTypingRef.current = false;
    }, 1000);
    };

  const handleSend = () => {
    if (!draft.trim()) return;
    sendMessage(draft);
    if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
    }
    if (isTypingRef.current) {
        notifyStopTyping();
        isTypingRef.current = false;
    }
    setDraft('');
  };

  return (
    <View style={styles.overlay}>
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
        <ChatHeader
          title={`${nutritionist?.person.first_name ?? 'Nutricionista'} ${nutritionist?.person.last_name ?? ''}`}
          subtitle={otherTyping ? 'Escribiendo...' : otherOnline ?'En línea' : 'Desconectado'}
          avatarIcon="account"
          onBack={onClose}
        />

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          {loading ? (
            <View style={styles.centered}>
              <ActivityIndicator size="small" color={COLORS.primary} />
            </View>
          ) : (
            <ScrollView
              ref={scrollRef}
              style={styles.list}
              contentContainerStyle={{ paddingVertical: 14 }}
              onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
            >
              {error && (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              {messages.map((msg) => {
                const isMe = msg.sender_role === 'patient';
                return (
                  <MessageBubble
                    key={msg.id}
                    sender={isMe ? 'me' : 'other'}
                    timestamp={formatTime(msg.sent_at)}
                    read={isMe && !!msg.read_at}
                  >
                    <Text style={isMe ? styles.textMe : styles.textOther}>{msg.content}</Text>
                  </MessageBubble>
                );
              })}
            </ScrollView>
          )}

          <ChatInput value={draft} onChangeText={handleChangeDraft} onSend={handleSend} />
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
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    flex: 1,
    backgroundColor: COLORS.background ?? COLORS.surface,
  },
  errorBox: {
    marginHorizontal: 12,
    marginBottom: 10,
    padding: 10,
    borderRadius: 10,
    backgroundColor: COLORS.errorLight,
    borderWidth: 1,
    borderColor: COLORS.errorBorder,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
  },
  textMe: {
    color: COLORS.textOnPrimary,
    fontSize: 14,
  },
  textOther: {
    color: COLORS.textPrimary,
    fontSize: 14,
  },
  quickRepliesWrap: {
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  quickRepliesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginBottom: 6,
  },
  quickRepliesRow: {
    flexDirection: 'row',
    gap: 8,
  },
  quickReplyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  quickReplyText: {
    fontSize: 12,
    color: COLORS.textPrimary,
  },
});