/**
 * Возвращает ISO-строку начала указанного дня в формате 00:00:00Z (UTC)
 */
export const startOfDay = (date: Date): Date =>
  new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));

/**
 * Возвращает ISO-строку начала следующего дня в формате 00:00:00Z (UTC)
 */
export const startOfNextDay = (date: Date): Date =>
  new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate() + 1));

/**
 * Возвращает строку времени в формате HH:mm
 */
export const formatTime = (date: Date): string => {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${hours}:${minutes}`;
};
