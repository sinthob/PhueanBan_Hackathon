/**
 * loneliness/loneliness.js  ← รวม engine.js + tracker.js เข้าด้วยกัน
 *
 * ────────────────────────────────────────────────────────────
 *  TRACKER — เก็บข้อมูลพฤติกรรมเบื้องหลัง (ผู้ใช้ไม่เห็น)
 *  ENGINE  — คำนวณ Loneliness Score จาก BehaviorSnapshot
 * ────────────────────────────────────────────────────────────
 *
 * Score Model (0–100, ยิ่งสูงยิ่งเสี่ยง):
 *   score = 0.35 * inactivity_factor
 *         + 0.30 * checkin_miss_factor
 *         + 0.20 * session_drop_factor
 *         + 0.15 * activity_drop_factor
 *
 * Risk Level:
 *   0–35   → safe    (ปลอดภัย)
 *   36–65  → watch   (เฝ้าระวัง)
 *   66–100 → alert   (ต้องการความช่วยเหลือ)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// ──────────────────────────────────────────────
// TRACKER — Storage keys & constants
// ──────────────────────────────────────────────

const KEY_LAST_OPENED    = 'hl_behavior:last_opened_at';
const KEY_CHECKIN_STREAK = 'hl_behavior:checkin_streak';
const KEY_MISSED_CHECKINS = 'hl_behavior:missed_checkins_streak';
const KEY_SESSION_LOG    = 'hl_behavior:session_log';   // JSON array of minutes
const KEY_ACTIVITY_LOG   = 'hl_behavior:activity_log';  // JSON array of ISO dates
const KEY_PREV_SCORE     = 'hl_behavior:previous_score';

const SESSION_LOG_MAX    = 14;  // เก็บ session ย้อนหลังสูงสุด 14 ครั้ง
const ACTIVITY_LOG_DAYS  = 7;   // นับกิจกรรมใน 7 วัน

// ── Write events ──────────────────────────────

/** เรียกทุกครั้งที่ผู้ใช้เปิดแอป */
export async function trackAppOpen() {
  try {
    await AsyncStorage.setItem(KEY_LAST_OPENED, new Date().toISOString());
  } catch (_) {}
}

/**
 * เรียกเมื่อ session จบ (ออกจากแอป / background)
 * @param {number} durationMinutes
 */
export async function trackSessionEnd(durationMinutes) {
  try {
    const raw = await AsyncStorage.getItem(KEY_SESSION_LOG);
    const log = raw ? JSON.parse(raw) : [];
    log.push(durationMinutes);
    if (log.length > SESSION_LOG_MAX) log.splice(0, log.length - SESSION_LOG_MAX);
    await AsyncStorage.setItem(KEY_SESSION_LOG, JSON.stringify(log));
  } catch (_) {}
}

/** เรียกเมื่อผู้ใช้กด check-in สำเร็จ */
export async function trackCheckinSuccess() {
  try {
    const raw = await AsyncStorage.getItem(KEY_CHECKIN_STREAK);
    const current = raw ? parseInt(raw, 10) : 0;
    await AsyncStorage.setItem(KEY_CHECKIN_STREAK, String(current + 1));
    await AsyncStorage.setItem(KEY_MISSED_CHECKINS, '0');
  } catch (_) {}
}

/**
 * เรียกทุกวันเที่ยงคืนจาก LonelinessProvider
 * ถ้าไม่มี check-in วันนั้น → เพิ่ม missed streak
 * @param {boolean} didCheckInToday
 */
export async function recordDailyCheckinStatus(didCheckInToday) {
  try {
    if (didCheckInToday) {
      await AsyncStorage.setItem(KEY_MISSED_CHECKINS, '0');
    } else {
      const raw = await AsyncStorage.getItem(KEY_MISSED_CHECKINS);
      const current = raw ? parseInt(raw, 10) : 0;
      await AsyncStorage.setItem(KEY_MISSED_CHECKINS, String(current + 1));
    }
  } catch (_) {}
}

/** เรียกเมื่อผู้ใช้ลงทะเบียนหรือเข้าร่วมกิจกรรม */
export async function trackActivityJoined() {
  try {
    const raw = await AsyncStorage.getItem(KEY_ACTIVITY_LOG);
    const log = raw ? JSON.parse(raw) : [];
    log.push(new Date().toISOString());
    await AsyncStorage.setItem(KEY_ACTIVITY_LOG, JSON.stringify(log));
  } catch (_) {}
}

