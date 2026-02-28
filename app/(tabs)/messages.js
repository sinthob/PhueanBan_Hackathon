import React, { useMemo, useRef, useState } from 'react';
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
import { sendChatbotMessage } from '../../services/chatbot';

function nowTimeLabel() {
  return new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
}

function ChatBubble({ from, name, text, time }) {
  const isMe = from === 'me';
  return (
    <View style={[styles.bubbleRow, isMe ? styles.bubbleRowMe : styles.bubbleRowOther]}>
      {!isMe && (
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>💬</Text>
        </View>
      )}
      <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleOther]}>
        {!isMe && <Text style={styles.bubbleName}>{name}</Text>}
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
  const [botLoading, setBotLoading] = useState(false);
  const scrollRef = useRef(null);

  const [botMessages, setBotMessages] = useState([
    {
      id: 'b1',
      from: 'other',
      name: 'แชทบอท',
      text: 'สวัสดีค่ะ อยากให้ช่วยหา "กิจกรรม" แบบไหนคะ? (เช่น ใกล้บ้าน / กลุ่มเล็ก / ในร่ม)',
      time: 'ตอนนี้',
    },
  ]);

  const canSend = useMemo(() => draft.trim().length > 0, [draft]);

  const onSend = () => {
    if (!canSend) return;
    const text = draft.trim();
    setDraft('');
    const time = nowTimeLabel();

    const myMsg = { id: `b-${Date.now()}`, from: 'me', name: 'คุณ', text, time };
    setBotMessages((prev) => [...prev, myMsg]);
    setBotLoading(true);

    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);

    (async () => {
      try {
        const reply = await sendChatbotMessage({ uiMessages: [...botMessages, myMsg] });
        setBotMessages((prev) => [
          ...prev,
          { id: `b-reply-${Date.now()}`, from: 'other', name: 'แชทบอท', text: reply, time: 'ตอนนี้' },
        ]);
      } catch {
        setBotMessages((prev) => [
          ...prev,
          {
            id: `b-reply-${Date.now()}`,
            from: 'other',
            name: 'แชทบอท',
            text: 'ตอนนี้ระบบยังเชื่อมต่อ AI ไม่ได้ชั่วคราวค่ะ\nแต่ฉันยังอยู่ตรงนี้นะ — เล่าให้ฟังได้เลยว่าช่วงนี้รู้สึกเป็นยังไงบ้าง 🙂',
            time: 'ตอนนี้',
          },
        ]);
      } finally {
        setBotLoading(false);
        setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
      }
    })();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView
        ref={scrollRef}
        style={styles.thread}
        contentContainerStyle={styles.threadContent}
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
      >
        {botMessages.map((m) => (
          <ChatBubble key={m.id} from={m.from} name={m.name} text={m.text} time={m.time} />
        ))}

        {botLoading && (
          <View style={styles.typingRow}>
            <View style={styles.typingDot} />
            <View style={styles.typingDot} />
            <View style={styles.typingDot} />
            <Text style={styles.typingText}>แชทบอทกำลังตอบ…</Text>
          </View>
        )}
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
            onSubmitEditing={onSend}
          />
        </View>
        <Pressable
          onPress={onSend}
          disabled={!canSend}
          style={[styles.sendButton, !canSend && styles.sendButtonDisabled]}
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
  thread: {
    flex: 1,
  },
  threadContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  bubbleRow: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'flex-end',
  },
  bubbleRowMe:    { justifyContent: 'flex-end' },
  bubbleRowOther: { justifyContent: 'flex-start' },
  avatar: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: WarmClearTheme.colors.surface,
    borderWidth: 1, borderColor: WarmClearTheme.colors.border,
    alignItems: 'center', justifyContent: 'center',
    marginRight: 10,
  },
  avatarText: { fontSize: 16 },
  bubble: {
    maxWidth: '82%', borderRadius: 18,
    paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1,
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
    fontSize: 12, fontWeight: '900',
    color: WarmClearTheme.colors.textMuted, marginBottom: 4,
  },
  bubbleText:      { fontSize: 16, fontWeight: '800', lineHeight: 22 },
  bubbleTextOther: { color: WarmClearTheme.colors.text },
  bubbleTextMe:    { color: WarmClearTheme.colors.surface },
  bubbleTime:      { fontSize: 12, marginTop: 8, fontWeight: '800', alignSelf: 'flex-end' },
  bubbleTimeOther: { color: WarmClearTheme.colors.textMuted },
  bubbleTimeMe:    { color: 'rgba(255,255,255,0.9)' },
  typingRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: 6, marginTop: 6, marginBottom: 8,
  },
  typingDot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: WarmClearTheme.colors.textMuted, opacity: 0.65,
  },
  typingText: {
    fontSize: 13, fontWeight: '800',
    color: WarmClearTheme.colors.textMuted, marginLeft: 4,
  },
  composer: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 10,
    paddingHorizontal: 16, paddingTop: 10, paddingBottom: 16,
    borderTopWidth: 1, borderTopColor: WarmClearTheme.colors.border,
    backgroundColor: WarmClearTheme.colors.surface,
  },
  inputWrap: {
    flex: 1,
    backgroundColor: WarmClearTheme.colors.surfaceSoft,
    borderRadius: WarmClearTheme.radii.control,
    borderWidth: 1, borderColor: WarmClearTheme.colors.border,
    paddingHorizontal: 12, paddingVertical: 10,
  },
  input: {
    minHeight: 22, maxHeight: 100,
    fontSize: 16, color: WarmClearTheme.colors.text, fontWeight: '800',
  },
  sendButton: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: WarmClearTheme.colors.primary,
    alignItems: 'center', justifyContent: 'center',
    ...WarmClearTheme.shadows.button,
  },
  sendButtonDisabled: { opacity: 0.55 },
});