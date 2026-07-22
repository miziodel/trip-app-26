export function formatDate(isoDate: string): string {
  if (!isoDate) return '';
  const date = new Date(isoDate);
  if (isNaN(date.getTime())) return isoDate;

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear()).slice(-2);

  const daysItalian = ['dom', 'lun', 'mar', 'mer', 'gio', 'ven', 'sab'];
  const dayName = daysItalian[date.getDay()];

  return `${day}-${month}-${year} ${dayName}`;
}