/**
 * บันทึก score ปัจจุบัน (เพื่อใช้คำนวณ trend ครั้งถัดไป)
 * @param {number} score
 */
export async function savePreviousScore(score) {
  try {
    await AsyncStorage.setItem(KEY_PREV_SCORE, String(score));
  } catch (_) {}
}

// ── Read — สร้าง BehaviorSnapshot ─────────────

/**
 * อ่านข้อมูลทั้งหมดและสร้าง BehaviorSnapshot
 * @returns {Promise<BehaviorSnapshot & { previousScore: number|null }>}
 */
export async function readBehaviorSnapshot() {
  try {
    const [lastOpened, missedRaw, sessionRaw, activityRaw, prevScoreRaw] =
      await AsyncStorage.multiGet([
        KEY_LAST_OPENED,
        KEY_MISSED_CHECKINS,
        KEY_SESSION_LOG,
        KEY_ACTIVITY_LOG,
        KEY_PREV_SCORE,
      ]);

    const lastOpenedAt = lastOpened[1] ?? null;
    const missedCheckinsStreak = missedRaw[1] ? parseInt(missedRaw[1], 10) : 0;

    const sessionLog = sessionRaw[1] ? JSON.parse(sessionRaw[1]) : [];
    const avgSessionMinutes =
      sessionLog.length > 0
        ? sessionLog.reduce((a, b) => a + b, 0) / sessionLog.length
        : 15;

    const activityLog = activityRaw[1] ? JSON.parse(activityRaw[1]) : [];
    const cutoff = Date.now() - ACTIVITY_LOG_DAYS * 24 * 60 * 60 * 1000;
    const activitiesThisWeek = activityLog.filter(
      (iso) => new Date(iso).getTime() >= cutoff
    ).length;

    const previousScore = prevScoreRaw[1] ? parseInt(prevScoreRaw[1], 10) : null;

    return { lastOpenedAt, missedCheckinsStreak, avgSessionMinutes, activitiesThisWeek, previousScore };
  } catch (_) {
    return { lastOpenedAt: null, missedCheckinsStreak: 0, avgSessionMinutes: 15, activitiesThisWeek: 0, previousScore: null };
  }
}

/** ล้าง behavioral data ทั้งหมด (ใช้ตอน sign-out) */
export async function clearBehaviorData() {
  try {
    await AsyncStorage.multiRemove([
      KEY_LAST_OPENED,
      KEY_CHECKIN_STREAK,
      KEY_MISSED_CHECKINS,
      KEY_SESSION_LOG,
      KEY_ACTIVITY_LOG,
      KEY_PREV_SCORE,
    ]);
  } catch (_) {}
}

// ──────────────────────────────────────────────
// ENGINE — Constants
// ──────────────────────────────────────────────

/** วันที่ไม่ได้ใช้งานก่อนถือว่า inactivity เต็ม */
const INACTIVITY_FULL_DAYS = 7;

/** จำนวน check-in ที่พลาดติดต่อกันก่อนถือว่าเต็ม */
const CHECKIN_MISS_FULL = 5;

/** session duration (นาที) ที่ถือว่าปกติ */
const BASELINE_SESSION_MIN = 15;

/** จำนวนกิจกรรม/สัปดาห์ที่ถือว่าปกติ */
const BASELINE_ACTIVITIES_PER_WEEK = 2;

// ── Core computation ──────────────────────────

/**
 * คำนวณ Loneliness Score จาก BehaviorSnapshot
 * @param {BehaviorSnapshot} snap
 * @returns {ScoreResult}
 */
