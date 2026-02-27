import { supabase, supabaseAnonKey } from '../lib/supabase';

function normalizeFunctionError(error) {
  if (!error) return null;
  if (typeof error === 'string') return error;
  const message = error.message || error.name || 'Unknown error';
  return message;
}

function mapUiMessagesToChat(messages) {
  // UI: { from: 'me'|'other', text: string }
  // OpenAI: { role: 'user'|'assistant', content: string }
  return (messages || [])
    .filter((m) => typeof m?.text === 'string' && m.text.trim().length > 0)
    .map((m) => ({
      role: m.from === 'me' ? 'user' : 'assistant',
      content: m.text,
    }));
}

export async function sendChatbotMessage({ uiMessages }) {
  const messages = mapUiMessagesToChat(uiMessages).slice(-20);

  const { data, error } = await supabase.functions.invoke('chatbot', {
    body: { messages },
    headers: supabaseAnonKey
      ? {
          Authorization: `Bearer ${supabaseAnonKey}`,
        }
      : undefined,
  });

  if (error) {
    throw new Error(normalizeFunctionError(error) || 'Failed to invoke chatbot function');
  }

  const reply = data?.reply;
  if (typeof reply !== 'string' || !reply.trim()) {
    throw new Error('Chatbot returned empty reply');
  }

  return reply;
}
