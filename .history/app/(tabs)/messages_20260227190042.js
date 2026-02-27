import React, { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { WarmClearTheme } from '../../theme';

const initialMessages = [
  {
    id: 'm1',
    from: 'other',
    name: 'อสม. แก้ว',
    text: 'สวัสดีค่ะ พรุ่งนี้สนใจไปเดินในสวนด้วยกันไหมคะ',
    time: '09:12',
  },
  {
    id: 'm2',
    from: 'me',
    name: 'คุณ',
    text: 'สนใจครับ ขอรายละเอียดจุดนัดพบหน่อยได้ไหม',
    time: '09:15',
  },
  {
    id: 'm3',
    from: 'other',
    name: 'อสม. แก้ว',
    text: 'นัดที่หน้าประตูสวนสาธารณะ 7:00 น. นะคะ',
    time: '09:17',
  },
];

function ChatBubble({ from, name, text, time }) {
  const isMe = from === 'me';
  return (
    <View style={[styles.bubbleRow, isMe ? styles.bubbleRowMe : styles.bubbleRowOther]}>
      {!isMe ? (
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>💬</Text>
        </View>
      ) : null}

      <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleOther]}>
        {!isMe ? <Text style={styles.bubbleName}>{name}</Text> : null}
        <Text style={[styles.bubbleText, isMe ? styles.bubbleTextMe : styles.bubbleTextOther]}>
          {text}
        </Text>
        <Text style={[styles.bubbleTime, isMe ? styles.bubbleTimeMe : styles.bubbleTimeOther]}>
          {time}
        </Text>
      </View>
    </View>
  );
}

export default function MessagesScreen() {
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState(initialMessages);

  const canSend = useMemo(() => draft.trim().length > 0, [draft]);

  const onSendMock = () => {
    if (!canSend) return;
    const text = draft.trim();
    setDraft('');
    const now = new Date();
    const time = now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });

    setMessages((prev) => [
      ...prev,
      {
        id: `m-${Date.now()}`,
        from: 'me',
        name: 'คุณ',
        text,
        time,
      },
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <View style={styles.header}>
        <Text style={styles.title}>ข้อความ</Text>
        <Text style={styles.subtitle}>พูดคุยกับเพื่อนและผู้ดูแลกิจกรรม</Text>
      </View>

      <ScrollView
        style={styles.thread}
        contentContainerStyle={styles.threadContent}
        keyboardShouldPersistTaps="handled"
      >
        {messages.map((m) => (
          <ChatBubble key={m.id} from={m.from} name={m.name} text={m.text} time={m.time} />
        ))}
      </ScrollView>

      <View style={styles.composer}>
        <View style={styles.inputWrap}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="พิมพ์ข้อความ…"
            placeholderTextColor={WarmClearTheme.colors.textMuted}
            style={styles.input}
            multiline
          />
        </View>

        <Pressable
          onPress={onSendMock}
          disabled={!canSend}
          style={[styles.sendButton, !canSend ? styles.sendButtonDisabled : null]}
          accessibilityRole="button"
          accessibilityLabel="ส่งข้อความ"
        >
          <Ionicons name="send" size={18} color={WarmClearTheme.colors.surface} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: WarmClearTheme.colors.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: WarmClearTheme.colors.text,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 18,
    color: WarmClearTheme.colors.textSub,
    fontWeight: '700',
    lineHeight: 24,
  },
  thread: {
    flex: 1,
  },
  threadContent: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: 6,
  },
  bubbleRow: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'flex-end',
  },
  bubbleRowMe: {
    justifyContent: 'flex-end',
  },
  bubbleRowOther: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: WarmClearTheme.colors.surface,
    borderWidth: 1,
    borderColor: WarmClearTheme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarText: {
    fontSize: 16,
  },
  bubble: {
    maxWidth: '82%',
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
  },
  bubbleOther: {
    backgroundColor: WarmClearTheme.colors.surface,
    borderColor: WarmClearTheme.colors.border,
    ...WarmClearTheme.shadows.subtle,
  },
  bubbleMe: {
    backgroundColor: WarmClearTheme.colors.primary,
    borderColor: WarmClearTheme.colors.primaryDark,
    ...WarmClearTheme.shadows.subtle,
  },
  bubbleName: {
    fontSize: 12,
    fontWeight: '900',
    color: WarmClearTheme.colors.textMuted,
    marginBottom: 4,
  },
  bubbleText: {
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 22,
  },
  bubbleTextOther: {
    color: WarmClearTheme.colors.text,
  },
  bubbleTextMe: {
    color: WarmClearTheme.colors.surface,
  },
  bubbleTime: {
    fontSize: 12,
    marginTop: 8,
    fontWeight: '800',
    alignSelf: 'flex-end',
  },
  bubbleTimeOther: {
    color: WarmClearTheme.colors.textMuted,
  },
  bubbleTimeMe: {
    color: 'rgba(255,255,255,0.9)',
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: WarmClearTheme.colors.border,
    backgroundColor: WarmClearTheme.colors.surface,
  },
  inputWrap: {
    flex: 1,
    backgroundColor: WarmClearTheme.colors.surfaceSoft,
    borderRadius: WarmClearTheme.radii.control,
    borderWidth: 1,
    borderColor: WarmClearTheme.colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  input: {
    minHeight: 22,
    maxHeight: 100,
    fontSize: 16,
    color: WarmClearTheme.colors.text,
    fontWeight: '800',
  },
  sendButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: WarmClearTheme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...WarmClearTheme.shadows.button,
  },
  sendButtonDisabled: {
    opacity: 0.55,
  },
});
