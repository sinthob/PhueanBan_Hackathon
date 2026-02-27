// Supabase Edge Function: chatbot
// Deploy with: supabase functions deploy chatbot
// Set secrets:
// - supabase secrets set OPENAI_API_KEY=... OPENAI_MODEL=gpt-4o-mini
// Notes:
// - This function is designed to keep OpenAI keys off the client.

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

type ChatMessage = { role: 'user' | 'assistant'; content: string };

const SYSTEM_PROMPT = `คุณคือผู้ช่วยสนทนาที่เป็นมิตรเหมือน “หลาน” ของผู้ใช้สูงวัย

เป้าหมายหลัก:
- รับฟังอย่างตั้งใจ ชวนคุยให้คลายเหงา ให้กำลังใจ
- ชวนผู้ใช้กลับมาโฟกัสเรื่องความรู้สึก สุขภาพใจ และการเข้าร่วมกิจกรรมชุมชนอย่างเหมาะสม

ข้อกำหนดสำคัญ:
- อย่าถาม/ชวนคุยนอกเรื่องไปไกล: ถ้าผู้ใช้ถามเรื่องอื่น ให้ตอบสั้นๆ สุภาพ แล้วชวนกลับมาที่การรับฟัง/กิจกรรม
- หลีกเลี่ยงการให้คำแนะนำทางการแพทย์หรือกฎหมายแบบเฉพาะเจาะจง ให้เสนอทางเลือกที่ปลอดภัยและแนะนำให้ปรึกษาผู้เชี่ยวชาญเมื่อเหมาะสม
- ถ้าผู้ใช้มีแนวโน้มทำร้ายตัวเองหรืออยู่ในภาวะวิกฤต ให้ตอบด้วยความห่วงใย แนะนำให้ติดต่อคนใกล้ตัวหรือบริการฉุกเฉินในพื้นที่ทันที

สไตล์การตอบ:
- ใช้ภาษาไทยสุภาพ อบอุ่น กระชับ
- ถามคำถามปลายเปิดได้ แต่เฉพาะที่ช่วยให้ผู้ใช้ระบายและรู้สึกดีขึ้น
`;

function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      // Allow calling from the app; adjust for stricter origins if needed.
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    },
  });
}

function isValidMessages(messages: unknown): messages is ChatMessage[] {
  if (!Array.isArray(messages)) return false;
  return messages.every((m) => {
    if (!m || typeof m !== 'object') return false;
    const role = (m as any).role;
    const content = (m as any).content;
    return (role === 'user' || role === 'assistant') && typeof content === 'string';
  });
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
    });
  }

  if (req.method !== 'POST') {
    return jsonResponse(405, { error: 'Method not allowed' });
  }

  const openaiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openaiKey) {
    return jsonResponse(500, { error: 'Missing OPENAI_API_KEY secret' });
  }

  const model = Deno.env.get('OPENAI_MODEL') ?? 'gpt-4o-mini';

  let payload: any;
  try {
    payload = await req.json();
  } catch {
    return jsonResponse(400, { error: 'Invalid JSON body' });
  }

  const messages = payload?.messages;
  if (!isValidMessages(messages)) {
    return jsonResponse(400, { error: 'Invalid messages format' });
  }

  const trimmed = messages
    .map((m) => ({ role: m.role, content: (m.content || '').toString() }))
    .filter((m) => m.content.trim().length > 0)
    .slice(-20);

  const body = {
    model,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      ...trimmed,
    ],
    temperature: 0.7,
    max_tokens: 220,
  };

  try {
    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!resp.ok) {
      const text = await resp.text();
      return jsonResponse(502, { error: 'OpenAI request failed', details: text });
    }

    const data = await resp.json();
    const reply = data?.choices?.[0]?.message?.content;
    if (typeof reply !== 'string' || !reply.trim()) {
      return jsonResponse(502, { error: 'OpenAI returned empty reply' });
    }

    return jsonResponse(200, { reply: reply.trim() });
  } catch (err) {
    return jsonResponse(502, { error: 'OpenAI call crashed', details: String(err) });
  }
});
