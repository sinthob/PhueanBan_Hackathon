let activityProfile = null;

export function getActivityProfile() {
  return activityProfile;
}

export function setActivityProfile(nextProfile) {
  activityProfile = nextProfile;
  return activityProfile;
}

export function clearActivityProfile() {
  activityProfile = null;
  return activityProfile;
}
