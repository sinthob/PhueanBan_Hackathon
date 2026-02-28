// userActivitiesStore.js
// In-memory store สำหรับกิจกรรมที่ผู้ใช้สร้างเอง
// ใช้ EventEmitter pattern เพื่อให้ทุก screen subscribe ได้

const listeners = new Set();
let userActivities = []; // [ { ...activityShape, isOwner: true } ]

export function getUserActivities() {
  return userActivities;
}

export function addUserActivity(activity) {
  userActivities = [activity, ...userActivities];
  listeners.forEach((cb) => cb(userActivities));
}

export function subscribeUserActivities(cb) {
  listeners.add(cb);
  return () => listeners.delete(cb); // unsubscribe fn
}