/**
 * Возвращает ISO-строку начала указанного дня в формате 00:00:00Z (UTC)
 */
export function startOfDay(date: Date): string {
  const newDate = new Date(Date.UTC(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  ));

  return newDate.toISOString();
}

/**
 * Возвращает ISO-строку начала следующего дня в формате 00:00:00Z (UTC)
 */
export function startOfNextDay(date: Date): string {
  const newDate = new Date(Date.UTC(
    date.getFullYear(),
    date.getMonth(),
    date.getDate() + 1
  ));

  return newDate.toISOString();
}

/**
 * Возвращает строку времени в формате HH:mm
 */
export function formatTime(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${hours}:${minutes}`;
}
