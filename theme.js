// theme.js — SunnyVillage Theme
// อิงจาก design reference: เหลืองอ่อน + teal + bottom nav เหลืองสด

export const WarmClearTheme = {
  colors: {
    // ─── Backgrounds ───
    background: '#FFF9E6',       // เหลืองอ่อนมาก (body bg)
    surface: '#FFFFFF',
    surfaceSoft: '#FFFBF0',      // เหลืองนวล
    border: '#E8DFC0',           // เหลืองอมน้ำตาลอ่อน

    // ─── Text ───
    text: '#1A1A1A',
    textSub: '#3D3D3D',
    textMuted: '#7A7A7A',

    // ─── Primary: teal ───
    primary: '#2ABFAC',          // teal หลัก
    primaryDark: '#1FA090',      // teal เข้ม
    primarySoft: '#D4F5F0',      // teal อ่อนมาก (chip bg)
    primarySoftBorder: '#9DE8DF',

    // ─── Card gradient: teal อ่อน ───
    cardGradientStart: '#C8EEE9',
    cardGradientEnd: '#FFFFFF',

    // ─── Accent: เหลืองสด (ปุ่ม CTA + bottom nav) ───
    accent: '#FFD84D',           // เหลืองสด
    accentDark: '#F5C800',
    accentText: '#1A1A1A',       // text บนปุ่มเหลือง

    // ─── Bottom nav ───
    tabBar: '#FFD84D',           // เหลืองสด
    tabBarIcon: '#E05A1E',       // ส้มแดง (icon active)
    tabBarIconInactive: '#A07830',

    // ─── Status ───
    danger: '#E53E3E',
    dangerSoft: '#FFF5F5',
    dangerSoftBorder: '#FED7D7',

    warningSoft: '#FFFBEB',
    warningSoftBorder: '#FDE68A',
    warningText: '#92400E',
  },
  radii: {
    card: 20,
    control: 16,
    chip: 999,
    pill: 999,
  },
  shadows: {
    card: {
      shadowColor: '#B8960A',
      shadowOpacity: 0.15,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
      elevation: 4,
    },
    button: {
      shadowColor: '#000000',
      shadowOpacity: 0.15,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
      elevation: 4,
    },
    bar: {
      shadowColor: '#000000',
      shadowOpacity: 0.10,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: -2 },
      elevation: 8,
    },
    subtle: {
      shadowColor: '#000000',
      shadowOpacity: 0.06,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
    },
  },
};