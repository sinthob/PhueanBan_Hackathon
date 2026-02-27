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
import { sendChatbotMessage } from '../../services/chatbot';

const chatListMock = [
  {
    id: 'c1',
    name: 'อสม. แก้ว',
    avatar: '👩‍⚕️',
    lastText: 'นัดที่หน้าประตูสวนสาธารณะ 7:00 น. นะคะ',
    lastTime: '09:17',
    unread: 0,
  },
  {
    id: 'c2',
    name: 'คุณสมหมาย',
    avatar: '👴',
    lastText: 'วันนี้อากาศดีมาก เดินกันไหม',
    lastTime: 'เมื่อวาน',
    unread: 2,
  },
  {
    id: 'c3',
    name: 'กลุ่มโยคะผู้สูงวัย',
    avatar: '🧘',
    lastText: 'ครูจะเริ่มคลาส 8:00 น. อย่าลืมเสื่อโยคะนะคะ',
    lastTime: '2 วันก่อน',
    unread: 0,
  },
];

function nowTimeLabel() {
  const now = new Date();
  return now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
}

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
  const [mode, setMode] = useState('people');
  const [activeChatId, setActiveChatId] = useState(null);
  const [draft, setDraft] = useState('');
  const [botLoading, setBotLoading] = useState(false);

  const [peopleThreads, setPeopleThreads] = useState(() => ({
    c1: [
      {
        id: 'c1-m1',
        from: 'other',
        name: 'อสม. แก้ว',
        text: 'สวัสดีค่ะ พรุ่งนี้สนใจไปเดินในสวนด้วยกันไหมคะ',
        time: '09:12',
      },
      {
        id: 'c1-m2',
        from: 'me',
        name: 'คุณ',
        text: 'สนใจครับ ขอรายละเอียดจุดนัดพบหน่อยได้ไหม',
        time: '09:15',
      },
      {
        id: 'c1-m3',
        from: 'other',
        name: 'อสม. แก้ว',
        text: 'นัดที่หน้าประตูสวนสาธารณะ 7:00 น. นะคะ',
        time: '09:17',
      },
    ],
    c2: [
      {
        id: 'c2-m1',
        from: 'other',
        name: 'คุณสมหมาย',
        text: 'วันนี้อากาศดีมาก เดินกันไหม',
        time: 'เมื่อวาน',
      },
      {
        id: 'c2-m2',
        from: 'other',
        name: 'คุณสมหมาย',
        text: 'ถ้าว่างตอนเย็นแถวสวนลุมฯ เจอกันได้เลย',
        time: 'เมื่อวาน',
      },
    ],
    c3: [
      {
        id: 'c3-m1',
        from: 'other',
        name: 'ครูนภา',
        text: 'ครูจะเริ่มคลาส 8:00 น. อย่าลืมเสื่อโยคะนะคะ',
        time: '2 วันก่อน',
      },
    ],
  }));

  const [botMessages, setBotMessages] = useState(() => ([
    {
      id: 'b1',
      from: 'other',
      name: 'แชทบอท',
      text: 'สวัสดีค่ะ อยากให้ช่วยหา “กิจกรรม” แบบไหนคะ? (เช่น ใกล้บ้าน / กลุ่มเล็ก / ในร่ม)',
      time: 'ตอนนี้',
    },
  ]));

  const isBotMode = mode === 'bot';
  const showList = !isBotMode && !activeChatId;

  const activeThreadMessages = useMemo(() => {
    if (isBotMode) return botMessages;
    if (!activeChatId) return [];
    return peopleThreads[activeChatId] || [];
  }, [isBotMode, botMessages, activeChatId, peopleThreads]);

  const canSend = useMemo(() => draft.trim().length > 0, [draft]);

  const onBackToList = () => {
    setActiveChatId(null);
    setDraft('');
  };

  const onSwitchMode = (nextMode) => {
    setMode(nextMode);
    setDraft('');
    if (nextMode === 'bot') {
      setActiveChatId(null);
    }
  };

  const onSendMock = () => {
    if (!canSend) return;
    const text = draft.trim();
    setDraft('');
    const time = nowTimeLabel();

    if (isBotMode) {
      const myMsg = {
        id: `b-${Date.now()}`,
        from: 'me',
        name: 'คุณ',
        text,
        time,
      };
      setBotMessages((prev) => [...prev, myMsg]);
      setBotLoading(true);

      // Call real AI via Supabase Edge Function. If not deployed/configured yet,
      // we'll show a friendly fallback message.
      (async () => {
        try {
          const reply = await sendChatbotMessage({ uiMessages: [...botMessages, myMsg] });
          setBotMessages((prev) => [
            ...prev,
            {
              id: `b-reply-${Date.now()}`,
              from: 'other',
              name: 'แชทบอท',
              text: reply,
              time: 'ตอนนี้',
            },
          ]);
        } catch (err) {
          void err;
          setBotMessages((prev) => [
            ...prev,
            {
              id: `b-reply-${Date.now()}`,
              from: 'other',
              name: 'แชทบอท',
              text:
                'ตอนนี้ระบบยังเชื่อมต่อ AI ไม่ได้ชั่วคราวค่ะ\n'
                + 'แต่ฉันยังอยู่ตรงนี้นะ—เล่าให้ฟังได้เลยว่าช่วงนี้รู้สึกเหงาเวลาไหนมากที่สุด 🙂\n'
                + 'ถ้าต้องการเชื่อม AI จริง ช่วยตั้งค่า Supabase Function (chatbot) ก่อนนะคะ',
              time: 'ตอนนี้',
            },
          ]);
        } finally {
          setBotLoading(false);
        }
      })();
      return;
    }

    if (!activeChatId) return;

    const myMsg = {
      id: `m-${Date.now()}`,
      from: 'me',
      name: 'คุณ',
      text,
      time,
    };
    setPeopleThreads((prev) => ({
      ...prev,
      [activeChatId]: [...(prev[activeChatId] || []), myMsg],
    }));
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

        <View style={styles.modeRow}>
          <Pressable
            onPress={() => onSwitchMode('people')}
            style={[styles.modeChip, mode === 'people' ? styles.modeChipActive : null]}
            accessibilityRole="button"
            accessibilityLabel="โหมดแชท"
          >
            <Text style={[styles.modeChipText, mode === 'people' ? styles.modeChipTextActive : null]}>
              แชท
            </Text>
          </Pressable>

          <Pressable
            onPress={() => onSwitchMode('bot')}
            style={[styles.modeChip, mode === 'bot' ? styles.modeChipActive : null]}
            accessibilityRole="button"
            accessibilityLabel="โหมดแชทกับแชทบอท"
          >
            <Text style={[styles.modeChipText, mode === 'bot' ? styles.modeChipTextActive : null]}>
              แชทกับแชทบอท
            </Text>
          </Pressable>
        </View>
      </View>

      {showList ? (
        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
        >
          {chatListMock.map((chat) => (
            <Pressable
              key={chat.id}
              onPress={() => setActiveChatId(chat.id)}
              style={styles.chatCard}
              accessibilityRole="button"
              accessibilityLabel={`เปิดแชทกับ ${chat.name}`}
            >
              <View style={styles.chatCardRow}>
                <View style={styles.chatAvatar}>
                  <Text style={styles.chatAvatarText}>{chat.avatar}</Text>
                </View>
                <View style={styles.chatBody}>
                  <View style={styles.chatTopRow}>
                    <Text style={styles.chatName}>{chat.name}</Text>
                    <Text style={styles.chatTime}>{chat.lastTime}</Text>
                  </View>
                  <View style={styles.chatBottomRow}>
                    <Text style={styles.chatPreview} numberOfLines={1}>
                      {chat.lastText}
                    </Text>
                    {chat.unread ? (
                      <View style={styles.unreadPill}>
                        <Text style={styles.unreadText}>{chat.unread}</Text>
                      </View>
                    ) : null}
                  </View>
                </View>
              </View>
            </Pressable>
          ))}

          <View style={styles.listHintCard}>
            <Text style={styles.listHintTitle}>ทิป</Text>
            <Text style={styles.listHintBody}>
              สลับไปที่ “แชทกับแชทบอท” เพื่อให้ช่วยแนะนำกิจกรรมได้ทันที
            </Text>
          </View>
        </ScrollView>
      ) : (
        <>
          {!isBotMode ? (
            <Pressable
              onPress={onBackToList}
              style={styles.backRow}
              accessibilityRole="button"
              accessibilityLabel="กลับไปที่รายการแชท"
            >
              <Ionicons name="chevron-back" size={18} color={WarmClearTheme.colors.primary} />
              <Text style={styles.backText}>กลับไปที่รายการแชท</Text>
            </Pressable>
          ) : null}

          <ScrollView
            style={styles.thread}
            contentContainerStyle={styles.threadContent}
            keyboardShouldPersistTaps="handled"
          >
            {activeThreadMessages.map((m) => (
              <ChatBubble key={m.id} from={m.from} name={m.name} text={m.text} time={m.time} />
            ))}

            {isBotMode && botLoading ? (
              <View style={styles.typingRow}>
                <View style={styles.typingDot} />
                <View style={styles.typingDot} />
                <View style={styles.typingDot} />
                <Text style={styles.typingText}>แชทบอทกำลังตอบ…</Text>
              </View>
            ) : null}
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
        </>
      )}
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
  modeRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  modeChip: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: WarmClearTheme.radii.control,
    backgroundColor: WarmClearTheme.colors.surface,
    borderWidth: 1,
    borderColor: WarmClearTheme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeChipActive: {
    backgroundColor: WarmClearTheme.colors.primarySoft,
    borderColor: WarmClearTheme.colors.primary,
  },
  modeChipText: {
    fontSize: 14,
    fontWeight: '900',
    color: WarmClearTheme.colors.textSub,
  },
  modeChipTextActive: {
    color: WarmClearTheme.colors.primaryDark,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 18,
    paddingTop: 4,
    gap: 12,
  },
  chatCard: {
    backgroundColor: WarmClearTheme.colors.surface,
    borderRadius: WarmClearTheme.radii.card,
    borderWidth: 1,
    borderColor: WarmClearTheme.colors.border,
    padding: 14,
    ...WarmClearTheme.shadows.card,
  },
  chatCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  chatAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: WarmClearTheme.colors.surfaceSoft,
    borderWidth: 1,
    borderColor: WarmClearTheme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatAvatarText: {
    fontSize: 22,
  },
  chatBody: {
    flex: 1,
  },
  chatTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '900',
    color: WarmClearTheme.colors.text,
    flex: 1,
    marginRight: 10,
  },
  chatTime: {
    fontSize: 12,
    fontWeight: '900',
    color: WarmClearTheme.colors.textMuted,
  },
  chatBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  chatPreview: {
    fontSize: 14,
    fontWeight: '800',
    color: WarmClearTheme.colors.textSub,
    flex: 1,
  },
  unreadPill: {
    minWidth: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: WarmClearTheme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  unreadText: {
    fontSize: 12,
    fontWeight: '900',
    color: WarmClearTheme.colors.surface,
  },
  listHintCard: {
    backgroundColor: WarmClearTheme.colors.warningSoft,
    borderRadius: WarmClearTheme.radii.card,
    borderWidth: 1,
    borderColor: WarmClearTheme.colors.warningSoftBorder,
    padding: 14,
  },
  listHintTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: WarmClearTheme.colors.warningText,
    marginBottom: 6,
  },
  listHintBody: {
    fontSize: 14,
    fontWeight: '800',
    color: WarmClearTheme.colors.warningText,
    lineHeight: 20,
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 6,
  },
  backText: {
    fontSize: 14,
    fontWeight: '900',
    color: WarmClearTheme.colors.primary,
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
  typingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
    marginBottom: 8,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: WarmClearTheme.colors.textMuted,
    opacity: 0.65,
  },
  typingText: {
    fontSize: 13,
    fontWeight: '800',
    color: WarmClearTheme.colors.textMuted,
    marginLeft: 4,
  },
});