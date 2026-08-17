import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';

export type MessageSender = 'me' | 'other';

interface MessageBubbleProps {
  sender: MessageSender;
  timestamp: string;
  children: React.ReactNode; // texto, botones, forms, lo que sea
  read?: boolean;
}

export function MessageBubble({ sender, timestamp, children, read }: MessageBubbleProps) {
  const isMe = sender === 'me';

  return (
    <View style={[styles.row, isMe ? styles.rowMe : styles.rowOther]}>
      <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleOther]}>
        {children}
        <View style={styles.footer}>
          <Text style={[styles.time, isMe && styles.timeMe]}>{timestamp}</Text>
          {isMe && (
            <MaterialCommunityIcons
              name={read ? 'check-all' : 'check'}
              size={14}
              color={read ? COLORS.inputBg : COLORS.overlayMedium}
            />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginBottom: 10,
    paddingHorizontal: 12,
  },
  rowMe: {
    justifyContent: 'flex-end',
  },
  rowOther: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    borderRadius: 16,
    padding: 12,
  },
  bubbleMe: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: COLORS.surface,
    borderBottomLeftRadius: 4,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    marginTop: 4,
  },
  time: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  timeMe: {
    color: COLORS.overlayMedium,
  },
});