export function computeLonelinessScore(snap) {
  if (!snap) {
    return _buildResult(50, { inactivity: 0.5, checkinMiss: 0.5, sessionDrop: 0.5, activityDrop: 0.5 });
  }

  const daysSinceLast = _daysSince(snap.lastOpenedAt);
  const inactivity = Math.min(daysSinceLast / INACTIVITY_FULL_DAYS, 1.0);

  const missedCheckins = snap.missedCheckinsStreak ?? 0;
  const checkinMiss = Math.min(missedCheckins / CHECKIN_MISS_FULL, 1.0);

  const avgSession = snap.avgSessionMinutes ?? BASELINE_SESSION_MIN;
  const sessionDrop = avgSession >= BASELINE_SESSION_MIN
    ? 0
    : 1 - avgSession / BASELINE_SESSION_MIN;

  const weeklyActivities = snap.activitiesThisWeek ?? 0;
  const activityDrop = weeklyActivities >= BASELINE_ACTIVITIES_PER_WEEK
    ? 0
    : 1 - weeklyActivities / BASELINE_ACTIVITIES_PER_WEEK;

  const rawScore =
    0.35 * inactivity +
    0.30 * checkinMiss +
    0.20 * sessionDrop +
    0.15 * activityDrop;

  const score = Math.round(rawScore * 100);
  return _buildResult(score, { inactivity, checkinMiss, sessionDrop, activityDrop });
}

/**
 * คืน trend เทียบกับ score ก่อนหน้า
 * @param {number} currentScore
 * @param {number|null} previousScore
 * @returns {'improving'|'stable'|'worsening'}
 */
export function computeTrend(currentScore, previousScore) {
  if (previousScore == null) return 'stable';
  const delta = currentScore - previousScore;
  if (delta <= -5) return 'improving';
  if (delta >= 5) return 'worsening';
  return 'stable';
}

/**
 * แปลง score เป็น risk label
 * @param {number} score
 * @returns {'safe'|'watch'|'alert'}
 */
export function scoreToRiskLevel(score) {
  if (score <= 35) return 'safe';
  if (score <= 65) return 'watch';
  return 'alert';
}

/**
 * ข้อความแจ้งเตือนสำหรับผู้ดูแล (ภาษาไทย)
 * @param {ScoreResult} result
 * @returns {string[]}
 */
export function buildCaregiverAlerts(result) {
  const alerts = [];
  const { factors, riskLevel } = result;

  if (riskLevel === 'alert') alerts.push('ควรโทรหาหรือไปเยี่ยมโดยเร็ว');

  if (factors.inactivity > 0.7) {
    const days = Math.round(factors.inactivity * INACTIVITY_FULL_DAYS);
    alerts.push(`ไม่ได้ใช้งานแอปมาแล้วประมาณ ${days} วัน`);
  }
  if (factors.checkinMiss > 0.5) {
    const missed = Math.round(factors.checkinMiss * CHECKIN_MISS_FULL);
    alerts.push(`พลาด Check-in ติดต่อกัน ${missed} วัน`);
  }
  if (factors.activityDrop > 0.6) alerts.push('กิจกรรมชุมชนลดลงมากกว่าปกติ');
  if (factors.sessionDrop > 0.6) alerts.push('เวลาที่ใช้งานแอปต่อครั้งลดลงมาก');

  return alerts;
}

// ── Private helpers ───────────────────────────

function _daysSince(isoDateString) {
  if (!isoDateString) return INACTIVITY_FULL_DAYS;
  const diffMs = Date.now() - new Date(isoDateString).getTime();
  return Math.max(0, diffMs / (1000 * 60 * 60 * 24));
}

function _buildResult(score, factors) {
  return { score, riskLevel: scoreToRiskLevel(score), factors };
}

// ──────────────────────────────────────────────
// JSDoc Types
// ──────────────────────────────────────────────

/**
 * @typedef {Object} BehaviorSnapshot
 * @property {string|null} lastOpenedAt          - ISO date string ครั้งล่าสุดที่เปิดแอป
 * @property {number}      missedCheckinsStreak  - จำนวนวันติดต่อกันที่ไม่ได้ check-in
 * @property {number}      avgSessionMinutes     - เวลาใช้งานเฉลี่ย (นาที) ใน 7 วันล่าสุด
 * @property {number}      activitiesThisWeek    - กิจกรรมที่เข้าร่วมใน 7 วันล่าสุด
 */

/**
 * @typedef {Object} ScoreResult
 * @property {number}                    score      - 0–100
 * @property {'safe'|'watch'|'alert'}   riskLevel
 * @property {Object}                    factors    - breakdown ของแต่ละ factor (0–1)
 */