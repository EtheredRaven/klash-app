export function getUTCTime() {
  let now = new Date();
  let UTCTimestamp = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
    now.getUTCHours(),
    now.getUTCMinutes(),
    now.getUTCSeconds(),
    now.getUTCMilliseconds()
  );
  return UTCTimestamp;
}

export function getRemainingTime(endtime, startTime) {
  let remainingTime = endtime - (startTime || getUTCTime());
  return {
    h: Math.max(
      0,
      Math.floor((remainingTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    ),
    m: Math.max(
      0,
      Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60))
    ),
    s: Math.max(0, Math.floor((remainingTime % (1000 * 60)) / 1000)),
  };
}
