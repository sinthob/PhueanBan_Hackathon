export const caregiverUser = {
  id: 'cg1',
  name: 'คุณแนน (ลูกสาว)',
  avatar: '👩‍👦',
  relationship: 'ลูกสาว',
};

// Privacy-friendly monitoring snapshot (no GPS / no continuous tracking)
export const monitoringSnapshot = {
  consent: {
    enabled: true,
    scope: [
      'สถานที่กิจกรรมล่าสุดแบบคร่าวๆ',
      'แนวโน้มการออกไปทำกิจกรรม',
      'สัญญาณเตือนแบบรวม (ไม่ใช่การติดตามตลอดเวลา)',
    ],
    updatedAt: '2026-02-15 09:10',
  },
  lastKnown: {
    label: 'ศูนย์ชุมชนบางกะปิ',
    district: 'เขตบางกะปิ',
    updatedAt: '2026-02-15 08:55',
    source: 'เช็คอินจากกิจกรรม',
  },
  activityTrend: {
    last7Days: {
      joinedActivities: 2,
      outdoorDays: 2,
      socialInteractions: 'ปานกลาง',
    },
    last30Days: {
      joinedActivities: 7,
      consistency: 'ดี',
    },
  },
  safetySignals: [
    {
      id: 's1',
      level: 'ok',
      title: 'เช็คอินล่าสุดปกติ',
      detail: 'มีการเช็คอินวันนี้ 08:55 ผ่านกิจกรรม',
    },
    {
      id: 's2',
      level: 'watch',
      title: 'ช่วงบ่ายออกข้างนอกน้อย',
      detail: 'สัปดาห์นี้ส่วนใหญ่ทำกิจกรรมตอนเช้า',
    },
  ],
  quickContacts: [
    { id: 'c1',
      label: 'โทรหาคุณสมชาย (ผู้สูงอายุ)',
      value: '+66 8x-xxx-xxxx',
      type: 'phone',
    },
    { id: 'c2',
      label: 'โทรฉุกเฉิน 1669',
      value: '1669',
      type: 'emergency',
    },
  ],
};
