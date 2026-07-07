/**
 * Formats `process.uptime()` (seconds) into a human-readable string,
 * e.g. "2d 3h 14m 7s".
 */
export function formatUptime(uptimeSeconds: number): string {
  const totalSeconds = Math.floor(uptimeSeconds);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const parts: string[] = [];
  if (days) parts.push(`${days}d`);
  if (hours) parts.push(`${hours}h`);
  if (minutes) parts.push(`${minutes}m`);
  parts.push(`${seconds}s`);

  return parts.join(" ");
}
